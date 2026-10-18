# 音色下载、校验与归档

本流程用于 FL Studio 制作：先找到合适的乐器、预设或采样，再取得文件、确认格式、归档来源，最后在插件里试用。入口实测日期为 **2026-10-18**；各渠道实际走到哪一步，见[下载验证记录](download-verification.md)。网站界面、账号权限和付费方案可能变化。

**按声音缺口下载。** 渠道清单是备选入口，不是每首歌都要逐项完成的下载任务。先用现有音色写 Loop；主旋律、铺底、808 与鼓组有可用候选后就停止扩充。只有具体某一层不合适，再到相应渠道补充。

本轮按使用者要求收敛到已取得的 SampleRadar 鼓采样、Vital 官方库与一个 PresetShare Pluck；FLEX 不再追加下载，Cymatics 保留已安装的 Hub，Splice 暂时跳过。已有 FLEX 音色也可直接用于制作；下载预设文件不等于对应插件已安装或已经试听通过。

## 1. 先确定下载的是什么

| 类型 | 下载结果 | 在 FL 中怎么用 |
|---|---|---|
| 乐器插件 | Windows 安装程序、VST3 等 | 安装后扫描插件，在 Channel Rack 加载，再用 Piano Roll 写音符 |
| 插件预设 | 例如 `.vital`、`.vitalbank`、FLEX 音色包 | 在对应插件导入；不同合成器的预设不能互换 |
| One-shot | 一次鼓击或一个有音高的乐器音，通常为 WAV | 拖入 Sampler；旋律单音与 808 需要确认实际音高和根音 |
| Loop | 已演奏好的音频乐句 | 在 Playlist 使用或切片，检查速度、调性和循环边界 |
| MIDI | 音符、时值、力度等演奏信息 | 导入 Piano Roll，再为它指定乐器；MIDI 自身没有音色 |

项目设为 140 BPM 时，预设与单次鼓采样不需要筛选 140 BPM；已演奏的 Loop 才需要重点检查速度。

## 2. 下载渠道与适用内容

