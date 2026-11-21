"use strict";

const LONG_TASK_MS = 30_000;

function shouldPlayCompletionSound(mode = "long", durationMs) {
  if (mode === "off") return false;
  if (mode === "always") return true;
  return Number.isFinite(durationMs) && durationMs >= LONG_TASK_MS;
}

// Kept separately from visual/session freshness timestamps: permission waits,
// subagent traffic and thinking/working switches must not restart the clock.
function createCompletionSoundTracker() {
  const tasks = new Map();
  return {
    observe(id, state, event, now = Date.now()) {
      if (event === "SessionEnd" || event === "Interrupt" || event === "StopFailure") {
        tasks.delete(id);
        return;
      }
      if (event === "Stop" || event === "event_msg:task_complete") {
        const task = tasks.get(id);
        if (task && task.completed !== true) task.stoppedAt = now;
      } else if (["working", "thinking", "juggling", "sweeping", "carrying"].includes(state)) {
        const task = tasks.get(id);
        if (task && task.completed !== true) task.stoppedAt = null;
        else tasks.set(id, { startedAt: now, stoppedAt: null });
      }
    },
    finish(id, now = Date.now()) {
      const task = tasks.get(id);
      if (!task) return null;
      if (task.completed !== true) {
        task.durationMs = Math.max(0, (task.stoppedAt ?? now) - task.startedAt);
        task.completed = true;
      }
      // Keep the settled duration until the next work event: an idle JSONL
      // terminal may later be upgraded to an official Stop celebration.
      return task.durationMs;
    },
    delete(id) { tasks.delete(id); },
    clear() { tasks.clear(); },
  };
}

module.exports = { LONG_TASK_MS, shouldPlayCompletionSound, createCompletionSoundTracker };
