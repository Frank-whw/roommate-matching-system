/*
 * 功能：
 * 1) 计算两位用户的匹配度（0-100）与细项拆分
 * 2) 为指定用户生成候选推荐（过滤硬条件 + 排序）
 * 3) 点赞/取消赞，并在互相点赞时落地到 matches 表
 * 4) 查询已互相匹配的对象
 */

import { and, eq, ne, sql, inArray } from "drizzle-orm";
import { db } from "@/lib/db"; 
import {
  users,
  userProfiles,
  userLikes,
  matches,
  teams,
  teamMembers,
} from "@/db/schema"; // 按你的项目路径调整

/* --------------------------------------------------
 * 类型定义
 * -------------------------------------------------- */
export type StudyHabit = "library" | "dormitory" | "flexible";
export type Lifestyle = "quiet" | "social" | "balanced";
export type Cleanliness = "extremely_clean" | "regularly_tidy" | "acceptable";
export type Gender = "male" | "female" | "other";
export type MBTI =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP" | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ" | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export interface UserProfileRow {
  id: number;
  userId: number;
  wechatId: string | null;
  gender: Gender | null;
  age: number | null;
  sleepTime: string | null; // "22:30"
  wakeTime: string | null;  // "07:00"
  studyHabit: StudyHabit | null;
  lifestyle: Lifestyle | null;
  cleanliness: Cleanliness | null;
  mbti: MBTI | null;
  roommateExpectations: string | null;
  hobbies: string | null;
  dealBreakers: string | null;
  bio: string | null;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchWeights {
  sleepTime?: number;       // 默认 3
  wakeTime?: number;        // 默认 3
  studyHabit?: number;      // 默认 2
  lifestyle?: number;       // 默认 2
  cleanliness?: number;     // 默认 2
  mbti?: number;            // 默认 1
  hobbies?: number;         // 默认 3
  expectations?: number;    // 默认 1
}

export interface MatchBreakdownItem {
  key:
    | "sleepTime"
    | "wakeTime"
    | "studyHabit"
    | "lifestyle"
    | "cleanliness"
    | "mbti"
    | "hobbies"
    | "expectations";
  weight: number;
  similarity: number; // 0 ~ 1
  note?: string;      
}

export interface MatchResult {
  aUserId: number;
  bUserId: number;
  score: number;                      // 0 ~ 100
  breakdown: MatchBreakdownItem[];    // 细项拆分
}

export interface RecommendOptions {
  limit?: number;                  // 返回数量，默认 20
  sameGenderOnly?: boolean;        // 只同性别，默认 true
  excludeAlreadyMatched?: boolean; // 排除已在 matches 中的对象，默认 true
  excludeTeamFull?: boolean;       // 排除已满员队伍中的用户，默认 true
  minProfileComplete?: boolean;    // 仅展示资料完成的用户，默认 true
  hardDealBreakers?: boolean;      // 启用 dealBreakers 过滤，默认 true
  weights?: MatchWeights;          // 权重
}

/* --------------------------------------------------
 * 工具函数
 * -------------------------------------------------- */

const DEFAULT_WEIGHTS: Required<MatchWeights> = {
  sleepTime: 3,
  wakeTime: 3,
  studyHabit: 2,
  lifestyle: 2,
  cleanliness: 2,
  mbti: 1,
  hobbies: 3,
  expectations: 1,
};

const STOP_WORDS = new Set(
  [
    "the","a","an","and","or","but","to","of","in","on","for","with","at","by","from",
    "我","的","了","和","与","及","在","对","为","你","我","他","她","它","我们","他们","以及",
  ]
);

function timeStrToMinutes(t?: string | null): number | null {
  if (!t) return null;
  const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(t.trim());
  if (!m) return null;
  const hh = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  return hh * 60 + mm;
}

function circadianSimilarity(aMin: number | null, bMin: number | null): number {
  // 将 24h 环形处理，差值取 0~720 之间最小角距离
  if (aMin == null || bMin == null) return 0.5; // 缺失值给中性分
  const diff = Math.abs(aMin - bMin);
  const circular = Math.min(diff, 1440 - diff);
  // 0 分钟差 -> 1.0，相差 >= 6 小时(360 分钟) -> 接近 0
  const sim = Math.max(0, 1 - circular / 360);
  return +sim.toFixed(4);
}

function categoricalSimilarity(a?: string | null, b?: string | null): number {
  if (!a || !b) return 0.5; // 缺失值中性
  return a === b ? 1 : 0;
}

function tokenize(text?: string | null): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w));
}

