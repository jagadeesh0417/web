"""Download the official NCCD-PF archive, verify it, and extract safely."""
import hashlib
import json
import sys
import time
import urllib.request
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
URL = 'https://zenodo.org/records/8215100/files/NCCD-PF_Dataset.zip?download=1'
EXPECTED = 'ca7bf252351bfb191b20d0a13ee9cedf'

def digest(path):
    h = hashlib.md5()  # Publisher-supplied integrity checksum, not authentication.
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()

def download(partial, attempts=5):
    """Retry interrupted requests, resuming only when the server honours Range."""
    for attempt in range(1, attempts + 1):
        start = partial.stat().st_size if partial.exists() else 0
        request = urllib.request.Request(URL, headers={'Range': f'bytes={start}-'} if start else {})
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
                append = start > 0 and response.status == 206
                if append and not response.headers.get('Content-Range', '').startswith(f'bytes {start}-'):
                    raise ValueError('Server returned an unexpected byte range')
                total = int(response.headers.get('Content-Length', 0)) + (start if append else 0)
                done = start if append else 0
                with partial.open('ab' if append else 'wb') as file:
                    while True:
                        block = response.read(1024 * 1024)
                        if not block:
                            break
                        file.write(block)
                        done += len(block)
                        print(f'\rDownloaded {done / 1e6:.1f} / {total / 1e6:.1f} MB', end='', flush=True)
            print()
            if total and done != total:
                raise OSError(f'Incomplete response: {done} of {total} bytes')
            return
        except (OSError, TimeoutError) as exc:
            print(f'\nAttempt {attempt}/{attempts} failed: {exc}', file=sys.stderr)
            if attempt == attempts:
                raise
            time.sleep(min(2 ** attempt, 16))

def main():
    raw = ROOT / 'data' / 'raw'
    out = ROOT / 'data' / 'extracted' / 'nccd_pf'
    raw.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)
    path = raw / 'NCCD-PF_Dataset.zip'
    status = {'source': URL, 'archive': str(path), 'status': 'failed'}
    try:
        if not path.exists() or digest(path) != EXPECTED:
            partial = path.with_suffix('.part')
            download(partial)
            if digest(partial) != EXPECTED:
                raise ValueError('Archive checksum mismatch; partial file retained for inspection')
            partial.replace(path)
        marker = out / '.complete'
        if not marker.exists():
            with zipfile.ZipFile(path) as archive:
                root = out.resolve()
                for member in archive.infolist():
                    target = (root / member.filename).resolve()
                    if not target.is_relative_to(root):
                        raise ValueError('Unsafe archive path')
                archive.extractall(out)
            marker.write_text(EXPECTED, encoding='utf-8')
        status['status'] = 'downloaded, checksum verified and extracted'
    except Exception as exc:
        status['error'] = str(exc)
        print(f'Dataset acquisition failed: {exc}', file=sys.stderr)
    metadata = ROOT / 'data' / 'metadata'
    metadata.mkdir(parents=True, exist_ok=True)
    (metadata / 'acquisition.json').write_text(json.dumps(status, indent=2), encoding='utf-8')
    print(status['status'])
    return 0 if status['status'] != 'failed' else 1

if __name__ == '__main__':
    sys.exit(main())
