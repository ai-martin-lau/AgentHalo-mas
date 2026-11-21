# AgentHalo 1.0.7 App Preview

以用户提供的 21 秒分镜与英文／简体中文文案为制作设计。故事为：交出长任务 → 去做别的 → 执行前询问 → 完成提醒 → 十只角色 → 品牌收尾。

- 1920×1080、30 fps，固定时间函数 `window.renderAt(t)`。不实时录屏。
- 静态暖米色至薄荷色桌面；左上 64px 字幕；右下 Halo；左边仅一个无文字的模糊通用窗口。
- 真正的 Codex v2 图集原始像素：主角色整数 2 倍，横排整数 1 倍，120ms 换帧。Halo 原始可见高度 160px，因此主角色可见约 320px，横排约 160px；优先遵守整数倍、无插值。
- HUD 提取 `session-hud.html` 的完整样式，按其行结构展示指定的完整任务标题和分镜状态。文案读取 App `i18n.js`。按照分镜展示 Thinking／Done，不调用 App 的任务管理逻辑。
- 权限气泡直接使用 `bubble.html`、`bubble.css`、`bubble-format.js`、`bubble-renderer.js`，仅注入无副作用的本地 `bubbleAPI`。中文按钮为真实 App 的「批准／拒绝」。保留真实界面的语义色与 Claude Code 图标原色；桌面和字幕不添加其他强调色。
- 7.0s 显示权限气泡并混入 confirm.mp3；11.22–11.42s 显示按钮按下；11.65s 气泡消失；13.2s Done + complete.mp3 + jumping 五帧一次；13.8s waving。
- 15.5s 开始依序展示十只角色，相隔 0.12s；19.0s 品牌卡。交接处仅有 0.2s 透明度交叠，避免纯背景空帧。
- 收尾卡使用 `assets/icon.png`。21 秒静音底轨 + 两段音效，立体声 AAC 48kHz，无音乐。
- 只以无头 Chrome 工作，静音、隔离临时 profile、不访问外网、不启动产品、不操作桌面。

本次只渲染 en-US / zh-Hans。后续语言只需新增一份 `locales/<locale>.json` 并设置现有 App 语言键（zh-TW / ja / ko / es）；渲染脚本读取真实 App 文案，无需改时间轴。
