import { useEffect, useMemo, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { BurgerMap } from '@/components/BurgerMap';
import { BurgerList } from '@/components/BurgerList';
import { BurgerDetail } from '@/components/BurgerDetail';
import { Scorecard } from '@/components/Scorecard';
import { useAppState } from '@/state/AppState';
import { AboutSheet } from '@/components/AboutSheet';
import { cn } from '@/lib/utils';
import { MapPin, DollarSign, Trophy, Users, ClipboardList, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rankBurgersByGroup } from '@/lib/burger-utils';

export default function Home() {
  const { burgers, panel, setPanel, ratings, participants } = useAppState();
  const [aboutOpen, setAboutOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const prevPanel = useRef(panel);
  const mounted = useRef(false);

  // When the user toggles between detail and scorecard, scroll the panel into
  // view so it isn't hidden below the map fold. Skip the initial mount.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prevPanel.current = panel;
      return;
    }
    if (prevPanel.current !== panel && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevPanel.current = panel;
  }, [panel]);

  const stats = useMemo(() => {
    const neighborhoods = new Set(burgers.map((b) => b.neighborhood)).size;
    const priced = burgers.filter((b) => b.price != null);
    const avgPrice = priced.length
      ? Math.round(priced.reduce((a, b) => a + (b.price ?? 0), 0) / priced.length)
      : null;
    const grouped = rankBurgersByGroup(burgers, ratings).filter((r) => r.group.average != null);
    const leader = grouped[0] ?? null;
    return { neighborhoods, avgPrice, leader };
  }, [burgers, ratings]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-30">
        <Header onShowAbout={() => setAboutOpen(true)} />
      </div>

      <main className="flex-1 flex flex-col">
        {/* Intro / KPI strip */}
        <section className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold tracking-[0.22em] uppercase text-primary">
                  The NYC Burger Atlas
                </p>
                <h2 className="font-black text-[22px] sm:text-[26px] leading-tight mt-1">
                  Top {burgers.length} burgers, mapped end-to-end
                </h2>
                <p className="text-[13px] text-muted-foreground mt-1 max-w-xl">
                  Click any pin to surface the editorial story, address, and rate it on
                  the group tour scorecard.
                </p>
              </div>
              <KpiStrip
                count={burgers.length}
                neighborhoods={stats.neighborhoods}
                avgPrice={stats.avgPrice}
                leader={stats.leader?.burger.restaurant ?? null}
                raters={participants.length}
              />
            </div>
          </div>
        </section>

        {/* Map hero */}
        <section className="px-3 sm:px-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-md">
              <div className="relative w-full h-[58vh] min-h-[420px] max-h-[760px]">
                <BurgerMap />
              </div>
            </div>
          </div>
        </section>

        {/* Detail / list / scorecard grid */}
        <section
          ref={panelRef}
          className="px-3 sm:px-6 pt-5 sm:pt-7 pb-10"
          aria-label="Burger detail, ranking and scorecard"
        >
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px] gap-4 lg:gap-6">
            {/* Left/main: detail or scorecard */}
            <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm min-w-0 flex flex-col">
              <PanelTabs panel={panel} setPanel={setPanel} />
              <div className="min-w-0 flex-1 flex flex-col">
                {panel === 'detail' ? <BurgerDetail /> : <Scorecard />}
              </div>
            </div>

            {/* Right/aside: ranked list */}
            <aside className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm min-w-0 flex flex-col lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)]">
              <ListHeader />
              <div className="flex-1 min-h-0 overflow-y-auto scroll-thin">
                <BurgerList />
              </div>
            </aside>
          </div>
        </section>

        <Footer onShowAbout={() => setAboutOpen(true)} />
      </main>

      <AboutSheet open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}

function PanelTabs({
  panel,
  setPanel,
}: {
  panel: 'detail' | 'scorecard';
  setPanel: (p: 'detail' | 'scorecard') => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b border-border bg-card/80 px-3 py-2">
      <TabButton active={panel === 'detail'} onClick={() => setPanel('detail')}>
        <BookOpen className="size-3.5" />
        Burger detail
      </TabButton>
      <TabButton active={panel === 'scorecard'} onClick={() => setPanel('scorecard')}>
        <ClipboardList className="size-3.5" />
        Tour scorecard
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-semibold transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-foreground/70 hover:text-foreground hover:bg-muted/60'
      )}
    >
      {children}
    </button>
  );
}

function KpiStrip({
  count,
  neighborhoods,
  avgPrice,
  leader,
  raters,
}: {
  count: number;
  neighborhoods: number;
  avgPrice: number | null;
  leader: string | null;
  raters: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 shrink-0">
      <Kpi icon={<MapPin className="size-3.5" />} label="Mapped" value={`${count}`} />
      <Kpi
        icon={<MapPin className="size-3.5" />}
        label="Neighborhoods"
        value={`${neighborhoods}`}
      />
      <Kpi
        icon={<DollarSign className="size-3.5" />}
        label="Avg price"
        value={avgPrice != null ? `$${avgPrice}` : '—'}
      />
      <Kpi
        icon={leader ? <Trophy className="size-3.5" /> : <Users className="size-3.5" />}
        label={leader ? 'Group leader' : 'Raters'}
        value={leader ?? `${raters}`}
        compact
      />
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  compact,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm min-w-0">
      <div className="flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p
        className={cn(
          'font-black leading-tight tabular truncate',
          compact ? 'text-[15px]' : 'text-[20px]'
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ListHeader() {
  const { burgers, sortMode } = useAppState();
  return (
    <div className="px-4 pt-4 pb-3 border-b border-border bg-card/80">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-primary">
            The Ranking
          </p>
          <h2 className="font-black text-[15px] leading-tight mt-0.5 truncate">
            {burgers.length} burgers across NYC
          </h2>
        </div>
        <span className="text-[10.5px] text-muted-foreground tracking-wide shrink-0">
          {sortLabelShort(sortMode)}
        </span>
      </div>
      <p className="text-[11.5px] text-muted-foreground mt-1">
        Tap a name to focus the map & detail above.
      </p>
    </div>
  );
}

function sortLabelShort(s: string) {
  if (s === 'editorial') return 'sorted: editorial';
  if (s === 'group') return 'sorted: group score';
  if (s === 'price-asc') return 'sorted: price ↑';
  if (s === 'price-desc') return 'sorted: price ↓';
  return '';
}

function Footer({ onShowAbout }: { onShowAbout: () => void }) {
  return (
    <footer className="border-t border-border bg-card/40 py-4 px-3 sm:px-6">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
        <span>NYC Burger Atlas · Editorial + tour scorecard · May 2026</span>
        <Button variant="ghost" size="sm" onClick={onShowAbout} className="text-[12px]">
          About this list
        </Button>
      </div>
    </footer>
  );
}
