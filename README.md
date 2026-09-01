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
   showing up, along with one suggested calming exercise and a lightweight
   loop to try it and note whether anything shifted.
2. **Organization side** — a read-only aggregate dashboard intended for a
   program/cohort administrator. It only ever shows group-level numbers
   (averages, counts, distributions) — never an individual's answers,
   journal text, or identity-linked detail.

The guiding rule throughout the codebase: **anything a person writes or
selects during the main check-in stays in their own browser.** Only a
final, already-summarized signal (a pattern label and a load percentage) is
ever sent to the server, and only that signal feeds the organization
dashboard.

A secondary, simpler module (`/checkin`, `/dashboard`, `/assessment`)
exists alongside the main flow and uses a different storage model — see
section 5 and the note in section 7. The app is explicit about this
distinction in its own copy rather than making a single blanket privacy
claim that wouldn't be true for every page. The journal (`/journal`) is
part of this app but is stored entirely on-device, not server-side —
there is no login system, so nothing tied only to the unauthenticated
per-browser ID is ever sent to the server for storage.

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
- **`localStorage` / `sessionStorage`** in the browser hold everything that
  must never leave the device, or that's only sensitive in transit. See
  section 4.

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
selected IDs are kept in `sessionStorage` (`src/lib/sessionState.ts`), not
in the URL — this is deliberate, so a sensitive selection like "numb /
floaty / far away" never ends up in the address bar, browser history,
copied links, or a screenshot of the URL bar. The value is cleared once the
check-in finishes.

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
closest?"). These four answers are scored as their own result, and then
`recomputeAfterDeeperPass` combines both the pillar scores **and the
pattern weights** from the base pass and the deeper pass before picking a
final primary pattern (see 3.5) — the load percentage is recalculated
using a higher assumed maximum (46 instead of 26) to account for the extra
questions.

### 3.3 The six "pillars"

Every weight vector in the app has exactly six numbers, always in this
order (`PILLAR_ORDER` in `src/lib/daymap.ts`):

1. **Alert scanning** — staying on high alert, scanning for danger
2. **Boundary softening** — accommodating others ahead of your own needs
3. **Carried guilt** — holding blame that may not be fully yours
4. **Somatic drift** — feeling numb, floaty, or disconnected from the body
5. **Relational pullback** — pulling away from other people
6. **Control seeking** — tightly managing surroundings for predictability

Each pillar (`PILLARS` record) carries a short plain-language `subtitle`, a
longer `description`, a gentle `tip`, and the ID of a recommended tool
(`toolId`) to suggest if that pillar comes out on top.

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
   body sensations, since they reflect an active behavioral choice). These
   per-pattern totals are stored on the result as `patternWeights`, not
   just collapsed into a single winner — this is what makes it possible to
   correctly recombine two passes later (see 3.5).
3. **Decide whether there's a signal at all.** If every selected sensation
   and answer happened to be the neutral option, the total pillar
   activation is zero. In that case the result is explicitly marked
   `hasSignal: false`, `pillars: []`, and `loadPercent: 0` — the app does
   **not** invent a pillar or pattern to fill the gap (see 3.9).
4. **Turn the pillar total into a percentage ("nervous system load"), only
   if there is a signal.** All six pillar numbers are added into one
   `totalActivation` number. This is divided by an assumed maximum possible
   total (`26` for the 6-question base pass, `46` if the deeper pass is
   included), multiplied by 100, then clamped between 8 and 96
   (`Math.max(8, Math.min(96, ...))`) so the number is never a jarring 0%
   or 100%.
5. **Pick the top pillars, only if there is a signal.** The six pillars are
   sorted by score, filtered to only those above zero, and the top two are
   kept as `result.pillars`. These are the "what this might be about"
   cards shown on the results page.
6. **Estimate a "reflection strength."** See 3.8 — a deterministic,
   non-statistical read on how clearly the answers leaned somewhere.

The result of all this (`DayMapResult`) also carries a `scoringVersion`
field (currently `"v1"`), so if the weights or formula ever change later,
old and new results can be told apart without guessing.

### 3.5 The deeper pass no longer inherits the wrong pattern

