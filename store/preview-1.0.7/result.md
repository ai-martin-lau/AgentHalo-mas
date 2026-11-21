# AgentHalo 1.0.7 App Preview — 16.5 秒六语版

六条成片已完成并通过本地自检，使用同一套已验收画面和新的 16.5 秒节奏。en-US／zh-Hans 保留已确认文案，zh-Hant／ja／ko／es-ES 使用本轮指定的逐字文案。改动仅限 `store/preview-1.0.7/`，未修改产品或并行截图目录，未推送、未上传。

## 成片与抽帧总览

| 语言 | 成片 | 每约 0.33 秒抽帧 | 大小（bytes） | 自检 |
| --- | --- | --- | ---: | --- |
| en-US | [MP4](AgentHalo-preview-en-US.mp4) | [总览](en-US-frames.png) | 1,448,690 | 通过 |
| zh-Hans | [MP4](AgentHalo-preview-zh-Hans.mp4) | [总览](zh-Hans-frames.png) | 1,432,879 | 通过 |
| zh-Hant | [MP4](AgentHalo-preview-zh-Hant.mp4) | [总览](zh-Hant-frames.png) | 1,437,837 | 通过 |
| ja | [MP4](AgentHalo-preview-ja.mp4) | [总览](ja-frames.png) | 1,533,418 | 通过 |
| ko | [MP4](AgentHalo-preview-ko.mp4) | [总览](ko-frames.png) | 1,428,140 | 通过 |
| es-ES | [MP4](AgentHalo-preview-es-ES.mp4) | [总览](es-ES-frames.png) | 1,471,452 | 通过 |

每张总览为 2880×2940，含 **50 张全画面**：严格从 30fps 视频中每 10 帧取一次，时间为 0.000／0.333／0.667…16.333 秒。底部另有 6 张完成提醒局部抽帧（9.000／9.067／9.233／9.300／9.367／9.533 秒），可查看任务条放大和铃铛两轮晃动。

## 时间与局部动效

| 段落 | 时间 |
| --- | --- |
| 交出任务 | 0–2.2s |
| 去忙别的 | 2.2–4.6s |
| 执行前询问 | 4.6–8.6s；4.8s 弹出气泡及 confirm；6.6s 起移动鼠标；7.3s 点击；7.8s 开始收起 |
| 完成提醒 | 8.6–11.4s；9.0s Done 及 complete、任务条轻弹与铃铛晃动；jumping 一次后 waving |
| 十只角色 | 11.4–14.4s；依次相隔 0.08s 出场，然后统一轻浮 |
| 收尾卡 | 14.4–16.5s；16.1–16.5s 淡出 |

通过缩短各段停留时间调整节奏，没有整体倍速、插帧或新增配音。桌宠动画保持约 120ms 一帧；气泡出入各 0.18s；鼠标 0.65s 平滑移动；按钮按下 0.2s；任务条轻弹、铃铛两轮晃动和 jumping 仍用 0.6s。第一段和横排继续使用已确认的睁眼 idle 0。

字幕进出约 0.25s，第一句直接可读；收尾卡 0.1s 入场、0.4s 退场。六句完整显示时间依次为 **1.95／1.9／3.5／2.3／2.5／1.6 秒**。

## 界面语言来源

任务状态直接读取 `agenthalo/src/i18n.js`，气泡 DOM、CSS 和文案使用真实 `bubble.html`、`bubble.css`、`bubble-renderer.js`。无副作用桥接只填充分镜数据，不执行命令或修改 App 权限。

| 成片 | App 语言键 | 思考／工作／完成 | 批准／拒绝按钮 |
| --- | --- | --- | --- |
| en-US | en | Thinking／Working／Done | Allow／Deny |
| zh-Hans | zh | 思考中／工作中／已完成 | 批准／拒绝 |
| zh-Hant | zh-TW | 思考中／工作中／已完成 | 允許／拒絕 |
| ja | ja | 思考中／作業中／完了 | 許可／拒否 |
| ko | ko | 생각 중／작업 중／완료 | 허용／거부 |
| es-ES | es | Pensando／Trabajando／Listo | Permitir／Denegar |

## 自检结果

六条均为 **1920×1080、H.264、yuv420p、30/1 fps、495 帧、16.500 秒**，满足本轮 15–17 秒要求。音轨全部为 **AAC、48kHz、2 声道 stereo**。各文件小于 500MB；全片解码错误均为 0。

