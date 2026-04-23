export type CategoryKey =
  | "pros"
  | "cons"
  | "risks"
  | "opportunities"
  | "shortTermImpact"
  | "longTermImpact";

export interface Reflection {
  summary: string;
  categories: Record<CategoryKey, { title: string; points: string[] }>;
  reflection: string;
  questions: string[];
  clarityScore: number;
  clarityLabel: string;
}

export interface DecisionRecord {
  id: string;
  decision: string;
  context?: string;
  reflection: Reflection;
  createdAt: number;
}

const KEY = "clarifier.decisions.v1";

export function loadDecisions(): DecisionRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DecisionRecord[];
  } catch {
    return [];
  }
}

export function saveDecision(rec: DecisionRecord) {
  const all = loadDecisions();
  all.unshift(rec);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 200)));
}

export function deleteDecision(id: string) {
  const all = loadDecisions().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function clearAll() {
  localStorage.removeItem(KEY);
}

export const CATEGORY_ORDER: CategoryKey[] = [
  "pros",
  "cons",
  "risks",
  "opportunities",
  "shortTermImpact",
  "longTermImpact",
];
