# How the AI Semantic Search Works 🧠

Here is a simple, behind-the-scenes look at exactly how the AI (Llama 3 via Groq) handles semantic search step-by-step. Think of the LLM as an incredibly smart, fast-reading librarian.

---

### Step 1: Receiving the Materials (The Input)
When a student searches for an item, the backend sends the AI a package containing three things:
1. **The Rules:** Our `system_prompt` (e.g., "You are an AI matching engine. Give priority to name and location. Ignore exact keywords, look for meaning.")
2. **The Database:** A JSON list of all currently "found" items fetched directly from MongoDB.
3. **The Search:** The student's messy query (e.g., *"I think I left my metal hydroflask on kb level 1 on Tuesday"*).

---

### Step 2: Semantic Translation (Understanding Meaning)
Unlike a normal search engine that just looks for the exact word "hydroflask", the AI breaks the query down into **concepts** (semantics/meaning). 
* *"hydroflask"* ➔ concept: water container, metal bottle, thermos.
* *"kb level 1"* ➔ concept: specific building, floor 1, physical location.
* *"Tuesday"* ➔ concept: a day of the week, needs to be matched against the item's `event_date`.

---

### Step 3: The Comparison Loop (The "Inner Process")
The AI reads through the list of items from MongoDB one by one and mentally asks itself questions based on our rules:

**Example Item #1: `{"name": "rubiks cube", "location": "kb level 1"}`**
* *AI thought process:* "The location matches perfectly! But a rubiks cube has absolutely nothing to do with a water bottle conceptually. Semantic match is 0%." 
* **Score Calculation:** `0.1` (Fails the strict `0.4` threshold, so it gets discarded).

**Example Item #2: `{"name": "Black Water Bottle", "category": "accessories"}`**
* *AI thought process:* "A 'Water Bottle' is an exact semantic match for the concept of 'hydroflask'. The user asked for metal, but the description doesn't explicitly say metal. The location doesn't match either. It's a strong item match, but poor context match."
* **Score Calculation:** `0.65` (Passes the threshold!).

---

### Step 4: Formatting the Output
Once it evaluates everything, the LLM has to obey our strictest rule: **"Return ONLY valid JSON."** 

It throws away all of its internal thoughts, takes the items that scored `0.4` or higher, formats them exactly the way we told it to, and sends it back to your `main.py` code.

```json
[
  {
    "item_id": "69d11fe...",
    "name": "Black Water Bottle",
    "score": 0.65,
    "reason": "Conceptually matches 'hydroflask' but location was not specified in the database."
  }
]
```

That JSON goes straight from the backend API to your Next.js frontend, and the student sees their water bottle magically appear on the screen!
