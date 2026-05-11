import { useAppState } from '@/state/AppState';
import { Moon, Sun, ClipboardList, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header({ onShowAbout }: { onShowAbout: () => void }) {
  const { sortMode, setSortMode, panel, setPanel, participants } = useAppState();
  const [dark, setDark] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <header className="h-14 shrink-0 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-30">
      <div className="h-full px-3 sm:px-4 flex items-center gap-2 sm:gap-3">
        <Logo className="size-7 text-primary shrink-0" />
        <div className="min-w-0 hidden sm:block">
          <h1 className="font-black text-[15px] tracking-tight leading-none truncate">
            NYC Burger Atlas
          </h1>
          <p className="text-[10.5px] text-muted-foreground leading-none mt-1 tracking-wide">
            Top 25 · Editorial + tour scorecard
          </p>
        </div>
        <h1 className="sm:hidden font-black text-[14px] tracking-tight leading-none truncate min-w-0">
          Burger Atlas
        </h1>

        <div className="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-[12px] hidden sm:inline-flex" data-testid="button-sort">
              Sort: {sortLabel(sortMode)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortMode('editorial')}>
              Editorial rank
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortMode('group')}
              disabled={participants.length === 0}
            >
              Group score
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortMode('price-asc')}>
              Price ↑
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortMode('price-desc')}>
              Price ↓
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant={panel === 'scorecard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPanel(panel === 'scorecard' ? 'detail' : 'scorecard')}
          className="gap-1.5 text-[12px]"
          data-testid="button-toggle-scorecard"
        >
          <ClipboardList className="size-3.5" />
          <span className="hidden sm:inline">Scorecard</span>
          {participants.length > 0 && (
            <span className="tabular text-[11px] font-black rounded-full px-1.5 py-0.5 bg-background text-foreground border border-border">
              {participants.length}
            </span>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onShowAbout}
          aria-label="About"
          data-testid="button-about"
          className="size-9 hidden sm:inline-flex"
        >
          <Info className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDark((d) => !d)}
          aria-label="Toggle theme"
          data-testid="button-theme"
          className="size-9"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </div>
    </header>
  );
}

function sortLabel(s: string) {
  if (s === 'editorial') return 'Editor';
  if (s === 'group') return 'Group';
  if (s === 'price-asc') return 'Price ↑';
  if (s === 'price-desc') return 'Price ↓';
  return s;
}
