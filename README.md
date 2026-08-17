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
| `certification.html` | Pick one of 12 topics, answer a randomised 10-question MCQ round, and score 7+ to earn a printable certificate. Question bank lives in `certification-data.js`. |
| `login.html` | Email/password sign in and account creation via Supabase Auth. Standalone today — it doesn't gate any other page yet. |
| `recruiters.html` | Open criteria form (career track, education, certification + minimum score) that returns matching students who opted in on `dashboard.html`. No company sign-in — see "Recruiter matching" below. |
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

## Certification

`certification.html` covers all 12 domains from the skill catalogue in
`skills-data.js` (Employability, CS Fundamentals, Frontend, Backend & Infra,
Mobile, Data & Analytics, AI & ML, Security, Design, Product & Business,
Marketing, Electronics & Embedded). Each domain has its own hand-written pool
of 15-17 MCQs in `certification-data.js` (`window.DRONA_CERT`); a test
randomly samples 10 of them and shuffles each question's option order, so
retakes don't see an identical round.

Score 7 or more out of 10 and the page generates a certificate — name (read
from the onboarding profile, or entered on the spot if missing), topic,
score, date, and a display-only certificate code — styled to print or
"Save as PDF" straight from the browser (`window.print()` plus a
`@media print` stylesheet). **This is a personal record of achievement, not
a third-party-verifiable credential** — there is no backend to check it
against. Only passing attempts are saved; a learner can hold multiple
certificates per domain by retaking a test to improve their score.

**Storage key** (alongside the ones in `skills-data.js`):

| Key | Contents |
|---|---|
| `dronaskill_certifications` | Array of earned certificates: `{ id, domain, name, score, total, dateISO, issuedAt }` |

## Accounts (Supabase)

`login.html` is a standalone email/password sign in and sign up page using
[Supabase Auth](https://supabase.com/docs/guides/auth). It's the one page on
the site with a real external dependency: it loads the `@supabase/supabase-js`
client from a CDN (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`)
since there's no build step or package manager to install it through. Every
other page on the site still has zero external dependencies.

Project connection details live in `supabase-config.js` (`window.DRONA_SUPABASE`
— `url` and `anonKey`), loaded the same plain-script way as `skills-data.js`.
The anon/public key is meant to be shipped client-side by design — it
identifies the project, it doesn't grant privileged access on its own. Real
access control belongs in Supabase's Row Level Security policies, not in
keeping this key secret.

This page is not wired into the rest of the app yet: it doesn't gate
dashboard/onboarding/lectures/etc., and the existing `localStorage`-based
profile/progress data is entirely separate from a Supabase account. It's a
working sign-in surface, not yet a source of identity for the rest of the
product.

**Local testing note:** Supabase requires email confirmation before a new
account can sign in, by default. To test signup → signin locally without
checking a real inbox, turn off "Confirm email" under
**Authentication → Providers → Email** in the Supabase dashboard for this
project while you're testing.

## Recruiter matching

A judge-suggested feature: a company sets hiring criteria and sees matching
students. Because the rest of the site is entirely client-side (every
student's data lives only in their own browser's `localStorage`), this is
the one feature that needs a real shared backend — it reuses the Supabase
project wired in for [Accounts](#accounts-supabase).

**Setup (required, one-time, manual):** run `recruiter-schema.sql` in your
Supabase project's **SQL Editor** before this feature will work. It creates
two tables (`student_profiles`, `student_certifications`) with Row Level
Security policies that are the actual enforcement mechanism for everything
below — not just UI hiding.

**How it works:**
- On `dashboard.html`, a signed-in student sees a "Visible to recruiters"
  card. Turning it on syncs their onboarding profile (name, career track,
  education, resolved skill names) and every certification they've earned
  (from `dronaskill_certifications`) up to Supabase, and sets
  `visible_to_recruiters = true` on their row. Sync is manual ("Sync now"),
  so a certification earned after opting in needs a re-sync to show up.
  "Stop sharing" flips the flag off — RLS then stops returning that row to
  anyone but the student themselves; their data isn't deleted.
- `recruiters.html` is an **open, unauthenticated** criteria form — career
  track, education level, a certification domain + minimum score. Submitting
  it queries Supabase directly with the anon key and displays matching
  students (name, email, track, education, matched certifications, skills).
- **Demo mode**: a row of quick-select chips (Wipro, TCS Digital, Google,
  Microsoft, Amazon, Flipkart, Zomato) fills in realistic criteria and shows
  a hand-written set of matching students — no network call, so it can't
  fail or come up empty during a live presentation. Wipro is what the page
  loads by default. It's clearly hand-written sample data (`DEMO_COMPANIES`
  in `recruiters.html`), not a claim that these companies are integrated
  with Dronaskill. "Find Matches" still runs a real Supabase query against
  whatever's actually been synced from `dashboard.html`.

**Companies you match** (`dashboard.html`, entirely local, no Supabase): the
flip side of the above — a student-facing card that checks their real career
track and real earned certifications against `company-data.js`, a small
illustrative roster of hiring bars spanning mass IT-services recruiters
(Wipro, TCS Digital, Infosys, Accenture, Cognizant — broader tracks, a 6/10
bar) and product companies (Google, Microsoft, Amazon, Flipkart, Zomato —
narrower track, 7-8/10 bar). It shows which companies the student currently
clears the bar for, motivating the next certification rather than claiming
any real hiring pipeline exists. `recruiters.html`'s demo mode reuses the
same company names so both sides of the site tell one consistent story.

**Privacy trade-off, stated plainly rather than buried:** there is no
company login. Anyone who opens `recruiters.html` can query and see any
opted-in student's name and email — the opt-in toggle controls whether a
student is discoverable at all, not who can discover them. This was a
deliberate scope choice to keep the feature demoable without building a
second authentication system; gating `recruiters.html` behind its own
company accounts is the natural next step if this goes beyond a demo.

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
