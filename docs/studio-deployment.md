# ForBeats Studio：页面与 hk_88 部署

在线入口：**https://haoceanlab.cn/forbeats/**。

页面用于与 FL Studio 并排对照制作《北四环》的 140 BPM、8 小节 Loop。它提供六轨音色选择、交互式 Piano Roll、逐音位置／音高／长度／力度、逐小节表、完整 PNG 图谱、制作进度与笔记。走拍只提供时间定位和可选节拍器，不播放 FLEX 的实际预设。

## 本地运行与更新

页面为无框架静态 HTML、CSS、JavaScript，不依赖 Node 构建、数据库、外部字体或第三方 CDN。

```powershell
python -m http.server 8791 --bind 127.0.0.1 --directory studio
```

打开 `http://127.0.0.1:8791/`。`studio/score.json` 是页面数据；`studio/assets/` 是六张图谱。网站不包含第三方采样、插件安装包、参考 MP3、账号信息或本地绝对路径。

首次图谱在本地 `projects/bei-sihuan/piano-roll-v1/`，该目录按仓库原规则保留本地。若它存在，构建脚本会读取其中的 `notes.json`，移除机器路径，并同步图谱与指南。新克隆只有公开网站文件时，构建脚本直接校验并打包已有页面。修改音符应从原始图谱数据重新生成，保证 PNG、表格和交互谱一致。

```powershell
node --check studio/app.js
python tools/build_studio.py
```

产物为 `exports/forbeats-studio-release.tar.gz`，以及网站内的 SHA-256 文件清单 `studio/manifest.json`。构建检查六轨共 185 颗音符、140 BPM、8 小节、音符边界与图片存在；这不是音频试听检查。

## 在 hk_88 发布

采用本机已有的 SSH 别名 `hk_88`。域名和 HTTPS 沿用服务器已有 Caddy；只增加 `haoceanlab.cn` 的 `/forbeats/` 路径。

```powershell
scp exports/forbeats-studio-release.tar.gz hk_88:/tmp/forbeats-studio-release.tar.gz
scp tools/deploy_studio_server.py hk_88:/tmp/deploy-forbeats-studio.py
ssh hk_88 'python3 /tmp/deploy-forbeats-studio.py /tmp/forbeats-studio-release.tar.gz'
```

| 项目 | 位置／行为 |
|---|---|
| 站点文件 | `/srv/forbeats/releases/<UTC 时间>/` |
| 当前版本 | `/srv/forbeats/current` 符号链接 |
| 服务 | 已有 systemd `caddy`，直接提供静态文件；没有额外常驻进程 |
| 路由 | `https://haoceanlab.cn/forbeats/`；无末尾斜线时自动跳转 |
| 配置 | `/etc/caddy/Caddyfile` 中 `BEGIN ForBeats Studio` 标记块 |
| 配置备份 | `/etc/caddy/Caddyfile.before-forbeats-<UTC 时间>` |
| 部署回执 | `/srv/forbeats/deployment-<UTC 时间>.json` |

脚本拒绝绝对路径、目录穿越和符号链接归档项，检查全部文件 SHA-256，然后验证 Caddy 候选配置。发布时原子切换 `current` 并 reload Caddy；reload 或站点自检失败时恢复旧配置和旧链接。历史 release 保留，便于回滚。

发布后检查首页、`score.json`、六张图片以及现有首页和 `/gomoku/` 路由。外部访问可用以下命令检查：

```powershell
curl.exe -I https://haoceanlab.cn/forbeats/
```

## 回滚

从部署回执取得 `previous_release`。如果有旧版本，在服务器上把 `current` 原子指回该目录即可；静态站无需重启。若还需要恢复路由配置，先备份当前 Caddyfile，再用对应的 `caddy_backup` 恢复，执行 `caddy validate` 后 reload。首次部署的 `previous_release` 为 null，不能把它当成旧目录。

## 使用习惯

- 桌面默认看 4 小节，手机默认看 1 小节；可以切换 1／2／4／8 小节和缩放。
- 专注模式只保留谱面与走拍控件；所选音符的格数与长度始终显示在谱面下方。
- 完成状态、当前音轨和每轨笔记存储在浏览器 localStorage；不会跨浏览器或设备同步。
- 页面切到后台时会暂停走拍。节拍器供手动制作参考，不承担 DAW 同步或音色预听功能。
