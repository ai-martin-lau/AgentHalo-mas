# AgentHalo 1.0.7 App Preview — 制作结果

已完成 en-US、zh-Hans 两条 21 秒成片、两张每 0.5 秒抽帧的总览图及可复用生成脚本。本次改动仅限 `store/preview-1.0.7/`；未修改 `agenthalo/`，未操作并行截图任务目录。未推送、未上传。全程未打开 GUI 窗口、未启动 AgentHalo、未播放声音。

## 本轮验收修改

1. 空白卡已替换为通用代码编辑器：三个红黄绿圆点、14 行长短和缩进不同的圆角代码色条，无应用名、产品图标或真实代码文字。第一段 opacity 0.3；第二段起完整显示，12 秒后继续保留；12.0–12.3 秒轻降到 0.6，保留至 15.5 秒场景交接。
2. 13.2 秒变 Done／已完成并播放完成音效时，任务条开始一次 0.6 秒的轻微放大：13.5 秒达到 1.04，13.8 秒恢复 1.00；同一时段铃铛轻晃两轮。Halo 的 jumping 五帧一次与随后 waving 保留。总览最底行使用成片的 13.200／13.267／13.433／13.500／13.567／13.733 秒真实局部抽帧，直接展示提醒变化。
3. 十只角色全部固定真实图集 idle 第 0 帧，已逐只检查，特别检查狐狸、企鹅、六角恐龙与熊猫的睁眼状态。可见高度 200px，按透明边界裁切后排布，总宽 1726px、左右边距均 97px；标题下方可用区间的中心为 y=640，角色中心与之对齐。全员出场后整排统一上下浮动至多 4px，不再切换表情帧。
4. 第一段 Halo 固定平和睁眼的 idle 第 0 帧，0／0.5／1／2／3.4 秒的角色 canvas 内容完全相同；其余段的动作时序保留。

以上修改均已重新渲染到两条 MP4 中；两张总览及所有媒体检测数据已重新生成。

## 交付物

| 文件 | 内容 |
| --- | --- |
| `AgentHalo-preview-en-US.mp4` | 英文成片，1,669,059 bytes |
| `AgentHalo-preview-zh-Hans.mp4` | 简体中文成片，1,636,854 bytes |
| `en-US-frames.png`、`zh-Hans-frames.png` | 各 42 张全画面（0.0s 至 20.5s，每 15 帧一次）＋底部 6 张完成提醒局部；2880×2352 总览 |
| `render.mjs` | 无第三方 Node 依赖；通过 CDP 控制无头 Chrome，逐帧截图，交给 ffmpeg 编码和混音 |
| `preview.html` | 固定 1920×1080 场景，`window.initialize(config)` + `window.renderAt(t)` |
| `locales/*.json` | 字幕、任务标题、收尾文案与 App 语言键 |
| `verify.py` | ffprobe 规格断言、完整解码、分段 volumedetect、音效时点分析、抽帧与拼图 |
| `verification.json` | 媒体规格、音量值、实际音效区间、命令参数和成片 SHA-256 |
| `*-ffprobe.json` | 两条视频完整 ffprobe 输出 |
| `*-acceptance.json` | 本轮四项验收的时间采样、固定睁眼帧检查、透明度、缩放、铃铛角度和横排布局 |
| `source-manifest.json` | 所用真实产品源码与素材 SHA-256，验证前后完全一致 |
| `design.md` | 分镜落实、真实素材来源、尺寸取舍 |

## 重现命令

从仓库根目录运行，要求 macOS、Node >=22、Chrome、ffmpeg/ffprobe、Python + Pillow。此次版本为 Node v26.0.0、Chrome 157.0.8103.80、ffmpeg 8.1.2、Python 3.14.7。

```sh
node store/preview-1.0.7/render.mjs
python3 store/preview-1.0.7/verify.py
```

只渲染一种语言，或只输出关键 PNG 供检查：

```sh
node store/preview-1.0.7/render.mjs en-US
node store/preview-1.0.7/render.mjs --stills zh-Hans
python3 store/preview-1.0.7/verify.py en-US
```

