async def run(page):
    start_url = "http://127.0.0.1:5500/middleware/testware/test_web/test.html"
    
    print("🚀 Step 1: Loading Job Board...")
    await page.goto(start_url)
    
    await page.wait_for_selector("#job-card-1")
    await page.click("#job-card-1")

    print("➡️ Step 2: Filling Application Form...")
    await page.wait_for_selector("#first-name")
    await page.fill("#first-name", "Arjun")
    await page.fill("#last-name", "Sharma")
    await page.fill("#email-input", "arjun@example.com")
    
    await page.click("#submit-application")

    print("➡️ Step 3: Verifying Submission...")
    await page.wait_for_selector(".ref-code")
    ref_code = await page.inner_text(".ref-code")
    
    print(f"\n✅ Success! Reference: {ref_code}")