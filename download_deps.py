#!/usr/bin/env python3
"""
Downloads yt-dlp.exe, ffmpeg.exe, ffprobe.exe into native_server/
Works on Windows. No third-party Python packages needed.
"""

import os
import sys
import io
import json
import shutil
import zipfile
import hashlib
import urllib.request
import urllib.error
import time
import ssl
import tempfile
from pathlib import Path

# ── configuration ──────────────────────────────────────────
NATIVE_SERVER_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'native_server')

YTDLP_RELEASE_URL  = 'https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest'
YTDLP_DIRECT_URL   = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'

# BtbN builds — auto-built nightly / release, always up-to-date
FFMPEG_BTBN_API     = 'https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/latest'
# Fallback: gyan.dev stable URL
FFMPEG_GYAN_URL     = 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip'

REQUIRED_FILES = ['yt-dlp.exe', 'ffmpeg.exe', 'ffprobe.exe']

# ── pretty printing ────────────────────────────────────────
class C:
    """ANSI colors for Windows 10+ terminal."""
    RESET  = '\033[0m'
    BOLD   = '\033[1m'
    RED    = '\033[91m'
    GREEN  = '\033[92m'
    YELLOW = '\033[93m'
    CYAN   = '\033[96m'
    DIM    = '\033[90m'

def enable_ansi():
    """Enable ANSI escape codes on Windows."""
    if sys.platform == 'win32':
        try:
            import ctypes
            k32 = ctypes.windll.kernel32
            h   = k32.GetStdHandle(-11)
            mode = ctypes.c_ulong()
            k32.GetConsoleMode(h, ctypes.byref(mode))
            k32.SetConsoleMode(h, mode.value | 0x0004)
        except Exception:
            pass

def banner():
    print(f"""
{C.CYAN}{C.BOLD}╔═══════════════════════════════════════════════╗
║     YT-DLP Userscript — Dependency Setup      ║
╚═══════════════════════════════════════════════╝{C.RESET}
""")

def ok(msg):    print(f'  {C.GREEN}✔{C.RESET}  {msg}')
def warn(msg):  print(f'  {C.YELLOW}⚠{C.RESET}  {msg}')
def fail(msg):  print(f'  {C.RED}✖{C.RESET}  {msg}')
def info(msg):  print(f'  {C.CYAN}ℹ{C.RESET}  {msg}')
def step(msg):  print(f'\n{C.BOLD}▸ {msg}{C.RESET}')

# ── network helpers ────────────────────────────────────────
def make_opener():
    """Create a URL opener that works even with questionable certs."""
    ctx = ssl.create_default_context()
    try:
        ctx.check_hostname = True
        ctx.verify_mode    = ssl.CERT_REQUIRED
    except Exception:
        ctx = ssl._create_unverified_context()
    return urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))

OPENER = make_opener()

