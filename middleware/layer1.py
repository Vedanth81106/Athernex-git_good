def layer1_match(prev, currJson):
    """
    Layer 1: Fast, direct attribute matching.
    Prioritizes IDs, then falls back to Text + Tag.
    """
    
    # --- STEP 1: ID MATCHING ---
    # We only match IDs if the ID actually exists and isn't just an empty string
    prev_id = prev.get('id', '').strip()
    
    if prev_id:
        for curr in currJson:
            curr_id = curr.get('id', '').strip()
            if prev_id == curr_id:
                print(f"[Layer 1] Success: Matched by ID '{prev_id}'")
                return curr

    # --- STEP 2: TEXT + TAG MATCHING ---
    # Fallback if ID fails or doesn't exist.
    # We only do this if the element actually has text (to avoid matching empty containers).
    prev_text = prev.get('innerText', '').strip().lower()
    prev_tag = prev.get('tag', '').lower()
    
    if prev_text and prev_tag:
        for curr in currJson:
            curr_text = curr.get('innerText', '').strip().lower()
            curr_tag = curr.get('tag', '').lower()
            
            if prev_text == curr_text and prev_tag == curr_tag:
                print(f"[Layer 1] Success: Matched by Tag<{prev_tag}> and Text '{prev_text[:20]}...'")
                return curr

    return None