`recomputeAfterDeeperPass` (in `src/lib/daymap.ts`) is what runs when the
optional deeper pass finishes. Earlier, only the pillar scores were merged
and the load percentage recalculated, while `primaryPattern` silently kept
whatever the *base* pass alone had produced — even if the deeper answers
leaned somewhere else entirely. This is fixed: the function now combines
`patternWeights` from both passes with `combinePatternWeights`, then picks
the primary pattern fresh from that combined total, using the exact same
weighting rule as everywhere else (sensations +1, answers +2). The results
page shows an "includes a deeper pass" badge whenever this has happened, so
it's visible that the final reflection accounts for both passes.

### 3.6 What syncs to the server, and what doesn't

Immediately after scoring, the check-in flow calls `POST /api/daymap` with
**only two fields**: `pattern` (a single word like `"fight"`) and
`loadPercent` (a number like `62`). Nothing else — not the six pillar
scores, not which sensations were picked, not which answers were chosen,
not the reflection strength — ever leaves the browser. This is enforced in
the API route (`src/app/api/daymap/route.ts`), which only reads
`body.pattern` and `body.loadPercent` and ignores anything else sent to
it.

If this network call fails for any reason, it's caught silently — the
on-device result was already saved before the call, so the person's own
experience of the check-in is never disrupted by a network issue.

### 3.7 Results page (`/results`)

Reads the most recent result out of `localStorage`
(`getLatestDayMapResult`) and:

- If the result has no signal (`hasSignal: false`), shows a distinct
  neutral state — "Nothing strongly stands out today" — with copy
  explaining that this is a useful, valid outcome, and a link to check in
  again later. It does not fabricate a pillar or pattern.
- Otherwise, picks a plain-language band based on the load percentage
  (`loadBand`): under 35% is described as "fairly steady," 35–64% as "some
  noticeable weight," 65%+ as "a lot is carrying weight right now." A raw
  percentage and the radar/bar charts are only shown behind a "see a more
  detailed view" toggle.
- Shows the pattern as a short state-based badge (`patternChipLabel`, e.g.
  "More accommodating today") plus a fuller sentence
  (`patternStateSentence`) that explicitly frames it as "today," not an
  identity — the raw words fight/flight/freeze/fawn are intentionally kept
  out of the visible UI copy.
- Shows a "Reflection strength" badge (Low / Moderate / Strong) — see 3.8.
- Shows a "What changed" card comparing the current pillar vector against
  the person's own recent history average (`comparePillarsToHistory`,
  computed only from their own past on-device results, never other
  people's data), or a "your personal baseline will become clearer after a
  few check-ins" message if there isn't enough history yet (fewer than 3
  past signal-bearing results).
- Offers a collapsible "Why this showed up" section
  (`explainResult`) — a locally generated, plain-language explanation built
  only from the pillar/pattern already computed. It never exposes raw
  weight numbers or the underlying answers.
- Recommends one tool based on whichever pillar scored highest
  (`findTool(primaryPillar.toolId)`), unless the person's own local history
  of past tool sessions shows a clear pattern of that tool (or another
  candidate) making things feel "lighter" more often than not
  (`getPreferredTool`) — in which case that tool is suggested instead, with
  a short explanation that it "seemed to resonate with you last time."
  Underneath, a one-line "Suggested because X was the strongest theme"
  explanation is always shown.
- The tool link includes `?from=results` so the tool page knows to offer a
  post-exercise re-check (see 3.10), and starts a local
  "regulation session" recording the load percentage at that moment
  (`beforeLoad`).
- Shows a three-option resonance check ("Yes, that fits" / "Partly" /
  "Not really") plus an optional free-text note. Choosing "Not really"
  shows supportive copy ("This reflection is a prompt, not a verdict").
  Both the resonance value and the note are saved only to `localStorage`
  (see 4.1), never sent anywhere.
- Offers a "Something here feels off?" correction control — the person can
  flag that the body description, pattern, theme, or recommendation didn't
  fit (or "none of these"), with an optional free-text note. This is saved
  locally only, is explicitly non-authoritative ("nothing is retrained from
  this"), and never changes the displayed result.

### 3.8 Reflection strength (`reflectionStrengthLabel` /
`reflectionStrengthDescription`)

A small, deterministic signal — **not** a statistical confidence interval,
not a clinical certainty score, and never described as either in the UI.
It only looks at how clearly the six pillar totals separated from one
another:

```
top pillar score >= 6 AND gap to the second-highest pillar >= 3  -> Strong
top pillar score >= 3 AND (gap >= 1 OR only a few pillars active) -> Moderate
otherwise (or no signal at all)                                   -> Low
```

The accompanying description is always phrased as "how much your answers
leaned somewhere," e.g. "A few of your answers pointed somewhere, but not
overwhelmingly."

### 3.9 No forced interpretation when there's no signal

If every selected sensation and chosen answer happens to be the neutral
option, `scoreDayMap` (and `recomputeAfterDeeperPass`) mark the result as
`hasSignal: false`, with an empty `pillars` array and `loadPercent: 0`.
Previously, the scoring function silently defaulted to labeling the person
as "control-seeking" in this situation — that default has been removed.
The results page now shows a dedicated neutral state instead of inventing
a theme (see 3.7).

### 3.10 CHECK → TRY → RE-CHECK: the regulation loop

Each of the four tool pages (`/tools/paced-breathing`,
`/tools/grounding-cards`, `/tools/release-note`, `/tools/bilateral-tone`)
checks for a `?from=results` query parameter. If present, and if a
matching local "regulation session" was started from the results page
(`saveRegulationSession` / `getRegulationSession` in
`src/lib/localStore.ts`), the tool page renders a `RegulationRecheck`
component after the exercise. This asks "Did anything shift?" with four
options: Lighter, About the same, Heavier, Not sure. The choice is saved
locally (`saveToolShift`) alongside the `beforeLoad` value captured on the
results page, and is explicitly labeled "self-reflection signal" rather
than a claim like "this reduced your stress" or a physiological
measurement. This local history is what powers the personalized tool
preference described in 3.7.

### 3.11 The on-device baseline (`useBaseline`)

