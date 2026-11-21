# 本轮逐张原尺寸视觉自检

已逐张直接打开全部 30 张 2880×1800 原尺寸 PNG，并另查总览与搜索预览。以下记录对应本轮最终文件的 SHA-256。

检查结论：给定文案保持原样，标题不超过两行；各语言无混入英文提示、加载占位或报错。桌宠像素清楚，全部页面没有桌宠遮挡界面文字和控件。03 的十只所选真实帧已逐只检查眼睛完全睁开，高度 160～167 CSS 像素，左右区域互不相交。

| 文件 | 标题行数 | 本轮验收检查 | SHA-256 |
| --- | --- | --- | --- |
| en-US/01-walk-away.png | 1 | 通过：浮窗 1.8 倍、宽 936 CSS 像素，Halo 实高 400；整组垂直居中，文字无遮挡 | `ea5fd047228f1f0289893df1d8f85137599d48037b1c3b4488c19d3d9d1a9595` |
| en-US/02-approve.png | 1 | 通过：保留原 PNG 字节，npm test、允许／拒绝按钮无遮挡 | `dc1b4ce368f8dfdaed6475f3b2b4364c2f5f4d9e3f43268e32b15e57e69dc182` |
| en-US/03-characters.png | 1 | 通过：左侧两排各 5 只、全部睁眼；右侧首排三张卡片及名字完整，Halo 选中；两区互不遮挡 | `9a88adc4a470292b4c13f3f0eba572df9f25f9d1e06514e1fc47d4d0bf03eb61` |
| en-US/04-quiet.png | 1 | 通过：分组标题与卡片文字左对齐；长任务菜单、音量及 50% 可读；Halo 与界面分离 | `83cca071994c349f2e5223965e1c0e34624d9fc4fbffb5e05c7e09ea1d467657` |
| en-US/05-privacy.png | 1 | 通过：Halo 位于窗口左侧外；两个断开按钮及开关完整可见，所有文字和控件无遮挡 | `9b3d2f5cfd342908c11fca291441b3bc9d968721ff9390a952d575f763becb87` |
| zh-Hans/01-walk-away.png | 1 | 通过：浮窗 1.8 倍、宽 936 CSS 像素，Halo 实高 400；整组垂直居中，文字无遮挡 | `c7d92c20efad88216a30e077e2d21c9d54c8e25987a7de807b8875b44e4e57b0` |
| zh-Hans/02-approve.png | 1 | 通过：保留原 PNG 字节，npm test、允许／拒绝按钮无遮挡 | `bb0e5da8b2c11612da38355881213f1717921730b9ebad71ccae2509e129fd0e` |
| zh-Hans/03-characters.png | 1 | 通过：左侧两排各 5 只、全部睁眼；右侧首排三张卡片及名字完整，Halo 选中；两区互不遮挡 | `455a002f0c2c8b532088a70fe8307e2293dc0cbc70df2f5fee58fbcbc1084901` |
| zh-Hans/04-quiet.png | 1 | 通过：分组标题与卡片文字左对齐；长任务菜单、音量及 50% 可读；Halo 与界面分离 | `6d8d122d091dca7231e235a71809d35fac676e61b40b0c4d8566f240867c3896` |
| zh-Hans/05-privacy.png | 1 | 通过：Halo 位于窗口左侧外；两个断开按钮及开关完整可见，所有文字和控件无遮挡 | `52abf9cf648aa6438d070d08b8ac98d5ba52ca1af1e7b6d7ebea79d1e96b8a22` |
| zh-Hant/01-walk-away.png | 1 | 通过：浮窗 1.8 倍、宽 936 CSS 像素，Halo 实高 400；整组垂直居中，文字无遮挡 | `8be1bf40848aa1843338327310573e6513ed1de5c13d7ba648275c9e2edf6636` |
| zh-Hant/02-approve.png | 1 | 通过：保留原 PNG 字节，npm test、允许／拒绝按钮无遮挡 | `4d1a553fafbdd2ae22cbaded097cc9a0c55d2252eb6051632fef2f39c4351988` |
| zh-Hant/03-characters.png | 1 | 通过：左侧两排各 5 只、全部睁眼；右侧首排三张卡片及名字完整，Halo 选中；两区互不遮挡 | `d560cfd62ec9c996ff7ce968df40958a57fd43f783872f4cf4b26713e1329d8e` |
| zh-Hant/04-quiet.png | 1 | 通过：分组标题与卡片文字左对齐；长任务菜单、音量及 50% 可读；Halo 与界面分离 | `aa6676c13d492937a7204b7cc6ceae32321ff545188afe60c2d0561ce0997ea3` |
| zh-Hant/05-privacy.png | 1 | 通过：Halo 位于窗口左侧外；两个断开按钮及开关完整可见，所有文字和控件无遮挡 | `3ccd1f52b5aa8c5f7d0f168d5ef0529e73fa906f26a2e862669bdf9de65394f0` |
| ja/01-walk-away.png | 1 | 通过：浮窗 1.8 倍、宽 936 CSS 像素，Halo 实高 400；整组垂直居中，文字无遮挡 | `56b60120071bb1a390d85fc33e5f6f5c1a3722a82709a6f0d846218635c90802` |
| ja/02-approve.png | 1 | 通过：保留原 PNG 字节，npm test、允许／拒绝按钮无遮挡 | `6bfc9a28bc2539973d0e96a3cc0577fe02aab048726a40a143dcbaec602eb57e` |
| ja/03-characters.png | 1 | 通过：左侧两排各 5 只、全部睁眼；右侧首排三张卡片及名字完整，Halo 选中；两区互不遮挡 | `326aeac9aad01c6f265ba52138e4fcf4c6b18da48876f5bd6c4b39923989ad18` |
| ja/04-quiet.png | 1 | 通过：分组标题与卡片文字左对齐；长任务菜单、音量及 50% 可读；Halo 与界面分离 | `31bd483ce6cff02f4b7fb801d241bcce7af53b055e2d472c0b8bb45cf214b5fb` |
| ja/05-privacy.png | 1 | 通过：Halo 位于窗口左侧外；两个断开按钮及开关完整可见，所有文字和控件无遮挡 | `6e5a6279e463355583e53b0c79fddf5b2b1897330b180edfad523ea556040ff3` |
| ko/01-walk-away.png | 1 | 通过：浮窗 1.8 倍、宽 936 CSS 像素，Halo 实高 400；整组垂直居中，文字无遮挡 | `1f0af5b19f3d3786efe4eea66d8be51c488f19294352aeb1c88973aad38463b0` |
| ko/02-approve.png | 1 | 通过：保留原 PNG 字节，npm test、允许／拒绝按钮无遮挡 | `5bd9b0416079847e0ff3cff7b9b50db6c9912109854deac33810218c5d336fa9` |
| ko/03-characters.png | 1 | 通过：左侧两排各 5 只、全部睁眼；右侧首排三张卡片及名字完整，Halo 选中；两区互不遮挡 | `0655eca2649ff2073a13e9969a0029fa441ec2b7bcc2aa9a273b04cb52b8e6d9` |
| ko/04-quiet.png | 1 | 通过：分组标题与卡片文字左对齐；长任务菜单、音量及 50% 可读；Halo 与界面分离 | `30ba55f065e458c464f23a76f94ee23b97171024c6200fa0900767e7d51af305` |
| ko/05-privacy.png | 1 | 通过：Halo 位于窗口左侧外；两个断开按钮及开关完整可见，所有文字和控件无遮挡 | `b7052e4a2c1ef88566b735b027633c69e27f68b406de33083928cf3297f5eafe` |
| es-ES/01-walk-away.png | 1 | 通过：浮窗 1.8 倍、宽 936 CSS 像素，Halo 实高 400；整组垂直居中，文字无遮挡 | `0cf97b93972890e57a5e6e23755fe05e2554e8d70796451e6016faed970a7d07` |
| es-ES/02-approve.png | 1 | 通过：保留原 PNG 字节，npm test、允许／拒绝按钮无遮挡 | `e0a0d6168d8c19b8409b20445f54f9f8763333cb5212afe8eba06f856749d7c9` |
| es-ES/03-characters.png | 2 | 通过：左侧两排各 5 只、全部睁眼；右侧首排三张卡片及名字完整，Halo 选中；两区互不遮挡 | `3ade557dd00c94bec6b7f50d09d93b148bd3b84f154a41c7718c3eabd5c5eabe` |
| es-ES/04-quiet.png | 1 | 通过：分组标题与卡片文字左对齐；长任务菜单、音量及 50% 可读；Halo 与界面分离 | `e666895adfb6efa64fe8b1c266f8fbcdb6e853e4f58fa3f8c3df251c934e99d3` |
| es-ES/05-privacy.png | 1 | 通过：Halo 位于窗口左侧外；两个断开按钮及开关完整可见，所有文字和控件无遮挡 | `870334d4f1afae6996e428f1b4c94382f2a923061c51931da65ed2583181379f` |

说明：应用名、工具名与技术标识保留原文。03 的真实网格只裁切其余列／行，首排前三张卡片和名字完整。04 展开真实选项菜单，原生菜单覆盖上方部分音效说明，完成提示音与音量均可读；桌宠不与界面相交。

自动检查补充：30/30 尺寸和 RGB 通过，30/30 角色与界面矩形不相交，6/6 的 02 与上一提交字节完全一致；50 个打包代码文件和 20 个素材与源文件一致。详见 `audit.json`、`validation.json` 和各语言 `ui/layout.json`。
