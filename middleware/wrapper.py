import httpx
import asyncio
import re
import sys
import os
import importlib.util
import tempfile
from pathlib import Path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from playwright.async_api import async_playwright
from layer1 import layer1_match
from layer2 import layer_2_mechanism
from layer3 import layer3_match
# --- CONFIGURATION ---
BACKEND_URL = "http://localhost:8000"
# Adjust this path based on your actual folder structure
BUNDLE_PATH = Path(__file__).parent.parent / "dom-stripper" / "dist" / "bundle.iife.js"

# --- CORE UTILITIES ---

async def get_stripped_dom(page):
    """Injects the stripper bundle and extracts the flat-list DOM."""
    if not BUNDLE_PATH.exists():
        raise FileNotFoundError(f"Bundle not found at {BUNDLE_PATH}.")
    
    bundle_code = BUNDLE_PATH.read_text(encoding="utf-8")
    await page.evaluate(bundle_code)
    
    print("[Kintsugi] Stripping DOM...")
    stripped_dom = await page.evaluate("Kintsugi.extractStrippedDOM()")
    return stripped_dom

def derive_intent(selector: str) -> str:
    """Creates a database-friendly slug from a selector."""
    # Example: //*[@id='email-input'] -> email_input
    # Example: #submit-button -> submit_button
    clean = re.sub(r"[^a-zA-Z0-9]", "_", selector)
    return clean.strip("_")

async def update_job_status(job_id: int, status: str):
    """Helper to update job status in the backend."""
    async with httpx.AsyncClient() as client:
        await client.patch(f"{BACKEND_URL}/jobs/{job_id}/", json={"status": status})

# --- THE INTERCEPTOR (MONKEY PATCHING) ---

class KintsugiWrapper:
    def __init__(self, page, job_id):
        self.page = page
        self.job_id = job_id
        self.last_url = ""
        self.current_dom = None

    async def get_latest_dom(self):
        """Only strips the DOM if the URL has changed since the last check."""
        current_url = self.page.url
        if current_url != self.last_url or self.current_dom is None:
            print(f"[Kintsugi] URL changed to {current_url}. Refreshing DOM cache...")
            self.current_dom = await get_stripped_dom(self.page)
            self.last_url = current_url
        return self.current_dom
    
    async def wrap_action(self, original_method, selector, **kwargs):
        intent = derive_intent(selector)
        try:
            # 1. Execute original Playwright action
            result = await original_method(selector, **kwargs)
            
            # 2. SUCCESS PATH: Get the ACTUAL XPath of the element for Layer 2 compatibility
            # We use JS because Playwright's selector might be CSS, but we need XPath in DB.
            actual_xpath = await self.page.evaluate('''
            (sel) => {
            const el = document.querySelector(sel);
            if (!el) return null;
            
            const getXPath = (element) => {
                if (element.id !== '') return `//*[@id="${element.id}"]`;
                if (element === document.body) return '/html/body';
                let ix = 0;
                const siblings = element.parentNode.childNodes;
                for (let i = 0; i < siblings.length; i++) {
                    const sibling = siblings[i];
                    if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
                    if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
                }
                };
            return getXPath(el);
            }
        ''', selector)

            # 3. Update DOM Snapshot
            dom_snapshot = await self.get_latest_dom()

            # 4. Save to DB (Always save the XPath version)
            async with httpx.AsyncClient() as client:
                await client.post(f"{BACKEND_URL}/selectors/", json={
                    "job_id": self.job_id,
                    "intent": intent,
                    "selector": actual_xpath or selector,
                    "last_success_dom": dom_snapshot
                })
            
            print(f"[Kintsugi] Success: {intent} saved with XPath: {actual_xpath}")
            return result

        except Exception as e:
            # 5. SAD PATH: Initialize Healing
            print(f"[Kintsugi] FAILURE detected for {intent}: {e}")
            await update_job_status(self.job_id, "healing")
            
            # This is where we call the 4-layer system
            new_selector = await self.heal_selector(selector, intent)
            
            if new_selector:
                print(f"[Kintsugi] Healing successful! Retrying with: {new_selector}")
                await update_job_status(self.job_id, "healed")
                # Retry the action once with the new selector
                return await original_method(new_selector, **kwargs)
            else:
                print(f"[Kintsugi] Healing failed for {intent}.")
                await update_job_status(self.job_id, "failed")
                raise e
            
    async def heal_selector(self, old_selector, intent):
        """Orchestrates the 4-layer healing pipeline."""
        
        # 1. FETCH BASELINE: Get the 'Known Good' state from the DB
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{BACKEND_URL}/selectors/?intent={intent}&job_id={self.job_id}")
            if resp.status_code != 200:
                print(f"[Kintsugi] No baseline found for {intent}. Cannot heal.")
                return None
            
            baseline = resp.json()
            last_success_dom = baseline["last_success_dom"]
            db_xpath = baseline["selector"] # The XPath we saved during the Happy Path

        # 2. CAPTURE CURRENT STATE: See what the broken page looks like
        current_dom = await get_stripped_dom(self.page)

        # 3. IDENTIFY TARGET: Find the exact node we are looking for in the baseline
        prev_node = next((n for n in last_success_dom if n.get("xpath") == db_xpath), None)
        if not prev_node:
            print("[Kintsugi] Baseline node not found in saved DOM.")
            return None

        # --- LAYER 1: DIRECT MATCH ---
        print("[Kintsugi] Attempting Layer 1 (Direct)...")
        l1_node = layer1_match(prev_node, current_dom)
        if l1_node:
            async with httpx.AsyncClient() as client:
                await client.post(f"{BACKEND_URL}/selectors/", json={
                    "job_id": self.job_id,
                    "intent": intent,
                    "selector": l1_node['xpath'],
                    "last_success_dom": current_dom
                })
            await self.log_heal(intent, db_xpath, l1_node['xpath'], current_dom, 1.0, "layer1")
            return l1_node['xpath']

        # --- LAYER 2: CONTEXTUAL ---
        print("[Kintsugi] Attempting Layer 2 (Structural)...")
        l2_xpath, l2_score = layer_2_mechanism(db_xpath, last_success_dom, current_dom)
        if l2_score > 0.8:
            async with httpx.AsyncClient() as client:
                await client.post(f"{BACKEND_URL}/selectors/", json={
                    "job_id": self.job_id,
                    "intent": intent,
                    "selector": l2_xpath,
                    "last_success_dom": current_dom
                })
            await self.log_heal(intent, db_xpath, l2_xpath, current_dom, l2_score, "layer2")
            return l2_xpath

        # --- LAYER 3: SEMANTIC ---
        print("[Kintsugi] Attempting Layer 3 (Semantic)...")
        l3_xpath, l3_score = layer3_match(prev_node, current_dom)
        if l3_score > 0.7:
            async with httpx.AsyncClient() as client:
                await client.post(f"{BACKEND_URL}/selectors/", json={
                    "job_id": self.job_id,
                    "intent": intent,
                    "selector": l3_xpath,
                    "last_success_dom": current_dom
                })
            await self.log_heal(intent, db_xpath, l3_xpath, current_dom, l3_score, "layer3")
            return l3_xpath

        # --- LAYER 4: GEMINI FALLBACK ---
        print("[Kintsugi] Layers 1-3 failed. Calling Layer 4 (Gemini)...")
        async with httpx.AsyncClient() as client:
            gemini_resp = await client.post(f"{BACKEND_URL}/heal", json={
                "job_id": self.job_id,
                "intent": intent,
                "old_selector": db_xpath,
                "current_dom": current_dom
            })
            if gemini_resp.status_code == 200:
                # Layer 4 handles its own logging internally in the backend
                return gemini_resp.json()["new_selector"]

        return None
    async def log_heal(self, intent, old_sel, new_sel, dom, conf, healer):
        """Submits successful healing data to the backend."""
        async with httpx.AsyncClient() as client:
            await client.post(f"{BACKEND_URL}/heal_logs/", json={
                "job_id": self.job_id,
                "intent": intent,
                "old_selector": old_sel,
                "new_selector": new_sel,
                "current_dom": dom,
                "confidence": conf,
                "healed_by": healer
            })
        print(f"[Kintsugi] Healing logged via {healer} with {conf*100}% confidence.")
    
