"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { REVIEW_URL } = require("../src/app-store-review");
const Module = require("node:module");
const menuPath = require.resolve("../src/menu");
function setup(lang = "en", hidden = false, dnd = false) {
  const calls = [];
  const electron = { app: { quit: () => calls.push("quit"), dock: {} }, screen: {},
    shell: { openExternal: async url => calls.push(["review", url]) },
    Menu: { buildFromTemplate: template => ({ template }) } };
  const previous = Module._load;
  delete require.cache[menuPath];
  Module._load = function(request) { return request === "electron" ? electron : previous.apply(this, arguments); };
  let init;
  try { init = require(menuPath); } finally { Module._load = previous; }
  const ctx = { lang, petHidden: hidden, doNotDisturb: dnd,
    tray: { setContextMenu: menu => { ctx.trayMenu = menu; } },
    openDashboard: () => calls.push("tasks"), openSettingsWindow: () => calls.push("settings"),
    enableDoNotDisturb: () => calls.push("dnd-on"), disableDoNotDisturb: () => calls.push("dnd-off"),
    setPetVisibility: value => calls.push(["visible", value]),
    setPermissionAutomationMode: () => { throw new Error("menu must not change permission policy"); },
    newSessionWithFolder: () => { throw new Error("menu must not launch a session"); } };
  const menu = init(ctx); menu.buildContextMenu(); menu.buildTrayMenu();
  return { ctx, menu, calls };
}
test("both menus expose the same six actions in all seven languages", () => {
  for (const lang of ["en", "zh", "zh-TW", "ko", "ja", "pt-BR", "es"]) {
    const {ctx} = setup(lang);
    const a = ctx.contextMenu.template, b = ctx.trayMenu.template;
    assert.deepEqual(a.map(x=>x.label), b.map(x=>x.label));
    const actions = a.filter(x=>x.type !== "separator");
    assert.equal(actions.length, 6);
    assert.equal(actions.some(x=>x.submenu || x.enabled === false), false);
    assert.equal(new Set(actions.map(x=>x.label)).size, 6);
  }
});
test("menu actions route correctly and visibility uses the displayed intent", async () => {
  const {ctx,calls} = setup();
  const [tasks,dnd,settings,visibility,rate,quit] = ctx.contextMenu.template.filter(x=>x.type !== "separator");
  tasks.click(); dnd.click({checked:true}); dnd.click({checked:false}); settings.click();
  ctx.petHidden = true; visibility.click(); await rate.click(); quit.click();
  assert.deepEqual(calls,["tasks","dnd-on","dnd-off","settings",["visible",false],["review",REVIEW_URL],"quit"]);
  assert.equal(ctx.isQuitting,true);
});
test("hidden and quiet states remain visible and reversible from tray", () => {
  const {ctx,calls} = setup("zh",true,true);
  const items = ctx.trayMenu.template.filter(x=>x.type !== "separator");
  assert.equal(items[1].checked,true);
  assert.equal(items[3].label,"显示桌宠");
  items[3].click(); assert.deepEqual(calls,[["visible",true]]);
});

test("rating opens only on a click from either menu in every language", async () => {
  const { createTranslator } = require("../src/i18n");
  for (const lang of ["en", "zh", "zh-TW", "ko", "ja", "pt-BR", "es"]) {
    const { ctx, calls } = setup(lang);
    assert.deepEqual(calls, []);
    for (const menu of [ctx.contextMenu, ctx.trayMenu]) {
      const rate = menu.template.find(item => item.label === createTranslator(() => lang)("rateApp"));
      assert.ok(rate);
      assert.deepEqual(await rate.click(), { status: "ok" });
    }
    assert.deepEqual(calls, [["review", REVIEW_URL], ["review", REVIEW_URL]]);
  }
});
