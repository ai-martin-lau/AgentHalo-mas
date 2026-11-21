# AgentHalo 界面文案破折号清理结果

日期：2026-11-21。分支：`v1.0.7`。

共修改 **228 条源代码界面字符串**，覆盖七种语言。按各翻译表的语言归属统计，重复出现在不同表中的文案分别计数；通用格式模板单独计数，不重复计入七种语言。测试期望值和本报告不计入文案数量。

| 语言 | 修改条数 |
| --- | ---: |
| en | 50 |
| zh | 31 |
| zh-TW | 32 |
| ja | 31 |
| ko | 30 |
| pt-BR | 42 |
| es | 9 |
| 通用模板（七种语言共用） | 3 |
| 合计 | 228 |

其中：`settings-i18n.js` 191 条，`i18n.js` 15 条，`bubble-renderer.js` 9 条，其他 10 个源文件合计 13 条。五条气泡文案原本通过 `\u2014` 保存，现已一起清理。

## 保留的例外

- 无数据占位符 `"—"`：`settings-i18n.js` 的 `recapMetricUnavailable`（en、zh、zh-TW、ja、ko、pt-BR、es，7 处）；`quota-ring-renderer.js` 的未知百分比（1 处）；`settings-tab-anim-overrides.js` 的空资源名称和静态状态（2 处）。合计 10 处。
- 数字范围 `17–20`：`settings-i18n.js` 的 `discordPresenceInvalidAppId`（en、zh、zh-TW，3 处），保留。
- 动态数值范围 `${TEXT_SCALE_MIN}–${TEXT_SCALE_MAX}`：`settings-actions.js`，保留。
- 周日期区间：`settings-tab-recap.js` 原来的 em dash 改为表示日期范围的 en dash，例如 `Nov 15 – Nov 21`。这属于范围标记，不是句中破折号；检查仅为该确切日期模板放行。

## 检查范围与边界

- 新增 `agenthalo/test/ui-copy-no-dashes.test.js`，递归扫描 `src/` 内的 JS、HTML 和 CSS（排除明确要求避开的 `builtin-pets.js`）。检查单引号、双引号、模板字符串、嵌套插值、Unicode 转义、HTML 文本/属性/实体以及内嵌脚本和 CSS 文本。
- 回归测试覆盖破折号拦截，并验证注释、正则表达式、日志、无数据占位符与数值范围不会被误改。拼接字符串或插值中的分隔用 em dash 不作为无数据占位符放行。
- 注释与日志保持原样，包括 `console.*`、权限日志和窗口恢复日志。`focus.js` 内嵌 PowerShell 脚本的 `#` 注释也保持原样。
- `settings-controller.js` 的 `applyBulk` 内部 API 校验错误保持原样，检查仅按文件和完整字符串精确排除；它不是界面文案。代码内部标识没有改动。
- `builtin-pets.js` 没有修改；`store/` 只新建本报告，未改动其他文件。未执行 `open`，未启动 AgentHalo 或任何 GUI，未切换前台窗口。

## 验证结果

- `AGENTHALO_TEST_NO_GUI=1 npm test`：退出码 0；共 9623 项，9585 通过，0 失败，0 取消，38 跳过，937 个套件。耗时见下方原始摘要。
- 新增文案检查及其扫描器验证共 3 项，全部通过；同步更新 `shortcut-actions.test.js` 的 1 条旧文案期望及 `settings-renderer-browser-env.test.js` 的 2 条旧文案期望。
- 对三份翻译表实际修改的 215 项核对：语言集合、键集合、非字符串值及 `{agent}`、`{brand}`、`{pct}` 等插值占位符均保持一致。逐条审阅改写，保留原有信息和语言含义。
- `git diff --check` 通过。没有未解决的失败项。

```text
ℹ tests 9623
ℹ suites 937
ℹ pass 9585
ℹ fail 0
ℹ cancelled 0
ℹ skipped 38
ℹ todo 0
ℹ duration_ms 22068.565834
```

## 中文和英文完整对照

下面列出 en、zh、zh-TW 的全部修改，以及七种语言共用的三条格式模板。其他语言只列数量：ja 31 条、ko 30 条、pt-BR 42 条、es 9 条。