def api_get(url):
    """GET JSON from a URL (GitHub API, etc.)."""
    req = urllib.request.Request(url, headers={
        'User-Agent': 'ytdl-userscript-setup/1.0',
        'Accept':     'application/vnd.github+json',
    })
    with OPENER.open(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

def download_file(url, dest_path, label=''):
    """Download a file with a progress bar."""
    req = urllib.request.Request(url, headers={
        'User-Agent': 'ytdl-userscript-setup/1.0',
    })

    # handle redirects (GitHub releases redirect to S3)
    try:
        resp = OPENER.open(req, timeout=60)
    except urllib.error.HTTPError as e:
        fail(f'HTTP {e.code}: {url}')
        raise

    total = int(resp.headers.get('Content-Length', 0))
    downloaded = 0
    chunk_size = 1024 * 64   # 64 KB
    start      = time.time()

    with open(dest_path, 'wb') as f:
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            f.write(chunk)
            downloaded += len(chunk)
            _progress(label, downloaded, total, start)

    print()  # newline after progress bar
    return downloaded

def _progress(label, done, total, t0):
    """Render a progress bar."""
    elapsed = max(time.time() - t0, 0.001)
    speed   = done / elapsed

    if total > 0:
        pct = done / total * 100
        bar_w = 30
        filled = int(bar_w * done / total)
        bar = '█' * filled + '░' * (bar_w - filled)
        line = f'\r  {C.DIM}[{bar}]{C.RESET} {pct:5.1f}%  {_fmt_size(done)}/{_fmt_size(total)}  {_fmt_size(speed)}/s'
    else:
        line = f'\r  {C.DIM}⏳{C.RESET}  {_fmt_size(done)} downloaded  {_fmt_size(speed)}/s'

    if label:
        line += f'  {C.DIM}({label}){C.RESET}'
    print(line, end='', flush=True)

def _fmt_size(b):
    """Human-readable file size."""
    for unit in ['B','KB','MB','GB']:
        if b < 1024:
            return f'{b:.1f} {unit}'
        b /= 1024
    return f'{b:.1f} TB'

# ── version helpers ────────────────────────────────────────
def get_local_version(exe_path):
    """Try to get the version string of a local exe."""
    import subprocess
    try:
        r = subprocess.run(
            [exe_path, '--version'],
            capture_output=True, text=True, timeout=10,
            creationflags=0x08000000,  # CREATE_NO_WINDOW
        )
        return r.stdout.strip().split('\n')[0].strip()
    except Exception:
        return None

# ── yt-dlp download ───────────────────────────────────────
def download_ytdlp(force=False):
    step('yt-dlp.exe')
    dest = os.path.join(NATIVE_SERVER_DIR, 'yt-dlp.exe')

    # check existing
    if os.path.isfile(dest) and not force:
        ver = get_local_version(dest)
        if ver:
            ok(f'Already installed: {ver}')
            return True

    # get latest release info
    info('Checking latest release on GitHub …')
    try:
        data = api_get(YTDLP_RELEASE_URL)
        tag  = data.get('tag_name', '?')
        info(f'Latest release: {tag}')

        # find yt-dlp.exe asset
        dl_url = None
        for asset in data.get('assets', []):
            if asset['name'] == 'yt-dlp.exe':
                dl_url = asset['browser_download_url']
                break

        if not dl_url:
            dl_url = YTDLP_DIRECT_URL
            warn('Asset not found in API, using direct URL')

    except Exception as e:
        warn(f'GitHub API failed ({e}), using direct URL')
        dl_url = YTDLP_DIRECT_URL
        tag = 'latest'

    # download
    info(f'Downloading yt-dlp.exe …')
    tmp = dest + '.tmp'
    try:
        download_file(dl_url, tmp, f'yt-dlp {tag}')
        # verify it's a valid PE
        with open(tmp, 'rb') as f:
            if f.read(2) != b'MZ':
                fail('Downloaded file is not a valid Windows executable!')
                os.remove(tmp)
                return False
        shutil.move(tmp, dest)
        ver = get_local_version(dest)
        ok(f'Installed: {ver or tag}')
        return True
    except Exception as e:
        fail(f'Download failed: {e}')
        if os.path.isfile(tmp):
            os.remove(tmp)
        return False

# ── ffmpeg download ────────────────────────────────────────
def download_ffmpeg(force=False):
    step('ffmpeg.exe + ffprobe.exe')
    ffmpeg_dest  = os.path.join(NATIVE_SERVER_DIR, 'ffmpeg.exe')
    ffprobe_dest = os.path.join(NATIVE_SERVER_DIR, 'ffprobe.exe')

    # check existing
    if os.path.isfile(ffmpeg_dest) and os.path.isfile(ffprobe_dest) and not force:
        ver = get_local_version(ffmpeg_dest)
        if ver:
            ok(f'Already installed: {ver[:80]}')
            return True

    # try BtbN GitHub releases first (smaller, GPL builds with all codecs)
    dl_url  = None
    src_tag = ''

    info('Checking BtbN/FFmpeg-Builds on GitHub …')
    try:
        data = api_get(FFMPEG_BTBN_API)
        src_tag = data.get('tag_name', '')
        for asset in data.get('assets', []):
            name = asset['name']
            # look for win64 GPL shared or full zip
            if ('win64' in name and 'gpl' in name and name.endswith('.zip')
                    and 'shared' not in name and 'lgpl' not in name):
                dl_url = asset['browser_download_url']
                info(f'Found: {name}')
                break
        if not dl_url:
            # broaden search
            for asset in data.get('assets', []):
                name = asset['name']
                if 'win64' in name and name.endswith('.zip') and 'shared' not in name:
                    dl_url = asset['browser_download_url']
                    info(f'Found: {name}')
                    break
    except Exception as e:
        warn(f'BtbN API failed: {e}')

    if not dl_url:
        info('Falling back to gyan.dev essentials build …')
        dl_url  = FFMPEG_GYAN_URL
        src_tag = 'gyan.dev-release'

    # download zip
    info('Downloading ffmpeg (this may take a minute) …')
    tmp_zip = os.path.join(tempfile.gettempdir(), 'ffmpeg_download.zip')

    try:
        download_file(dl_url, tmp_zip, f'ffmpeg {src_tag}')
    except Exception as e:
        fail(f'Download failed: {e}')
        # if BtbN failed, retry with gyan.dev
        if 'gyan.dev' not in dl_url:
            warn('Retrying with gyan.dev …')
            dl_url = FFMPEG_GYAN_URL
            try:
                download_file(dl_url, tmp_zip, 'ffmpeg gyan.dev')
            except Exception as e2:
                fail(f'Retry also failed: {e2}')
                return False
        else:
            return False

    # extract ffmpeg.exe and ffprobe.exe from the zip
    info('Extracting executables …')
    try:
        found_ffmpeg  = False
        found_ffprobe = False

        with zipfile.ZipFile(tmp_zip, 'r') as zf:
            for entry in zf.namelist():
                basename = os.path.basename(entry).lower()

                if basename == 'ffmpeg.exe' and not found_ffmpeg:
                    _extract_member(zf, entry, ffmpeg_dest)
                    found_ffmpeg = True

                elif basename == 'ffprobe.exe' and not found_ffprobe:
                    _extract_member(zf, entry, ffprobe_dest)
                    found_ffprobe = True

                if found_ffmpeg and found_ffprobe:
                    break

        if not found_ffmpeg:
            fail('ffmpeg.exe not found inside the zip!')
            return False
        if not found_ffprobe:
            fail('ffprobe.exe not found inside the zip!')
            return False

        ver = get_local_version(ffmpeg_dest)
        ok(f'Installed: {ver[:80] if ver else src_tag}')
        return True

    except zipfile.BadZipFile:
        fail('Downloaded file is not a valid ZIP. Try again later.')
        return False
    except Exception as e:
        fail(f'Extraction failed: {e}')
        return False
    finally:
        # clean up temp zip
        try:
            os.remove(tmp_zip)
        except Exception:
            pass

def _extract_member(zf, member, dest):
    """Extract a single member from a zip to a destination path."""
    with zf.open(member) as src, open(dest, 'wb') as dst:
        shutil.copyfileobj(src, dst)

# ── verification ───────────────────────────────────────────
def verify_all():
    step('Verifying installation')
    all_ok = True
    for name in REQUIRED_FILES:
        path = os.path.join(NATIVE_SERVER_DIR, name)
        if os.path.isfile(path):
            size = os.path.getsize(path)
            ver  = get_local_version(path) or ''
            ok(f'{name:16s}  {_fmt_size(size):>10s}  {ver[:60]}')
        else:
            fail(f'{name} — NOT FOUND')
            all_ok = False
    return all_ok

# ── main ───────────────────────────────────────────────────
def main():
    enable_ansi()
    banner()

    # parse args
    force = '--force' in sys.argv or '-f' in sys.argv
    if force:
        info('Force mode: re-downloading everything')

    # ensure native_server directory exists
    os.makedirs(NATIVE_SERVER_DIR, exist_ok=True)
    info(f'Target directory: {NATIVE_SERVER_DIR}')

    # download
    ytdlp_ok  = download_ytdlp(force)
    ffmpeg_ok = download_ffmpeg(force)

    # verify
    all_ok = verify_all()

    # summary
    print()
    if all_ok:
        print(f'{C.GREEN}{C.BOLD}  ✅  All dependencies are ready!{C.RESET}')
        print(f'      Now run {C.CYAN}run_server.bat{C.RESET} to start the local backend server.\n')
    else:
        print(f'{C.RED}{C.BOLD}  ❌  Some dependencies are missing.{C.RESET}')
        print(f'      You can download them manually:')
        print(f'        yt-dlp  → https://github.com/yt-dlp/yt-dlp/releases')
        print(f'        ffmpeg  → https://www.gyan.dev/ffmpeg/builds/')
        print(f'      Place the .exe files in: {NATIVE_SERVER_DIR}\n')

    return 0 if all_ok else 1


if __name__ == '__main__':
    sys.exit(main())
