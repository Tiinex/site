"""Bounded real-browser smoke for the current Site/App/Playthings host contract.

Run only after the exact Site lockfile dependency tree is already materialized.
The smoke may use an existing Chromium/Chrome executable; it never downloads one.
"""
import json
import os
import pathlib
import shutil
import subprocess
import time
import urllib.request

from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parents[1]


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


def resolve_browser_executable():
    explicit = os.environ.get('TIINEX_BROWSER_EXECUTABLE', '').strip()
    if explicit:
        candidate = pathlib.Path(explicit).expanduser()
        if not candidate.is_file():
            raise RuntimeError(f'TIINEX_BROWSER_EXECUTABLE does not name a file: {candidate}')
        return str(candidate)
    for name in ('chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable'):
        candidate = shutil.which(name)
        if candidate:
            return candidate
    return None


def wait_for_visible_moment_count(page, expected):
    selector = '[data-visible-moment-count]'
    page.locator(selector).wait_for(timeout=15000)
    page.wait_for_function(
        "([selector, expected]) => document.querySelector(selector)?.getAttribute('data-visible-moment-count') === expected",
        [selector, str(expected)],
    )


vite = resolve_vite()
browser_executable = resolve_browser_executable()
server = subprocess.Popen(
    ['node', str(vite), '--host', '127.0.0.1', '--port', '4317', '--strictPort'],
    cwd=root,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.STDOUT,
)
try:
    for _ in range(100):
        if server.poll() is not None:
            raise RuntimeError('Vite exited before browser checks')
        try:
            urllib.request.urlopen('http://127.0.0.1:4317/test/browser.html', timeout=1)
            break
        except OSError:
            time.sleep(.1)
    else:
        raise RuntimeError('Vite never became ready')

    with sync_playwright() as p:
        launch = {'executable_path': browser_executable} if browser_executable else {}
        browser = p.chromium.launch(**launch)
        page = browser.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))

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

    print(json.dumps({
        'status': 'passed',
        'realBrowser': True,
        'browserExecutable': browser_executable or 'playwright-managed',
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
finally:
    server.terminate()
    try:
        server.wait(timeout=5)
    except subprocess.TimeoutExpired:
        server.kill()
