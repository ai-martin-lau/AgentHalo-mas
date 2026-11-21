"use strict";

const REVIEW_URL = "macappstore://apps.apple.com/app/id6814860893?action=write-review";
const REVIEW_WEB_URL = "https://apps.apple.com/app/id6814860893?action=write-review";

// Called only by an explicit menu or Settings action. Never prompt on launch.
async function openAppStoreReview(shell) {
  try {
    try {
      await shell.openExternal(REVIEW_URL);
    } catch {
      await shell.openExternal(REVIEW_WEB_URL);
    }
    return { status: "ok" };
  } catch (err) {
    return { status: "error", message: (err && err.message) || String(err) };
  }
}

module.exports = { openAppStoreReview, REVIEW_URL, REVIEW_WEB_URL };
