import { useState } from 'react';
import { Header } from '@/components/Header';
import { BurgerMap } from '@/components/BurgerMap';
import { BurgerList } from '@/components/BurgerList';
import { BurgerDetail } from '@/components/BurgerDetail';
import { Scorecard } from '@/components/Scorecard';
import { useAppState } from '@/state/AppState';
import { AboutSheet } from '@/components/AboutSheet';
import { cn } from '@/lib/utils';

export default function Home() {
  const { viewMode, panel } = useAppState();
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <Header onShowAbout={() => setAboutOpen(true)} />

      {/* Desktop / tablet: 3-column layout. Mobile: stack. */}
      <main className="flex-1 min-h-0 lg:grid lg:grid-cols-[340px_minmax(0,1fr)_400px] xl:grid-cols-[380px_minmax(0,1fr)_440px] flex flex-col lg:flex-row">
        {/* Left: list always visible on lg+ */}
        <aside
          className={cn(
            'border-r border-border bg-sidebar/40 min-h-0 h-full overflow-hidden',
            'hidden lg:flex flex-col'
          )}
          aria-label="Burger list"
        >
          <ListHeader />
          <div className="flex-1 min-h-0">
            <BurgerList />
          </div>
        </aside>

        {/* Center: map or list (mobile gets list when list mode selected) */}
        <section className="relative min-h-0 h-[55vh] lg:h-full bg-background overflow-hidden">
          {viewMode === 'map' ? (
            <BurgerMap />
          ) : (
            <div className="h-full lg:hidden">
              <BurgerList />
            </div>
          )}
          {/* On desktop list mode, still show map as background but dimmed feels weird;
              instead, keep map as main and list on the left. So in lg+ always show map. */}
          {viewMode === 'list' && (
            <div className="hidden lg:block absolute inset-0">
              <BurgerMap />
            </div>
          )}
        </section>

        {/* Right: detail/scorecard. On mobile, slides up via aboutOpen-style approach? Simpler: stack below map. */}
        <aside
          className="border-t lg:border-t-0 lg:border-l border-border bg-card min-h-0 lg:h-full overflow-hidden flex flex-col flex-1"
          aria-label="Detail and scorecard"
        >
          {panel === 'detail' ? <BurgerDetail /> : <Scorecard />}
        </aside>
      </main>

      <AboutSheet open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}

function ListHeader() {
  const { burgers } = useAppState();
  return (
    <div className="px-4 pt-4 pb-3 border-b border-border bg-card/60">
      <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-primary">
        The Ranking
      </p>
      <h2 className="font-black text-[15px] leading-tight mt-0.5">
        {burgers.length} burgers across NYC
      </h2>
      <p className="text-[11.5px] text-muted-foreground mt-0.5">
        Click a name to focus the map & detail.
      </p>
    </div>
  );
}
