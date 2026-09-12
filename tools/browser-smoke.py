"""Bounded real-browser smoke for the current Site/App/Playthings host contract.

Run only after the exact Site dependency tree is already materialized.
The smoke may use an existing Chromium/Chrome executable; it never downloads one.
When TIINEX_BROWSER_SMOKE_VITE_LOG is set, exact Vite stdout/stderr is written there.
"""
import json
import os
import pathlib
import shutil
import subprocess
import sys
import time
import urllib.request

root = pathlib.Path(__file__).resolve().parents[1]

WINDOWS_BROWSER_CANDIDATES = (
    ('chrome-program-files', 'PROGRAMFILES', ('Google', 'Chrome', 'Application', 'chrome.exe')),
    ('chrome-program-files-x86', 'PROGRAMFILES(X86)', ('Google', 'Chrome', 'Application', 'chrome.exe')),
    ('chrome-local-app-data', 'LOCALAPPDATA', ('Google', 'Chrome', 'Application', 'chrome.exe')),
    ('edge-program-files', 'PROGRAMFILES', ('Microsoft', 'Edge', 'Application', 'msedge.exe')),
    ('edge-program-files-x86', 'PROGRAMFILES(X86)', ('Microsoft', 'Edge', 'Application', 'msedge.exe')),
    ('edge-local-app-data', 'LOCALAPPDATA', ('Microsoft', 'Edge', 'Application', 'msedge.exe')),
    ('chromium-program-files', 'PROGRAMFILES', ('Chromium', 'Application', 'chrome.exe')),
    ('chromium-program-files-x86', 'PROGRAMFILES(X86)', ('Chromium', 'Application', 'chrome.exe')),
    ('chromium-local-app-data', 'LOCALAPPDATA', ('Chromium', 'Application', 'chrome.exe')),
)
WINDOWS_BROWSER_PATH_NAMES = ('chrome.exe', 'msedge.exe', 'chromium.exe')
POSIX_BROWSER_PATH_NAMES = ('chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable')


def resolve_vite():
    try:
        package = subprocess.check_output(
            ['node', '-p', "require.resolve('vite/package.json')"],
            cwd=root,
            text=True,
            stderr=subprocess.STDOUT,
        ).strip()
    except subprocess.CalledProcessError as cause:
        raise RuntimeError(
            'Exact Site dependency tree is unavailable: vite/package.json cannot be resolved. '
            'Materialize the locked dependencies before running this smoke; do not install alternate versions.'
        ) from cause
    return pathlib.Path(package).parent / 'bin/vite.js'


def resolve_browser_executable(environ=None, platform=None, which=None, is_file=None):
    environ = os.environ if environ is None else environ
    platform = sys.platform if platform is None else platform
    which = shutil.which if which is None else which
    is_file = (lambda candidate: pathlib.Path(candidate).is_file()) if is_file is None else is_file
    checked = []

    explicit = str(environ.get('TIINEX_BROWSER_EXECUTABLE', '')).strip()
    if explicit:
        candidate = pathlib.Path(explicit).expanduser()
        checked.append({'source': 'explicit', 'candidate': str(candidate)})
        if not is_file(str(candidate)):
            raise RuntimeError(f'TIINEX_BROWSER_EXECUTABLE does not name a file: {candidate}')
        return {'executable': str(candidate), 'source': 'explicit', 'checked': checked}

    if str(platform).lower().startswith('win'):
        for label, environment_name, relative_parts in WINDOWS_BROWSER_CANDIDATES:
            base = str(environ.get(environment_name, '')).strip()
            if not base:
                continue
            candidate = pathlib.Path(base).joinpath(*relative_parts)
            checked.append({'source': f'windows:{label}', 'candidate': str(candidate)})
            if is_file(str(candidate)):
                return {'executable': str(candidate), 'source': f'windows:{label}', 'checked': checked}
        path_names = WINDOWS_BROWSER_PATH_NAMES
    else:
        path_names = POSIX_BROWSER_PATH_NAMES

    for name in path_names:
        candidate = which(name)
        checked.append({'source': f'path:{name}', 'candidate': str(candidate or '')})
        if candidate:
            return {'executable': str(candidate), 'source': f'path:{name}', 'checked': checked}
    return {'executable': '', 'source': 'unresolved-system', 'checked': checked}


def wait_for_visible_moment_count(page, expected):
    selector = '[data-visible-moment-count]'
    page.locator(selector).wait_for(timeout=15000)
    page.wait_for_function(
        "([selector, expected]) => document.querySelector(selector)?.getAttribute('data-visible-moment-count') === expected",
        [selector, str(expected)],
    )


def emit_failure(stage, error, browser_resolution=None):
    print(json.dumps({
        'status': 'failed',
        'realBrowser': stage in {'browser-launch', 'smoke-assertion'},
        'failureStage': stage,
        'errorType': type(error).__name__,
        'message': str(error),
        'browserExecutable': (browser_resolution or {}).get('executable', ''),
        'browserSource': (browser_resolution or {}).get('source', ''),
        'browserChecked': (browser_resolution or {}).get('checked', []),
        'viteLog': os.environ.get('TIINEX_BROWSER_SMOKE_VITE_LOG', '').strip(),
    }), file=sys.stderr)


