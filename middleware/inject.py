# this file is use to inject the pipeline to the middleware, so that the middleware can use the pipeline to process the request and response

from pathlib import Path
import json

# resolve absolute path to the esbuild thingy
BUNDLE_PATH = Path(__file__).parent.parent / "dom-stripper" / "dist" / "bundle.iife.js"

async def get_stripped_dom(page):

    if not BUNDLE_PATH.exists():
        raise FileNotFoundError(
            f"Bundle not found at {BUNDLE_PATH}. "
            "Run 'npm run build' in the dom-stripper directory to generate the IIFE artifact."
        )

    # load the bundled js file
    bundle_code = BUNDLE_PATH.read_text(encoding="utf-8")

    await page.evaluate(bundle_code)

    print("Stripping DOM...")
    stripped_dom = await page.evaluate("Kintsugi.extractStrippedDOM()")
    
    return stripped_dom