async def patch_page(page, job_id):
    """Monkey-patches the page object with Kintsugi logic."""
    wrapper = KintsugiWrapper(page, job_id)

    # Patch common actions
    original_click = page.click
    original_fill = page.fill
    original_inner_text = page.inner_text

    async def patched_click(selector, **kwargs):
        return await wrapper.wrap_action(original_click, selector, **kwargs)

    async def patched_fill(selector, value, **kwargs):
        return await wrapper.wrap_action(original_fill, selector, value=value, **kwargs)

    async def patched_inner_text(selector, **kwargs):
        return await wrapper.wrap_action(original_inner_text, selector, **kwargs)

    page.click = patched_click
    page.fill = patched_fill
    page.inner_text = patched_inner_text
    return page

# --- EXECUTION ENGINE ---

async def get_job_and_load_module(job_id: int):
    """Fetches script from DB and loads it dynamically."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BACKEND_URL}/jobs/{job_id}/")
        if response.status_code != 200:
            print(f"Error: Job {job_id} not found.")
            return None
        job_data = response.json()
        
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(job_data["script"])
        temp_path = f.name

    try:
        spec = importlib.util.spec_from_file_location("user_script", temp_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)

async def run_wrapper(job_id: int):
    module = await get_job_and_load_module(job_id)
    if not module: return

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        # Initialize
        await update_job_status(job_id, "running")
        await patch_page(page, job_id)

        try:
            # Call the user's 'run' function
            await module.run(page)
            await update_job_status(job_id, "done")
            print(f"Job {job_id} completed successfully.")
        except Exception as e:
            print(f"Job {job_id} crashed: {e}")
            # Ensure the dashboard reflects the failure even if healing couldn't save it
            await update_job_status(job_id, "failed")
        finally:
            await asyncio.sleep(2)
            await browser.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        asyncio.run(run_wrapper(int(sys.argv[1])))
    else:
        print("Usage: python wrapper.py <job_id>")