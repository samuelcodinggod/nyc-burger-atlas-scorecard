import type { Burger, Rating, Participant } from '@/types/burger';

export const PARTICIPANT_COLORS = [
  '#E25C3B', // coral
  '#E8AF34', // gold
  '#4F98A3', // teal
  '#A86FDF', // purple
  '#6DAA45', // green
  '#DD6974', // rose
  '#5591C7', // blue
  '#BB653B', // amber
];

export function pickColor(index: number) {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

export function formatPrice(b: Burger): string {
  if (b.price == null || Number.isNaN(b.price)) return 'Market';
  const prefix = b.price_approximate ? '~' : '';
  return `${prefix}$${b.price.toFixed(0)}`;
}

export interface GroupScore {
  burgerRank: number;
  average: number | null;
  count: number;
  individual: { participantId: string; score: number }[];
  favorites: string[]; // participant ids
  spread: number; // max - min
}

export function computeGroupScores(
  burgers: Burger[],
  ratings: Rating[]
): Map<number, GroupScore> {
  const map = new Map<number, GroupScore>();
  for (const b of burgers) {
    const rs = ratings.filter((r) => r.burgerRank === b.rank);
    if (rs.length === 0) {
      map.set(b.rank, {
        burgerRank: b.rank,
        average: null,
        count: 0,
        individual: [],
        favorites: [],
        spread: 0,
      });
      continue;
    }
    const scores = rs.map((r) => r.score);
    const avg = scores.reduce((a, c) => a + c, 0) / scores.length;
    map.set(b.rank, {
      burgerRank: b.rank,
      average: avg,
      count: rs.length,
      individual: rs.map((r) => ({ participantId: r.participantId, score: r.score })),
      favorites: rs.filter((r) => r.favorite).map((r) => r.participantId),
      spread: Math.max(...scores) - Math.min(...scores),
    });
  }
  return map;
}

export function rankBurgersByGroup(
  burgers: Burger[],
  ratings: Rating[]
): { burger: Burger; group: GroupScore }[] {
  const scores = computeGroupScores(burgers, ratings);
  return burgers
    .map((b) => ({ burger: b, group: scores.get(b.rank)! }))
    .sort((a, b) => {
      const av = a.group.average;
      const bv = b.group.average;
      if (av == null && bv == null) return a.burger.rank - b.burger.rank;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (bv !== av) return bv - av;
      // tiebreaker: more raters wins, then editorial rank
      if (b.group.count !== a.group.count) return b.group.count - a.group.count;
      return a.burger.rank - b.burger.rank;
    });
}

export function rankBurgersForParticipant(
  burgers: Burger[],
  ratings: Rating[],
  participantId: string
): { burger: Burger; score: number | null; favorite: boolean }[] {
  return burgers
    .map((b) => {
      const r = ratings.find(
        (x) => x.burgerRank === b.rank && x.participantId === participantId
      );
      return { burger: b, score: r?.score ?? null, favorite: !!r?.favorite };
    })
    .sort((a, b) => {
      if (a.score == null && b.score == null) return a.burger.rank - b.burger.rank;
      if (a.score == null) return 1;
      if (b.score == null) return -1;
      return b.score - a.score;
    });
}

export function buildScorecardSummary(
  burgers: Burger[],
  participants: Participant[],
  ratings: Rating[]
): string {
  const ranked = rankBurgersByGroup(burgers, ratings);
  const ratedOnly = ranked.filter((r) => r.group.average != null);

  const lines: string[] = [];
  lines.push('NYC BURGER TOUR — Group Scorecard');
  lines.push(`Participants: ${participants.map((p) => p.name).join(', ') || '—'}`);
  lines.push('');
  if (ratedOnly.length === 0) {
    lines.push('No ratings yet. Pick a burger and start scoring.');
    return lines.join('\n');
  }

  lines.push('GROUP RANKING (by average score, 0–10):');
  ratedOnly.forEach((r, i) => {
    const avg = r.group.average!.toFixed(2);
    const fav =
      r.group.favorites.length > 0
        ? ` ★${r.group.favorites
            .map((id) => participants.find((p) => p.id === id)?.name)
            .filter(Boolean)
            .join(', ')}`
        : '';
    lines.push(
      `${i + 1}. ${r.burger.restaurant} — ${r.burger.burger_name} · avg ${avg}/10 (${r.group.count}/${participants.length} rated)${fav}`
    );
  });

  lines.push('');
  lines.push('INDIVIDUAL TOP PICKS:');
  for (const p of participants) {
    const personal = rankBurgersForParticipant(burgers, ratings, p.id).filter(
      (r) => r.score != null
    );
    if (personal.length === 0) {
      lines.push(`${p.name}: no ratings yet`);
      continue;
    }
    const top = personal[0];
    lines.push(
      `${p.name}: ${top.burger.restaurant} (${top.score!.toFixed(1)}/10)`
    );
  }
  return lines.join('\n');
}

export function scoreBucket(score: number): 'top' | 'high' | 'mid' | 'low' {
  if (score >= 9) return 'top';
  if (score >= 7.5) return 'high';
  if (score >= 5) return 'mid';
  return 'low';
}