| 渠道 | 用途 | 正常取得方式 |
|---|---|---|
| [SampleRadar](https://www.musicradar.com/news/tech/free-music-samples-royalty-free-loops-hits-and-multis-to-download-sampleradar) | 鼓、乐器 WAV、Loop | 资源文章中的官方 ZIP 链接，实测 Trap 包无需账号 |
| [Vital](https://vital.audio/) | 免费合成器、官方音色库 | Basic Free → 用户登录/注册 → Your products / Your packs |
| [PresetShare](https://presetshare.com/) | Vital、Serum、Sytrus 等预设 | 选择合成器 → 预设详情 → 登录 → 下载箭头 |
| [Cymatics](https://cymatics.fm/pages/free-download-vault) | 鼓组、808、One-shot 等 | 免费库解锁 → 当前页面引导 Cymatics Hub → Hub 中下载 |
| [FLEX](https://www.image-line.com/flex) | FL 内可直接演奏的预设库 | FLEX 内 Library / Store，选择有权限的免费或已购音色包 |
| [Splice Sounds](https://splice.com/sounds) | 按需挑选单个采样、Loop、插件预设 | 登录 → 搜索筛选 → 按账号积分和授权下载 |
| [Splice INSTRUMENT](https://splice.com/instrument) | 可演奏的钢琴、弦乐、合成器等 | 官网安装插件 → 登录 → Discover → 下载免费或已授权包 |

Splice Sounds 的采样积分与 INSTRUMENT 的音色包权限不同；拥有其中一个产品不能直接推定拥有另一个产品的所有内容。

## 3. SampleRadar：已验证的公开直链路线

例子：[300 free trap samples](https://www.musicradar.com/news/tech/sampleradar-300-free-trap-samples-627140)。

1. 打开资源文章，查看采样说明与使用条件。
2. 找正文中的下载链接，避开广告的 Download 按钮。
3. 下载 ZIP 并验证完整性；本次文件有 300 个 WAV，其中 Drum_Hits 目录有 65 个鼓单音。
4. 原 ZIP 留作来源备份，把要使用的 Drum_Hits 解压到本地音色库。
5. 在 FL Browser 找到该目录，挑选 WAV 拖进 Channel Rack。

官方文章提供的 ZIP 可用仓库工具下载：

```powershell
python tools/sound_asset.py fetch --provider SampleRadar --source 'https://www.musicradar.com/news/tech/sampleradar-300-free-trap-samples-627140' --url 'https://cdn.mos.musicradar.com/audio/samples/musicradar-trap-samples.zip' --out 'downloads/sampleradar/musicradar-trap-samples.zip'
```

若文件已经存在，使用 `inspect` 校验，不必重复下载。源文章保留为稳定入口；若 CDN 链接失效，回文章找最新链接。

## 4. Vital：合成器与官方音色库

1. 打开 [Vital 官网](https://vital.audio/)，选择 **Basic Free**。
2. 在 [Basic 页面](https://account.vital.audio/basic) 登录或注册；密码、邮箱验证码由使用者在网站输入。
3. 进入 **Your products**，选择 Windows 安装包。实测账号页同时列出 `Vital` 与 `Vital (Early access)`，应记录所选版本，避免混淆稳定版本与提前体验版本。
4. 在 **Your packs → Factory Content → Download** 取得 `.vitalbank`。
5. 安装插件并通过 FL 扫描后，在 Vital 中导入 bank。下载完成与插件成功发声是两个独立检查点。

本次实际下载的 Factory Content 含 75 个 `.vital` 预设。可以先试听其中的 `Cinema Bells`、`Moog Pluck`、`Analog Pad` 等候选；名称和文件存在已经核对，未在本次下载验证中试听。

```powershell
python tools/sound_asset.py fetch --provider Vital --source 'https://vital.audio/' --url 'https://cdn.vital.audio/content/FactoryContent.vitalbank' --out 'downloads/vital/FactoryContent.vitalbank'
```

**安装包链接可能含临时登录令牌。** 以后从账号页重新点击，不把完整链接复制进脚本、Markdown 或公开 Git。浏览器正常下载安装包后，对本地文件执行 `inspect` 即可。

## 5. PresetShare：登录后下载单个预设

1. 打开 [PresetShare](https://presetshare.com/)，先按自己拥有的合成器筛选，例如 Vital。
2. 再选 Pluck、Keys、Pad 等类型，打开预设详情页，确认作者、插件和说明。
3. 未登录时，点击下载会出现 **Auth required**；用网页上的 Google 或邮箱入口完成登录。
4. 回到预设详情页。例如 [NOSTALGIA - PLUCK](https://presetshare.com/p25040)。
5. 下载按钮在**预设灰色卡片左下角：空心爱心右侧的向下箭头**。它颜色较暗、没有明显的 Download 文字。右侧 `Subscribe` 是关注作者，不是文件下载。
6. 保存下载的 `.vital` 文件，并记录详情页 URL。不要把试听音频或示例 MIDI 当成预设文件。
7. 在 Vital 中加载预设；若提示版本过新，检查作者要求和本机 Vital 版本。

```powershell
python tools/sound_asset.py inspect 'downloads/presetshare/NOSTALGIA_PLUCK.vital' --provider PresetShare --source 'https://presetshare.com/p25040'
```

本次已通过正常网页下载并校验 `NOSTALGIA_PLUCK.vital`：163,406 字节，内部预设名为 `NOSTALGIA - PLUCK`，作者为 `BLKSTYLE`，`synth_version` 为 **1.6.4**。这表示文件保存时的版本；本次未验证旧版能否加载，也未在 FL 中试听。若加载报版本错误，先核对本机版本，或先用已有音色继续写 Loop。

预设的下载地址可能随登录状态变化。复用时保存 **详情页**，通过当前登录会话点击下载；不用旧的临时下载链接代替登录。

## 6. Cymatics：免费库解锁与 Hub

本次实际流程与旧教程里“填写邮箱后直接出现全部 ZIP 链接”不同：

1. 打开 [Free Download Vault](https://cymatics.fm/pages/free-download-vault)。
2. 点击 **UNLOCK FOR FREE**；弹窗要求 First Name 和 Email。
3. 使用者自行填写并提交。解锁后页面出现 **Access all our free downloads in the Cymatics Hub**，以及 Mac / Windows 下载按钮。
4. 取得 [官方 Hub 安装程序](https://cymatics.fm/pages/cymatics-hub-download-1)，安装并完成 Hub 登录。
5. 在 Hub 中选择免费采样包，指定内容目录，完成一包下载，再检查具体 WAV / MIDI 文件。
6. 从免费库的 [license 入口](https://cymatics.fm/pages/free-sample-packs-license-agreement) 保存对应使用说明；遇到购买或订阅页面时，先确认当前内容是否真的属于免费范围。

```powershell
python tools/sound_asset.py fetch --provider Cymatics --source 'https://cymatics.fm/pages/cymatics-hub-download-1' --url 'https://downloads.cymatics.fm/free/Hub/CymaticsHubSetup.exe' --out 'downloads/cymatics/CymaticsHubSetup.exe'
Get-AuthenticodeSignature -LiteralPath 'downloads/cymatics/CymaticsHubSetup.exe'
```

2026-10-18 下载的 Hub 安装包版本为 1.2.0，Windows 数字签名有效，签发给 Cymatics LLC；本机安装记录也已核对，使用者确认完成 Hub 登录。按本轮收敛后的范围，暂不下载 Hub 内采样包。步骤 5 保留为以后确实需要 Cymatics 素材时的操作入口，尚未经本次完整下载验证。

## 7. FLEX：通过 FL 内的音色库取得

1. 在 FL Studio 添加 FLEX，打开 Library；旧界面可能显示 Installed Packs / For Download。
2. 选择未安装且标为免费的包，或账号已拥有的包，点击其下载图标。付费包从 Store 进入并检查授权。
3. 如果插件要求账号验证，使用自己的 Image-Line 账号完成。
4. 完成后确认包出现在已安装库、能展开预设列表，再弹一个音确认可用。
5. 记录包名、FL 版本、落盘位置；具体路径取决于 FL 的用户数据目录，不把某台机器的安装路径写成所有用户的默认路径。

参考：[FLEX 官方手册](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/plugins/FLEX.htm)、[FLEX Packs 与账号权限](https://support.image-line.com/action/knowledgebase?ans=881)。

**已发现的误区：** 官网元数据中的 `Arksun Cityscape.preset` 实际只有 931 字节，是预设名称的纯文本列表，并非完整音色包。下载这份列表不能算打通音色库下载，也不能把它改名为 `.flexpack` 使用。本机现有 `.flexpack` 文件的存在，只能证明已安装，不能证明本次新下载成功。

本轮已确认本机存在 Mobile Synth Pluck、General Midi Library、Mobile Tuned 808 Bass 等包；按使用者要求不再追加下载，也不要求为验证渠道再找一个未安装包。

## 8. Splice 两条路线

### Sounds：采样与第三方合成器预设

1. 登录 [Splice Sounds](https://splice.com/sounds)。
2. 先选择 One-shots / Loops / Presets，再按乐器和声音类型搜索。
3. 下载前查看账号积分与该素材的权限；插件预设还要检查对应插件版本。
4. 下载到本地库，保留素材名称、来源页、音高／BPM 标注及授权记录。

参考：[搜索与筛选](https://support.splice.com/en/articles/8652594-finding-sounds)、[预设下载](https://support.splice.com/en/articles/8652630-how-do-i-download-presets)。本次按使用者要求暂时跳过，不把浏览商品页视为成功下载。

### INSTRUMENT：可演奏的乐器库

1. 打开 [官方页面](https://splice.com/instrument)，选择 **Download free**；页面上的订阅试用是另一条入口。
2. 下载安装插件；FL Studio 使用 VST3，插件目录优先保持安装器的标准位置。
3. 登录后设置内容目录，在 **Discover** 找到免费或已授权包，下载整包或单个预设。
4. 到 **My Library** 确认已下载，并加载发声。

参考：[安装说明](https://support.splice.com/en/articles/12161253-how-do-i-install-splice-instrument)、[下载包和预设](https://support.splice.com/en/articles/12246879-how-to-install-a-pack-or-preset-in-splice-instrument)。本次官网自动下载跳转被 Edge 显示 `ERR_BLOCKED_BY_CLIENT`，使用者选择暂时跳过；未安装、未验证内容库下载。

## 9. 本地统一归档

建议在仓库根目录执行命令，下载文件保存在已经被 Git 忽略的 `downloads/`：

```text
downloads/
├── sampleradar/<pack>.zip
├── vital/FactoryContent.vitalbank
├── presetshare/<preset>.vital
├── cymatics/CymaticsHubSetup.exe
└── <provider>/<asset>.receipt.json
```

浏览器下载的文件可以先保留原件，再复制到对应目录。内容库很大时，可以使用仓库外的独立磁盘目录；按官方插件的设置修改内容路径。

每个选入工程的声音填写一份[音色来源记录](../templates/sound-asset.md)。公开仓库记录流程、公共来源页、版本和校验结果；采样、预设原文件、安装器、账号数据与授权邮件保留本地。

## 10. 校验工具的使用范围

`tools/sound_asset.py` 只依赖 Python 3.10+ 标准库：

- `fetch`：从已经确认的公开 HTTPS 文件链接下载，不接收 Cookie、密码或登录令牌。
- `inspect`：检查通过浏览器、插件或其他正常方式取得的本地文件。
- 自动生成相邻的 `.receipt.json`，记录来源、字节数、SHA-256 与检查结果。
- ZIP / `.vitalbank` 检查 CRC；`.vital` 检查 JSON 和 settings 结构；EXE 只检查文件头，数字签名单独用 Windows 检查。
- 不解压、不安装、不运行下载文件，也不替代 FL 内导入与试听。
- 已存在的目标文件会拒绝覆盖。失败下载可能留下 `.part`；检查失败原因后处理该文件，再重试。

```powershell
python tools/sound_asset.py inspect 'downloads/vital/FactoryContent.vitalbank' --provider Vital --source 'https://vital.audio/'
```

## 11. 常见阻挡与处理

| 现象 | 下一步 |
|---|---|
| 下载弹出 Auth required | 在该官网登录，回到详情页重新点下载 |
| 账号已登录但链接失效 | 从当前页面重新取得链接；不要复用过期令牌 |
| 下载下来是 HTML／登录页 | 不能按音色导入；回到正常登录与下载流程 |
| ZIP 检查失败或只有 `.part` | 文件不完整，保留失败记录并重新下载 |
| 免费库引导 Hub | 使用当前官方客户端流程，并确认免费包范围 |
| 浏览器或安全界面拦截 | 记录提示，由使用者检查；不自动更改浏览器安全设置 |
| 预设不能加载 | 确认插件名称、版本、格式；检查它是否依赖额外波表或采样 |
| 下载成功但 FL 找不到 | 区分插件扫描、音色库导入和 Browser 文件目录，分别处理 |

## 12. 为《北四环》挑选音色

先固定同一段 MIDI、调到相近音量，再对比不同预设。每层只保留少量候选，记录最终选择。

| 层 | 搜索词 |
|---|---|
| 主旋律 | bell pluck、glass pluck、music box、digital keys |
| 背景和弦 | soft pad、airy pad、warm pad |
| 808 | clean 808、sustained 808、tuned 808 |
| 鼓 | short kick、trap clap、tight hi hat、short open hat |

这些词用于寻找原创制作的候选音色，不表示参考歌曲使用了某个具体插件或预设。