六种语言均完成乱序跳转后同一时刻截图逐字节一致检查；第一段 Halo 固定帧检查通过；代码编辑器、完成提示、十角色布局检查保留。`*-acceptance.json` 中记录字幕实际文字范围、行数、元素重叠检查和任务名裁切检查。所有五屏字幕均为单行，全部在画幅内，未与桌面或横排角色重叠，任务名没有省略或裁切。

已逐张检查六张总览中的 300 张全画面及提醒局部，并重点检查日语、西语原尺寸权限画面和西语收尾长句：文字清晰完整，没有换行出界、与主体重叠、意外空白或闪烁。结尾按要求淡出。日语最长字幕右边界约 1302px、西语约 1112px，均远离 1800px 的字幕安全边界。

分段 `volumedetect` 六条结果一致（dBFS）：

| 区间 | 内容 | mean_volume | max_volume |
| --- | --- | ---: | ---: |
| 0–4.7s | 静音 | -91.0 | -91.0 |
| 4.8–5.4s | confirm | -27.1 | -13.5 |
| 5.5–8.9s | 静音 | -91.0 | -91.0 |
| 9.0–9.7s | complete | -27.2 | -12.5 |
| 9.8–16.5s | 静音 | -91.0 | -91.0 |

`volumedetect` 的静音显示下限为 -91dB。解码 AAC 后，以 10ms RMS、-60dB 阈值定位，实际可听片段均为 **4.80–5.15s** 与 **9.00–9.39s**，与事件时点一致。六条提取出的 AAC 音轨哈希完全相同，无背景音乐。

统一 AAC SHA-256：`e7dd41d79438dc8f6fad75e3df7ef323d0c2e8f251b4c6867a2455058ffeb375`。

## 重现命令与证据文件

从仓库根目录运行；需要 macOS、Node >=22、Chrome、ffmpeg／ffprobe、Python + Pillow。默认一次输出全部六语：

```sh
node store/preview-1.0.7/render.mjs
python3 store/preview-1.0.7/verify.py
```

只处理一种语言，或只生成关键帧：

```sh
node store/preview-1.0.7/render.mjs ja
python3 store/preview-1.0.7/verify.py ja
node store/preview-1.0.7/render.mjs --stills es-ES
```

渲染采用本目录隔离 profile 的 `--headless=new --disable-gpu --mute-audio` Chrome，以 `window.renderAt(n / 30)` 设置每一帧，再截图交给 ffmpeg。没有实时录屏，没有打开 GUI、切换前台或播放声音。`CHROME_BIN` 可覆盖 Chrome 可执行路径。

编码为 `libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -fps_mode cfr`，BT.709、faststart。音轨为 192k AAC／48kHz／2ch，时长 `-t 16.5`。静音底轨与两段原始音效的混音滤镜：

```text
[2:a]aresample=48000,aformat=channel_layouts=stereo,adelay=4800|4800[c];
[3:a]aresample=48000,aformat=channel_layouts=stereo,adelay=9000|9000[d];
[1:a][c][d]amix=inputs=3:duration=first:normalize=0[a]
```

输入 0 为逐帧 PNG，输入 1 为 `anullsrc=r=48000:cl=stereo`，输入 2／3 分别为 `agenthalo/pets/halo/sounds/confirm.mp3`／`complete.mp3`。

单段音量核对示例（先 `atrim` 再 `volumedetect`）：

```sh
ffmpeg -hide_banner -nostats \
  -i store/preview-1.0.7/AgentHalo-preview-es-ES.mp4 \
  -vn -af 'atrim=start=4.8:end=5.4,volumedetect' -f null -
```

`verification.json` 保存每条规格、音效区间、音量值、实际命令及视频／音轨 SHA-256；`*-ffprobe.json` 保存完整媒体信息；`*-acceptance.json` 保存布局与时序采样；`source-manifest.json` 证明使用的真实产品素材与源码在渲染前后未改变。`design.md` 记录最终时间轴。

无待解决问题。临时 profile、拆帧与检查用图片已清理，保留视频、六张总览、生成脚本、字幕 JSON 和证据文件；已有 `codex-last.md` 未修改、未纳入提交。