function jaccardSimilarity(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0.5;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0.5 : +(inter / union).toFixed(4);
}

function cosineSimilarity(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0.5;
  const freqA = new Map<string, number>();
  const freqB = new Map<string, number>();
  for (const w of a) freqA.set(w, (freqA.get(w) || 0) + 1);
  for (const w of b) freqB.set(w, (freqB.get(w) || 0) + 1);
  const vocab = new Set([...freqA.keys(), ...freqB.keys()]);
  let dot = 0, nA = 0, nB = 0;
  for (const w of vocab) {
    const va = freqA.get(w) || 0;
    const vb = freqB.get(w) || 0;
    dot += va * vb;
    nA += va * va;
    nB += vb * vb;
  }
  const denom = Math.sqrt(nA) * Math.sqrt(nB);
  return denom === 0 ? 0.5 : +(dot / denom).toFixed(4);
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/* --------------------------------------------------
 * 核心：计算匹配度
 * -------------------------------------------------- */

export function computeMatch(
  a: UserProfileRow,
  b: UserProfileRow,
  weights: MatchWeights = {}
): MatchResult {
  const w = { ...DEFAULT_WEIGHTS, ...weights } as Required<MatchWeights>;

  const sleepSim = circadianSimilarity(
    timeStrToMinutes(a.sleepTime),
    timeStrToMinutes(b.sleepTime)
  );

  const wakeSim = circadianSimilarity(
    timeStrToMinutes(a.wakeTime),
    timeStrToMinutes(b.wakeTime)
  );

  const studySim = categoricalSimilarity(a.studyHabit, b.studyHabit);
  const lifeSim = categoricalSimilarity(a.lifestyle, b.lifestyle);
  const cleanSim = categoricalSimilarity(a.cleanliness, b.cleanliness);
  const mbtiSim = categoricalSimilarity(a.mbti, b.mbti);

  const hobbiesSim = cosineSimilarity(tokenize(a.hobbies), tokenize(b.hobbies));
  const expSim = jaccardSimilarity(
    tokenize(a.roommateExpectations),
    tokenize(b.roommateExpectations)
  );

  const breakdown: MatchBreakdownItem[] = [
    { key: "sleepTime", weight: w.sleepTime, similarity: sleepSim, note: `作息接近度` },
    { key: "wakeTime", weight: w.wakeTime, similarity: wakeSim, note: `起床时间接近度` },
    { key: "studyHabit", weight: w.studyHabit, similarity: studySim, note: `学习习惯一致性` },
    { key: "lifestyle", weight: w.lifestyle, similarity: lifeSim, note: `生活方式一致性` },
    { key: "cleanliness", weight: w.cleanliness, similarity: cleanSim, note: `清洁习惯一致性` },
    { key: "mbti", weight: w.mbti, similarity: mbtiSim, note: `MBTI 类型一致性` },
    { key: "hobbies", weight: w.hobbies, similarity: hobbiesSim, note: `兴趣相似度（余弦）` },
    { key: "expectations", weight: w.expectations, similarity: expSim, note: `室友期待（Jaccard）` },
  ];

  const totalW = breakdown.reduce((s, x) => s + x.weight, 0);
  const weighted = breakdown.reduce((s, x) => s + x.weight * clamp01(x.similarity), 0);
  const score = Math.round((weighted / totalW) * 100);

  return {
    aUserId: a.userId,
    bUserId: b.userId,
    score,
    breakdown,
  };
}

/* --------------------------------------------------
 * 候选获取与过滤
 * -------------------------------------------------- */

async function getProfile(userId: number): Promise<UserProfileRow | null> {
  const row = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  });
  return row as unknown as UserProfileRow | null;
}

async function getProfilesByUserIds(userIds: number[]): Promise<UserProfileRow[]> {
  if (!userIds.length) return [];
  const rows = await db.query.userProfiles.findMany({
    where: inArray(userProfiles.userId, userIds),
  });
  return rows as unknown as UserProfileRow[];
}

