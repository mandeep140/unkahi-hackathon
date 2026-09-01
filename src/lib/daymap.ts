export const SCORING_VERSION = "v1";

export type NervousSystemPattern = "fight" | "flight" | "freeze" | "fawn";

export type ReflectionStrength = "low" | "moderate" | "strong";

export type PillarId =
  | "alert-scanning"
  | "boundary-softening"
  | "carried-guilt"
  | "somatic-drift"
  | "relational-pullback"
  | "control-seeking";

export const PILLAR_ORDER: PillarId[] = [
  "alert-scanning",
  "boundary-softening",
  "carried-guilt",
  "somatic-drift",
  "relational-pullback",
  "control-seeking",
];

export interface PillarDefinition {
  id: PillarId;
  icon: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  description: string;
  tip: string;
  toolId: string;
}

export const PILLARS: Record<PillarId, PillarDefinition> = {
  "alert-scanning": {
    id: "alert-scanning",
    icon: "◉",
    shortLabel: "Alert scanning",
    title: "Staying on alert",
    subtitle: "Staying highly alert to what could go wrong.",
    description:
      "Part of you may be scanning for signs of trouble, even in ordinary moments. This kept you safe once, but it takes real energy to sustain.",
    tip: "Try a slow paced-breathing pass to let your body register that this moment is not an emergency.",
    toolId: "paced-breathing",
  },
  "boundary-softening": {
    id: "boundary-softening",
    icon: "◐",
    shortLabel: "Boundary softening",
    title: "Softening your own edges",
    subtitle: "Putting other people's needs ahead of your own.",
    description:
      "You may be accommodating other people's needs ahead of your own to keep things calm, even when it costs you something.",
    tip: "Practice a small, low-risk boundary today — even just saying 'let me think about it' before agreeing.",
    toolId: "release-note",
  },
  "carried-guilt": {
    id: "carried-guilt",
    icon: "◒",
    shortLabel: "Carried guilt",
    title: "Carrying blame that isn't fully yours",
    subtitle: "Holding onto blame that may not fully belong to you.",
    description:
      "Holding onto responsibility for things outside your control can be a way of trying to feel some power over pain that otherwise feels random.",
    tip: "Try writing the blame story down and letting it go, rather than replaying it silently.",
    toolId: "release-note",
  },
  "somatic-drift": {
    id: "somatic-drift",
    icon: "◌",
    shortLabel: "Somatic drift",
    title: "Drifting from the body",
    subtitle: "Feeling disconnected, numb, floaty, or far from your body.",
    description:
      "Feeling numb, floaty, or far away is a protective buffer your nervous system can reach for when things feel like too much.",
    tip: "A short grounding pass — naming a few things you can see, hear, and touch — can help bring you back gently.",
    toolId: "grounding-cards",
  },
  "relational-pullback": {
    id: "relational-pullback",
    icon: "◇",
    shortLabel: "Relational pullback",
    title: "Pulling away from others",
    subtitle: "Wanting more distance from other people.",
    description:
      "Stepping back from people can feel safer when connection has previously come with risk. It offers relief, but can also leave you more alone with hard feelings.",
    tip: "You don't need to force closeness today. Even noticing you feel safe in your own company counts as progress.",
    toolId: "bilateral-tone",
  },
  "control-seeking": {
    id: "control-seeking",
    icon: "◧",
    shortLabel: "Control seeking",
    title: "Reaching for control",
    subtitle: "Needing things to feel predictable before you can relax.",
    description:
      "You may be trying to manage your surroundings closely. This kind of tight planning can bring a feeling of predictability when things otherwise feel uncertain.",
    tip: "Let one small, low-stakes thing stay slightly out of order today, and notice that you are still okay.",
    toolId: "grounding-cards",
  },
};

export type PillarVector = [number, number, number, number, number, number];

function emptyVector(): PillarVector {
  return [0, 0, 0, 0, 0, 0];
}

function addVectors(a: PillarVector, b: PillarVector): PillarVector {
  return a.map((v, i) => v + b[i]) as PillarVector;
}

export interface BodySensation {
  id: string;
  icon: string;
  label: string;
  pattern: NervousSystemPattern;
  weights: PillarVector;
}