脚本默认使用 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`，可通过 `CHROME_BIN` 指定。Chrome 始终带 `--headless=new --disable-gpu --mute-audio`，使用本目录 `.work/chrome-profile/`；只加载本地素材，用回环 CDP 控制，不调用系统桌面或现有浏览器。每帧设置 `n / 30` 后截图；CSS 自行动画和过渡关闭，桌宠通过无插值 canvas 绘制真实图集。

更换语言时新增 `locales/<locale>.json`，保持五条 `captions`、`task`、`tagline`，并将 `appLanguage` 设为 App 已有的 `zh-TW`、`ja`、`ko`、`es` 等，然后以该文件名作为命令参数。HUD 状态和权限按钮自动读取真实 App 对应语言。本次未渲染其他语言。

H.264 编码使用 `libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -fps_mode cfr`，标记 BT.709，启用 faststart；AAC 为 `192k / 48000Hz / 2ch`。音效与静音底轨的滤镜为：

```text
[2:a]aresample=48000,aformat=channel_layouts=stereo,adelay=7000|7000[c];
[3:a]aresample=48000,aformat=channel_layouts=stereo,adelay=13200|13200[d];
[1:a][c][d]amix=inputs=3:duration=first:normalize=0[a]
```

输入 0 是逐帧 PNG，输入 1 是 `anullsrc=r=48000:cl=stereo`，输入 2/3 是 Halo 的 `confirm.mp3` / `complete.mp3`。输出以 `-t 21` 截止。

## 自检结果

| 项目 | en-US | zh-Hans |
| --- | --- | --- |
| 画幅 | 1920×1080 | 1920×1080 |
| 编码／像素格式 | H.264 / yuv420p | H.264 / yuv420p |
| r_frame_rate / avg_frame_rate | 30/1 / 30/1 | 30/1 / 30/1 |
| 视频帧数 | 630 | 630 |
| 时长 | 21.000s | 21.000s |
| 音轨 | AAC / 48kHz / 2ch stereo | AAC / 48kHz / 2ch stereo |
| 文件大小 | 1.67MB，低于 500MB | 1.64MB，低于 500MB |
| 全片解码错误 | 0 | 0 |
| 同时刻乱序回访截图 | 逐字节相同 | 逐字节相同 |
| 抽帧总览 | 42 全画面＋6 提醒局部，已目视检查 | 42 全画面＋6 提醒局部，已目视检查 |

目视检查：五屏字幕与收尾文案均完整；中英文权限标题、`npm test`、Allow／批准按钮清晰；像素角色轮廓清晰；十只角色顺序正确；抽帧中无意外空白、裁切或闪烁。3.5／7.0／12.0／15.5／19.0 秒是文字淡入淡出的边界，场景交接保留可见主体。另检查了原尺寸权限画面及按钮按下的关键帧。

分段 `volumedetect` 两种语言结果相同（dBFS）：

| 区间 | mean_volume | max_volume |
| --- | ---: | ---: |
| 0–6.9s，静音 | -91.0 | -91.0 |
| 7.0–7.6s，confirm | -27.1 | -13.5 |
| 7.7–13.1s，静音 | -91.0 | -91.0 |
| 13.2–13.9s，complete | -27.2 | -12.5 |
| 14–21s，静音 | -91.0 | -91.0 |

注意 `volumedetect` 的静音显示下限为 -91dB。实际命令先做 `atrim` 再做 `volumedetect`，避免输出寻址被误当成滤镜输入裁剪。例如：

```sh
ffmpeg -hide_banner -nostats \
  -i store/preview-1.0.7/AgentHalo-preview-en-US.mp4 \
  -vn -af 'atrim=start=7:end=7.6,volumedetect' -f null -
```

解码 AAC 后按 10ms RMS、-60dB 阈值定位，可听片段只有 **7.00–7.35s** 与 **13.20–13.59s**，与气泡出现／Done 变化时点对应。没有背景音乐。

## 已知取舍与未解决问题

- 无阻塞问题。主 Halo 真实帧可见高度为 160px；为满足整数倍放大且不插值，采用 2 倍、约 320px 可见高度，而非非整数缩放至 260px。十角色横排按本轮验收的约 200px 高度要求，采用原帧 1.25 倍最近邻绘制、关闭插值；这一尺寸调整取代首版横排整数 1 倍的安排。
- HUD 按真实 CSS 与行结构展示分镜指定的完整任务标题及 Thinking／Working／Done 状态；权限气泡使用真正 DOM、CSS 与 renderer。它们的数据是分镜演示数据，未运行 App 或真实任务。
- 保留真实 UI 的状态色、权限按钮色及 Claude Code 图标原色；没有为了单一青绿色而重涂产品界面。背景、文字使用指定的米色／薄荷色／深绿色，通用编辑器按本轮要求加入柔和灰／淡青／淡橙色条及红黄绿圆点。
- 未上传 App Store Connect，因此没有远端处理结果。交付视频已按本任务给定的媒体规格本地验证。

临时 Chrome profile、关键帧、拆分检查图与调试文件已清理；保留最终视频、两张总览、脚本与证据文件。开始任务前已存在的空文件 `codex-last.md` 未修改、未纳入本次提交。
