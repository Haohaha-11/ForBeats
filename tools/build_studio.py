"""Build the static Studio bundle from the local original score, or existing site data."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import tarfile

ROOT = Path(__file__).resolve().parents[1]
STUDIO = ROOT / "studio"


def build(source):
    if source.exists():
        original = json.loads((source / "notes.json").read_text(encoding="utf-8"))
        public = {key: original[key] for key in
                  ["title", "version", "date", "bpm", "meter", "bars", "steps_per_bar", "beats_per_step", "fl_middle_c", "key", "seconds"]}
        public["tracks"] = []
        for item in original["tracks"]:
            row = {key: item[key] for key in ["id", "title", "preset", "channel", "pitch_low", "pitch_high", "notes", "summary", "footnote"]}
            row["sample_filename"] = Path(item["source_file"]).name if item.get("source_file") else None
            public["tracks"].append(row)
        (STUDIO / "score.json").write_text(json.dumps(public, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (STUDIO / "assets").mkdir(exist_ok=True)
        for item in public["tracks"]:
            shutil.copy2(source / f"{item['id']}.png", STUDIO / "assets")
        guide = (source / "GUIDE.md").read_text(encoding="utf-8")
        guide = re.sub(r"\]\((0[1-6]-[^)]+\.png)\)", r"](assets/\1)", guide)
        guide = re.sub(r"\[本地 ([^\]]+)\]\(\.\./sound-library/[^)]+\)", r"`\1`", guide)
        guide = guide.replace("本目录保留原始 `notes.json`、逐音 `notes.csv` 和绘图脚本。", "页面保留可下载图谱，音符来自同一份原创数据。")
        (STUDIO / "guide.md").write_text(guide, encoding="utf-8")
    score = json.loads((STUDIO / "score.json").read_text(encoding="utf-8"))
    assert score["bpm"] == 140 and score["bars"] == 8
    assert len(score["tracks"]) == 6
    assert sum(len(t["notes"]) for t in score["tracks"]) == 185
    for item in score["tracks"]:
        assert "source_file" not in item
        assert (STUDIO / "assets" / f"{item['id']}.png").is_file()
        for note in item["notes"]:
            assert 1 <= note["bar"] <= 8
            assert 1 <= note["step"] <= 16
            assert 0 < note["length_steps"] <= 17 - note["step"]
    files = sorted(p for p in STUDIO.rglob("*") if p.is_file() and p.name != "manifest.json")
    for path in files:
        if path.suffix in {".json", ".js", ".html", ".css", ".md"}:
            assert not re.search(r"[A-Z]:[\\/]", path.read_text(encoding="utf-8")), f"Local path in {path.name}"
    manifest = {p.relative_to(STUDIO).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in files}
    (STUDIO / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    output = ROOT / "exports/forbeats-studio-release.tar.gz"
    output.parent.mkdir(exist_ok=True)
    with tarfile.open(output, "w:gz") as archive:
        for path in [*files, STUDIO / "manifest.json"]:
            archive.add(path, arcname=path.relative_to(STUDIO).as_posix(), recursive=False)
    print(json.dumps({"files": len(files) + 1, "notes": 185, "archive": str(output),
                      "archive_sha256": hashlib.sha256(output.read_bytes()).hexdigest()}, ensure_ascii=False))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=ROOT / "projects/bei-sihuan/piano-roll-v1")
    build(parser.parse_args().source)