| 语言 | 文件与键或位置 | 旧 → 新 |
| --- | --- | --- |
| en | <code>agenthalo/src/settings-i18n.js:discordPresenceSubtitle</code> | <code>Show your current agent and a coarse status on your Discord profile. Read-only and off by default — only the agent type and a coarse state (idle / thinking / working / waiting) are shared.</code> → <code>Show your current agent and a coarse status on your Discord profile. Read-only and off by default. Only the agent type and a coarse state (idle / thinking / working / waiting) are shared.</code> |
| en | <code>agenthalo/src/settings-i18n.js:discordPresenceDesktopRequiredNote</code> | <code>Requires the Discord Desktop app to be running and signed in. No bot, token, or server invite — and nothing to configure.</code> → <code>Requires the Discord Desktop app to be running and signed in. No bot, token, or server invite is needed, and there is nothing to configure.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyOneWayLabel</code> | <code>Notifications only — Slack cannot approve</code> → <code>Notifications only: Slack cannot approve</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyPrivacyDesc</code> | <code>Messages are posted to a Slack channel and can include the session title, folder name, and host name — everyone in that channel can read them. Use a private channel.</code> → <code>Messages are posted to a Slack channel and can include the session title, folder name, and host name. Everyone in that channel can read them. Use a private channel.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyCardReadyToEnable</code> | <code>Configured — flip the switch to start.</code> → <code>Configured. Flip the switch to start.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyEventPermissionDesc</code> | <code>Post a read-only heads-up when a tool needs approval — Slack cannot answer it; you decide in the desktop app.</code> → <code>Post a read-only heads-up when a tool needs approval. Slack cannot answer it; you decide in the desktop app.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyRevokeNote</code> | <code>Removing a credential here does not revoke it at Slack — delete the webhook or revoke the token in your Slack app as well.</code> → <code>Removing a credential here does not revoke it at Slack. Delete the webhook or revoke the token in your Slack app as well.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyErrNotFound</code> | <code>That Slack webhook no longer exists — it may have been deleted.</code> → <code>That Slack webhook no longer exists; it may have been deleted.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyErrUnauthorized</code> | <code>Slack rejected the bot token — it may be invalid or revoked.</code> → <code>Slack rejected the bot token; it may be invalid or revoked.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyErrInvalidWebhook</code> | <code>That is not a Slack webhook URL — it must start with https://hooks.slack.com/.</code> → <code>That is not a Slack webhook URL; it must start with https://hooks.slack.com/.</code> |
| en | <code>agenthalo/src/settings-i18n.js:slackNotifyErrInvalidToken</code> | <code>That is not a bot token — it must start with xoxb-.</code> → <code>That is not a bot token; it must start with xoxb-.</code> |
| en | <code>agenthalo/src/settings-i18n.js:feishuApprovalEventSubStep2</code> | <code>2. Set the subscription method to long connection (finish step 3 first — {brand} only saves this while the long connection is online).</code> → <code>2. Set the subscription method to long connection (finish step 3 first; {brand} only saves this while the long connection is online).</code> |
| en | <code>agenthalo/src/settings-i18n.js:feishuApprovalEventSubStep3</code> | <code>3. Add the &quot;card.action.trigger&quot; callback — not the legacy card.action.trigger_v1, which cannot use long connections.</code> → <code>3. Add the &quot;card.action.trigger&quot; callback, not the legacy card.action.trigger_v1, which cannot use long connections.</code> |
| en | <code>agenthalo/src/settings-i18n.js:feishuApprovalTestNoResponse</code> | <code>The test card was sent, but no button press came back within 60 seconds. This usually means the card.action.trigger callback is not subscribed in the {brand} Open Platform — check step 4.</code> → <code>The test card was sent, but no button press came back within 60 seconds. This usually means the card.action.trigger callback is not subscribed in the {brand} Open Platform. Check step 4.</code> |
| en | <code>agenthalo/src/settings-i18n.js:feishuApprovalTestSendFailed</code> | <code>Sending the test card failed — check the approver user id and the bot&#x27;s messaging permission.</code> → <code>Sending the test card failed. Check the approver user id and the bot&#x27;s messaging permission.</code> |
| en | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorInvalidConfig</code> | <code>The {brand} approval config is incomplete — check the approver user id.</code> → <code>The {brand} approval config is incomplete. Check the approver user id.</code> |
| en | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorInvalidSecret</code> | <code>That App ID does not look like a self-built app id — {brand} self-built app ids start with cli_.</code> → <code>That App ID does not look like a self-built app id; {brand} self-built app ids start with cli_.</code> |
| en | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorWrongPlatform</code> | <code>The selected platform does not match your app — this App ID is registered on the other platform. Switch the platform above.</code> → <code>The selected platform does not match your app. This App ID is registered on the other platform. Switch the platform above.</code> |
| en | <code>agenthalo/src/settings-i18n.js:remoteSshSubtitle</code> | <code>Manage one-click SSH tunnels for remote AI coding sessions. Profiles never store passwords or passphrases — AgentHalo relies on your existing ssh-agent / SSH keys.</code> → <code>Manage one-click SSH tunnels for remote AI coding sessions. Profiles never store passwords or passphrases. AgentHalo relies on your existing ssh-agent / SSH keys.</code> |
| en | <code>agenthalo/src/settings-i18n.js:remoteSshDeployDriftWarning</code> | <code>Deploy ran against the previous configuration — please redeploy</code> → <code>Deploy ran against the previous configuration. Please redeploy</code> |
| en | <code>agenthalo/src/settings-i18n.js:remoteSshIsolatedPrepared</code> | <code>Experimental isolated root prepared — CLI evidence pending</code> → <code>Experimental isolated root prepared; CLI evidence pending</code> |
| en | <code>agenthalo/src/settings-i18n.js:remoteSshErrUnknownStrikes</code> | <code>Multiple unrecognized errors in a row — please check the profile and logs.</code> → <code>Multiple unrecognized errors in a row. Please check the profile and logs.</code> |
| en | <code>agenthalo/src/settings-i18n.js:shortcutUnassigned</code> | <code>— unassigned —</code> → <code>unassigned</code> |
| en | <code>agenthalo/src/settings-i18n.js:agentInstancePairedNoConnectivity</code> | <code>Paired, but this distro cannot reach AgentHalo — WSL NAT networking does not share localhost. Set networkingMode=mirrored in .wslconfig and restart WSL.</code> → <code>Paired, but this distro cannot reach AgentHalo. WSL NAT networking does not share localhost. Set networkingMode=mirrored in .wslconfig and restart WSL.</code> |
| en | <code>agenthalo/src/settings-i18n.js:codexHookHealthReasonNeedsReview</code> | <code>AgentHalo&#x27;s Codex hooks are registered but need approval in Codex — run /hooks in Codex, or use Doctor → Fix.</code> → <code>AgentHalo&#x27;s Codex hooks are registered but need approval in Codex. Run /hooks in Codex, or use Doctor → Fix.</code> |
| en | <code>agenthalo/src/settings-i18n.js:rowSessionCleanupGroupDesc</code> | <code>How long AgentHalo waits before clearing inactive sessions. Mainly affects remote SSH sessions where the terminal isn&#x27;t visible — raise the limit for long-running remote work, or set Session timeout to 0 to never clear by time.</code> → <code>How long AgentHalo waits before clearing inactive sessions. Mainly affects remote SSH sessions where the terminal isn&#x27;t visible. Raise the limit for long-running remote work, or set Session timeout to 0 to never clear by time.</code> |
| en | <code>agenthalo/src/settings-i18n.js:rowStaleSessionDesc</code> | <code>Remote SSH sessions are removed after this much idle time. Local sessions whose terminal is still open are not removed — they just dim to idle. Default 10 min. 0 = never remove by time. Must be at least as long as Working timeout.</code> → <code>Remote SSH sessions are removed after this much idle time. Local sessions whose terminal is still open are not removed; they just dim to idle. Default 10 min. 0 = never remove by time. Must be at least as long as Working timeout.</code> |
| en | <code>agenthalo/src/settings-i18n.js:permissionAutomationAutoToolsDesc</code> | <code>Recommended. Supported tool requests—including terminal commands, file writes, and deletions—are approved automatically; questions and plan reviews still wait for you. CodeBuddy questions and plan reviews return to its native approval flow.</code> → <code>Recommended. Supported tool requests (including terminal commands, file writes, and deletions) are approved automatically; questions and plan reviews still wait for you. CodeBuddy questions and plan reviews return to its native approval flow.</code> |
| en | <code>agenthalo/src/settings-i18n.js:rowFullscreenOverlayDesc</code> | <code>On Windows, keep the pet usable over fullscreen games — it stays on top, stays draggable, and won&#x27;t steal the game&#x27;s focus. Off restores the unoptimized default. A borderless-fullscreen game always keeps the pet on top; to remove it use Hide Pet. (Behavior over exclusive-fullscreen games may vary.)</code> → <code>On Windows, keep the pet usable over fullscreen games: it stays on top, stays draggable, and won&#x27;t steal the game&#x27;s focus. Off restores the unoptimized default. A borderless-fullscreen game always keeps the pet on top; to remove it use Hide Pet. (Behavior over exclusive-fullscreen games may vary.)</code> |
| en | <code>agenthalo/src/settings-i18n.js:rowFullscreenAutoHideDesc</code> | <code>Hide the pet and its floating panels while a fullscreen app — a game, a video — is in the foreground, and bring them back when it ends. Choosing Show Pet keeps the pet visible until the next fullscreen app. Windows only.</code> → <code>Hide the pet and its floating panels while a fullscreen app (a game or a video) is in the foreground, and bring them back when it ends. Choosing Show Pet keeps the pet visible until the next fullscreen app. Windows only.</code> |
| en | <code>agenthalo/src/settings-i18n.js:animMapSubtitle</code> | <code>Silence individual interrupt animations. Events still fire — AgentHalo just skips the visual and sound for the selected states.</code> → <code>Silence individual interrupt animations. Events still fire; AgentHalo just skips the visual and sound for the selected states.</code> |
| en | <code>agenthalo/src/settings-i18n.js:animOverridesAspectWarning</code> | <code>This asset&#x27;s aspect ratio differs from the original by {pct}% — the hitbox and positioning may need manual tuning.</code> → <code>This asset&#x27;s aspect ratio differs from the original by {pct}%; the hitbox and positioning may need manual tuning.</code> |
| en | <code>agenthalo/src/settings-i18n.js:mobileBetaNote</code> | <code>Beta limitation: the phone page is a read-only preview for now — you can watch session status, but approval actions are still in development.</code> → <code>Beta limitation: the phone page is a read-only preview for now. You can watch session status, but approval actions are still in development.</code> |
| en | <code>agenthalo/src/settings-i18n.js:mobileCardRunning</code> | <code>LAN bridge is live — open the pair URL on your phone.</code> → <code>LAN bridge is live. Open the pair URL on your phone.</code> |
| en | <code>agenthalo/src/settings-i18n.js:mobileDesc</code> | <code>Connect your phone to monitor sessions. Read-only LAN preview — no write or approval operations.</code> → <code>Connect your phone to monitor sessions. Read-only LAN preview: no write or approval operations.</code> |
| en | <code>agenthalo/src/settings-i18n.js:aboutEasterEggToast</code> | <code>🦀 Coding shouldn&#x27;t feel lonely. — Ruller_Lulu / 鹿鹿</code> → <code>🦀 Coding shouldn&#x27;t feel lonely. (Ruller_Lulu / 鹿鹿)</code> |
| en | <code>agenthalo/src/i18n.js:shortcutUnassigned</code> | <code>— unassigned —</code> → <code>unassigned</code> |
| en | <code>agenthalo/src/i18n.js:approvalSummaryUnavailable</code> | <code>No description available — check the AgentHalo bubble on your desktop before deciding.</code> → <code>No description available. Check the AgentHalo bubble on your desktop before deciding.</code> |
| en | <code>agenthalo/src/bubble-renderer.js</code> | <code>alwaysAllowBlanketTitle: &quot;Warning: {agent}&#x27;s &#x27;always&#x27; rule auto-approves every subsequent tool call of the same category in this session (including rm and similar destructive commands). The rule lives only in memory — restart {agent} to revoke.&quot;,</code> → <code>alwaysAllowBlanketTitle: &quot;Warning: {agent}&#x27;s &#x27;always&#x27; rule auto-approves every subsequent tool call of the same category in this session (including rm and similar destructive commands). The rule lives only in memory. Restart {agent} to revoke.&quot;,</code> |
| en | <code>agenthalo/src/tutorial-renderer.js</code> | <code>const unassigned = i18n(&quot;shortcutUnassigned&quot;, &quot;— unassigned —&quot;);</code> → <code>const unassigned = i18n(&quot;shortcutUnassigned&quot;, &quot;unassigned&quot;);</code> |
| en | <code>agenthalo/src/settings-ui-core.js</code> | <code>&#124;&#124; ((value) =&gt; value &#124;&#124; &quot;— unassigned —&quot;);</code> → <code>&#124;&#124; ((value) =&gt; value &#124;&#124; &quot;unassigned&quot;);</code> |
| en | <code>agenthalo/src/shortcut-actions.js</code> | <code>{ isMac = false, unassignedLabel = &quot;— unassigned —&quot; } = {}</code> → <code>{ isMac = false, unassignedLabel = &quot;unassigned&quot; } = {}</code> |
| en | <code>agenthalo/src/remote-ssh-deploy.js</code> | <code>const msg = &quot;Remote default shell is Windows cmd.exe. Remote SSH needs a POSIX shell — set OpenSSH DefaultShell to Git Bash or WSL bash on the remote, then redeploy.&quot;;</code> → <code>const msg = &quot;Remote default shell is Windows cmd.exe. Remote SSH needs a POSIX shell. Set OpenSSH DefaultShell to Git Bash or WSL bash on the remote, then redeploy.&quot;;</code> |
| en | <code>agenthalo/src/settings-actions.js</code> | <code>message: `removeTheme: cannot delete active theme &quot;${themeId}&quot; — switch to another theme first`,</code> → <code>message: `removeTheme: cannot delete active theme &quot;${themeId}&quot;; switch to another theme first`,</code> |
| en | <code>agenthalo/src/settings-actions.js</code> | <code>message: `removeTheme: cannot delete managed Codex Pet theme &quot;${themeId}&quot; — remove it from Petdex instead`,</code> → <code>message: `removeTheme: cannot delete managed Codex Pet theme &quot;${themeId}&quot;; remove it from Petdex instead`,</code> |
| en | <code>agenthalo/src/doctor-detectors/local-server.js</code> | <code>+ &quot; — hooks will omit process metadata&quot;</code> → <code>+ &quot;; hooks will omit process metadata&quot;</code> |
| en | <code>agenthalo/src/doctor-detectors/agent-integrations.js</code> | <code>? &quot;a foreign PermissionRequest hook coexists with AgentHalo&#x27;s; ZCode executes same-event hooks with last-wins decisions — keep exactly one owner for PermissionRequest&quot;</code> → <code>? &quot;a foreign PermissionRequest hook coexists with AgentHalo&#x27;s; ZCode executes same-event hooks with last-wins decisions; keep exactly one owner for PermissionRequest&quot;</code> |
| en | <code>agenthalo/src/doctor-detectors/agent-integrations.js</code> | <code>const missingSuffix = validation.missing ? ` — missing ${validation.missing}` : &quot;&quot;;</code> → <code>const missingSuffix = validation.missing ? `; missing ${validation.missing}` : &quot;&quot;;</code> |
| en | <code>agenthalo/src/doctor-detectors/agent-integrations.js</code> | <code>detail: `${legacyTarget.configPath}: ${issues.join(&quot;; &quot;)} — Fix rewrites AgentHalo&#x27;s Kimi hooks in the current format`,</code> → <code>detail: `${legacyTarget.configPath}: ${issues.join(&quot;; &quot;)}. Fix rewrites AgentHalo&#x27;s Kimi hooks in the current format`,</code> |
| en | <code>agenthalo/src/bubble-renderer.js:irreversibleHint</code> | <code>irreversibleHint: &quot;Destructive action — may not be recoverable&quot;,</code> → <code>irreversibleHint: &quot;Destructive action: may not be recoverable&quot;,</code> |
| zh | <code>agenthalo/src/settings-i18n.js:discordPresenceSubtitle</code> | <code>在你的 Discord 个人资料上显示当前的 Agent 和粗略状态。只读、默认关闭——仅共享 Agent 类型和粗略状态（空闲 / 思考 / 工作 / 等待）。</code> → <code>在你的 Discord 个人资料上显示当前的 Agent 和粗略状态。只读、默认关闭，仅共享 Agent 类型和粗略状态（空闲 / 思考 / 工作 / 等待）。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:discordPresenceDesktopRequiredNote</code> | <code>需要 Discord 桌面版正在运行并已登录。无需机器人、令牌或服务器邀请——也无需任何配置。</code> → <code>需要 Discord 桌面版正在运行并已登录。无需机器人、令牌或服务器邀请，也无需任何配置。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyOneWayLabel</code> | <code>仅通知——Slack 无法审批</code> → <code>仅通知，Slack 无法审批</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyPrivacyDesc</code> | <code>消息会发送到 Slack 频道，可能包含会话标题、目录名与主机名——该频道中的所有人都能看到。建议使用私有频道。</code> → <code>消息会发送到 Slack 频道，可能包含会话标题、目录名与主机名，该频道中的所有人都能看到。建议使用私有频道。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyCardReadyToEnable</code> | <code>已配置——打开开关即可启用。</code> → <code>已配置，打开开关即可启用。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyEventPermissionDesc</code> | <code>当工具需要审批时发送只读提醒——Slack 无法批准，请在桌面 App 中决定。</code> → <code>当工具需要审批时发送只读提醒。Slack 无法批准，请在桌面 App 中决定。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyRevokeNote</code> | <code>在这里移除只是本地删除，并不会在 Slack 端吊销——请同时在 Slack 应用中删除该 Webhook 或吊销 Token。</code> → <code>在这里移除只是本地删除，并不会在 Slack 端吊销。请同时在 Slack 应用中删除该 Webhook 或吊销 Token。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyErrNotFound</code> | <code>该 Slack Webhook 已不存在——它可能已被删除。</code> → <code>该 Slack Webhook 已不存在，它可能已被删除。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyErrUnauthorized</code> | <code>Slack 拒绝了 Bot Token——它可能无效或已被吊销。</code> → <code>Slack 拒绝了 Bot Token，它可能无效或已被吊销。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyErrInvalidWebhook</code> | <code>这不是 Slack Webhook URL——必须以 https://hooks.slack.com/ 开头。</code> → <code>这不是 Slack Webhook URL，必须以 https://hooks.slack.com/ 开头。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:slackNotifyErrInvalidToken</code> | <code>这不是 Bot Token——必须以 xoxb- 开头。</code> → <code>这不是 Bot Token，必须以 xoxb- 开头。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:feishuApprovalEventSubStep2</code> | <code>2. 订阅方式选择「使用长连接接收回调」（需要先完成第 3 步启用——长连接在线时{brand}才允许保存）。</code> → <code>2. 订阅方式选择「使用长连接接收回调」（需要先完成第 3 步启用，长连接在线时{brand}才允许保存）。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:feishuApprovalEventSubStep3</code> | <code>3. 添加回调，勾选「卡片回传交互」（card.action.trigger）——不要选带「旧」字的 _v1，它不支持长连接。</code> → <code>3. 添加回调，勾选「卡片回传交互」（card.action.trigger）。不要选带「旧」字的 _v1，它不支持长连接。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:feishuApprovalTestSendFailed</code> | <code>测试卡片发送失败——请检查审批人 user id 是否正确、机器人是否有发消息权限。</code> → <code>测试卡片发送失败，请检查审批人 user id 是否正确、机器人是否有发消息权限。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorInvalidConfig</code> | <code>{brand}审批配置不完整——请检查审批人 user id。</code> → <code>{brand}审批配置不完整，请检查审批人 user id。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorInvalidSecret</code> | <code>这个 App ID 不像自建应用的 ID——{brand}自建应用的 App ID 以 cli_ 开头。</code> → <code>这个 App ID 不像自建应用的 ID，{brand}自建应用的 App ID 以 cli_ 开头。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorWrongPlatform</code> | <code>选择的平台和你的应用不匹配——这个 App ID 注册在另一个平台。请在上方切换平台。</code> → <code>选择的平台和你的应用不匹配，这个 App ID 注册在另一个平台。请在上方切换平台。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:remoteSshSubtitle</code> | <code>管理一键 SSH 隧道，让远程 AI 编码会话像本地一样工作。AgentHalo 不存任何密码或私钥口令——依赖你已配置的 ssh-agent / SSH 密钥。</code> → <code>管理一键 SSH 隧道，让远程 AI 编码会话像本地一样工作。AgentHalo 不存任何密码或私钥口令，依赖你已配置的 ssh-agent / SSH 密钥。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:remoteSshDeployDriftWarning</code> | <code>部署期间配置被改动，已部署的是旧配置 — 请重新部署</code> → <code>部署期间配置被改动，已部署的是旧配置，请重新部署</code> |
| zh | <code>agenthalo/src/settings-i18n.js:shortcutUnassigned</code> | <code>— 未绑定 —</code> → <code>未绑定</code> |
| zh | <code>agenthalo/src/settings-i18n.js:agentInstancePairedNoConnectivity</code> | <code>已配对，但该发行版无法访问 AgentHalo——WSL 的 NAT 网络不互通 localhost。请在 .wslconfig 中设置 networkingMode=mirrored 并重启 WSL。</code> → <code>已配对，但该发行版无法访问 AgentHalo，WSL 的 NAT 网络不互通 localhost。请在 .wslconfig 中设置 networkingMode=mirrored 并重启 WSL。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:rowSessionCleanupGroupDesc</code> | <code>AgentHalo 等待多久才清理不活跃会话。主要影响远程 SSH 会话（看不到终端窗口）——远程长任务可调大；设为 0 则永远不按时间清理。</code> → <code>AgentHalo 等待多久才清理不活跃会话。主要影响远程 SSH 会话（看不到终端窗口）。远程长任务可调大；设为 0 则永远不按时间清理。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:rowFullscreenOverlayDesc</code> | <code>在 Windows 上让桌宠在全屏游戏上方依然好用——保持在上方、可拖动，且不会抢走游戏焦点。关闭则回到未优化的原样。无边框全屏游戏下桌宠始终浮在上方；想彻底移除请用「隐藏桌宠」。（独占全屏游戏下的表现可能不一致。）</code> → <code>在 Windows 上让桌宠在全屏游戏上方依然好用：保持在上方、可拖动，且不会抢走游戏焦点。关闭则回到未优化的原样。无边框全屏游戏下桌宠始终浮在上方；想彻底移除请用「隐藏桌宠」。（独占全屏游戏下的表现可能不一致。）</code> |
| zh | <code>agenthalo/src/settings-i18n.js:animMapSubtitle</code> | <code>关掉不想看的打扰动画。事件照样会触发——AgentHalo 只是不再播放对应的动画和音效。</code> → <code>关掉不想看的打扰动画。事件照样会触发，AgentHalo 只是不再播放对应的动画和音效。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:mobileBetaNote</code> | <code>Beta 限制：手机页面目前为只读预览——可以查看会话状态，审批操作仍在开发中。</code> → <code>Beta 限制：手机页面目前为只读预览，可以查看会话状态，审批操作仍在开发中。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:mobileCardRunning</code> | <code>局域网桥接运行中——用手机打开配对 URL。</code> → <code>局域网桥接运行中，用手机打开配对 URL。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:mobileDesc</code> | <code>连接手机查看会话状态。只读局域网预览——无写入或审批操作。</code> → <code>连接手机查看会话状态。只读局域网预览，无写入或审批操作。</code> |
| zh | <code>agenthalo/src/settings-i18n.js:aboutEasterEggToast</code> | <code>🦀 Coding shouldn&#x27;t feel lonely. — Ruller_Lulu / 鹿鹿</code> → <code>🦀 Coding shouldn&#x27;t feel lonely. (Ruller_Lulu / 鹿鹿)</code> |
| zh | <code>agenthalo/src/i18n.js:shortcutUnassigned</code> | <code>— 未绑定 —</code> → <code>未绑定</code> |
| zh | <code>agenthalo/src/i18n.js:approvalSummaryUnavailable</code> | <code>工具未提供描述——决定前请先看一下桌面上的 AgentHalo 气泡。</code> → <code>工具未提供描述，决定前请先看一下桌面上的 AgentHalo 气泡。</code> |
| zh | <code>agenthalo/src/bubble-renderer.js:irreversibleHint</code> | <code>irreversibleHint: &quot;破坏性操作——可能无法恢复&quot;,</code> → <code>irreversibleHint: &quot;破坏性操作，可能无法恢复&quot;,</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:discordPresenceSubtitle</code> | <code>在你的 Discord 個人檔案上顯示目前的 Agent 與粗略狀態。唯讀、預設關閉——僅分享 Agent 類型與粗略狀態（閒置 / 思考 / 工作 / 等待）。</code> → <code>在你的 Discord 個人檔案上顯示目前的 Agent 與粗略狀態。唯讀、預設關閉，僅分享 Agent 類型與粗略狀態（閒置 / 思考 / 工作 / 等待）。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:discordPresenceDesktopRequiredNote</code> | <code>需要 Discord 桌面版正在執行並已登入。無需機器人、權杖或伺服器邀請——也無需任何設定。</code> → <code>需要 Discord 桌面版正在執行並已登入。無需機器人、權杖或伺服器邀請，也無需任何設定。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyOneWayLabel</code> | <code>僅通知——Slack 無法核准</code> → <code>僅通知，Slack 無法核准</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyPrivacyDesc</code> | <code>訊息會傳送到 Slack 頻道，可能包含工作階段標題、目錄名稱與主機名稱——該頻道中的所有人都看得到。建議使用私人頻道。</code> → <code>訊息會傳送到 Slack 頻道，可能包含工作階段標題、目錄名稱與主機名稱，該頻道中的所有人都看得到。建議使用私人頻道。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyCardReadyToEnable</code> | <code>已設定——開啟開關即可啟用。</code> → <code>已設定，開啟開關即可啟用。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyEventPermissionDesc</code> | <code>當工具需要核准時傳送唯讀提醒——Slack 無法核准，請在桌面 App 中決定。</code> → <code>當工具需要核准時傳送唯讀提醒。Slack 無法核准，請在桌面 App 中決定。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyRevokeNote</code> | <code>在這裡移除只是本機刪除，並不會在 Slack 端撤銷——請同時在 Slack 應用程式中刪除該 Webhook 或撤銷 Token。</code> → <code>在這裡移除只是本機刪除，並不會在 Slack 端撤銷。請同時在 Slack 應用程式中刪除該 Webhook 或撤銷 Token。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyErrNotFound</code> | <code>此 Slack Webhook 已不存在——它可能已被刪除。</code> → <code>此 Slack Webhook 已不存在，它可能已被刪除。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyErrUnauthorized</code> | <code>Slack 拒絕了 Bot Token——它可能無效或已被撤銷。</code> → <code>Slack 拒絕了 Bot Token，它可能無效或已被撤銷。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyErrInvalidWebhook</code> | <code>這不是 Slack Webhook URL——必須以 https://hooks.slack.com/ 開頭。</code> → <code>這不是 Slack Webhook URL，必須以 https://hooks.slack.com/ 開頭。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:slackNotifyErrInvalidToken</code> | <code>這不是 Bot Token——必須以 xoxb- 開頭。</code> → <code>這不是 Bot Token，必須以 xoxb- 開頭。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:feishuApprovalEventSubStep2</code> | <code>2. 訂閱方式選擇「使用長連線接收回呼」（需要先完成第 3 步啟用——長連線在線時{brand}才允許儲存）。</code> → <code>2. 訂閱方式選擇「使用長連線接收回呼」（需要先完成第 3 步啟用，長連線在線時{brand}才允許儲存）。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:feishuApprovalEventSubStep3</code> | <code>3. 新增回呼，勾選「卡片回傳互動」（card.action.trigger）——不要選舊版的 _v1，它不支援長連線。</code> → <code>3. 新增回呼，勾選「卡片回傳互動」（card.action.trigger）。不要選舊版的 _v1，它不支援長連線。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:feishuApprovalTestSendFailed</code> | <code>測試卡片發送失敗——請檢查審批人 user id 是否正確、機器人是否有發訊息權限。</code> → <code>測試卡片發送失敗，請檢查審批人 user id 是否正確、機器人是否有發訊息權限。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorInvalidConfig</code> | <code>{brand}審批設定不完整——請檢查審批人 user id。</code> → <code>{brand}審批設定不完整，請檢查審批人 user id。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorInvalidSecret</code> | <code>這個 App ID 不像自建應用的 ID——{brand}自建應用的 App ID 以 cli_ 開頭。</code> → <code>這個 App ID 不像自建應用的 ID，{brand}自建應用的 App ID 以 cli_ 開頭。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:feishuApprovalErrorWrongPlatform</code> | <code>選擇的平台和你的應用不符——這個 App ID 註冊在另一個平台。請在上方切換平台。</code> → <code>選擇的平台和你的應用不符，這個 App ID 註冊在另一個平台。請在上方切換平台。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:remoteSshSubtitle</code> | <code>管理一鍵 SSH 通道，讓遠端 AI 程式設計工作階段像在本機一樣順手。AgentHalo 不會留下任何密碼或私鑰通行片語——靠你已經設好的 ssh-agent 或 SSH 金鑰。</code> → <code>管理一鍵 SSH 通道，讓遠端 AI 程式設計工作階段像在本機一樣順手。AgentHalo 不會留下任何密碼或私鑰通行片語，靠你已經設好的 ssh-agent 或 SSH 金鑰。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:remoteSshDeployDriftWarning</code> | <code>部署期間設定被改過，已部署的是舊設定 — 請重新部署</code> → <code>部署期間設定被改過，已部署的是舊設定，請重新部署</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:shortcutUnassigned</code> | <code>— 未綁定 —</code> → <code>未綁定</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:agentInstancePairedNoConnectivity</code> | <code>已配對，但該發行版無法存取 AgentHalo——WSL 的 NAT 網路不互通 localhost。請在 .wslconfig 中設定 networkingMode=mirrored 並重新啟動 WSL。</code> → <code>已配對，但該發行版無法存取 AgentHalo，WSL 的 NAT 網路不互通 localhost。請在 .wslconfig 中設定 networkingMode=mirrored 並重新啟動 WSL。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:codexHookHealthReasonNeedsReview</code> | <code>AgentHalo 的 Codex hooks 已註冊但需在 Codex 裡確認——在 Codex 執行 /hooks，或用 Doctor → Fix。</code> → <code>AgentHalo 的 Codex hooks 已註冊但需在 Codex 裡確認，在 Codex 執行 /hooks，或用 Doctor → Fix。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:rowSessionCleanupGroupDesc</code> | <code>AgentHalo 等多久才清掉沒動靜的工作階段。主要影響遠端 SSH 工作階段（看不到終端機）——遠端長任務可以放寬；設成 0 就完全不按時間清。</code> → <code>AgentHalo 等多久才清掉沒動靜的工作階段。主要影響遠端 SSH 工作階段（看不到終端機）。遠端長任務可以放寬；設成 0 就完全不按時間清。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:rowFullscreenOverlayDesc</code> | <code>在 Windows 上讓桌寵在全螢幕遊戲上方依然好用——保持在上方、可拖曳，且不會搶走遊戲焦點。關閉則回到未最佳化的原樣。無邊框全螢幕遊戲下桌寵始終浮在上方；想徹底移除請用「隱藏桌寵」。（獨佔全螢幕遊戲下的表現可能不一致。）</code> → <code>在 Windows 上讓桌寵在全螢幕遊戲上方依然好用：保持在上方、可拖曳，且不會搶走遊戲焦點。關閉則回到未最佳化的原樣。無邊框全螢幕遊戲下桌寵始終浮在上方；想徹底移除請用「隱藏桌寵」。（獨佔全螢幕遊戲下的表現可能不一致。）</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:animMapSubtitle</code> | <code>關掉不想看的打擾動畫。事件還是會觸發——AgentHalo 只是不再播對應的動畫和音效。</code> → <code>關掉不想看的打擾動畫。事件還是會觸發，AgentHalo 只是不再播對應的動畫和音效。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:mobileBetaNote</code> | <code>Beta 限制：手機頁面目前為唯讀預覽——可以查看工作階段狀態，核准操作仍在開發中。</code> → <code>Beta 限制：手機頁面目前為唯讀預覽，可以查看工作階段狀態，核准操作仍在開發中。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:mobileCardRunning</code> | <code>區域網路橋接運作中——用手機開啟配對 URL。</code> → <code>區域網路橋接運作中，用手機開啟配對 URL。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:mobileDesc</code> | <code>連接手機查看工作階段狀態。唯讀區域網路預覽——無寫入或核准操作。</code> → <code>連接手機查看工作階段狀態。唯讀區域網路預覽，無寫入或核准操作。</code> |
| zh-TW | <code>agenthalo/src/settings-i18n.js:aboutEasterEggToast</code> | <code>🦀 Coding shouldn&#x27;t feel lonely. — Ruller_Lulu / 鹿鹿</code> → <code>🦀 Coding shouldn&#x27;t feel lonely. (Ruller_Lulu / 鹿鹿)</code> |
| zh-TW | <code>agenthalo/src/i18n.js:shortcutUnassigned</code> | <code>— 未綁定 —</code> → <code>未綁定</code> |
| zh-TW | <code>agenthalo/src/i18n.js:approvalSummaryUnavailable</code> | <code>工具未提供描述——決定前請先看一下桌面上的 AgentHalo 泡泡。</code> → <code>工具未提供描述，決定前請先看一下桌面上的 AgentHalo 泡泡。</code> |
| zh-TW | <code>agenthalo/src/bubble-renderer.js:irreversibleHint</code> | <code>irreversibleHint: &quot;破壞性操作——可能無法復原&quot;,</code> → <code>irreversibleHint: &quot;破壞性操作，可能無法復原&quot;,</code> |
| 通用 | <code>agenthalo/src/settings-tab-remote-ssh.js</code> | <code>line.textContent = `[${ev.status}] ${stepLabel}` + (detail ? ` — ${detail}` : &quot;&quot;);</code> → <code>line.textContent = `[${ev.status}] ${stepLabel}` + (detail ? `; ${detail}` : &quot;&quot;);</code> |
| 通用 | <code>agenthalo/src/slack-message-format.js</code> | <code>`${icon} ${redactMrkdwn(rawTitle)} ${wrapStatus}${fallbackMeta.length ? ` — ${fallbackMeta.join(&quot; · &quot;)}` : &quot;&quot;}`,</code> → <code>`${icon} ${redactMrkdwn(rawTitle)} ${wrapStatus}${fallbackMeta.length ? ` (${fallbackMeta.join(&quot; · &quot;)})` : &quot;&quot;}`,</code> |
| 通用 | <code>agenthalo/src/settings-tab-recap.js</code> | <code>return `${formatDate(data.startDate, { month: &quot;short&quot;, day: &quot;numeric&quot; })} — ${formatDate(end, { month: &quot;short&quot;, day: &quot;numeric&quot; })}`;</code> → <code>return `${formatDate(data.startDate, { month: &quot;short&quot;, day: &quot;numeric&quot; })} – ${formatDate(end, { month: &quot;short&quot;, day: &quot;numeric&quot; })}`;</code> |

## 提交要求

本次提交只包含 13 个源文件、3 个测试文件和本报告。提交邮箱为 `zijingliu123@gmail.com`，提交信息末尾包含指定的 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。不推送。
