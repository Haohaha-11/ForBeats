# 音色下载验证记录

日期：2026-10-18。本文记录实际结果；完整步骤见[音色下载流程](sound-downloads.md)。

使用者在本轮明确收敛范围：不需要为了验证渠道下载很多音色。保留已取得的文件与可复用入口；停止追加 FLEX、Cymatics 素材，Splice 按此前要求跳过。

## 当前进度

| 来源 | 实际证据 | 状态与边界 |
|---|---|---|
| SampleRadar | Trap ZIP，106,262,955 字节；300 个 WAV，ZIP CRC 通过；已提取 65 个 Drum_Hits | 已验证取得文件与完整性 |
| Vital | 用户完成账号操作；Factory Content，85,145,976 字节；75 个 `.vital`，ZIP CRC 通过 | 音色库已下载；安装器下载与 FL 导入不计为已完成 |
| PresetShare | 用户登录后手动下载；`NOSTALGIA_PLUCK.vital`，163,406 字节，Vital JSON 结构通过，保存版本 1.6.4 | 已验证取得预设并归档；插件加载与试听未验证 |
| Cymatics | 用户完成邮箱解锁；Hub 1.2.0 安装器，84,699,416 字节，Cymatics LLC 数字签名有效；本机安装记录已核对，用户确认 Hub 已登录 | 停在已安装／用户确认登录阶段；按收敛后的范围不追加采样包 |
| FLEX | 核对现有包和官方流程；验证 `.preset` 链接只有名称列表 | 按使用者要求不追加下载；未把现有文件当成本次新下载证据 |
| Splice Sounds | 正常入口已整理 | 用户于本轮选择 Splice 暂时跳过；未验证实际下载 |
| Splice INSTRUMENT | 官网 Download free 跳转被 Edge 显示 ERR_BLOCKED_BY_CLIENT | 用户于本轮选择 Splice 暂时跳过；未安装、未下载音色包 |

## 已取得文件的校验信息

| 文件 | SHA-256 |
|---|---|
| musicradar-trap-samples.zip | `307b15c58dc174702412ea8197a112ba24682eda75995e29a596bd7dfe6ecb4e` |
| FactoryContent.vitalbank | `cfd5c027f75ec25366cbd28f39fa95ed37bdeb60766ec431107c7767546c6064` |
| NOSTALGIA_PLUCK.vital | `bd3c4110e5d792c962d3da94792a27e16931c8a8fe2bd8f7f7dd86f2009ebbbe` |
| CymaticsHubSetup.exe | `a2d2a1bf88d6e1d0e0518b04816854284d6afc33eb0e8288322005985585ddda` |

这些哈希对应本次取得的文件；供应商更新包后哈希可以改变。它们用于识别与复核文件，不代表官方公布的签名值。

原始文件及逐文件回执保留在本地被忽略的目录中。公开记录不包含登录邮箱、用户名、Cookie、令牌或完整账号下载链接。

## 工具验证范围

`tools/sound_asset.py` 已用于取得并检查上述公开下载文件与本地预设。已检查 ZIP CRC、Vital JSON 结构与 SHA-256；HTML 伪装音频、错误哈希及带账号令牌的链接会被拒绝。Python 语法检查和文档相对链接检查通过。文件检查不等于音色试听，也不证明任意第三方预设都能兼容当前插件版本。
