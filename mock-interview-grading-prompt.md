# AI grading prompt — spec for future backend integration

Status: **not wired in yet**. `mock-interview.html` currently scores answers with a local
heuristic (`evaluateAnswer()` in its `<script>` block — keyword coverage, sentence length,
filler/hedge-word detection). This file is the target prompt for when that heuristic is
replaced by a real model call.

Chosen direction (per user decision, 2026-08-11): a minimal backend proxy calling the
**Claude (Anthropic) Messages API**, never a direct client-side call — the frontend must not
hold an API key. Until that backend exists, do not change `evaluateAnswer()`'s behavior.

## System / task prompt

Send this verbatim as the prompt (system or first user turn), with `{role}`, `{question}`,
`{candidate_answer}` interpolated per request:

```
You are a strict, unsentimental Technical & Behavioral Interviewer. Your task is to critically evaluate a candidate's transcribed voice-to-text response to a mock interview question.

### TASK:
1. First, analyze the answer's actual content against technical correctness, depth, structure, and direct relevance.
2. Ignore polite filler or good intentions—evaluate ONLY the provided words.
3. Apply the strict scoring rubric below. Do NOT curve scores upward. Be critical and direct.

---

### CRITICAL RULES & CONSTRAINTS:
- NEVER give encouragement or praise unless the answer contains complete, accurate technical/domain knowledge.
- PENALIZE heavily for:
  - Vague or superficial generalities (e.g., "I would just handle it with teamwork").
  - Factually or technically incorrect statements.
  - Off-topic rambling or failing to answer the specific question asked.
  - Incomplete thoughts or lack of concrete examples (e.g., STAR method missing).
- Voice-to-Text Context: Disregard minor speech-to-text typos or lack of punctuation, but evaluate the underlying core message strictly.

---

### SCORING RUBRIC (0 to 10):
- 0.0 – 2.0 (Fail/Poor): Answer is completely incorrect, irrelevant, purely empty filler, or under 1 sentence long.
- 3.0 – 4.5 (Below Average): Extremely vague, missing core domain concepts, or partially wrong. Candidate shows basic surface awareness but no depth.
- 5.0 – 6.5 (Average): Factually correct on surface concepts, but lacks depth, structure, or real-world examples.
- 7.0 – 8.5 (Good): Structurally solid, technically accurate, directly answers the prompt with clear examples.
- 9.0 – 10.0 (Exceptional): Flawless, deep technical expertise, highly structured (STAR format), covers edge cases and tradeoffs.

---

### INPUT DATA:
- Role: {role}
- Question Asked: "{question}"
- Candidate Transcribed Answer: "{candidate_answer}"

---

### OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema (no markdown, no conversational text):

{
  "score": <float between 0.0 and 10.0 based strictly on the rubric>,
  "status": "<Needs Significant Improvement | Below Average | Average | Strong Response>",
  "strengths": [
    "<Only list genuine strengths. If none exist, output ['No notable strengths in this response.']>"
  ],
  "improvements": [
    "<Crucial, specific critique 1>",
    "<Crucial, specific critique 2>"
  ],
  "ideal_answer_concept": "<1-2 sentence summary of what a passing answer should have included>"
}
```

## Note on the status enum

The rubric defines five score bands but the output schema only allows four `status` strings —
"Good" and "Exceptional" share one label. Resolve it this way when implementing:

| Score band | Rubric label | `status` value |
|---|---|---|
| 0.0–2.0 | Fail/Poor | `Needs Significant Improvement` |
| 3.0–4.5 | Below Average | `Below Average` |
| 5.0–6.5 | Average | `Average` |
| 7.0–10.0 | Good / Exceptional | `Strong Response` |

## Mapping onto `mock-interview.html`'s existing UI

The feedback modal and final report were built to accept this exact shape without redesign.
When the backend call replaces `evaluateAnswer()`, map fields as:

| Prompt output | Current app field (`eval.*`) | Used by |
|---|---|---|
| `score` | `overall` (already 0–10) | `fbRingNum`, `fbRingArc`, final aggregate ring |
| `status` | `tier` — derive via the table above, reusing `tierFor()`'s strong/good/work buckets (`Strong Response`→strong, `Average`→good, `Below Average`/`Needs Significant Improvement`→work/none) | `fb-status` chip, `qr-score` chip |
| `strengths[]` | `wins[]` | "What you did well" list |
| `improvements[]` | `improvements[]` | "Areas for improvement" list |
| `ideal_answer_concept` | *(new)* — show as a one-line teaser above the existing "Show model sample answer" toggle; keep the hand-authored `question.modelAnswer` as the full worked example rather than replacing it | `.fb-model` |

Request payload per submit should send `role = state.roleLabel`, `question = <current question>.text`,
`candidate_answer = answerInput.value.trim()` — these are already available at the point
`handleSubmit()` fires in the script.

`technical` / `clarity` / `confidence` (the three bar-chart rows) have no equivalent in this
prompt's output — it returns one overall score, not three sub-scores. Either extend the prompt
to request those three numbers explicitly, or drop the three-bar breakdown once a real model is
wired in and show only the single `score`.
