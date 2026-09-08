"""Run after npm ci with python playwright==1.55.0 and chromium installed.
Exercises real package imports, preserved Viewer state, lazy Verse load, and return.
This is not claimed as a local pass when React/Vite cannot be downloaded.
"""
import subprocess, time, urllib.request, pathlib, json
from playwright.sync_api import sync_playwright
root=pathlib.Path(__file__).resolve().parents[1]
vite=pathlib.Path(subprocess.check_output(['node','-p',"require.resolve('vite/package.json')"],cwd=root,text=True).strip()).parent/'bin/vite.js'
server=subprocess.Popen(['node',str(vite),'--host','127.0.0.1','--port','4317','--strictPort'],cwd=root,stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
try:
    for _ in range(100):
        if server.poll() is not None: raise RuntimeError('Vite exited before browser checks')
        try:
            urllib.request.urlopen('http://127.0.0.1:4317/test/browser.html',timeout=1);break
        except OSError: time.sleep(.1)
    else: raise RuntimeError('Vite never became ready')
    with sync_playwright() as p:
        browser=p.chromium.launch();page=browser.new_page();errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto('http://127.0.0.1:4317/test/browser.html');page.get_by_role('combobox',name='View',exact=True).select_option('playthings')
        page.locator('[data-playthings-state="ready"]').wait_for(timeout=15000)
        assert page.get_by_text('2 / 2 declared historical moments',exact=False).is_visible()
        slider=page.get_by_role('slider',name='History position');slider.fill('0');assert page.get_by_text('1 / 2 declared historical moments',exact=False).is_visible()
        page.get_by_role('button',name='Back to Viewer',exact=True).click()
        assert page.get_by_role('combobox',name='View',exact=True).input_value()=='viewer'
        page.get_by_role('combobox',name='View',exact=True).select_option('playthings');page.locator('[data-playthings-state="ready"]').wait_for()
        assert page.get_by_text('2 / 2 declared historical moments',exact=False).is_visible()
        page.get_by_role('button',name='Fullscreen',exact=True).click();page.get_by_role('button',name='Back to Viewer',exact=True).click()
        assert not errors, errors
        browser.close()
    print(json.dumps({'status':'passed','realBrowser':True,'checks':['mount','lazy-import','read-only-data','history-selection','return','state-retention','fullscreen-return']}))
finally:
    server.terminate()
    try:server.wait(timeout=5)
    except subprocess.TimeoutExpired:server.kill()
