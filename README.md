# unkahi

A privacy-first, on-device nervous system check-in tool. unkahi helps someone
notice how their body and mind are doing right now, using short, gentle
questions instead of clinical language, and offers small regulation
exercises in response. It is a self-reflection tool for everyday emotional
awareness — not a diagnostic or clinical product.

This README explains what the project does, how every calculation works,
and exactly what data is stored where, so anyone reading the code (or
reviewing the project without reading the code) can understand it fully.

---

## 1. What this project is

unkahi has two sides:

1. **Individual side** — a private check-in flow. A person answers a few
   questions about physical sensations and everyday moments, and the app
   reflects back a plain-language summary, a "nervous system load"
   percentage, and a couple of small themes ("pillars") that seem to be
   showing up, along with one suggested calming exercise.
2. **Organization side** — a read-only aggregate dashboard intended for a
   program/cohort administrator. It only ever shows group-level numbers
   (averages, counts, distributions) — never an individual's answers,
   journal text, or identity-linked detail.

The guiding rule throughout the codebase: **anything a person writes or
selects during a check-in stays in their own browser.** Only a final,
already-summarized signal (a pattern label and a load percentage) is ever
sent to the server, and only that signal feeds the organization dashboard.

---

## 2. Technology used

- **Next.js 16** (App Router) — used for both the frontend pages (React
  Server/Client Components) and the backend API routes. There is no
  separate backend server; API routes under `src/app/api/*/route.ts` run on
  the same Next.js server as the pages.
- **React 19** for UI.
- **TypeScript** throughout, for both frontend and API code.
- **Tailwind CSS v4** for styling, configured via `globals.css` using CSS
  custom properties (`--accent`, `--background`, etc.) rather than a
  separate config file.
- **Recharts** for the radar/bar charts on the results page.
- **A local JSON file (`data/db.json`)** acts as the "server-side database"
  for this prototype. See section 5 for exactly what lives in it.
- **`localStorage`** in the browser holds everything that must never leave
  the device. See section 4.

No external AI service, analytics SDK, or third-party tracking script is
used anywhere in the app. All scoring and analysis described below is
plain arithmetic running in this codebase — nothing is sent to a model or
external API to compute a result.

---

## 3. The check-in flow, step by step

### 3.1 Body scan — `/start`

The user is shown a list of physical sensations (`BODY_SENSATIONS` in
`src/lib/daymap.ts`), for example "Tight chest / racing heart" or "Numb /
floaty / far away". Each sensation has two things attached to it:

- a `pattern`: one of `fight`, `flight`, `freeze`, `fawn` (the four classic
  nervous-system response patterns)
- a `weights` vector: six numbers, one per "pillar" (see 3.3)

The user can select any number of sensations (including none). The
selected IDs are passed along in the URL query string to the next step —
nothing is saved yet at this point.

### 3.2 The day map — `/day-map` (and optional `/day-map/deeper`)

This is the main questionnaire. `DAY_MAP_STEPS` in `src/lib/daymap.ts`
defines six situational questions, grouped into three phases: waking,
midday, and evening. Each question has four answer options, and — just
like the body sensations — every option carries a `pattern` and a
`weights` vector.

Example: the question "Before you fully open your eyes, what does your
body do first?" has options like "My jaw is already tight and I feel a
jolt of alertness" (pattern: `fight`, weights: `[3,0,0,1,0,0]`) versus "I
open my eyes calmly and feel mostly rested" (weights: `[0,0,0,0,0,0]`,
meaning it contributes nothing to any pillar).

After the sixth question, the answers so far are scored (see 3.4) and the
result is saved to `localStorage`, then the user is taken to `/results`.

