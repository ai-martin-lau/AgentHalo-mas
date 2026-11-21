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

源文件为 `canvas.html`、`canvas.css`、`canvas.js`、`copy.json`、`frame-bounds.json`、`generate.cjs` 和各语言的 `hud.html`。最终 HTML 画布严格为 1440×900 CSS 像素，Chrome 的 `deviceScaleFactor` 为 2。界面底图以 4 倍采样，避免二次放大使界面文字模糊；最终画布仍以 2 倍截图输出，未对最终 PNG 做缩放或模式修补。

## 界面来源

| 页 | 来源与处理 |
| --- | --- |
| 01-walk-away | 从 `src/session-hud.html` 原样提取整个真实样式表，使用相同的 `.hud`、`.row`、`.left`、`.title`、`.right`、`.state-chip` 结构与真实应用图标。三条任务、应用名及状态为题目要求的静态夹具；任务名和状态按语言本地化。浮窗放大 1.8 倍，宽 936 CSS 像素，与 Halo 在下方 600 像素画面区域共同垂直居中。右侧直接使用 Halo idle 行第 0 帧，去掉透明边距后的实际高度为 400 CSS 像素。 |
| 02-approve | 直接加载 `src/bubble.html`，运行原 `bubble-format.js`、`bubble-renderer.js`、`bubble.css`；仅注入 `window.bubbleAPI` 传入 `Bash` / `npm test` 权限请求，按钮和所有提示来自真实渲染器。约 1.84 倍放大。Halo 为 waiting 行第 0 帧。本轮不改该页，六种语言的最终 PNG 保留上一提交的完整字节；仍重渲 HTML 检查位置关系。 |
| 03-characters | 直接加载 `src/settings.html`，原设置脚本渲染桌面伙伴页。`src/theme-metadata.js` 实时读取 `themes/<id>/theme.json` 与真实预览，10 个角色、Halo 选中。左侧约 55% 区域独立排列 10 只睁眼桌宠，两排各 5 只、等间距；右侧约 45% 区域裁取同一 `ui/theme.png` 的内容区，1.15 倍显示，完整保留首排 Halo、狐狸、熊猫三张卡片与名字，其余向右、下裁切。两个区域不相交。 |
| 04-quiet | 同一真实设置页面的 `general` 标签，截取完整提醒分组，包含完成提示音与音量行，放大约 1.69～1.94 倍。按本轮验收要求，仅在截图夹具中把分组标题的左内边距改为 19 CSS 像素，与卡片行文字对齐；未改 App 的 CSS 文件。Halo 移到卡片右侧独立区域。夹具 `completionSoundMode: "long"`、`soundVolume: 0.5`；通过真实按钮展开菜单，选中项来自原组件，菜单向上展开以保留滑杆和 50% 数值。Halo 为 review 行第 0 帧。 |
| 05-privacy | 同一真实设置页面的 `agents` 标签，原脚本渲染连接应用页，Claude Code 与 Codex 的 `integrationInstalled`、`enabled` 为 true。裁取原截图的内容区并放大 1.4 倍，完整露出两个断开按钮及开关。Halo 为 idle 行第 0 帧，独立放在窗口左侧外面。 |
| 关于页（取证） | 同样真实加载 `settings.html?lang=…&tab=about`，使用 `getAboutInfo()` 的真实字段结构，版本 1.0.7；底图保存在各语言 `ui/about.png`，不额外添加第六张商店截图。 |

设置页面均未退回手写 DOM。设置夹具基于 `src/prefs.js` 的 `getDefaults()`，主题列表使用 App 的元数据生成器；语言由设置快照的 `lang` 提供：`en`、`zh`、`zh-TW`、`ja`、`ko`、`es`。未知 API 的订阅方法返回空取消函数，其余返回 `Promise.resolve(undefined)`，所有操作留在夹具内。

