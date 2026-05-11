import { useAppState } from '@/state/AppState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/burger-utils';
import { ExternalLink, MapPin, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Burger } from '@/types/burger';

export function BurgerDetail() {
  const { burgers, selectedRank, setSelectedRank, setPanel } = useAppState();
  const burger = burgers.find((b) => b.rank === selectedRank) ?? burgers[0];

  if (!burger) return null;
  const idx = burgers.findIndex((b) => b.rank === burger.rank);
  const prev = burgers[(idx - 1 + burgers.length) % burgers.length];
  const next = burgers[(idx + 1) % burgers.length];

  return (
    <div className="h-full flex flex-col" data-testid="burger-detail">
      <div className="relative">
        <div className="aspect-[16/10] bg-muted overflow-hidden">
          {burger.image_url ? (
            <img
              src={burger.image_url}
              alt={`${burger.restaurant} — ${burger.burger_name}`}
              className="size-full object-cover"
              loading="eager"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
          ) : (
            <div className="size-full flex items-center justify-center text-6xl">🍔</div>
          )}
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="inline-flex items-center justify-center size-10 rounded-full bg-accent text-accent-foreground font-black text-sm tabular shadow-md">
            {burger.rank}
          </span>
          <Badge className="bg-background/90 text-foreground border-border tabular">
            {formatPrice(burger)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          <Button
            size="icon"
            variant="secondary"
            className="size-9 shadow-md"
            onClick={() => setSelectedRank(prev.rank)}
            data-testid="button-prev-burger"
            aria-label="Previous burger"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="size-9 shadow-md"
            onClick={() => setSelectedRank(next.rank)}
            data-testid="button-next-burger"
            aria-label="Next burger"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-thin">
        <div className="p-5 space-y-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-primary mb-1">
              #{burger.rank} editorial rank
            </p>
            <h2
              className="text-xl font-black leading-tight"
              data-testid={`text-restaurant-${burger.rank}`}
            >
              {burger.restaurant}
            </h2>
            <p className="text-[15px] text-foreground/80 font-medium mt-0.5">
              {burger.burger_name}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1.5">
              <MapPin className="size-3" />
              {burger.neighborhood} · {burger.borough}
            </Badge>
            <Badge variant="secondary" className="tabular">{formatPrice(burger)}</Badge>
          </div>

          <p className="text-[14px] leading-relaxed text-foreground/90">{burger.description}</p>

          <div className="rounded-lg border border-border bg-muted/30 p-3.5">
            <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-1.5">
              Why it ranks
            </p>
            <p className="text-[13px] leading-relaxed text-foreground/85">
              {burger.score_rationale}
            </p>
          </div>

          <ListAppearances burger={burger} />

          <div className="space-y-2">
            <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Sources
            </p>
            <ul className="space-y-1.5">
              {burger.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-primary hover:underline inline-flex items-center gap-1.5"
                    data-testid={`link-source-${burger.rank}`}
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{s.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-[11px] text-muted-foreground border-t border-border pt-3">
            <div className="flex items-start gap-2">
              <MapPin className="size-3 mt-0.5 shrink-0" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${burger.restaurant} ${burger.address}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                {burger.address}
              </a>
            </div>
            {burger.image_attribution && (
              <p className="mt-1">Photo: {burger.image_attribution}</p>
            )}
          </div>

          <Button
            className="w-full gap-2"
            onClick={() => setPanel('scorecard')}
            data-testid={`button-rate-${burger.rank}`}
          >
            <ClipboardList className="size-4" />
            Rate this burger on the tour scorecard
          </Button>
        </div>
      </div>
    </div>
  );
}

function ListAppearances({ burger }: { burger: Burger }) {
  if (!burger.list_appearances?.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
        On these lists
      </p>
      <ul className="space-y-1">
        {burger.list_appearances.map((a) => (
          <li
            key={a}
            className="text-[12.5px] text-foreground/80 flex gap-2 items-start"
          >
            <span className="text-accent mt-0.5">●</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
