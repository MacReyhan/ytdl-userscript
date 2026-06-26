#!/usr/bin/env python3
"""
Userscript server for YT Video Downloader.
Listens on http://127.0.0.1:6554, receives JSON commands via HTTP POST, launches yt-dlp.
"""

import sys, os, json, subprocess, tempfile, traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ── paths (everything lives next to this script) ──
DIR        = os.path.dirname(os.path.abspath(sys.argv[0]))
YTDLP      = os.path.join(DIR, 'yt-dlp.exe')
FFMPEG_DIR = DIR                                       # ffmpeg.exe & ffprobe.exe
CONFIG     = os.path.join(DIR, 'config.json')
DEFAULT_DL = os.path.join(os.path.expanduser('~'), 'Downloads', 'YouTube')

# ── config helpers ──
def load_cfg():
    if os.path.isfile(CONFIG):
        try:
            with open(CONFIG) as f: return json.load(f)
        except Exception:
            pass
    return {}

def save_cfg(cfg):
    with open(CONFIG, 'w') as f: json.dump(cfg, f, indent=2)

def dl_dir():
    d = load_cfg().get('download_dir', DEFAULT_DL)
    os.makedirs(d, exist_ok=True)
    return d

# ── handlers ──
def handle_ping(_):
    return {
        'success': True,
        'ytdlp_found':  os.path.isfile(YTDLP),
        'ffmpeg_found':  os.path.isfile(os.path.join(DIR, 'ffmpeg.exe')),
    }

def handle_get_config(_):
    cfg = load_cfg()
    cfg.setdefault('download_dir', DEFAULT_DL)
    return {'success': True, 'config': cfg}

def handle_set_config(msg):
    cfg = load_cfg()
    if 'download_dir' in msg:
        cfg['download_dir'] = msg['download_dir']
        os.makedirs(msg['download_dir'], exist_ok=True)
    save_cfg(cfg)
    return {'success': True}

def quote_arg(arg):
    # Windows CMD special characters that require quoting to avoid command injection / syntax errors
    special_chars = ' <>&|^%='
    if not arg:
        return '""'
    if any(c in arg for c in special_chars):
        # Escape existing double quotes
        arg = arg.replace('"', '\\"')
        return f'"{arg}"'
    return arg

def handle_download(msg):
    url         = msg.get('url', '')
    format_args = msg.get('format_args', [])
    out_dir     = msg.get('download_dir') or dl_dir()

    if not url:
        return {'success': False, 'error': 'No URL provided'}
    if not os.path.isfile(YTDLP):
        return {'success': False, 'error': f'yt-dlp.exe not found in {DIR}'}

    out_tpl = os.path.join(out_dir, '%(title)s.%(ext)s')

    # Windows cmd.exe splits commands on '&' unless the string is wrapped in double quotes. 
    # list2cmdline unfortunately won't quote a URL unless it has spaces, which causes bugs for "?v=...&list=..."
    # So we manually build the cmd string using a custom quoting function that checks for all CMD special characters:
    base_cmd = [
        YTDLP,
        '--ffmpeg-location', FFMPEG_DIR,
        '--no-mtime',
        '--windows-filenames',
        '-o', out_tpl
    ]
    
    cmd_str = ' '.join(quote_arg(a) for a in base_cmd)
    
    # Append format args and explicitly quote the URL 
    for arg in format_args:
        cmd_str += f' {quote_arg(arg)}'
    cmd_str += f' {quote_arg(url)}'

    # write a tiny batch file so the console stays open after yt-dlp finishes
    bat = os.path.join(tempfile.gettempdir(), 'ytdl_run.bat')
    with open(bat, 'w', encoding='utf-8') as f:
        f.write('@echo off\n')
        f.write('title yt-dlp  —  downloading …\n')
        f.write('echo.\n')
        f.write(f'echo  URL : "{url}"\n')
        f.write(f'echo  Dir : "{out_dir}"\n')
        f.write('echo.\n')
        # Windows batch requires doubling '%' signs, otherwise "%(title)s" is parsed as a variable.
        f.write(cmd_str.replace('%', '%%') + '\n')
        f.write('echo.\n')
        f.write('if errorlevel 1 (\n')
        f.write('    echo  [FAILED]  see error above\n')
        f.write('    pause\n')
        f.write(') else (\n')
        f.write(f'    echo  [DONE]  file saved to "{out_dir}"\n')
        f.write('    timeout /t 4 >nul\n')
        f.write(')\n')

    try:
        subprocess.Popen(
            ['cmd.exe', '/c', bat],
            creationflags=subprocess.CREATE_NEW_CONSOLE,
        )
        return {'success': True, 'message': 'Download started', 'download_dir': out_dir}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def handle_get_formats(msg):
    url = msg.get('url', '')
    if not url:
        return {'success': False, 'error': 'No URL'}
    try:
        r = subprocess.run(
            [YTDLP, '--ffmpeg-location', FFMPEG_DIR, '-J', '--no-warnings', url],
            capture_output=True, text=True, timeout=30,
            creationflags=0x08000000,          # CREATE_NO_WINDOW
        )
        if r.returncode != 0:
            return {'success': False, 'error': r.stderr or 'yt-dlp error'}
        info = json.loads(r.stdout)
        fmts = [{
            'id':     f.get('format_id',''),
            'ext':    f.get('ext',''),
            'h':      f.get('height'),
            'fps':    f.get('fps'),
            'tbr':    f.get('tbr'),
            'vcodec': f.get('vcodec','none'),
            'acodec': f.get('acodec','none'),
            'size':   f.get('filesize') or f.get('filesize_approx'),
            'note':   f.get('format_note',''),
        } for f in info.get('formats', [])]
        return {'success': True, 'title': info.get('title',''), 'formats': fmts}
    except subprocess.TimeoutExpired:
        return {'success': False, 'error': 'Timed out'}
    except Exception as e:
        return {'success': False, 'error': str(e)}

# ── dispatch ──
DISPATCH = {
    'ping':       handle_ping,
    'download':   handle_download,
    'getFormats': handle_get_formats,
    'getConfig':  handle_get_config,
    'setConfig':  handle_set_config,
}

class UserscriptServerHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            msg = json.loads(post_data.decode('utf-8'))
            action = msg.get('action')
            handler = DISPATCH.get(action, lambda m: {'success': False, 'error': f'Unknown action: {action}'})
            response_obj = handler(msg)
        except Exception as e:
            response_obj = {'success': False, 'error': traceback.format_exc()}

        response_bytes = json.dumps(response_obj).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response_bytes))
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(response_bytes)

    def log_message(self, format, *args):
        # Clean console output
        print(f"  [{self.log_date_time_string()}] {format % args}")

def main():
    port = 6554
    server_address = ('127.0.0.1', port)
    httpd = ThreadingHTTPServer(server_address, UserscriptServerHandler)
    
    print()
    print("=" * 60)
    print(f"  🚀  YT-DLP Userscript Server running on http://127.0.0.1:{port}")
    print("  🟢  Keep this window open while downloading from YouTube.")
    print("  Press Ctrl+C to stop the server.")
    print("=" * 60)
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopping server...")
        httpd.server_close()
        print("  Server stopped.")

if __name__ == '__main__':
    main()