export const BODY_SENSATIONS: BodySensation[] = [
  {
    id: "tight-chest",
    icon: "◈",
    label: "Tight chest / racing heart",
    pattern: "fight",
    weights: [3, 0, 0, 0, 0, 0],
  },
  {
    id: "numb",
    icon: "◌",
    label: "Numb / floaty / far away",
    pattern: "freeze",
    weights: [0, 0, 0, 4, 0, 0],
  },
  {
    id: "heavy-stomach",
    icon: "◍",
    label: "Heavy stomach / unease",
    pattern: "flight",
    weights: [0, 0, 3, 0, 0, 0],
  },
  {
    id: "clenched-jaw",
    icon: "◭",
    label: "Clenched jaw or shoulders",
    pattern: "fight",
    weights: [1, 0, 0, 0, 0, 2],
  },
  {
    id: "avoiding-eyes",
    icon: "◔",
    label: "Avoiding eye contact / hiding",
    pattern: "fawn",
    weights: [0, 2, 0, 0, 2, 0],
  },
  {
    id: "pacing",
    icon: "◑",
    label: "Restless / can't sit still",
    pattern: "flight",
    weights: [2, 0, 0, 0, 0, 1],
  },
];

export interface DayMapOption {
  label: string;
  pattern: NervousSystemPattern;
  weights: PillarVector;
}

export interface DayMapStep {
  id: string;
  phase: string;
  stepLabel: string;
  prompt: string;
  options: DayMapOption[];
}