async function getAllCandidateUserIds(currentUserId: number, opts: RecommendOptions): Promise<number[]> {
  const sameGenderOnly = opts.sameGenderOnly ?? true;
  const excludeAlreadyMatched = opts.excludeAlreadyMatched ?? true;
  const excludeTeamFull = opts.excludeTeamFull ?? true;
  const minProfileComplete = opts.minProfileComplete ?? true;

  const me = await getProfile(currentUserId);
  if (!me) return [];

  // 基础候选：所有除自己外的用户
  // 这里为了简化，分步查询。生产可根据需要写成单条 SQL。
  const allProfiles = (await db.query.userProfiles.findMany({})).filter(
    (p: any) => p.userId !== currentUserId
  ) as UserProfileRow[];

  // 过滤：资料完整
  let candidates = minProfileComplete
    ? allProfiles.filter((p) => p.isProfileComplete)
    : allProfiles;

  // 过滤：同性别
  if (sameGenderOnly && me.gender) {
    candidates = candidates.filter((p) => p.gender === me.gender);
  }

  // 过滤：已互相匹配的对象
  if (excludeAlreadyMatched) {
    const matchedRows = await db
      .select({ id: matches.id, u1: matches.user1Id, u2: matches.user2Id })
      .from(matches)
      .where(
        sql`${matches.user1Id} = ${currentUserId} OR ${matches.user2Id} = ${currentUserId}`
      );
    const matchedIds = new Set<number>();
    for (const r of matchedRows) {
      matchedIds.add(r.u1);
      matchedIds.add(r.u2);
    }
    matchedIds.delete(currentUserId);
    candidates = candidates.filter((p) => !matchedIds.has(p.userId));
  }

  // 过滤：已满员队伍
  if (excludeTeamFull) {
    // 找出所有在满员队伍中的用户
    const fullTeams = await db
      .select({ id: teams.id })
      .from(teams)
      .where(sql`${teams.currentMembers} >= ${teams.maxMembers}`);
    const fullTeamIds = fullTeams.map((t) => t.id);
    if (fullTeamIds.length) {
      const fullTeamMembers = await db
        .select({ userId: teamMembers.userId })
        .from(teamMembers)
        .where(inArray(teamMembers.teamId, fullTeamIds));
      const inFullTeam = new Set(fullTeamMembers.map((r) => r.userId));
      candidates = candidates.filter((p) => !inFullTeam.has(p.userId));
    }
  }

  // 过滤：硬性拒绝，简化策略：若 A 的 dealBreakers 中出现 B 的描述关键词，则剔除
  if (opts.hardDealBreakers ?? true) {
    const meDB = new Set(tokenize(me.dealBreakers));
    candidates = candidates.filter((p) => {
      const hisBio = new Set(tokenize(p.bio));
      // 若任意 dealBreaker 词出现在对方 bio 中，则不推荐
      for (const w of meDB) if (hisBio.has(w)) return false;
      const hisDB = new Set(tokenize(p.dealBreakers));
      const myBio = new Set(tokenize(me.bio));
      for (const w of hisDB) if (myBio.has(w)) return false;
      return true;
    });
  }

  return candidates.map((p) => p.userId);
}
/**
 * 为用户生成四人间宿舍分配。
 * 确保每个宿舍组合为四人，尽量按匹配相似度聚合。
 */
export async function assignDormRooms(
    userIds: number[],
    weights: MatchWeights = {},
  ): Promise<{ room: number[]; scores: MatchResult[] }[]> {
  
    const profiles = await getProfilesByUserIds(userIds);
    const assigned = new Set<number>();
    const rooms: { room: number[]; scores: MatchResult[] }[] = [];
  
    // 预计算两两匹配结果
    const simMap = new Map<string, MatchResult>();
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const a = profiles[i], b = profiles[j];
        const r = computeMatch(a, b, weights);
        simMap.set(`${a.userId},${b.userId}`, r);
        simMap.set(`${b.userId},${a.userId}`, { ...r, aUserId: b.userId, bUserId: a.userId });
      }
    }
  
    while (assigned.size < profiles.length) {
      const remaining = profiles.filter(p => !assigned.has(p.userId));
      const first = remaining[0];
      const sims = remaining
        .filter(p => p.userId !== first.userId)
        .map(p => simMap.get(`${first.userId},${p.userId}`)!)
        .sort((x, y) => y.score - x.score);
  
      const top3 = sims.slice(0, 3).map(r => r.bUserId);
      const group = [first.userId, ...top3];
      const roomScores = group.map((uid, _, arr) => {
        const others = arr.filter(v => v !== uid);
        return others.map(v => simMap.get(`${uid},${v}`)!);
      }).flat();
  
      group.forEach(uid => assigned.add(uid));
      rooms.push({ room: group, scores: roomScores });
    }
  
    return rooms;
  }
