#!/usr/bin/env python3
"""FAP: extract firmware with Binwalk, scan with YARA, fingerprint components.
Usage: fap_analyze.py <firmware> <outdir>   ->  JSON on stdout"""
import json, os, re, subprocess, sys
from pathlib import Path

try:
    import yara
except ImportError:
    yara = None

RULES = Path(__file__).parent / "rules" / "iot_default.yar"
# component name -> version regex (matched against strings in extracted files)
SIGNATURES = {
    "busybox": rb"BusyBox v(\d+\.\d+(?:\.\d+)?)",
    "openssl": rb"OpenSSL (\d+\.\d+\.\d+[a-z]?)",
    "dropbear": rb"dropbear[_ ]v?(\d{4}\.\d+)",
    "lighttpd": rb"lighttpd/(\d+\.\d+\.\d+)",
    "uclibc": rb"uClibc(?:-ng)? (\d+\.\d+\.\d+)",
    "dnsmasq": rb"dnsmasq-(\d+\.\d+)",
    "linux kernel": rb"Linux version (\d+\.\d+\.\d+)",
}

def extract(fw, out):
    os.makedirs(out, exist_ok=True)
    subprocess.run(["binwalk", "-e", "-M", "-C", out, fw],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=900)

def walk_files(root):
    for p in Path(root).rglob("*"):
        if p.is_file() and p.stat().st_size < 64 * 1024 * 1024:
            yield p

def main():
    fw, out = sys.argv[1], sys.argv[2]
    extract(fw, out)
    rules = yara.compile(filepath=str(RULES)) if yara else None
    found, hits = {}, []
    targets = [Path(fw), *walk_files(out)]
    for p in targets:
        try:
            data = p.read_bytes()
        except OSError:
            continue
        for name, rx in SIGNATURES.items():
            m = re.search(rx, data)
            if m and name not in found:
                found[name] = m.group(1).decode(errors="ignore")
        if rules:
            for match in rules.match(data=data):
                hits.append({"rule": match.rule, "file": str(p), "severity": match.meta.get("severity", "info")})
    print(json.dumps({
        "components": [{"name": n, "version": v} for n, v in found.items()],
        "yara_hits": hits[:200],
    }))

if __name__ == "__main__":
    main()