export const DAY_MAP_STEPS: DayMapStep[] = [
  {
    id: "waking",
    phase: "Waking",
    stepLabel: "Step 1 of 6",
    prompt: "Before you fully open your eyes, what does your body do first?",
    options: [
      { label: "My jaw is already tight and I feel a jolt of alertness.", pattern: "fight", weights: [3, 0, 0, 1, 0, 0] },
      { label: "I feel heavy and slow, like it takes a while to feel my limbs.", pattern: "freeze", weights: [0, 0, 0, 4, 0, 0] },
      { label: "I open my eyes calmly and feel mostly rested.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "My mind is already listing everything I need to manage today.", pattern: "fight", weights: [1, 0, 0, 0, 0, 3] },
    ],
  },
  {
    id: "notification",
    phase: "Waking",
    stepLabel: "Step 2 of 6",
    prompt: "You see an unexpected message from someone you don't immediately recognise. What happens inside first?",
    options: [
      { label: "A sudden brace, like I'm expecting bad news.", pattern: "fight", weights: [4, 0, 0, 0, 0, 0] },
      { label: "An automatic worry that I've forgotten or missed something.", pattern: "fawn", weights: [0, 0, 3, 0, 0, 0] },
      { label: "Mild curiosity, nothing more.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "A pull to open and sort it immediately so it's handled.", pattern: "fight", weights: [1, 0, 0, 0, 0, 3] },
    ],
  },
  {
    id: "crowded-space",
    phase: "Midday",
    stepLabel: "Step 3 of 6",
    prompt: "You walk into a busy, crowded room. How do you pick where to stand or sit?",
    options: [
      { label: "Somewhere I can see the exits and most of the room.", pattern: "fight", weights: [3, 0, 0, 0, 0, 2] },
      { label: "Somewhere I take up as little space as possible.", pattern: "fawn", weights: [0, 3, 0, 0, 1, 0] },
      { label: "Wherever is convenient, without thinking much about it.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "I mentally check out until I've settled somewhere.", pattern: "freeze", weights: [0, 0, 0, 3, 0, 0] },
    ],
  },
  {
    id: "extra-task",
    phase: "Midday",
    stepLabel: "Step 4 of 6",
    prompt: "Someone asks you for an extra favour that disrupts your plans for the day. What happens next?",
    options: [
      { label: "I say yes right away, mostly to avoid disappointing them.", pattern: "fawn", weights: [0, 4, 1, 0, 0, 0] },
      { label: "I decline and protect the plan I already had.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "I take it on and quietly restructure the rest of my day around it.", pattern: "fight", weights: [0, 1, 0, 0, 0, 3] },
      { label: "I agree, but feel a quiet guilt about wanting to say no.", pattern: "fawn", weights: [0, 2, 3, 0, 0, 0] },
    ],
  },
  {
    id: "mistake",
    phase: "Midday",
    stepLabel: "Step 5 of 6",
    prompt: "You realise you made a small, fixable mistake earlier today. How does your inner voice react?",
    options: [
      { label: "I replay it over and over, unable to let it drop.", pattern: "freeze", weights: [0, 0, 4, 0, 0, 0] },
      { label: "I quietly panic and try to fix it before anyone notices.", pattern: "fight", weights: [3, 0, 1, 0, 0, 1] },
      { label: "I note it, fix it, and move on without much fuss.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "I feel strangely distant from it, like it barely registers.", pattern: "freeze", weights: [0, 0, 0, 3, 0, 0] },
    ],
  },
  {
    id: "evening",
    phase: "Evening",
    stepLabel: "Step 6 of 6",
    prompt: "As the day winds down, where does your mind tend to go?",
    options: [
      { label: "Replaying moments where I think I said or did the wrong thing.", pattern: "freeze", weights: [0, 0, 3, 1, 0, 0] },
      { label: "Running through tomorrow's plan again, just to be sure.", pattern: "fight", weights: [3, 0, 0, 0, 0, 2] },
      { label: "I feel distant from the day, like it happened to someone else.", pattern: "freeze", weights: [0, 0, 0, 4, 0, 0] },
      { label: "I feel settled and ready to let the day close.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
    ],
  },
];

export const DEEPER_STEPS: DayMapStep[] = [
  {
    id: "inner-weather",
    phase: "Inner weather",
    stepLabel: "Step 1 of 4",
    prompt: "If your inner emotional state right now were a kind of weather, which feels closest?",
    options: [
      { label: "A storm that always seems to be building on the horizon.", pattern: "fight", weights: [4, 0, 0, 1, 0, 0] },
      { label: "A thick, quiet fog that makes things hard to see clearly.", pattern: "freeze", weights: [0, 0, 0, 4, 1, 0] },
      { label: "A clear, cool morning.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "A carefully controlled indoor climate I manage myself.", pattern: "fight", weights: [1, 0, 0, 0, 0, 4] },
    ],
  },
  {
    id: "new-room",
    phase: "Inner weather",
    stepLabel: "Step 2 of 4",
    prompt: "You step into an unfamiliar room, alone, for the first time. What's your first instinct?",
    options: [
      { label: "Quietly checking the corners and exits before relaxing.", pattern: "fight", weights: [4, 0, 0, 0, 0, 1] },
      { label: "Standing still, feeling oddly far away from the space.", pattern: "freeze", weights: [0, 0, 0, 4, 0, 0] },
      { label: "Starting to arrange things in a way that makes sense to me.", pattern: "fight", weights: [0, 0, 0, 0, 0, 4] },
      { label: "A wave of relief that no one else is around.", pattern: "fawn", weights: [0, 0, 0, 0, 4, 0] },
    ],
  },
  {
    id: "old-photo",
    phase: "Memory",
    stepLabel: "Step 3 of 4",
    prompt: "You come across an old photo of yourself as a child. Your first honest reaction is...",
    options: [
      { label: "A quiet ache — I want to reach in and protect that kid.", pattern: "freeze", weights: [0, 0, 3, 0, 2, 0] },
      { label: "A strange distance, like they're a stranger to me.", pattern: "freeze", weights: [0, 0, 0, 4, 0, 0] },
      { label: "A gentle recognition — I can feel the thread between us.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "An urge to put the photo away quickly.", pattern: "fight", weights: [2, 0, 2, 1, 0, 0] },
    ],
  },
  {
    id: "sincere-compliment",
    phase: "Social mirror",
    stepLabel: "Step 4 of 4",
    prompt: "Someone gives you a genuine, specific compliment about your character. Before you respond, what happens inside?",
    options: [
      { label: "An urge to immediately wave it off.", pattern: "fawn", weights: [0, 3, 1, 0, 0, 0] },
      { label: "A flicker of suspicion about what they might want.", pattern: "fight", weights: [3, 0, 0, 0, 1, 0] },
      { label: "A warm feeling — I let it land.", pattern: "flight", weights: [0, 0, 0, 0, 0, 0] },
      { label: "It barely registers, like it was said to someone else.", pattern: "freeze", weights: [0, 0, 0, 4, 0, 0] },
    ],
  },
];

export interface DayMapAnswer {
  stepId: string;
  pattern: NervousSystemPattern;
  weights: PillarVector;
}

export type PatternWeights = Record<NervousSystemPattern, number>;

export interface DayMapResult {
  scoringVersion: string;
  loadPercent: number;
  primaryPattern: NervousSystemPattern;
  patternWeights: PatternWeights;
  pillarScores: PillarVector;
  pillars: PillarId[];
  hasSignal: boolean;
  reflectionStrength: ReflectionStrength;
  hasDeeperPass: boolean;
  createdAt: string;
}

const PATTERN_LABELS: Record<NervousSystemPattern, string> = {
  fight: "Fight",
  flight: "Flight",
  freeze: "Freeze",
  fawn: "Fawn",
};

export function patternLabel(pattern: NervousSystemPattern): string {
  return PATTERN_LABELS[pattern];
}

const PATTERN_CHIP_LABELS: Record<NervousSystemPattern, string> = {
  fight: "More activated today",
  flight: "Seeking space today",
  freeze: "More still today",
  fawn: "More accommodating today",
};

export function patternChipLabel(pattern: NervousSystemPattern): string {
  return PATTERN_CHIP_LABELS[pattern];
}

const PATTERN_STATE_CLAUSES: Record<NervousSystemPattern, string> = {
  fight: "leaning toward a more alert, activated pattern today",
  flight: "leaning toward wanting a bit more distance or space today",
  freeze: "leaning toward feeling still, distant, or shut down today",
  fawn: "leaning toward accommodating others today",
};

export function patternStateClause(pattern: NervousSystemPattern): string {
  return PATTERN_STATE_CLAUSES[pattern];
}

export function patternStateSentence(pattern: NervousSystemPattern): string {
  const clause = PATTERN_STATE_CLAUSES[pattern];
  return `Your responses are ${clause}.`;
}

function computePillarScores(
  sensations: string[],
  answers: DayMapAnswer[]
): PillarVector {
  let total = emptyVector();
  for (const id of sensations) {
    const sensation = BODY_SENSATIONS.find((s) => s.id === id);
    if (sensation) total = addVectors(total, sensation.weights);
  }
  for (const answer of answers) {
    total = addVectors(total, answer.weights);
  }
  return total;
}

function emptyPatternWeights(): PatternWeights {
  return { fight: 0, flight: 0, freeze: 0, fawn: 0 };
}

function computePatternWeight(
  sensations: string[],
  answers: DayMapAnswer[]
): PatternWeights {
  const weight = emptyPatternWeights();
  for (const id of sensations) {
    const sensation = BODY_SENSATIONS.find((s) => s.id === id);
    if (sensation) weight[sensation.pattern] += 1;
  }
  for (const answer of answers) {
    weight[answer.pattern] += 2;
  }
  return weight;
}

export function combinePatternWeights(
  a: PatternWeights | undefined,
  b: PatternWeights | undefined
): PatternWeights {
  const left = a ?? emptyPatternWeights();
  const right = b ?? emptyPatternWeights();
  return {
    fight: left.fight + right.fight,
    flight: left.flight + right.flight,
    freeze: left.freeze + right.freeze,
    fawn: left.fawn + right.fawn,
  };
}

function pickPrimaryPattern(weights: PatternWeights): NervousSystemPattern {
  const entries = Object.entries(weights) as [NervousSystemPattern, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? "flight";
}

function topPillars(pillarScores: PillarVector): PillarId[] {
  return PILLAR_ORDER
    .map((id, index) => ({ id, score: pillarScores[index] }))
    .sort((a, b) => b.score - a.score)
    .filter((p) => p.score > 0)
    .slice(0, 2)
    .map((p) => p.id);
}

function computeReflectionStrength(
  pillarScores: PillarVector,
  hasSignal: boolean
): ReflectionStrength {
  if (!hasSignal) return "low";
  const sorted = [...pillarScores].sort((a, b) => b - a);
  const top = sorted[0] ?? 0;
  const second = sorted[1] ?? 0;
  const separation = top - second;
  const activePillars = pillarScores.filter((v) => v > 0).length;

  if (top >= 6 && separation >= 3) return "strong";
  if (top >= 3 && (separation >= 1 || activePillars <= 3)) return "moderate";
  return "low";
}

export function reflectionStrengthLabel(strength: ReflectionStrength): string {
  if (strength === "strong") return "Strong";
  if (strength === "moderate") return "Moderate";
  return "Low";
}

export function reflectionStrengthDescription(strength: ReflectionStrength): string {
  if (strength === "strong") {
    return "Several of your answers pointed the same direction, fairly clearly.";
  }
  if (strength === "moderate") {
    return "A few of your answers pointed somewhere, but not overwhelmingly.";
  }
  return "Your answers didn't lean very strongly in any one direction.";
}

export function scoreDayMap(
  sensations: string[],
  answers: DayMapAnswer[],
  hasDeeperPass: boolean = false
): DayMapResult {
  const pillarScores = computePillarScores(sensations, answers);
  const patternWeights = computePatternWeight(sensations, answers);
  const totalActivation = pillarScores.reduce((a, b) => a + b, 0);
  const hasSignal = totalActivation > 0;

  const assumedMax = hasDeeperPass ? 46 : 26;
  const loadPercent = hasSignal
    ? Math.max(8, Math.min(96, Math.round((totalActivation / assumedMax) * 100)))
    : 0;

  const primaryPattern = hasSignal ? pickPrimaryPattern(patternWeights) : "flight";
  const pillars = hasSignal ? topPillars(pillarScores) : [];
  const reflectionStrength = computeReflectionStrength(pillarScores, hasSignal);

  return {
    scoringVersion: SCORING_VERSION,
    loadPercent,
    primaryPattern,
    patternWeights,
    pillarScores,
    pillars,
    hasSignal,
    reflectionStrength,
    hasDeeperPass,
    createdAt: new Date().toISOString(),
  };
}

export function combinePillarScores(a: PillarVector, b: PillarVector): PillarVector {
  return addVectors(a, b);
}

export function recomputeAfterDeeperPass(
  baseResult: DayMapResult,
  deeperResult: DayMapResult
): DayMapResult {
  const pillarScores = combinePillarScores(baseResult.pillarScores, deeperResult.pillarScores);
  const patternWeights = combinePatternWeights(baseResult.patternWeights, deeperResult.patternWeights);
  const totalActivation = pillarScores.reduce((a, b) => a + b, 0);
  const hasSignal = totalActivation > 0;
  const loadPercent = hasSignal
    ? Math.max(8, Math.min(96, Math.round((totalActivation / 46) * 100)))
    : 0;
  const primaryPattern = hasSignal ? pickPrimaryPattern(patternWeights) : "flight";
  const pillars = hasSignal ? topPillars(pillarScores) : [];
  const reflectionStrength = computeReflectionStrength(pillarScores, hasSignal);

  return {
    scoringVersion: SCORING_VERSION,
    loadPercent,
    primaryPattern,
    patternWeights,
    pillarScores,
    pillars,
    hasSignal,
    reflectionStrength,
    hasDeeperPass: true,
    createdAt: baseResult.createdAt,
  };
}

export function averagePillarVector(vectors: PillarVector[]): PillarVector | null {
  if (vectors.length === 0) return null;
  const sum = vectors.reduce((acc, v) => addVectors(acc, v), emptyVector());
  return sum.map((v) => v / vectors.length) as PillarVector;
}

export interface PillarShift {
  pillar: PillarId;
  direction: "higher" | "lower";
}

const PILLAR_SHIFT_THRESHOLD = 1;

export function comparePillarsToHistory(
  current: PillarVector,
  historyAverage: PillarVector
): PillarShift | null {
  let bestIndex = -1;
  let bestDiff = 0;
  for (let i = 0; i < PILLAR_ORDER.length; i++) {
    const diff = current[i] - historyAverage[i];
    if (Math.abs(diff) > Math.abs(bestDiff)) {
      bestDiff = diff;
      bestIndex = i;
    }
  }
  if (bestIndex === -1 || Math.abs(bestDiff) < PILLAR_SHIFT_THRESHOLD) return null;
  return {
    pillar: PILLAR_ORDER[bestIndex],
    direction: bestDiff > 0 ? "higher" : "lower",
  };
}

export function explainResult(result: DayMapResult): string {
  if (!result.hasSignal || result.pillars.length === 0) {
    return "Your answers didn't lean strongly toward any particular theme, so there isn't much to point to here — and that's a valid result too.";
  }
  const top = PILLARS[result.pillars[0]];
  const second = result.pillars[1] ? PILLARS[result.pillars[1]] : null;
  const clause = patternStateClause(result.primaryPattern);

  if (second) {
    return `Some of your responses pointed toward ${top.title.toLowerCase()} and ${second.title.toLowerCase()}. Those signals contributed most to ${top.shortLabel} and ${second.shortLabel}. Overall, your responses are ${clause}.`;
  }
  return `Some of your responses pointed toward ${top.title.toLowerCase()}. That signal contributed most to ${top.shortLabel}. Overall, your responses are ${clause}.`;
}

export interface ToolDefinition {
  id: string;
  icon: string;
  title: string;
  summary: string;
  useWhen: string;
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "paced-breathing",
    icon: "◎",
    title: "Paced Breathing",
    summary: "A slow, visual breathing pace to settle a racing or alert body.",
    useWhen: "general alertness, racing heart, or panic",
  },
  {
    id: "grounding-cards",
    icon: "▣",
    title: "Grounding Cards",
    summary: "Short sensory prompts to bring attention back to the present moment.",
    useWhen: "feeling floaty, numb, or disconnected",
  },
  {
    id: "release-note",
    icon: "▽",
    title: "Release Note",
    summary: "Write out a heavy thought, then let it fade from the screen.",
    useWhen: "self-blame, intrusive replaying, or hidden frustration",
  },
  {
    id: "bilateral-tone",
    icon: "◑",
    title: "Bilateral Tone",
    summary: "An alternating left-right tone to ease the intensity of a looping worry.",
    useWhen: "a thought that keeps circling and won't settle",
  },
];

export function findTool(id: string): ToolDefinition | undefined {
  return TOOLS.find((t) => t.id === id);
}
