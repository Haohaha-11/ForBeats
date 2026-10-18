# ForBeats

把一段音乐想法推进到完整说唱伴奏的制作流程与记录模板。

**当前版本：v0.1，已于 2026-10-18 review 确认。** 当前以 FL Studio 手动制作 Trap Beat 为主要场景，根据 ATTStudio 教程第 5～8 期整理，并明确标注补充的执行建议与练习示例。

## 从这里开始

- [Beat 制作 Pipeline](PIPELINE.md)：已确认的制作流程，包含 12 个步骤、阶段产物、完成标准与问题回退方式。
- [课程与软件资料来源](docs/sources.md)：已核对范围、视频时间点、官方文档，以及课程内容与整理建议的区别。
- [单首 Beat 项目记录模板](templates/beat-project.md)：每次创作复制一份，记录方向、音色、Loop、编排、混音和版本。
- [音色下载、校验与归档](docs/sound-downloads.md)：七个来源的下载入口、登录步骤、格式区别和复用命令。
- [下载验证记录](docs/download-verification.md)：实际取得的文件、完整性检查与尚待验证的步骤。
- [音色来源记录模板](templates/sound-asset.md)：记录素材来源、插件版本、授权链接和 FL 导入结果。
- [北四环 Studio 在线制作台](https://haoceanlab.cn/forbeats/)：逐轨查看 Piano Roll、音符位置与长度，保存本机制作进度。
- [Studio 本地运行与 hk_88 部署](docs/studio-deployment.md)：静态页面、数据更新、发布与回滚方法。

下载渠道按需要选用；先用已有音色写 Loop，只有明确缺少某一类声音时才补充，不要求逐个平台下载。

## 流程主线

确定方向 → 设置工程 → 写主旋律 → 定音色 → 加铺底与点缀 → 写鼓 → 写 808 → 检查 Loop → 展开编排 → 做段落变化 → 混音 → 导出检查。

流程规范的是每个阶段要解决的问题、需要留下的记录和进入下一阶段的条件。BPM、调性、音色数量、和弦、鼓点和段落长度由具体歌曲决定。

## 版本与依据范围

v0.1 已经用户 review 确认，作为当前制作流程使用。后续在具体歌曲的实践中修订流程，音色、旋律和节奏方案记录在各自项目中。

课程当前核对到第 5～8 期，即旋律、鼓组、编排、混音。其他期不作为本版已验证依据。原课程由 ATTStudio / ATTBEAT 提供，入口见[来源索引](docs/sources.md)。

仓库保存独立整理的流程、记录模板和来源链接。参考音视频、完整自动转写、第三方采样包、模型文件和个人音乐工程保留在各自工作目录。

## 文件结构

```text
ForBeats/
├── README.md
├── PIPELINE.md
├── docs/
│   ├── sources.md
│   ├── sound-downloads.md
│   ├── download-verification.md
│   └── studio-deployment.md
├── studio/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   ├── score.json
│   ├── guide.md
│   ├── manifest.json
│   └── assets/                   # 六轨 Piano Roll 图谱
├── templates/
│   ├── beat-project.md
│   └── sound-asset.md
└── tools/
    ├── sound_asset.py
    ├── build_studio.py
    └── deploy_studio_server.py
```

更新时间：2026-10-18。
