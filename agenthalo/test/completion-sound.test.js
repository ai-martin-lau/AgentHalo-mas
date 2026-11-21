"use strict";
const { test, mock } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { shouldPlayCompletionSound, createCompletionSoundTracker } = require("../src/completion-sound");
const loader = require("../src/theme-loader");
loader.init(path.join(__dirname, "..", "src"));
const theme = loader.loadTheme("halo", { strict: true });

for (const [mode, short, long] of [["long", false, true], ["always", true, true], ["off", false, false]]) {
  test(`${mode}: completion threshold at 30 seconds`, () => {
    assert.equal(shouldPlayCompletionSound(mode, 29_999), short);
    assert.equal(shouldPlayCompletionSound(mode, 30_000), long);
    assert.equal(shouldPlayCompletionSound(mode, 60_000), long);
    assert.equal(shouldPlayCompletionSound(mode, null), mode === "always");
  });
}

test("tracker isolates sessions, preserves first work time and excludes Stop debounce delay", () => {
  const tracker = createCompletionSoundTracker();
  tracker.observe("a", "thinking", "UserPromptSubmit", 0);
  tracker.observe("a", "working", "PreToolUse", 10_000);
  tracker.observe("b", "working", "PreToolUse", 25_000);
  tracker.observe("a", "notification", "PermissionRequest", 26_000);
  tracker.observe("a", "working", "PostToolUse", 28_000);
  tracker.observe("a", "attention", "Stop", 29_999);
  assert.equal(tracker.finish("a", 40_000), 29_999);
  tracker.observe("b", "attention", "Stop", 31_000);
  assert.equal(tracker.finish("b"), 6000);
  assert.equal(tracker.finish("a"), 29_999); // duplicate terminal keeps the original duration
  tracker.observe("a", "working", "PreToolUse", 50_000);
  tracker.observe("a", "attention", "Stop", 51_000);
  assert.equal(tracker.finish("a"), 1000);
});

test("continued work after a withheld Stop keeps the original start; terminal cleanup resets it", () => {
  const tracker = createCompletionSoundTracker();
  tracker.observe("a", "working", "PreToolUse", 0);
  tracker.observe("a", "attention", "Stop", 20_000);
  tracker.observe("a", "working", "PreToolUse", 25_000);
  tracker.observe("a", "attention", "Stop", 35_000);
  assert.equal(tracker.finish("a"), 35_000);
  for (const event of ["SessionEnd", "Interrupt", "StopFailure"]) {
    tracker.observe("a", "working", "PreToolUse", 0);
    tracker.observe("a", "idle", event, 40_000);
    assert.equal(tracker.finish("a"), null);
  }
});

function runtime(t, mode, agentId = "codex") {
  mock.timers.enable({ apis: ["Date", "setTimeout", "setInterval"], now: 100_000 });
  const sounds = [];
  const ctx = {
    theme, completionSoundMode: mode, doNotDisturb: false, miniMode: false,
    pendingPermissions: [], mouseStillSince: Date.now(),
    playSound: (name) => sounds.push(name),
    sendToRenderer() {}, sendToHitWin() {}, syncHitWin() {},
    buildTrayMenu() {}, buildContextMenu() {},
    t: (key) => key, getCursorScreenPoint: () => ({ x: 0, y: 0 }),
    processKill: () => { const e = new Error("ESRCH"); e.code = "ESRCH"; throw e; },
  };
  const api = require("../src/state")(ctx);
  t.after(() => { api.cleanup(); mock.timers.reset(); });
  const update = (id, state, event, opts = {}) => api.updateSession(id, state, event, { agentId, ...opts });
  return { api, ctx, sounds, update };
}

for (const mode of ["long", "always", "off"]) {
  test(`state runtime wires ${mode} to completed tasks and keeps confirmation sound`, (t) => {
    const { api, update, sounds } = runtime(t, mode);
    update("a", "thinking", "UserPromptSubmit");
    mock.timers.tick(15_000);
    update("a", "working", "PreToolUse");
    mock.timers.tick(14_999);
    update("a", "attention", "Stop");
    mock.timers.tick(3000);
    assert.equal(sounds.filter((s) => s === "complete").length, mode === "always" ? 1 : 0);
    update("a", "thinking", "UserPromptSubmit");
    mock.timers.tick(30_000);
    update("a", "attention", "Stop");
    mock.timers.tick(3000);
    assert.equal(sounds.filter((s) => s === "complete").length, mode === "always" ? 2 : mode === "long" ? 1 : 0);
    api.applyState("notification");
    assert.ok(sounds.includes("confirm"));
  });
}

test("short completion remains silent after Claude Stop debounce crosses threshold", (t) => {
  const previous = process.env.CLAWD_COMPLETION_DEBOUNCE_MS;
  process.env.CLAWD_COMPLETION_DEBOUNCE_MS = "2000";
  t.after(() => { if (previous === undefined) delete process.env.CLAWD_COMPLETION_DEBOUNCE_MS; else process.env.CLAWD_COMPLETION_DEBOUNCE_MS = previous; });
  const { update, sounds } = runtime(t, "long", "claude-code");
  update("a", "thinking", "UserPromptSubmit");
  mock.timers.tick(29_000);
  update("a", "attention", "Stop");
  mock.timers.tick(5000);
  assert.ok(!sounds.includes("complete"));
});

test("concurrent short task cannot use another session's long duration", (t) => {
  const { update, sounds } = runtime(t, "long");
  update("long", "working", "PreToolUse");
  mock.timers.tick(30_000);
  update("short", "thinking", "UserPromptSubmit");
  mock.timers.tick(1000);
  update("short", "attention", "Stop");
  mock.timers.tick(3000);
  assert.ok(!sounds.includes("complete"));
  update("long", "attention", "Stop");
  mock.timers.tick(3000);
  assert.deepEqual(sounds, ["complete"]);
});


test("an idle completion resets timing for the next task in the same session", (t) => {
  const { update, sounds } = runtime(t, "long");
  update("a", "thinking", "UserPromptSubmit");
  mock.timers.tick(40_000);
  update("a", "idle", "event_msg:task_complete");
  mock.timers.tick(5000);
  update("a", "working", "PreToolUse");
  mock.timers.tick(1000);
  update("a", "attention", "Stop");
  mock.timers.tick(5000);
  assert.ok(!sounds.includes("complete"));
});