/* --------------------------------------------------
 * 点赞 / 取消赞 / 建立匹配
 * -------------------------------------------------- */
export async function likeUser(
  fromUserId: number,
  toUserId: number,
  isLike = true
): Promise<{
  mutual: boolean;
  matchId?: number;
  matchScore?: number;
}> {
  if (fromUserId === toUserId) return { mutual: false };

  // Upsert 到 userLikes（每对用户仅一条记录）
  const exist = await db.query.userLikes.findFirst({
    where: and(eq(userLikes.fromUserId, fromUserId), eq(userLikes.toUserId, toUserId)),
  });
  if (exist) {
    await db
      .update(userLikes)
      .set({ isLike, createdAt: new Date() })
      .where(eq(userLikes.id, (exist as any).id));
  } else {
    await db.insert(userLikes).values({ fromUserId, toUserId, isLike });
  }

  if (!isLike) return { mutual: false };

  // 检查对方是否也 like 了我
  const reverse = await db.query.userLikes.findFirst({
    where: and(eq(userLikes.fromUserId, toUserId), eq(userLikes.toUserId, fromUserId), eq(userLikes.isLike, true)),
  });

  if (!reverse) return { mutual: false };

  // 已存在互相喜欢，检查是否已在 matches
  const existingMatch = await db
    .select({ id: matches.id })
    .from(matches)
    .where(
      sql`(${matches.user1Id} = ${fromUserId} AND ${matches.user2Id} = ${toUserId}) OR (${matches.user1Id} = ${toUserId} AND ${matches.user2Id} = ${fromUserId})`
    );

  if (existingMatch.length) return { mutual: true, matchId: existingMatch[0].id };

  // 计算匹配分数并写入 matches
  const [a, b] = await Promise.all([getProfile(fromUserId), getProfile(toUserId)]);
  if (!a || !b) return { mutual: true };
  const { score } = computeMatch(a, b);

  const inserted = await db
    .insert(matches)
    .values({ user1Id: fromUserId, user2Id: toUserId, matchScore: score, status: "matched" as any })
    .returning({ id: matches.id });

  return { mutual: true, matchId: inserted[0].id, matchScore: score };
}

export async function unlikeUser(
  fromUserId: number,
  toUserId: number
): Promise<void> {
  const row = await db.query.userLikes.findFirst({
    where: and(eq(userLikes.fromUserId, fromUserId), eq(userLikes.toUserId, toUserId)),
  });
  if (!row) return;
  await db.delete(userLikes).where(eq(userLikes.id, (row as any).id));
}

/* --------------------------------------------------
 * 查询：已互相匹配列表
 * -------------------------------------------------- */

export async function listMutualMatches(userId: number) {
  const rows = await db
    .select({ id: matches.id, u1: matches.user1Id, u2: matches.user2Id, score: matches.matchScore, status: matches.status })
    .from(matches)
    .where(sql`${matches.user1Id} = ${userId} OR ${matches.user2Id} = ${userId}`);

  // 把对方的档案拼上
  const peerIds = rows.map((r) => (r.u1 === userId ? r.u2 : r.u1));
  const profiles = await getProfilesByUserIds(peerIds);
  const map = new Map<number, UserProfileRow>();
  for (const p of profiles) map.set(p.userId, p);

  return rows.map((r) => {
    const peerId = r.u1 === userId ? r.u2 : r.u1;
    return {
      matchId: r.id,
      peerUserId: peerId,
      score: r.score ?? null,
      status: r.status,
      profile: map.get(peerId) || null,
    };
  });
}


export function explainBreakdown(b: MatchBreakdownItem[]): string[] {
  return b
    .sort((x, y) => y.weight * y.similarity - x.weight * x.similarity)
    .slice(0, 5)
    .map((x) => {
      const pct = Math.round(x.similarity * 100);
      switch (x.key) {
        case "sleepTime": return `作息时间相近（${pct}%）`;
        case "wakeTime": return `起床时间相近（${pct}%）`;
        case "studyHabit": return `学习习惯一致（${pct}%）`;
        case "lifestyle": return `生活方式相似（${pct}%）`;
        case "cleanliness": return `清洁偏好匹配（${pct}%）`;
        case "mbti": return `MBTI 类型匹配（${pct}%）`;
        case "hobbies": return `兴趣相近（${pct}%）`;
        case "expectations": return `室友期待相符（${pct}%）`;
      }
    })
    .filter(Boolean) as string[];
}