If the user chooses to go further, `/day-map/deeper` runs a second,
optional set of four questions (`DEEPER_STEPS`) that use imagery and
memory-style prompts instead of daily situations (for example, "If your
inner emotional state right now were a kind of weather, which feels
closest?"). These four answers are scored separately and then **combined**
with the first result's pillar scores (see `combinePillarScores`), and the
load percentage is recalculated using a higher assumed maximum (46 instead
of 26) to account for the extra questions.

### 3.3 The six "pillars"

Every weight vector in the app has exactly six numbers, always in this
order (`PILLAR_ORDER` in `src/lib/daymap.ts`):

1. **Alert scanning** — staying on high alert, scanning for danger
2. **Boundary softening** — accommodating others ahead of your own needs
3. **Carried guilt** — holding blame that may not be fully yours
4. **Somatic drift** — feeling numb, floaty, or disconnected from the body
5. **Relational pullback** — pulling away from other people
6. **Control seeking** — tightly managing surroundings for predictability

Each pillar (`PILLARS` record) also carries a short description, a gentle
tip, and the ID of a recommended tool (`toolId`) to suggest if that pillar
comes out on top.

### 3.4 How the score is actually calculated (`scoreDayMap`)

This is the core function in `src/lib/daymap.ts`. Given the selected body
sensations and the list of answered questions, it does the following, in
plain terms:

1. **Sum the pillar vectors.** Every selected sensation and every chosen
   answer contributes its 6-number weight vector. These are added together
   element-by-element (`addVectors`) to get one final 6-number vector —
   this *is* the "shape" shown in the radar/bar charts on the results page.
2. **Sum the pattern weights.** Separately, each sensation adds 1 point to
   its `pattern` (fight/flight/freeze/fawn), and each day-map answer adds
   2 points to its pattern (answers are weighted more heavily than passive
   body sensations, since they reflect an active behavioral choice). The
   pattern with the highest total becomes the `primaryPattern` shown on the
   results page (e.g. "Leaning toward fight").
3. **Turn the pillar total into a percentage ("nervous system load").**
   All six pillar numbers are added into one `totalActivation` number.
   This is divided by an assumed maximum possible total (`26` for the
   6-question base pass, `46` if the deeper pass is included — these
   numbers come from the maximum possible weight per question), multiplied
   by 100, then clamped between 8 and 96 (`Math.max(8, Math.min(96, ...))`)
   so the number is never a jarring 0% or 100%.
4. **Pick the top pillars.** The six pillars are sorted by score, filtered
   to only those above zero, and the top two are kept as `result.pillars`.
   These are the two "what stands out" cards shown on the results page. If
   somehow nothing scored above zero (e.g. every answer was the neutral
   option), it defaults to showing "control-seeking" so the page always has
   something to say.

The result of all this (`DayMapResult`) is a small object: the load
percentage, the primary pattern, the six-number pillar vector, the top
pillar IDs, whether the deeper pass was included, and a timestamp. This
object is what gets saved to `localStorage` — never the actual answers
that produced it.

### 3.5 What syncs to the server, and what doesn't

Immediately after scoring, the check-in flow calls `POST /api/daymap` with
**only two fields**: `pattern` (a single word like `"fight"`) and
`loadPercent` (a number like `62`). Nothing else — not the six pillar
scores, not which sensations were picked, not which answers were chosen —
ever leaves the browser. This is enforced in the API route
(`src/app/api/daymap/route.ts`), which only reads `body.pattern` and
`body.loadPercent` and ignores anything else sent to it.

If this network call fails for any reason, it's caught silently — the
on-device result was already saved before the call, so the person's own
experience of the check-in is never disrupted by a network issue.

### 3.6 Results page (`/results`)

Reads the most recent result out of `localStorage` (`getLatestDayMapResult`)
and:

- Picks a plain-language band based on the load percentage
  (`loadBand` in `src/app/results/page.tsx`): under 35% is described as
  "fairly steady," 35–64% as "some noticeable weight," 65%+ as "a lot is
  carrying weight right now." This mapping exists specifically so the
  first thing shown is a sentence, not a bare number — a raw percentage is
  shown only if the user taps "see a more detailed view."
- Shows the top two pillars with their description and tip text.
- Shows a "resonance check" — a simple yes/no ("does this feel true to
  you?") plus an optional free-text note. Both are saved only to
  `localStorage` (see 4.1), never sent anywhere.
- Compares the latest result to the person's own on-device history using
  `useBaseline` (see 3.7) and mentions, in words only, whether today
  is "close to usual" or "stands out a bit" — never a clinical-sounding
  statistic.
- Recommends one tool, based on whichever pillar scored highest
  (`findTool(primaryPillar.toolId)`).
- If the deeper pass hasn't been done yet, offers a link to it.

### 3.7 The on-device baseline (`useBaseline`)

`src/lib/useBaseline.ts` reads *all* of a person's past results out of
`localStorage` (never the server) and computes, purely with arithmetic:

- **Average**: the mean of all past `loadPercent` values.
- **Standard deviation**: how spread out those values are, computed the
  standard way (`variance = average of (value - mean)^2`, then
  `stdDev = sqrt(variance)`).
- **Streak**: counts backwards from the most recent result, incrementing
  as long as each result is within 1.5 days of the one before it, and
  stopping at the first gap larger than that.
- **Deviation flag**: `true` if the most recent result differs from the
  person's own average by more than 1.25 standard deviations. This is a
  simple outlier check, not a medical threshold — it only ever produces
  gentle, first-person phrasing like "outside your usual range," and is
  always compared to the person's *own* history, never to anyone else's.

This computation runs entirely in the browser on data that never left the
browser. It is recalculated fresh every time the page loads (no caching),
using `useState(() => computeBaseline())` so it only runs once per page
visit.

### 3.8 My Data page (`/my-data`)

A personal, on-device-only dashboard: shows the same average/deviation
numbers as above, a small bar chart of recent check-ins (each bar's
height is that day's `loadPercent`), and resonance totals
(`getResonanceCounts` — how many times "yes" vs "no" was tapped on past
results). Also offers:

- **Export**: bundles everything in `localStorage` under the app's keys
  into one JSON file and triggers a browser download
  (`exportLocalData` in `src/lib/localStore.ts`).
- **Clear everything**: deletes all of the app's `localStorage` keys
  (`clearAllLocalData`), with no server-side equivalent needed since the
  server never had this data in the first place.

---

## 4. Exactly what lives on the device (`localStorage`)

Everything below lives only in the browser that created it. Clearing
browser data, using a different browser, or using a different device
means none of this is available — there is no cloud backup or sync of
this data, by design. All of it is managed through `src/lib/localStore.ts`.

| localStorage key | What it holds | Written by |
|---|---|---|
| `unkahi.userId` | A random UUID generated once per browser, used only to tag API requests (see 5). Not a real identity. | `src/lib/client.ts` |
| `unkahi.daymap.results` | Every completed check-in result: load %, primary pattern, six pillar scores, top pillar IDs, whether the deeper pass was done, timestamp. Up to the most recent 30 are kept. | `src/lib/localStore.ts` |
| `unkahi.daymap.resonance` | A map of `{ resultTimestamp: "yes" | "no" }` — whether each result felt accurate. | `src/lib/localStore.ts` |
| `unkahi.daymap.feedback` | A map of `{ resultTimestamp: freeTextNote }` — optional notes typed on the results page. | `src/lib/localStore.ts` |
| `unkahi.safetyPlan` | The personal safety plan: warning signs, coping steps, a trusted contact, and when it was last saved. | `src/lib/localStore.ts` |

None of these five keys are ever read by any API route. The only thing
that ever crosses from browser to server is described in section 5.

---

## 5. Exactly what is stored server-side (`data/db.json`)

The "backend" for this prototype is a single JSON file at `data/db.json`,
read and written by plain functions in `src/lib/db.ts` (no real database
engine — this keeps the hackathon build simple, and would be swapped for
Postgres/etc. in a production version). It holds these collections:

- **`users`** — one row per anonymous `userId` (the random UUID from
  `localStorage`), with a display name (usually blank), language, creation
  date, and a `baselineComplete` flag. No email, phone, or real name is
  ever collected.
- **`checkins`** — mood check-ins from `/checkin` (`POST /api/checkins`):
  a 1–5 mood value plus an optional free-text note. *(Note: unlike the
  day-map flow, this simpler mood check-in's optional note is stored
  server-side, in this JSON file — not just on-device. This is a legacy,
  simpler feature separate from the main day-map/results flow.)*
- **`journalEntries`** — free-text journal entries from `/journal`
  (`POST /api/journal`), each with a locally-computed `sentiment` label
  (`"low" | "neutral" | "positive"`) attached. See 6.3 for how sentiment
  is computed. Entries can be deleted (`DELETE /api/journal?id=...`),
  which permanently removes that row from the file.
- **`assessmentResponses`** — results from the separate `/assessment` page
  (a simple 5-question weekly wellbeing check, unrelated to the day-map),
  storing the raw numeric answers, a total score, and a band
  (`steady` / `mixed` / `strained`).
- **`dayMapSubmissions`** — **only** `pattern` and `loadPercent` from the
  main day-map flow, as described in 3.5. This is the only server-side
  trace of a day-map check-in ever happening.
- **`events`** — a simple activity log (`USER_REGISTERED`,
  `MOOD_SIGNAL_CREATED`, `JOURNAL_ENTRY_CREATED`, `ASSESSMENT_COMPLETED`,
  `DAY_MAP_COMPLETED`), used only to compute "active this week" counts on
  the organization dashboard.

`data/db.json` is excluded from git (see `.gitignore`) and is created
automatically, pre-filled with nine fake demo participants
(`seedDatabase()` in `src/lib/db.ts`), the first time the app starts and
the file doesn't exist yet. This seed data exists purely so the
organization dashboard has something to display in a demo; it is not real
user data.

### 5.1 How a request is tied to a "user" without login

There is no login system. Every browser generates a random UUID once
(`getLocalUserId` in `src/lib/client.ts`) and stores it as
`unkahi.userId` in `localStorage`. Every API call from that browser sends
this ID in an `x-user-id` header (`apiGet`/`apiPost`/`apiPatch`/
`apiDelete` in `src/lib/client.ts`), and the server reads it via
`getUserIdFromRequest` (`src/lib/apiUser.ts`) to know which rows in
`db.json` belong to that browser. If someone clears their browser storage,
a new random ID is generated and the server has no way to link the new
one back to the old one.

---

## 6. Every calculation, explained

### 6.1 Nervous system load percentage — `scoreDayMap` (`src/lib/daymap.ts`)

Covered in detail in 3.4. Summary formula:

```
totalActivation = sum of all 6 pillar-vector numbers after adding up
                   every selected sensation's weights + every chosen
                   answer's weights

loadPercent = clamp( round(totalActivation / assumedMax * 100), 8, 96 )
  where assumedMax = 26 (base 6-question pass)
                   = 46 (if the optional 4-question deeper pass is included)
```

### 6.2 Primary pattern (fight/flight/freeze/fawn) — `computePatternWeight`

```
for each selected body sensation: patternScore[sensation.pattern] += 1
for each chosen day-map/deeper answer: patternScore[answer.pattern] += 2

primaryPattern = whichever of the four patterns has the highest score
                 (defaults to "flight" if everything is tied at zero)
```

### 6.3 Journal sentiment — `analyzeSentiment` (`src/lib/signals.ts`)

A simple word-matching heuristic, not a machine-learning model:

```
score = 0
for each word in a fixed NEGATIVE_WORDS list found in the entry: score -= 1
for each word in a fixed POSITIVE_WORDS list found in the entry: score += 1

if score <= -1: sentiment = "low"
if score >= 1:  sentiment = "positive"
otherwise:      sentiment = "neutral"
```

The word lists live directly in `src/lib/signals.ts` and can be edited
there. This runs entirely on the Next.js server when a journal entry is
saved (not in the browser, and not via any external AI/NLP service).

### 6.4 Mood trend — `computeMoodTrend` (`src/lib/signals.ts`)

Used on the `/dashboard` page for the simple mood check-in feature:

```
take the most recent 7 mood check-ins
average = mean of their mood values (1-5)
split those 7 into an earlier half and a later half
direction = "up"   if (later half average - earlier half average) > 0.3
          = "down" if that difference < -0.3
          = "flat" otherwise
```

### 6.5 Recommendations on the dashboard — `buildRecommendations`
(`src/lib/signals.ts`)

A small fixed lookup, not a learned model: if the mood trend is down or
the last weekly-assessment band was "strained," it suggests breathing +
grounding + a resource link; if things are "mixed" or the last journal
entry's sentiment was "low," it suggests a grounding + journaling prompt;
otherwise it suggests a reflection + journaling prompt. Duplicate
suggestions are filtered out.

### 6.6 Weekly wellbeing assessment score — `scoreAssessment`
(`src/lib/assessment.ts`)

The separate `/assessment` page asks 5 questions (sleep, energy, focus,
connection, outlook), each answered on a 0–3 scale. The total is just the
sum of the five answers (0–15 range), mapped to a band:

```
0–4:  "steady"
5–9:  "mixed"
10–15: "strained"
```

### 6.7 On-device baseline statistics — `computeBaseline`
(`src/lib/useBaseline.ts`)

Covered in 3.7 (average, population standard deviation, streak, and a
1.25-standard-deviation outlier flag).

### 6.8 Organization aggregate analytics — `getAggregateAnalytics`
(`src/lib/db.ts`)

Powers the `/org` dashboard and `GET /api/org/analytics`. Every number
here is computed from server-side data only (section 5) and is a plain
count or average across *all* users — there is no per-person breakdown
anywhere in this response:

- **Active participants**: number of distinct users who have any event
  logged in the last 7 days.
- **Average mood**: mean of every stored mood check-in value.
- **Average load**: mean of every stored `loadPercent` from
  `dayMapSubmissions`.
- **Pattern counts**: how many day-map submissions had each primary
  pattern (fight/flight/freeze/fawn).
- **Assessment band counts**: how many weekly assessments fell into each
  band (steady/mixed/strained).
- **7-day trend**: for each of the last 7 calendar days, a count of
  check-ins and journal entries logged that day.

---

## 7. Page-by-page map

| Route | Purpose |
|---|---|
| `/` | Landing page, explains the privacy model, links to the check-in |
| `/start` | Body sensation picker (step 1 of the check-in) |
| `/day-map` | Six-question situational day map (step 2) |
| `/day-map/deeper` | Optional four-question imagery/memory pass, combines into the same result |
| `/results` | Shows load %, pattern, pillars, charts, resonance check, tool suggestion |
| `/my-data` | Personal on-device history, baseline stats, export/clear controls |
| `/tools` | Hub linking to the four calming exercises |
| `/tools/paced-breathing` | Animated breathing pacer (4s in / 4s hold / 6s out) |
| `/tools/grounding-cards` | Five-sense grounding prompts, one at a time |
| `/tools/release-note` | Write a thought, then watch it fade — nothing is saved anywhere |
| `/tools/bilateral-tone` | Alternating left/right audio tone via the Web Audio API |
| `/safety-plan` | India-specific crisis helplines with tap-to-call, personal safety plan editor |
| `/resources` | Plain-language explanation of why each tool works |
| `/checkin`, `/dashboard`, `/journal`, `/assessment` | A simpler, separate mood/journal/weekly-assessment feature (server-stored, see section 5) |
| `/org` | Aggregate-only organization dashboard, no individual data |

A floating help button (bottom-right, on every page — `FloatingHelp`
component) gives one-tap access to the safety plan, tools, and a quick
check-in, plus a direct tap-to-call link to the KIRAN helpline. A "Leave
quickly" button in the navigation bar (`QuickExit` component) immediately
replaces the current tab with a neutral website, for anyone who needs to
exit fast without a back-button trail.

---

## 8. Running the project

```bash
npm install
npm run dev
```

Then open http://localhost:3000. On first run, `data/db.json` is created
automatically with demo seed data for the organization dashboard.

```bash
npm run build   # production build
npm run lint    # ESLint
```

---

## 9. Limitations and honesty notes

- This is **not** a diagnostic or clinical tool. The scoring is a
  transparent, fixed set of weights written for this project — not a
  validated psychological instrument.
- The `/org` dashboard currently has **no authentication**. In its current
  state, anyone with the URL can view aggregate participant data. This is
  acceptable for a hackathon demo but would need real access control
  before any real deployment.
- The simpler mood check-in/journal/assessment features (`/checkin`,
  `/dashboard`, `/journal`, `/assessment`) store their data server-side in
  `data/db.json`, unlike the main day-map flow which is on-device only.
  This distinction is intentional to document clearly rather than hide.
- Journal sentiment analysis is a basic keyword heuristic, not a trained
  model — it will misread plenty of entries and is only meant to add a
  small local signal, not to interpret anyone's writing.
