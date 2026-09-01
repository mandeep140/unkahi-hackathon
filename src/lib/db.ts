import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type {
  UserProfile,
  CheckIn,
  AssessmentResponse,
} from "./types";

export interface DomainEvent {
  id: string;
  type: string;
  userId: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface DayMapSubmission {
  id: string;
  userId: string;
  pattern: string;
  loadPercent: number;
  createdAt: string;
}

interface Database {
  users: UserProfile[];
  checkins: CheckIn[];
  assessmentResponses: AssessmentResponse[];
  events: DomainEvent[];
  dayMapSubmissions: DayMapSubmission[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function emptyDb(): Database {
  return {
    users: [],
    checkins: [],
    assessmentResponses: [],
    events: [],
    dayMapSubmissions: [],
  };
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedDatabase(), null, 2));
  }
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function seedDatabase(): Database {
  const db = emptyDb();
  const cohortSize = 9;
  for (let i = 0; i < cohortSize; i++) {
    const uid = `cohort-participant-${i + 1}`;
    const createdAt = daysAgo(20 - i);
    db.users.push({
      id: uid,
      name: `Participant ${i + 1}`,
      language: "en",
      createdAt,
      baselineComplete: true,
    });
    db.events.push({
      id: randomUUID(),
      type: "USER_REGISTERED",
      userId: uid,
      createdAt,
    });

    const checkinCount = 3 + (i % 6);
    for (let c = 0; c < checkinCount; c++) {
      const mood = (((i + c) % 5) + 1) as 1 | 2 | 3 | 4 | 5;
      const ts = daysAgo(checkinCount - c);
      db.checkins.push({
        id: randomUUID(),
        userId: uid,
        mood,
        note: "",
        createdAt: ts,
      });
      db.events.push({
        id: randomUUID(),
        type: "MOOD_SIGNAL_CREATED",
        userId: uid,
        createdAt: ts,
      });
    }

    if (i % 2 === 0) {
      const ts = daysAgo(2 + i);
      const score = 3 + (i % 10);
      db.assessmentResponses.push({
        id: randomUUID(),
        userId: uid,
        assessmentId: "wellbeing-checkin",
        answers: {},
        score,
        band: score >= 10 ? "strained" : score >= 5 ? "mixed" : "steady",
        createdAt: ts,
      });
      db.events.push({
        id: randomUUID(),
        type: "ASSESSMENT_COMPLETED",
        userId: uid,
        createdAt: ts,
      });
    }

    const patterns = ["fight", "flight", "freeze", "fawn"];
    const pattern = patterns[i % patterns.length];
    const loadPercent = 20 + ((i * 9) % 70);
    const dayMapTs = daysAgo(1 + (i % 6));
    db.dayMapSubmissions.push({
      id: randomUUID(),
      userId: uid,
      pattern,
      loadPercent,
      createdAt: dayMapTs,
    });
    db.events.push({
      id: randomUUID(),
      type: "DAY_MAP_COMPLETED",
      userId: uid,
      createdAt: dayMapTs,
      metadata: { pattern, loadPercent },
    });
  }
  return db;
}

function readDb(): Database {
  ensureFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Database;
}

function writeDb(db: Database) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function getOrCreateUser(userId: string): UserProfile {
  const db = readDb();
  let user = db.users.find((u) => u.id === userId);
  if (!user) {
    user = {
      id: userId,
      name: "",
      language: "en",
      createdAt: new Date().toISOString(),
      baselineComplete: false,
    };
    db.users.push(user);
    db.events.push({
      id: randomUUID(),
      type: "USER_REGISTERED",
      userId,
      createdAt: user.createdAt,
    });
    writeDb(db);
  }
  return user;
}

export function updateUser(
  userId: string,
  patch: Partial<Pick<UserProfile, "name" | "language" | "baselineComplete">>
): UserProfile {
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("user not found");
  Object.assign(user, patch);
  writeDb(db);
  return user;
}

export function addCheckIn(userId: string, mood: CheckIn["mood"], note: string): CheckIn {
  const db = readDb();
  const entry: CheckIn = {
    id: randomUUID(),
    userId,
    mood,
    note,
    createdAt: new Date().toISOString(),
  };
  db.checkins.push(entry);
  db.events.push({
    id: randomUUID(),
    type: "MOOD_SIGNAL_CREATED",
    userId,
    createdAt: entry.createdAt,
  });
  writeDb(db);
  return entry;
}

export function listCheckIns(userId: string): CheckIn[] {
  const db = readDb();
  return db.checkins
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addAssessmentResponse(
  userId: string,
  assessmentId: string,
  answers: Record<string, number>,
  score: number,
  band: string
): AssessmentResponse {
  const db = readDb();
  const entry: AssessmentResponse = {
    id: randomUUID(),
    userId,
    assessmentId,
    answers,
    score,
    band,
    createdAt: new Date().toISOString(),
  };
  db.assessmentResponses.push(entry);
  db.events.push({
    id: randomUUID(),
    type: "ASSESSMENT_COMPLETED",
    userId,
    createdAt: entry.createdAt,
    metadata: { assessmentId, score, band },
  });
  writeDb(db);
  return entry;
}

export function listAssessmentResponses(userId: string): AssessmentResponse[] {
  const db = readDb();
  return db.assessmentResponses
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addDayMapSubmission(
  userId: string,
  pattern: string,
  loadPercent: number
): DayMapSubmission {
  const db = readDb();
  const entry: DayMapSubmission = {
    id: randomUUID(),
    userId,
    pattern,
    loadPercent,
    createdAt: new Date().toISOString(),
  };
  db.dayMapSubmissions.push(entry);
  db.events.push({
    id: randomUUID(),
    type: "DAY_MAP_COMPLETED",
    userId,
    createdAt: entry.createdAt,
    metadata: { pattern, loadPercent },
  });
  writeDb(db);
  return entry;
}

export function logEvent(userId: string, type: string, metadata?: Record<string, unknown>) {
  const db = readDb();
  db.events.push({
    id: randomUUID(),
    type,
    userId,
    createdAt: new Date().toISOString(),
    metadata,
  });
  writeDb(db);
}

export function getAggregateAnalytics() {
  const db = readDb();
  const now = new Date();
  const since = new Date(now);
  since.setDate(since.getDate() - 6);

  const activeUserIds = new Set(
    db.events.filter((e) => new Date(e.createdAt) >= since).map((e) => e.userId)
  );

  const totalParticipants = new Set(db.users.map((u) => u.id)).size;
  const checkinCount = db.checkins.length;
  const assessmentCount = db.assessmentResponses.length;

  const moodValues = db.checkins.map((c) => c.mood);
  const avgMood =
    moodValues.length > 0
      ? Math.round((moodValues.reduce((a, b) => a + b, 0) / moodValues.length) * 100) / 100
      : 0;

  const bandCounts: Record<string, number> = {};
  for (const r of db.assessmentResponses) {
    bandCounts[r.band] = (bandCounts[r.band] ?? 0) + 1;
  }

  const patternCounts: Record<string, number> = {};
  for (const d of db.dayMapSubmissions) {
    patternCounts[d.pattern] = (patternCounts[d.pattern] ?? 0) + 1;
  }
  const avgLoad =
    db.dayMapSubmissions.length > 0
      ? Math.round(
          db.dayMapSubmissions.reduce((sum, d) => sum + d.loadPercent, 0) /
            db.dayMapSubmissions.length
        )
      : 0;

  const trend: { date: string; checkins: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const checkins = db.checkins.filter((c) => c.createdAt.slice(0, 10) === key).length;
    trend.push({ date: key, checkins });
  }

  return {
    totalParticipants,
    activeParticipants: activeUserIds.size,
    checkinCount,
    assessmentCount,
    avgMood,
    bandCounts,
    patternCounts,
    avgLoad,
    dayMapCount: db.dayMapSubmissions.length,
    trend,
  };
}
