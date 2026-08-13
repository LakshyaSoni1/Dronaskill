# Dronaskill

Dronaskill is an ad-free skill mentor for students: verify your degree, get a
personalised learning path, practise with mock interviews, and apply for
internships.

It is a static, build-free site — plain HTML files with inline `<style>` and
`<script>`. There is no framework, no bundler, and no `package.json`; each
page is fully self-contained.

## Pages

| File | Description |
|---|---|
| `index.html` | Homepage — hero, "how it works", feature grid, dashboard preview, and the Guru AI band. |
| `mock-interview.html` | AI Mock Interview flow: role/experience/mode setup → timed interview room (text or voice answers) → per-question feedback modal → final report. Answer scoring is currently a local heuristic (keyword coverage, sentence length, filler-word detection) — see [`mock-interview-grading-prompt.md`](./mock-interview-grading-prompt.md) for the real-LLM grading prompt planned to replace it. |
| `background-aesthetic.html` | A standalone earlier background-layer experiment (drifting orbs / grid / grain, "ocean" theme). Not linked from site navigation and not part of the live product. |

## Running locally

No build step or install is required. Either:

- Open `index.html` directly in a browser, **or**
- Serve the folder so relative links and any future fetch calls behave like
  they would in production:

  ```bash
  # Python
  python -m http.server 8000

  # Node (npx, no install)
  npx serve .
  ```

  then visit `http://localhost:8000`.

## Design system

Both live pages share one visual system, defined in `index.html`'s `:root`
tokens and duplicated (not imported) into `mock-interview.html` to keep every
page fully self-contained:

- Near-black background (`#07070d`) with a saffron/gold accent on indigo.
- Glassmorphism cards (`.glass`), drifting blurred background orbs, a faint
  grid, and film-grain noise as ambient layers.
- Data colours validated against the dark chart surface (`#131318`): gold,
  blue, aqua, violet.

When adding a new page, copy the existing tokens/background-layer markup
rather than introducing a shared stylesheet or a build step, to stay
consistent with the rest of the project.

## Roadmap

Mock interview grading is a client-side heuristic today since the site has no
backend. A strict, rubric-based grading prompt for the Claude (Anthropic)
Messages API is already written and mapped onto the existing feedback UI in
[`mock-interview-grading-prompt.md`](./mock-interview-grading-prompt.md) —
wiring it in requires a backend/serverless proxy so the API key is never
exposed client-side.

## Team

Built by Team Drona.
