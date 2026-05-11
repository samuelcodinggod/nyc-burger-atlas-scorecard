import { useMemo } from 'react';
import { useAppState } from '@/state/AppState';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatPrice, rankBurgersByGroup } from '@/lib/burger-utils';
import { MapPin, Star } from 'lucide-react';
import type { Burger } from '@/types/burger';

export function BurgerList() {
  const { burgers, selectedRank, setSelectedRank, setPanel, sortMode, ratings, participants } =
    useAppState();

  const ordered = useMemo(() => {
    if (sortMode === 'editorial') return [...burgers].sort((a, b) => a.rank - b.rank);
    const priceOr = (p: number | null) => (p == null ? Number.POSITIVE_INFINITY : p);
    if (sortMode === 'price-asc')
      return [...burgers].sort((a, b) => priceOr(a.price) - priceOr(b.price));
    if (sortMode === 'price-desc')
      return [...burgers].sort((a, b) => priceOr(b.price) - priceOr(a.price));
    const ranked = rankBurgersByGroup(burgers, ratings);
    return ranked.map((r) => r.burger);
  }, [burgers, sortMode, ratings]);

  const groupAverages = useMemo(() => {
    const m = new Map<number, number | null>();
    const ranked = rankBurgersByGroup(burgers, ratings);
    ranked.forEach((r) => m.set(r.burger.rank, r.group.average));
    return m;
  }, [burgers, ratings]);

  return (
    <div className="h-full overflow-y-auto scroll-thin" data-testid="burger-list">
      <ul className="divide-y divide-border">
        {ordered.map((b, idx) => {
          const isSel = b.rank === selectedRank;
          const groupAvg = groupAverages.get(b.rank) ?? null;
          return (
            <li key={b.rank}>
              <button
                type="button"
                data-testid={`button-list-item-${b.rank}`}
                onClick={() => {
                  setSelectedRank(b.rank);
                  setPanel('detail');
                }}
                className={cn(
                  'w-full text-left px-4 py-3 flex gap-3 items-start transition-colors',
                  'hover:bg-muted/60 focus:bg-muted/60 focus:outline-none',
                  isSel && 'bg-primary/10 hover:bg-primary/15'
                )}
              >
                <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
                  <RankBadge rank={b.rank} editorial={sortMode !== 'group'} groupIdx={idx} />
                </div>
                <Thumb burger={b} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold text-[15px] leading-tight truncate text-foreground">
                      {b.restaurant}
                    </h3>
                    <span className="tabular text-[13px] font-semibold text-foreground/80 shrink-0">
                      {formatPrice(b)}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground truncate mt-0.5">
                    {b.burger_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11.5px] text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{b.neighborhood} · {b.borough}</span>
                  </div>
                  {participants.length > 0 && (
                    <div className="mt-1.5">
                      {groupAvg != null ? (
                        <Badge variant="secondary" className="gap-1 tabular">
                          <Star className="size-3 fill-current text-accent" />
                          <span className="font-bold">{groupAvg.toFixed(1)}</span>
                          <span className="text-muted-foreground">group avg</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Not rated yet
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RankBadge({
  rank,
  editorial,
  groupIdx,
}: {
  rank: number;
  editorial: boolean;
  groupIdx: number;
}) {
  const label = editorial ? rank : groupIdx + 1;
  const top = editorial ? rank <= 3 : groupIdx < 3;
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center size-8 rounded-full font-black text-[12px] tabular border',
        top
          ? 'bg-accent text-accent-foreground border-accent'
          : 'bg-card text-foreground border-border'
      )}
    >
      {label}
    </span>
  );
}

function Thumb({ burger }: { burger: Burger }) {
  return (
    <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
      {burger.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={burger.image_url}
          alt={`${burger.restaurant} burger`}
          className="size-full object-cover"
          loading="lazy"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
      ) : (
        <div className="size-full flex items-center justify-center text-muted-foreground text-xs">
          🍔
        </div>
      )}
    </div>
  );
}
