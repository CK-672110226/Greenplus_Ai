"""
GreenPlus.Ai — Playwright smoke test suite
Tests: landing page, particles, language toggle, role routing, login page,
       admin login page, dark mode, and key navigation flows.
"""
import sys
import os
from playwright.sync_api import sync_playwright, expect

BASE = 'http://localhost:5176'
PASS = []
FAIL = []

def ok(name):
    PASS.append(name)
    print(f'  ✓  {name}')

def fail(name, reason):
    FAIL.append(name)
    print(f'  ✗  {name}: {reason}')

def section(title):
    print(f'\n── {title} ──')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx     = browser.new_context(viewport={'width': 1280, 'height': 800})
    page    = ctx.new_page()

    # ── 1. Landing page ────────────────────────────────────────────────────
    section('Landing page')
    page.goto(BASE)
    page.wait_for_load_state('networkidle')

    page.screenshot(path='/tmp/gp_01_landing.png', full_page=True)

    try:
        h1 = page.locator('h1').first.inner_text()
        assert 'Scan trash' in h1 or 'trash' in h1.lower(), f'unexpected h1: {h1!r}'
        ok('H1 headline present')
    except Exception as e:
        fail('H1 headline present', str(e))

    try:
        canvas = page.locator('canvas[aria-hidden="true"]')
        assert canvas.count() > 0, 'no canvas found'
        ok('ParticleField canvas rendered')
    except Exception as e:
        fail('ParticleField canvas rendered', str(e))

    try:
        recycler_btn = page.get_by_text("I'm a recycler")
        buyer_btn    = page.get_by_text("I'm a buyer / shop")
        assert recycler_btn.count() > 0 and buyer_btn.count() > 0
        ok('Role chooser cards visible')
    except Exception as e:
        fail('Role chooser cards visible', str(e))

    try:
        ctas = page.locator('button').all()
        cta_labels = [b.inner_text() for b in ctas]
        assert any('recyclables' in t or 'buy' in t.lower() for t in cta_labels), f'no CTA: {cta_labels}'
        ok('CTA buttons present')
    except Exception as e:
        fail('CTA buttons present', str(e))

    # ── 2. Language toggle ─────────────────────────────────────────────────
    section('Language toggle')
    try:
        lang_btn = page.get_by_role('button', name='TH').or_(page.get_by_role('button', name='EN'))
        lang_btn.first.click()
        page.wait_for_timeout(400)
        # After toggle the heading should still exist
        h1_after = page.locator('h1').first.inner_text()
        assert len(h1_after) > 0
        ok('Language toggle works without crash')
        # Toggle back
        lang_btn2 = page.get_by_role('button', name='TH').or_(page.get_by_role('button', name='EN'))
        lang_btn2.first.click()
        page.wait_for_timeout(300)
    except Exception as e:
        fail('Language toggle', str(e))

    # ── 3. User CTA → Login page ───────────────────────────────────────────
    section('Login page routing')
    try:
        page.goto(BASE)
        page.wait_for_load_state('networkidle')
        page.click('text=I have recyclables')
        page.wait_for_load_state('networkidle')
        assert '/login' in page.url, f'expected /login, got {page.url}'
        page.screenshot(path='/tmp/gp_02_login.png', full_page=True)
        ok('Recycler CTA → /login')
    except Exception as e:
        fail('Recycler CTA → /login', str(e))

    try:
        # Check Google OAuth button exists (LINE should be gone)
        google_btn = page.get_by_text('Google', exact=False)
        assert google_btn.count() > 0
        ok('Google OAuth button present')
    except Exception as e:
        fail('Google OAuth button present', str(e))

    try:
        # LINE button must NOT exist
        line_btns = page.locator('button', has_text='LINE').count()
        assert line_btns == 0, f'LINE button still exists ({line_btns} found)'
        ok('LINE button removed')
    except Exception as e:
        fail('LINE button removed', str(e))

    try:
        # Back navigation should be present
        back = page.locator('a[href="/"]').or_(page.get_by_role('link', name='Back')).or_(page.get_by_text('←'))
        assert back.count() > 0, 'no back link found'
        ok('Back navigation link present on login page')
    except Exception as e:
        fail('Back navigation link on login page', str(e))

    try:
        # Email and password fields with labels
        email_input = page.get_by_label('Email').or_(page.get_by_label('อีเมล'))
        pwd_input   = page.get_by_label('Password').or_(page.get_by_label('รหัสผ่าน'))
        assert email_input.count() > 0, 'no email input'
        assert pwd_input.count() > 0, 'no password input'
        ok('Form fields have accessible labels')
    except Exception as e:
        fail('Form fields have accessible labels', str(e))

    # ── 4. Buyer CTA → Login page ──────────────────────────────────────────
    try:
        page.goto(BASE)
        page.wait_for_load_state('networkidle')
        page.click("text=I'm a buyer / shop")
        page.wait_for_load_state('networkidle')
        assert '/login' in page.url and 'buyer' in page.url, f'expected /login?role=buyer, got {page.url}'
        ok("Buyer card → /login?role=buyer")
    except Exception as e:
        fail("Buyer card → /login?role=buyer", str(e))

    # ── 5. Admin login page ────────────────────────────────────────────────
    section('Admin login page')
    try:
        page.goto(f'{BASE}/x/admin')
        page.wait_for_load_state('networkidle')
        page.screenshot(path='/tmp/gp_03_admin_login.png', full_page=True)
        body_text = page.locator('body').inner_text()
        assert len(body_text) > 20, 'admin login page empty'
        ok('Admin login page loads')
    except Exception as e:
        fail('Admin login page loads', str(e))

    # ── 6. Protected route redirect ────────────────────────────────────────
    section('ProtectedRoute redirect')
    try:
        page.goto(f'{BASE}/home')
        page.wait_for_load_state('networkidle')
        assert '/login' in page.url, f'expected redirect to /login, got {page.url}'
        ok('/home redirects to /login when unauthenticated')
    except Exception as e:
        fail('/home redirect', str(e))

    try:
        page.goto(f'{BASE}/admin')
        page.wait_for_load_state('networkidle')
        assert '/login' in page.url or '/x/admin' in page.url, f'unexpected: {page.url}'
        ok('/admin redirects when unauthenticated')
    except Exception as e:
        fail('/admin redirect', str(e))

    # ── 7. Sign-up toggle on login page ───────────────────────────────────
    section('Login page sign-up toggle')
    try:
        import re
        page.goto(f'{BASE}/login?role=user')
        page.wait_for_load_state('networkidle')
        # Button has CSS text-transform:uppercase so inner_text() shows "SIGN UP FREE"
        signup_link = page.get_by_text(re.compile('sign up', re.IGNORECASE))
        signup_link.first.click()
        page.wait_for_timeout(400)
        # After toggle submit shows "Create account →"
        submit = page.get_by_text(re.compile('create account|สร้างบัญชี', re.IGNORECASE))
        assert submit.count() > 0, f'submit not found; buttons={[b.inner_text() for b in page.locator("button").all()]}'
        ok('Sign-up toggle works (create account button appears)')
    except Exception as e:
        fail('Sign-up toggle', str(e))

    # ── 8. SEO / head tags ─────────────────────────────────────────────────
    section('SEO head tags')
    try:
        page.goto(BASE)
        page.wait_for_load_state('networkidle')
        og_title = page.evaluate("document.querySelector('meta[property=\"og:title\"]')?.content")
        assert og_title and len(og_title) > 5, f'og:title missing or empty: {og_title!r}'
        ok(f'og:title set: {og_title[:50]}')
    except Exception as e:
        fail('og:title', str(e))

    try:
        desc = page.evaluate("document.querySelector('meta[name=\"description\"]')?.content")
        assert desc and len(desc) > 20
        ok(f'meta description set ({len(desc)} chars)')
    except Exception as e:
        fail('meta description', str(e))

    try:
        lang = page.evaluate("document.documentElement.lang")
        assert lang == 'th', f'expected lang=th, got {lang!r}'
        ok('html lang="th"')
    except Exception as e:
        fail('html lang="th"', str(e))

    try:
        canonical = page.evaluate("document.querySelector('link[rel=\"canonical\"]')?.href")
        assert canonical and 'greenplus' in canonical
        ok(f'canonical set: {canonical}')
    except Exception as e:
        fail('canonical', str(e))

    # ── 9. Console errors check ────────────────────────────────────────────
    section('Console errors')
    errors = []
    page.on('console', lambda m: errors.append(m) if m.type == 'error' else None)
    page.goto(BASE)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)

    critical = [e for e in errors if 'supabase' not in e.text.lower() and 'favicon' not in e.text.lower()]
    if not critical:
        ok('No critical console errors on landing page')
    else:
        fail('Console errors', '; '.join(e.text[:80] for e in critical[:3]))

    browser.close()

    # ── Summary ────────────────────────────────────────────────────────────
    print(f'\n{"="*50}')
    print(f'  PASSED: {len(PASS)} / {len(PASS)+len(FAIL)}')
    if FAIL:
        print(f'  FAILED: {len(FAIL)}')
        for f in FAIL:
            print(f'    ✗ {f}')
    print('='*50)
    print('\nScreenshots saved:')
    for s in ['/tmp/gp_01_landing.png', '/tmp/gp_02_login.png', '/tmp/gp_03_admin_login.png']:
        if os.path.exists(s): print(f'  {s}')

    sys.exit(0 if not FAIL else 1)
