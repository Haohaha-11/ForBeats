"""Run on hk_88 to deploy the self-contained static archive under /forbeats/.

Keeps timestamped releases and a Caddy backup. Validates the candidate config before
switching it in; a failed reload restores the previous config and symlink.
"""

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import subprocess
import tarfile

BASE = Path("/srv/forbeats")
CADDY = Path("/etc/caddy/Caddyfile")
BEGIN = "    # BEGIN ForBeats Studio"
END = "    # END ForBeats Studio"
BLOCK = """    # BEGIN ForBeats Studio
    redir /forbeats /forbeats/ 308
    handle_path /forbeats/* {
        root * /srv/forbeats/current
        encode gzip
        header Cache-Control "no-cache"
        header X-Content-Type-Options "nosniff"
        file_server
    }
    # END ForBeats Studio
"""


def run(*args):
    return subprocess.run(args, check=True, text=True, capture_output=True)


def change_symlink(link, target):
    pending = link.with_name(link.name + ".pending")
    if pending.exists() or pending.is_symlink():
        raise RuntimeError("A prior pending symlink exists; inspect it before deploying")
    pending.symlink_to(target)
    os.replace(pending, link)


def deploy(archive_path):
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    release = BASE / "releases" / stamp
    release.mkdir(parents=True, mode=0o755)
    with tarfile.open(archive_path, "r:gz") as archive:
        for member in archive.getmembers():
            relative = PurePosixPath(member.name)
            if relative.is_absolute() or ".." in relative.parts or not member.isfile():
                raise ValueError("Archive must contain only relative regular files")
            target = release.joinpath(*relative.parts)
            target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            with archive.extractfile(member) as source, target.open("xb") as output:
                shutil.copyfileobj(source, output)
            target.chmod(0o644)
    manifest = json.loads((release / "manifest.json").read_text())
    if set(manifest) != {p.relative_to(release).as_posix() for p in release.rglob("*") if p.is_file() and p.name != "manifest.json"}:
        raise ValueError("Release manifest does not match files")
    for name, digest in manifest.items():
        if hashlib.sha256((release / name).read_bytes()).hexdigest() != digest:
            raise ValueError(f"Hash mismatch: {name}")
    score = json.loads((release / "score.json").read_text())
    assert score["bpm"] == 140 and len(score["tracks"]) == 6
    assert sum(len(t["notes"]) for t in score["tracks"]) == 185

    original = CADDY.read_text()
    if BEGIN in original:
        if original.count(BEGIN) != 1 or original.count(END) != 1:
            raise RuntimeError("Ambiguous existing ForBeats configuration")
        start = original.index(BEGIN)
        end = original.index(END, start) + len(END)
        updated = original[:start] + BLOCK.rstrip("\n") + original[end:]
    else:
        host_line = "\nhaoceanlab.cn {\n"
        if original.count(host_line) != 1:
            raise RuntimeError("Expected exactly one existing haoceanlab.cn site")
        updated = original.replace(host_line, host_line + BLOCK, 1)
    candidate = CADDY.with_name(f"Caddyfile.forbeats-candidate-{stamp}")
    candidate.write_text(updated)
    candidate.chmod(0o644)
    run("caddy", "validate", "--adapter", "caddyfile", "--config", str(candidate))
    backup = CADDY.with_name(f"Caddyfile.before-forbeats-{stamp}")
    shutil.copy2(CADDY, backup)
    current = BASE / "current"
    if current.exists() and not current.is_symlink():
        raise RuntimeError("Current path is not a symlink; refusing to replace it")
    previous = os.readlink(current) if current.is_symlink() else None
    change_symlink(current, str(release))
    try:
        os.replace(candidate, CADDY)
        run("systemctl", "reload", "caddy")
        run("systemctl", "is-active", "--quiet", "caddy")
        # Use the actual HTTPS vhost locally, bypassing only DNS routing.
        result = run("curl", "--fail", "--silent", "--show-error", "--resolve",
                     "haoceanlab.cn:443:127.0.0.1", "https://haoceanlab.cn/forbeats/score.json")
        if json.loads(result.stdout) != score:
            raise RuntimeError("Deployed score differs")
    except Exception:
        shutil.copy2(backup, CADDY)
        if previous:
            change_symlink(current, previous)
        else:
            current.unlink()  # Only the symlink created above; release files stay recoverable.
        run("systemctl", "reload", "caddy")
        raise
    receipt = {"deployed_at": stamp, "url": "https://haoceanlab.cn/forbeats/",
               "release": str(release), "previous_release": previous,
               "caddy_backup": str(backup), "files": len(manifest), "notes": 185,
               "archive_sha256": hashlib.sha256(archive_path.read_bytes()).hexdigest()}
    (BASE / f"deployment-{stamp}.json").write_text(json.dumps(receipt, indent=2) + "\n")
    print(json.dumps(receipt, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    deploy(parser.parse_args().archive)