`src/lib/useBaseline.ts` reads *all* of a person's past **signal-bearing**
results out of `localStorage` (neutral, no-signal results are excluded so
they don't quietly drag the average toward zero) and computes, purely with
arithmetic:

- **Average**: the exact mean of all past `loadPercent` values, computed
  at full floating-point precision internally. Only the number actually
  displayed to the user is rounded (to one decimal place) — rounding
  happens strictly after the mean and variance are computed, never before,
  so the spread calculation isn't quietly biased by early rounding.
- **Standard deviation**: computed from that same exact mean
  (`variance = average of (value - exactMean)^2`, then
  `stdDev = sqrt(variance)`), then rounded only for display.
- **Streak**: counts backwards from the most recent result, incrementing
  as long as each result is within 1.5 days of the one before it, and
  stopping at the first gap larger than that.
- **Deviation flag**: `true` if the most recent result differs from the
  person's own average by more than 1.25 standard deviations. This is a
  simple outlier check used only internally to decide when to show softer
  phrasing like "a little different" — the UI never uses words like
  "abnormal," "clinically elevated," "risk score," or "outlier," and the
  comparison is always against the person's *own* history, never anyone
  else's.

This computation runs entirely in the browser on data that never left the
browser. It is recalculated fresh every time the page loads (no caching),
using `useState(() => computeBaseline())` so it only runs once per page
visit.

### 3.12 My Data page (`/my-data`)

A personal, on-device-only dashboard: shows the baseline numbers above
(with "no baseline yet" / "not enough yet" states when there isn't enough
history), a small bar chart of recent check-ins (each bar's height is that
day's `loadPercent`; no-signal days render as a flat "nothing strongly
stood out" bar instead of being skipped or faked), a simple day-by-day
pattern timeline ("Mon — Alert scanning," "Tue — Steady," etc. — whichever
pillar stood out most that day, or "Steady" if nothing did), and resonance
totals across all three tiers (yes / partly / no). Also offers:

- **Download raw JSON**: bundles everything in `localStorage` under the
  app's keys into one JSON file and triggers a browser download
  (`exportLocalData` in `src/lib/localStore.ts`).
- **Download readable summary**: a plain-text, human-readable summary of
  the same data (`buildReadableSummary`), generated entirely on-device.
- **Clear my data**: requires an explicit "Yes, remove everything"
  confirmation step before it actually deletes all of the app's
  `localStorage` keys (`clearAllLocalData`). There is no server-side
  equivalent needed, since the server never had this data in the first
  place.

### 3.13 Journal (`/journal`)

Free-text journaling, stored entirely on-device (`addJournalEntry` /
`getJournalEntries` / `deleteJournalEntry` in `src/lib/localStore.ts`).
This app has no login system — every browser is identified only by a
random ID it generates itself (see 5.1) — so nothing that depends only on
that ID for protection is sent to the server for storage. Each entry gets
a locally-computed sentiment label (`analyzeSentiment`, see 6.4) and can
be deleted at any time. Nothing here is included in the organization
dashboard, since the server never receives it.

### 4.1 `localStorage` (persists across visits)

Everything below lives only in the browser that created it. Clearing
browser data, using a different browser, or using a different device
means none of this is available — there is no cloud backup or sync of
this data, by design. All of it is managed through `src/lib/localStore.ts`.

| localStorage key | What it holds | Written by |
|---|---|---|
| `unkahi.userId` | A random UUID generated once per browser, used only to tag API requests (see 5). Not a real identity. | `src/lib/client.ts` |
| `unkahi.daymap.results` | Every completed check-in result: scoring version, load %, primary pattern, per-pattern weights, six pillar scores, top pillar IDs, whether there was a signal at all, reflection strength, whether the deeper pass was done, timestamp. Up to the most recent 30 are kept. Older results missing newer fields are filled in with safe defaults on read, so they keep rendering. | `src/lib/localStore.ts` |
| `unkahi.daymap.resonance` | A map of `{ resultTimestamp: "yes" \| "partly" \| "no" }` — whether each result felt accurate. Records saved before the "partly" option existed only ever contain "yes"/"no", and are read as-is. | `src/lib/localStore.ts` |
| `unkahi.daymap.feedback` | A map of `{ resultTimestamp: freeTextNote }` — optional notes typed on the results page. | `src/lib/localStore.ts` |
| `unkahi.daymap.correction` | A map of `{ resultTimestamp: { target, note, createdAt } }` — optional "something here feels off" flags a person raised about a result. | `src/lib/localStore.ts` |
| `unkahi.regulation.session` | At most one active "before" snapshot (`toolId`, `resultCreatedAt`, `beforeLoad`, `startedAt`) while a person is trying a recommended tool from the results page. Cleared once the after-check is answered. | `src/lib/localStore.ts` |
| `unkahi.tool.shiftHistory` | Up to the most recent 50 "did anything shift?" answers after trying a tool (`toolId`, `shift`, `beforeLoad`, timestamp). Powers the personalized tool suggestion. | `src/lib/localStore.ts` |
| `unkahi.safetyPlan` | The personal safety plan: warning signs, coping steps, a trusted contact, and when it was last saved. | `src/lib/localStore.ts` |
| `unkahi.journal.entries` | Free-text journal entries, each with a locally-computed sentiment label and timestamp. | `src/lib/localStore.ts` |

None of these keys are ever read by any API route. The only thing that
ever crosses from browser to server is described in section 5.

### 4.2 `sessionStorage` (cleared when the tab/session ends)

| sessionStorage key | What it holds | Written by |
|---|---|---|
| `unkahi.session.sensations` | The body sensations selected on `/start`, kept only long enough to reach `/day-map` and be scored. Cleared as soon as the check-in finishes. | `src/lib/sessionState.ts` |

This exists specifically so a sensitive selection like "numb / floaty / far
away" is never visible in the URL, browser history, a bookmark, or a
screenshot of the address bar — see 3.1.

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
  a 1–5 mood value plus an optional free-text note. *(Note: unlike the main
  day-map flow, this simpler mood check-in's optional note is stored
  server-side, in this JSON file — not just on-device. This is a separate,
  simpler feature described further in section 7.)*
- **`assessmentResponses`** — results from the separate `/assessment` page
  (a simple 5-question weekly wellbeing check, unrelated to the day-map),
  storing the raw numeric answers, a total score, and a band
  (`steady` / `mixed` / `strained`).
- **`dayMapSubmissions`** — **only** `pattern` and `loadPercent` from the
  main day-map flow, as described in 3.6. This is the only server-side
  trace of a day-map check-in ever happening.
- **`events`** — a simple activity log (`USER_REGISTERED`,
  `MOOD_SIGNAL_CREATED`, `ASSESSMENT_COMPLETED`, `DAY_MAP_COMPLETED`), used
  only to compute "active this week" counts on the organization dashboard.

`data/db.json` is excluded from git (see `.gitignore`) and is created
automatically, pre-filled with fake demo participants (`seedDatabase()` in
`src/lib/db.ts`), the first time the app starts and the file doesn't exist
yet. This seed data exists purely so the organization dashboard has
something to display in a demo; it is not real user data.

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

### 6.1 Nervous system load percentage — `scoreDayMap` /
`recomputeAfterDeeperPass` (`src/lib/daymap.ts`)

Covered in detail in 3.4–3.5. Summary formula:

```
totalActivation = sum of all 6 pillar-vector numbers after adding up
                   every selected sensation's weights + every chosen
                   answer's weights (combined across both passes, if a
                   deeper pass was completed)

hasSignal = totalActivation > 0

loadPercent = 0                                            if !hasSignal
            = clamp( round(totalActivation / assumedMax * 100), 8, 96 )
                                                              otherwise
  where assumedMax = 26 (base 6-question pass)
                   = 46 (if the optional 4-question deeper pass is included)
```

### 6.2 Primary pattern (fight/flight/freeze/fawn) —
`computePatternWeight` / `combinePatternWeights` (`src/lib/daymap.ts`)

```
for each selected body sensation: patternScore[sensation.pattern] += 1
for each chosen day-map/deeper answer: patternScore[answer.pattern] += 2

primaryPattern = whichever of the four patterns has the highest score
                 (defaults to "flight" if everything is tied at zero,
                  and only ever computed when hasSignal is true)
```

If a deeper pass is completed, the base pass's and deeper pass's
`patternScore` totals are added together (`combinePatternWeights`) before
picking the winner, so the final pattern reflects both passes rather than
staying whatever the base pass alone produced.

### 6.3 Reflection strength — `computeReflectionStrength`
(`src/lib/daymap.ts`)

Covered in 3.8. Deterministic thresholds based on the top pillar score and
how far it separates from the second-highest — not a statistical
confidence measure.

### 6.4 Journal sentiment — `analyzeSentiment` (`src/lib/signals.ts`)

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
there. This runs entirely in the browser when a journal entry is saved
(not on the server, and not via any external AI/NLP service) — the
journal itself is on-device only, described in section 3.13.

### 6.5 Mood trend — `computeMoodTrend` (`src/lib/signals.ts`)

Used on the `/dashboard` page for the simple mood check-in feature:

```
take the most recent 7 mood check-ins
average = mean of their mood values (1-5)
split those 7 into an earlier half and a later half
direction = "up"   if (later half average - earlier half average) > 0.3
          = "down" if that difference < -0.3
          = "flat" otherwise
```

### 6.6 Recommendations on the dashboard — `buildRecommendations`
(`src/lib/signals.ts`)

A small fixed lookup, not a learned model: if the mood trend is down or
the last weekly-assessment band was "strained," it suggests breathing +
grounding + a resource link; if things are "mixed," it suggests a
grounding + journaling prompt; otherwise it suggests a reflection +
journaling prompt. Duplicate suggestions are filtered out. This only ever
reads the server-stored mood check-ins and weekly assessment — the
on-device journal is never part of this computation, since the server
never sees it.

### 6.7 Weekly wellbeing assessment score — `scoreAssessment`
(`src/lib/assessment.ts`)

The separate `/assessment` page asks 5 questions (sleep, energy, focus,
connection, outlook), each answered on a 0–3 scale. The total is just the
sum of the five answers (0–15 range), mapped to a band:

```
0–4:  "steady"
5–9:  "mixed"
10–15: "strained"
```

### 6.8 On-device baseline statistics — `computeBaseline`
(`src/lib/useBaseline.ts`)

Covered in 3.11 (exact mean computed before rounding, population standard
deviation from that exact mean, streak, and a 1.25-standard-deviation
internal outlier flag that only ever surfaces as gentle phrasing).

### 6.9 Personal history comparison — `comparePillarsToHistory` /
`averagePillarVectorExcluding` (`src/lib/daymap.ts`, `src/lib/localStore.ts`)

Powers the "What changed" card on the results page:

```
historyAverage = mean pillar vector across the person's own past
                 signal-bearing results (excluding the current one)

for each of the 6 pillars: diff = currentValue - historyAverage[pillar]
pick the pillar with the largest |diff|
if |diff| < 1 (a small fixed threshold): report "close to your recent range"
otherwise: report that pillar as "a little higher" or "a little lower"
           than usual
```

Only shown once there are at least 3 past signal-bearing results to
compare against; otherwise the UI says the baseline "will become clearer
after a few check-ins" rather than fabricating a comparison.

### 6.10 Tool preference from local history — `getPreferredTool`
(`src/lib/localStore.ts`)

```
for each candidate tool (usually just the pillar-recommended one):
  look at this person's own past "did anything shift?" answers for that tool
  if there are at least 2 such answers AND more than half were "lighter":
    this tool becomes the preferred suggestion
```

This is personalization based on what the person themselves reported, not
a claim that the tool is objectively effective, and it's never sent to the
server.

### 6.11 Organization aggregate analytics — `getAggregateAnalytics`
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
  check-ins logged that day.

---

## 7. Page-by-page map

| Route | Purpose |
|---|---|
| `/` | Landing page, explains the privacy model, links to the check-in |
| `/start` | Body sensation picker (step 1 of the check-in); selections go to `sessionStorage`, not the URL |
| `/day-map` | Six-question situational day map (step 2) |
| `/day-map/deeper` | Optional four-question imagery/memory pass; recomputes both pillars and pattern from the combined base + deeper answers |
| `/results` | Neutral state if no signal, otherwise: load %, state-based pattern phrasing, reflection strength, "what changed," charts, "why this showed up," tool recommendation with rationale, three-tier resonance check, correction control |
| `/my-data` | Personal on-device history, baseline stats, day-by-day pattern timeline, raw/readable export, confirmed clear |
| `/tools` | Hub linking to the four calming exercises |
| `/tools/paced-breathing` | Animated breathing pacer (4s in / 4s hold / 6s out); shows a re-check if reached from results |
| `/tools/grounding-cards` | Five-sense grounding prompts, one at a time; shows a re-check if reached from results |
| `/tools/release-note` | Write a thought, then watch it fade — nothing is saved anywhere; shows a re-check if reached from results |
| `/tools/bilateral-tone` | Alternating left/right audio tone via the Web Audio API; shows a re-check if reached from results |
| `/safety-plan` | India-specific crisis helplines with tap-to-call, a direct "call 112" action, and a personal safety plan editor — accessible independently of any check-in result |
| `/resources` | Plain-language explanation of why each tool works, plus a note on the two different storage models in this app |
| `/journal` | Free-text journaling, stored on-device only, with a locally-computed sentiment label |
| `/checkin`, `/dashboard`, `/assessment` | A simpler, separate mood check-in/weekly-assessment module (server-stored, see section 5) |
| `/org` | Aggregate-only organization dashboard, no individual data, unauthenticated in this prototype |

A floating help button (bottom-right, on every page — `FloatingHelp`
component) gives one-tap access to the safety plan, tools, and a quick
check-in, plus a direct tap-to-call link to the KIRAN helpline. A "Leave
quickly" button in the navigation bar (`QuickExit` component) immediately
replaces the current tab with a neutral website — it does not clear
browser history or `localStorage`, and doesn't claim to.

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
  validated psychological instrument. "Reflection strength" is a
  deterministic signal-separation heuristic, not a statistical confidence
  score or clinical certainty measure, and is never described as either.
- The `/org` dashboard currently has **no authentication**. In its current
  state, anyone with the URL can view aggregate participant data. This is
  acceptable for a hackathon demo but would need real access control
  before any real deployment.
- The simpler mood check-in/weekly-assessment features (`/checkin`,
  `/dashboard`, `/assessment`) store their data server-side in
  `data/db.json`, unlike the main day-map flow and the journal, both of
  which are on-device only. This distinction is intentional to document
  clearly rather than hide — see the note on `/` and `/resources`.
- Journal sentiment analysis is a basic keyword heuristic, not a trained
  model — it will misread plenty of entries and is only meant to add a
  small local signal, not to interpret anyone's writing. It also runs
  entirely in the browser now, since the journal itself is on-device only.
- High load percentages are never automatically treated as a crisis
  signal. The safety plan and crisis helplines are reachable independently
  from any result, at any time, through the navigation, the floating help
  button, or `/safety-plan` directly.
