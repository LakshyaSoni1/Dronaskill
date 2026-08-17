# Dronaskill -  https://lakshyasoni1.github.io/Dronaskill/

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
| `onboarding.html` | Learner profile intake: five questions (education status, known skills, interests, preferred learning format, career goal) captured as structured JSON. Saved to `localStorage` today since there's no backend yet; `dashboard.html`, `analysis.html`, and `lectures.html` all read this profile to build the learning path. |
| `dashboard.html` | Skill checklist for the learner's track, progress ring, and the "log study time" modal. Each row deep-links into `lectures.html?skill=<id>`. |
| `analysis.html` | Charts over the study log: activity heatmap, per-level meters, domain bars, and an estimated-hours burn-up. |
| `lectures.html` | Distraction-free lecture player — see [Lecture library](#lecture-library) below. |
| `mock-interview.html` | AI Mock Interview flow: role/experience/mode setup → timed interview room (text or voice answers) → per-question feedback modal → final report. Answer scoring is currently a local heuristic (keyword coverage, sentence length, filler-word detection) — see [`mock-interview-grading-prompt.md`](./mock-interview-grading-prompt.md) for the real-LLM grading prompt planned to replace it. |
| `background-aesthetic.html` | A standalone earlier background-layer experiment (drifting orbs / grid / grain, "ocean" theme). Not linked from site navigation and not part of the live product. |

## Lecture library

`lectures.html` plays hand-picked YouTube courses inside the site, with no
suggested-video sidebar, comments, or autoplay to drift into. The data lives in
`lectures-data.js` (`window.DRONA_LECTURES`), the only shared JS besides
`skills-data.js`.

**Coverage.** Every one of the 124 skills in `skills-data.js` has at least one
lecture — 213 videos, roughly 800 hours, across all 12 domains. Every career
track is covered end to end, so a learner never meets an empty screen on the
path they picked.

**Curated + overrides.** `CURATED` maps a skill id to an ordered lecture list.
The learner can hide, edit, reorder, and add their own videos; those changes are
stored as a *patch* over the curated defaults rather than a copy of them, so
newly curated videos still reach someone who has already edited that skill, and
"reset to picked lectures" is just dropping their patch. Skills with nothing
curated show an empty state that invites adding a link — never a generated or
placeholder module list.

**Adding a curated video.** Pre-flight the id first:

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://www.youtube.com/oembed?format=json&url=https://youtu.be/<id>"
```

`200` = exists and is embeddable · `401` = **embedding disabled**, reject it ·
`404` = dead id. A 401 video renders "Video unavailable" inside the player and
that failure cannot be detected from JavaScript, so this check is not optional.
oEmbed does not return duration — read `minutes` off the watch page, since a
wrong duration directly corrupts the hours the page auto-logs.

**Watch tracking.** Marking a lecture watched is manual (there is no YouTube
IFrame API here, so the page behaves identically over `file://` and `http://`).
By default it also logs the video's runtime into the shared study log as a
`"Watched: …"` session, capped at 4h per entry and de-duplicated so re-clicking
cannot double-count; the checkbox above the list turns that off. Watching every
lecture *offers* to complete the skill rather than doing it silently, since
`dronaskill_skill_progress` drives the dashboard and the analysis charts.

**Storage keys** (alongside the three in `skills-data.js`):

| Key | Contents |
|---|---|
| `dronaskill_lecture_library` | Per-skill overrides: `hidden`, `edits`, `added`, `order` |
| `dronaskill_lecture_progress` | `{ skillId: { videoId: "YYYY-MM-DD" } }` |
| `dronaskill_lecture_prefs` | `{ autoLog, breakEvery }` |

Every read sanitises against the catalogue and a strict 11-character video-id
regex, so a hand-edited `localStorage` value can never reach an iframe `src`.

**`file://` caveat.** `localStorage` does persist when the page is opened
directly from disk, but moving the project folder — or opening it via a
different path, such as a mapped drive instead of a drive letter — can present
as a different origin and look like data loss. Serving the folder over
`http://localhost` avoids that.

## Running locally

No build step or install is required.

**Recommended — double-click `start-dronaskill.cmd`.** It picks a free port,
serves the folder using whichever of Python or Node is already on the machine,
and opens the site at `http://localhost:8000`. Videos play, because the pages
have a real origin. Closing the window stops the server.

Otherwise:

- Open `index.html` directly in a browser — everything works **except video
  playback on `lectures.html`** (see below), **or**
- Serve the folder yourself (this is what the launcher does, and it's the route
  to use on macOS or Linux):

  ```bash
  # Python
  python -m http.server 8000

  # Node (npx, no install)
  npx serve .
  ```

  then visit `http://localhost:8000`.

> **Lecture playback needs a server.** Opened straight from disk, the page has
> origin `null` and sends no `Referer`, so YouTube refuses the embed with
> *"Video player configuration error — Error 153"*. `lectures.html` detects this
> and shows a click-through card pointing at the launcher, instead of a broken
> player. Everything else — the lecture list, marking lectures watched, hours,
> focus mode, break reminders — behaves identically either way.

> **`file://` and `http://localhost` are separate origins.** A profile, progress,
> and study log saved while opening files directly are not visible once you
> switch to the launcher, and vice versa — that's normal browser isolation, not
> data loss. Pick one way of opening the site and stay with it; onboarding takes
> a minute to redo the first time you move.

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
