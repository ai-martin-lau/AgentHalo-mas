# AgentHalo 1.0.7 Mac App Store 截图

交付：6 种语言 × 5 张 PNG。每张 2880×1800、RGB、不含透明通道。另附 `overview.png`（6 行 × 5 列）与 `search-preview.png`（6 行，每行该语言前三张，每张宽 480 像素）。

## 重出全部文件

在仓库根目录执行：

```sh
node store/screenshots-1.0.7/generate.cjs
```

依赖：本机 Google Chrome、Node.js、Python 3 + Pillow、`agenthalo/node_modules/@electron/asar`、已安装的 `playwright-core`。生成器会使用本机已有的 `/Users/martin/halo/halotrack/node_modules/playwright-core`；其他机器可通过 `PLAYWRIGHT_CORE_PATH` 指向其已安装目录，通过 `CHROME_PATH` 指向 Chrome 可执行文件。无需安装依赖或联网。

仅检查图片及重出总览：

```sh
python3 store/screenshots-1.0.7/verify.py
```

源文件为 `canvas.html`、`canvas.css`、`canvas.js`、`copy.json`、`generate.cjs` 和各语言的 `hud.html`。最终 HTML 画布严格为 1440×900 CSS 像素，Chrome 的 `deviceScaleFactor` 为 2。界面底图以 4 倍采样，避免二次放大使界面文字模糊；最终画布仍以 2 倍截图输出，未对最终 PNG 做缩放或模式修补。

## 界面来源

| 页 | 来源与处理 |
| --- | --- |
| 01-walk-away | 从 `src/session-hud.html` 原样提取整个真实样式表，使用相同的 `.hud`、`.row`、`.left`、`.title`、`.right`、`.state-chip` 结构与真实应用图标。三条任务、应用名及状态为题目要求的静态夹具；任务名和状态按语言本地化。放大 1.7 倍。右侧直接使用 Halo idle 行第 0 帧。 |
| 02-approve | 直接加载 `src/bubble.html`，运行原 `bubble-format.js`、`bubble-renderer.js`、`bubble.css`；仅注入 `window.bubbleAPI` 传入 `Bash` / `npm test` 权限请求，按钮和所有提示来自真实渲染器。约 1.84 倍放大。Halo 为 waiting 行第 0 帧。 |
| 03-characters | 直接加载 `src/settings.html`，原设置脚本渲染桌面伙伴页。`src/theme-metadata.js` 实时读取 `themes/<id>/theme.json` 与真实预览，10 个角色、Halo 选中，界面放大 1.4 倍，右边和下边有意裁切。前景为指定 10 个原始图集帧，两排各 5 只。 |
| 04-quiet | 同一真实设置页面的 `general` 标签，截取完整提醒分组，包含完成提示音与音量行，放大约 1.75～2 倍。夹具 `completionSoundMode: "long"`、`soundVolume: 0.5`；通过真实按钮展开菜单，选中项来自原组件，菜单向上展开以保留滑杆和 50% 数值。Halo 为 review 行第 0 帧。 |
| 05-privacy | 同一真实设置页面的 `agents` 标签，原脚本渲染连接应用页，Claude Code 与 Codex 的 `integrationInstalled`、`enabled` 为 true。放大 1.4 倍。Halo 为 idle 行第 0 帧。 |
| 关于页（取证） | 同样真实加载 `settings.html?lang=…&tab=about`，使用 `getAboutInfo()` 的真实字段结构，版本 1.0.7；底图保存在各语言 `ui/about.png`，不额外添加第六张商店截图。 |

设置页面均未退回手写 DOM。设置夹具基于 `src/prefs.js` 的 `getDefaults()`，主题列表使用 App 的元数据生成器；语言由设置快照的 `lang` 提供：`en`、`zh`、`zh-TW`、`ja`、`ko`、`es`。未知 API 的订阅方法返回空取消函数，其余返回 `Promise.resolve(undefined)`，所有操作留在夹具内。

Chrome 把 SVG 当 `<img>` 载入时不解析其中的外链 WebP，初次渲染会出现空预览。生成器因此只在预览 URL 夹具中，把原生成 SVG 的 `href="spritesheet.webp"` 内嵌为该文件原始字节的 data URL，并将内部 `image-rendering` 设为 `pixelated`；SVG 几何、图集、角色、设置 DOM 与布局不变，未修改仓库的源文件或素材。

前景角色直接以 CSS 裁取 `pets/<id>/spritesheet.webp`：格子 192×208、8 列 × 11 行，`image-rendering: pixelated`。每个图集像素均保留原样，没有重画、平滑插值或生成新角色。图集本身为 96 像素原生画稿的 2 倍栅格，因此角色集合以图集原尺寸显示，即原生画稿 2 倍；大 Halo 以图集 2 倍显示，即原生画稿 4 倍。

角色集合帧（行／列从 0 开始）：Halo 0/0；fox 3/2；panda 4/3；octopus 7/2；cat 8/0；bunny 3/2；dragon 0/0；penguin 4/3；axolotl 6/0；wukong 3/2。

## 验证证据

- `audit.json`：记录每张标题、副标题、标题行数、文字边界、语言、标签页、菜单与角色帧；所有真实页面的 JavaScript 错误数组为空。
- 直接只读解析 `agenthalo/dist/mas-dev-universal/AgentHalo.app/Contents/Resources/app.asar`，与本地源代码比较；50 个打包内相关 HTML／CSS／JS 文件逐字一致。10 个角色图集、10 个主题 JSON 与 `app.asar.unpacked` 逐字一致。SHA-256 及逐文件结果在 `audit.json`。
- `validation.json`：Python/Pillow 检查全部 30 张，尺寸均为 2880×1800、模式均为 RGB，数量与语言／页名组合完整。
- 逐张视觉检查记录在 `visual-review.md`：标题至多两行，给定文案未改写；非英文画面没有额外英文提示或空白预览；命令、审批按钮、音量与连接状态可读，前景像素清楚，无加载中或报错占位。
- 全程只启动 Chrome headless，未启动 AgentHalo、未使用 `open`、未打开 GUI 窗口；HTTP(S) 页面请求均在生成上下文内拦截。

## 已知限制与边界

- HUD 按题目要求使用真实样式与结构的静态任务夹具，未运行 `session-hud-renderer.js`：原渲染器会把长标题截为 15 个单位，并将状态合并显示，无法同时保留指定的完整任务名和三种状态。设置页与权限气泡使用真实渲染器。
- 英文、西班牙文等较长的完成提示音选项，在真实组件的收起按钮中会原生省略；已展开真实菜单显示完整的当前选中项，保留 App 原行为。
- 设置页的连接与任务数据为截图夹具，不代表读取了本机个人任务或实际授权状态。关于页只作为代码渲染取证。
- 未启动打包 App 做运行时对照；依照任务边界，以包内渲染代码和素材的逐字／哈希一致性作为对照依据。
- 系统字体及 Chrome 版本改变可能影响跨机器的逐像素一致性，当前环境的完整结果已落盘。
- 本次只新增本目录内文件；保留任务开始前已有的空文件 `codex-last.md`，不将其纳入本次提交。未推送，未访问或修改 App Store Connect。