def main():
    stage = 'dependency-resolution'
    server = None
    vite_log = None
    browser = None
    playwright = None
    browser_resolution = None
    try:
        vite = resolve_vite()

        stage = 'browser-resolution'
        browser_resolution = resolve_browser_executable()
        from playwright.sync_api import sync_playwright
        playwright = sync_playwright().start()
        if not browser_resolution['executable']:
            managed = pathlib.Path(playwright.chromium.executable_path)
            browser_resolution['checked'].append({'source': 'playwright-managed', 'candidate': str(managed)})
            if not managed.is_file():
                raise RuntimeError(
                    'No compatible installed Chrome/Chromium/Edge executable was found in the bounded system candidate set, '
                    'and the Playwright-managed Chromium executable is not present. No browser download is attempted automatically.'
                )
            browser_resolution = {
                **browser_resolution,
                'executable': str(managed),
                'source': 'playwright-managed',
            }

        vite_log_path = os.environ.get('TIINEX_BROWSER_SMOKE_VITE_LOG', '').strip()
        if vite_log_path:
            vite_log_target = pathlib.Path(vite_log_path).expanduser()
            vite_log_target.parent.mkdir(parents=True, exist_ok=True)
            vite_log = vite_log_target.open('wb')

        stage = 'vite-startup'
        server = subprocess.Popen(
            ['node', str(vite), '--host', '127.0.0.1', '--port', '4317', '--strictPort'],
            cwd=root,
            stdout=vite_log if vite_log is not None else subprocess.DEVNULL,
            stderr=subprocess.STDOUT,
        )
        for _ in range(100):
            if server.poll() is not None:
                raise RuntimeError(f'Vite exited before browser checks with code {server.returncode}')
            try:
                urllib.request.urlopen('http://127.0.0.1:4317/test/browser.html', timeout=1)
                break
            except OSError:
                time.sleep(.1)
        else:
            raise RuntimeError('Vite never became ready')

        stage = 'browser-launch'
        browser = playwright.chromium.launch(executable_path=browser_resolution['executable'])
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

        stage = 'smoke-assertion'
        page.goto('http://127.0.0.1:4317/test/browser.html')
        view = page.get_by_role('combobox', name='View', exact=True)
        view.select_option('playthings')
        page.locator('[data-playthings-state="ready"]').wait_for(timeout=15000)
        wait_for_visible_moment_count(page, 2)

        slider = page.get_by_role('slider', name='History position')
        slider.fill('0')
        wait_for_visible_moment_count(page, 1)

        # Current Verse-owned exit control. The host-level control is named
        # "Exit Verse" even though its visible text is also "Back to Viewer".
        assert page.get_by_role('button', name='Exit Verse', exact=True).is_visible()
        page.get_by_role('button', name='Back to Viewer', exact=True).click()
        assert view.input_value() == 'viewer'

        view.select_option('playthings')
        page.locator('[data-playthings-state="ready"]').wait_for(timeout=15000)
        wait_for_visible_moment_count(page, 2)

        page.get_by_role('button', name='Root Gate menu', exact=True).click()
        root_gate = page.get_by_role('dialog', name='Root Gate', exact=True)
        root_gate.wait_for(timeout=15000)
        fullscreen = root_gate.get_by_role('button', name='Fullscreen', exact=True)
        assert fullscreen.is_visible()
        fullscreen.click()
        # Wait for the asynchronous host request to settle as either real
        # fullscreen state or an explicit Root Gate error; never race a failure.
        page.wait_for_function(
            "() => document.fullscreenElement !== null || document.querySelector('dialog[aria-label=\"Root Gate\"] [role=\"alert\"]') !== null"
        )
        assert root_gate.get_by_role('alert').count() == 0
        assert page.evaluate("document.fullscreenElement?.id") == 'tiinex-verse-stage'
        root_gate.get_by_role('button', name='Return to Viewer', exact=True).click()
        page.wait_for_function("() => document.fullscreenElement === null")
        assert view.input_value() == 'viewer'

        assert not errors, errors
        browser.close()
        browser = None

        print(json.dumps({
            'status': 'passed',
            'realBrowser': True,
            'browserExecutable': browser_resolution['executable'],
            'browserSource': browser_resolution['source'],
            'browserChecked': browser_resolution['checked'],
            'viteLog': vite_log_path,
            'checks': [
                'mount',
                'lazy-import',
                'read-only-data',
                'visible-moment-selection',
                'verse-return',
                'state-retention',
                'root-gate',
                'fullscreen-reachability',
                'root-gate-return',
            ],
        }))
    except Exception as error:
        emit_failure(stage, error, browser_resolution)
        raise
    finally:
        if browser is not None:
            try:
                browser.close()
            except Exception:
                pass
        if playwright is not None:
            try:
                playwright.stop()
            except Exception:
                pass
        if server is not None:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
        if vite_log is not None:
            vite_log.close()


if __name__ == '__main__':
    main()