Chrome 把 SVG 当 `<img>` 载入时不解析其中的外链 WebP，初次渲染会出现空预览。生成器因此只在预览 URL 夹具中，把原生成 SVG 的 `href="spritesheet.webp"` 内嵌为该文件原始字节的 data URL，并将内部 `image-rendering` 设为 `pixelated`；SVG 几何、图集、角色、设置 DOM 与布局不变，未修改仓库的源文件或素材。

前景角色直接以 CSS 裁取 `pets/<id>/spritesheet.webp`：格子 192×208、8 列 × 11 行，`image-rendering: pixelated`。每个图集像素均保留原样，没有重画、平滑插值或生成新角色。图集本身为 96 像素原生画稿的 2 倍栅格，因此角色集合以图集原尺寸显示，即原生画稿 2 倍。01 按本轮要求显示为实际 400 CSS 像素高，即图集 2.5 倍、原生像素 5 倍；其他大 Halo 为图集 2 倍。`frame-bounds.json` 只记录真实帧的非透明边界，CSS 裁去透明留白，不裁角色本体。

角色集合帧（行／列从 0 开始）：Halo 0/0；fox 3/1；panda 4/3；octopus 3/0；cat 4/0；bunny 3/1；dragon 0/0；penguin 4/1；axolotl 6/0；wukong 3/2。已逐只查看原帧确认睁眼。章鱼 running、猫 review 原行均有眯眼，按本轮要求换为睁眼的 waving／jumping 帧。

## 验证证据

- `audit.json`：记录每张标题、副标题、标题行数、文字边界、语言、标签页、菜单、角色帧和实际矩形。30 张均自动验证角色与界面矩形不相交、角色之间不相交、角色不被裁切；03 额外验证首排前三张卡片完整处于右侧可视区；02 记录文件 SHA-256，确认六种语言未改变。所有真实页面的 JavaScript 错误数组为空。
- 直接只读解析 `agenthalo/dist/mas-dev-universal/AgentHalo.app/Contents/Resources/app.asar`，与本地源代码比较；50 个打包内相关 HTML／CSS／JS 文件逐字一致。10 个角色图集、10 个主题 JSON 与 `app.asar.unpacked` 逐字一致。SHA-256 及逐文件结果在 `audit.json`。
- `validation.json`：Python/Pillow 检查全部 30 张，尺寸均为 2880×1800、模式均为 RGB，数量与语言／页名组合完整。
- 逐张直接打开 2880×1800 原尺寸 PNG 检查，记录在 `visual-review.md`：标题至多两行，给定文案未改写；03 的十只大桌宠全部睁眼，两侧独立；04 分组标题左对齐；05 两个断开按钮及全部控件无桌宠遮挡。30 张均无桌宠遮挡界面文字或控件，前景像素清楚，无加载中或报错占位。
- 全程只启动 Chrome headless，未启动 AgentHalo、未使用 `open`、未打开 GUI 窗口；HTTP(S) 页面请求均在生成上下文内拦截。

## 已知限制与边界

- HUD 按题目要求使用真实样式与结构的静态任务夹具，未运行 `session-hud-renderer.js`：原渲染器会把长标题截为 15 个单位，并将状态合并显示，无法同时保留指定的完整任务名和三种状态。设置页与权限气泡使用真实渲染器。
- 英文、西班牙文等较长的完成提示音选项，在真实组件的收起按钮中会原生省略；已展开真实菜单显示完整的当前选中项，保留 App 原行为。
- 设置页的连接与任务数据为截图夹具，不代表读取了本机个人任务或实际授权状态。关于页只作为代码渲染取证。
- 未启动打包 App 做运行时对照；依照任务边界，以包内渲染代码和素材的逐字／哈希一致性作为对照依据。
- 系统字体及 Chrome 版本改变可能影响跨机器的逐像素一致性，当前环境的完整结果已落盘。
- 本轮只修改或新增本目录内文件；保留任务开始前已有的空文件 `codex-last.md`，不将其纳入本次提交。未推送，未访问或修改 App Store Connect。
