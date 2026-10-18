"""Download public sound files or check a file obtained through a signed-in browser.

Python 3.10+, standard library only. Does not log in, install, or run downloaded files.
Receipts belong beside local assets, outside the public Git history.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
from datetime import datetime, timezone
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import zipfile


def public_url(value):
    parsed = urlsplit(value)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise argparse.ArgumentTypeError("Use a public HTTPS URL without credentials")
    # Account download URLs can carry bearer tokens. Use the browser for these.
    if any(word in parsed.query.lower() for word in ("token", "signature", "credential", "key=")):
        raise argparse.ArgumentTypeError("Use the signed-in browser, then inspect the saved file")
    return value


def inspect_file(path, expected_sha=None, expected_suffix=None):
    size = path.stat().st_size
    if not size:
        raise ValueError("Empty file")
    with path.open("rb") as stream:
        prefix = stream.read(512)
        stream.seek(0)
        digest = hashlib.sha256()
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    if prefix.lstrip().lower().startswith((b"<!doctype html", b"<html")):
        raise ValueError("Received an HTML/login page instead of an asset")
    sha = digest.hexdigest()
    if expected_sha and sha.lower() != expected_sha.lower():
        raise ValueError("SHA-256 mismatch")
    result = {"filename": path.name, "bytes": size, "sha256": sha}
    suffix = (expected_suffix or path.suffix).lower()
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as archive:
            # Check integrity without extracting unknown paths or executing anything.
            bad = archive.testzip()
            if bad:
                raise ValueError("ZIP CRC failed")
            counts = {}
            for entry in archive.infolist():
                if not entry.is_dir():
                    extension = Path(entry.filename).suffix.lower() or "(none)"
                    counts[extension] = counts.get(extension, 0) + 1
            result.update(format="zip", crc="passed", member_types=counts)
    elif suffix in (".zip", ".vitalbank"):
        raise ValueError("Expected a ZIP container, but its header is invalid")
    elif suffix == ".vital":
        preset = json.loads(path.read_text(encoding="utf-8-sig"))
        if not isinstance(preset, dict) or not isinstance(preset.get("settings"), dict):
            raise ValueError("Not a recognized Vital preset JSON structure")
        result.update(format="vital-json", synth_version=preset.get("synth_version"))
    elif suffix == ".exe":
        if prefix[:2] != b"MZ":
            raise ValueError("Expected a Windows executable header")
        result.update(format="windows-executable", signature="not_checked", installed=False)
    elif suffix == ".wav":
        if prefix[:4] not in (b"RIFF", b"RF64") or prefix[8:12] != b"WAVE":
            raise ValueError("Invalid WAVE header")
        result.update(format="wave", audio_decode="not_checked")
    else:
        result.update(format="opaque", note="Hash and nonempty check only; vendor import untested")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    fetch = sub.add_parser("fetch", help="Download a public file without account credentials")
    fetch.add_argument("--url", type=public_url, required=True)
    fetch.add_argument("--out", type=Path, required=True)
    check = sub.add_parser("inspect", help="Check a browser-downloaded or existing file")
    check.add_argument("file", type=Path)
    for command in (fetch, check):
        command.add_argument("--provider", required=True)
        command.add_argument("--source", type=public_url, required=True, help="Public product page")
        command.add_argument("--sha256", help="Expected hash, if previously verified")
        command.add_argument("--receipt", type=Path, help="Default: FILE.receipt.json")
    args = parser.parse_args()
    path = args.out if args.command == "fetch" else args.file
    receipt_path = args.receipt or path.with_name(path.name + ".receipt.json")
    if receipt_path.resolve() == path.resolve():
        raise ValueError("Receipt must not overwrite the asset")
    if args.command == "fetch":
        path.parent.mkdir(parents=True, exist_ok=True)
        if path.exists():
            raise FileExistsError("Destination exists; use inspect or choose a different name")
        part = path.with_name(path.name + ".part")
        request = Request(args.url, headers={"User-Agent": "ForBeats/1.0", "Accept-Encoding": "identity"})
        with urlopen(request, timeout=45) as response, part.open("xb") as target:
            public_url(response.geturl())
            if "text/html" in response.headers.get("Content-Type", "").lower():
                raise ValueError("Server returned HTML instead of a downloadable asset")
            for chunk in iter(lambda: response.read(1024 * 1024), b""):
                target.write(chunk)
            length = response.headers.get("Content-Length")
            if length and target.tell() != int(length):
                raise ValueError("Incomplete download: Content-Length mismatch")
        # Validate before publishing the final filename; failures leave a .part file.
        result = inspect_file(part, args.sha256, path.suffix)
        os.rename(part, path)
        result["filename"] = path.name
    else:
        result = inspect_file(path, args.sha256)
    result.update(provider=args.provider, source_page=args.source,
                  checked_at=datetime.now(timezone.utc).isoformat())
    if args.command == "fetch":
        result["public_download_url"] = args.url
    receipt_path.parent.mkdir(parents=True, exist_ok=True)
    receipt_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        # Avoid printing URLs from account redirects or proxy/network exceptions.
        print(f"Asset check failed ({type(exc).__name__}); no success receipt written.", file=sys.stderr)
        sys.exit(1)
