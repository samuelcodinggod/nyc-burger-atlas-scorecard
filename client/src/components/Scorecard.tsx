import { useMemo, useState } from 'react';
import { useAppState } from '@/state/AppState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  buildScorecardSummary,
  rankBurgersByGroup,
  rankBurgersForParticipant,
} from '@/lib/burger-utils';

import {
  Copy,
  Plus,
  Star,
  Trash2,
  Trophy,
  Users,
  ClipboardCheck,
  Sparkles,
  X,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Burger } from '@/types/burger';

export function Scorecard() {
  const {
    burgers,
    selectedRank,
    setSelectedRank,
    participants,
    addParticipant,
    removeParticipant,
    ratings,
  } = useAppState();

  const [newName, setNewName] = useState('');
  const [tab, setTab] = useState<'rate' | 'rankings' | 'individual'>('rate');
  const { toast } = useToast();

  const selectedBurger = burgers.find((b) => b.rank === selectedRank) ?? burgers[0];

  const groupRanked = useMemo(() => rankBurgersByGroup(burgers, ratings), [burgers, ratings]);
  const ratedCount = groupRanked.filter((r) => r.group.average != null).length;
  const winner = groupRanked.find((r) => r.group.average != null) ?? null;

  const onAdd = () => {
    if (!newName.trim()) return;
    addParticipant(newName);
    setNewName('');
  };

  const onCopy = async () => {
    const summary = buildScorecardSummary(burgers, participants, ratings);
    try {
      await navigator.clipboard.writeText(summary);
      toast({ title: 'Scorecard copied', description: 'Paste it anywhere — chat, notes, email.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Try the Download button instead.', variant: 'destructive' });
    }
  };

  const onDownload = () => {
    const summary = buildScorecardSummary(burgers, participants, ratings);
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nyc-burger-tour-scorecard-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col" data-testid="scorecard">
      <div className="px-5 pt-5 pb-3 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-primary">
              Tour Scorecard
            </p>
            <h2 className="text-lg font-black leading-tight">Rate the burgers, crown the winner</h2>
          </div>
          <Trophy className="size-6 text-accent shrink-0" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
          <Badge variant="secondary" className="gap-1.5">
            <Users className="size-3" /> {participants.length} {participants.length === 1 ? 'rater' : 'raters'}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <ClipboardCheck className="size-3" /> {ratedCount}/{burgers.length} burgers rated
          </Badge>
          {winner && (
            <Badge className="gap-1.5 bg-accent text-accent-foreground border-transparent">
              <Sparkles className="size-3" /> Leader: {winner.burger.restaurant}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-5 mt-3 grid grid-cols-3">
          <TabsTrigger value="rate" data-testid="tab-rate">Rate</TabsTrigger>
          <TabsTrigger value="rankings" data-testid="tab-rankings">Group rankings</TabsTrigger>
          <TabsTrigger value="individual" data-testid="tab-individual">Individual</TabsTrigger>
        </TabsList>

        <TabsContent value="rate" className="flex-1 overflow-y-auto scroll-thin mt-0 px-5 py-4 space-y-5">
          <ParticipantManager
            participants={participants}
            newName={newName}
            setNewName={setNewName}
            onAdd={onAdd}
            onRemove={removeParticipant}
          />

          {participants.length === 0 ? (
            <EmptyState
              icon={<Users className="size-8 text-muted-foreground" />}
              title="Add your crew to start scoring"
              body="Type each friend's name above and hit add. Up to eight raters work nicely."
            />
          ) : (
            <RatingPanel
              burger={selectedBurger}
              onPickAnother={() => setSelectedRank(null)}
            />
          )}
        </TabsContent>

        <TabsContent value="rankings" className="flex-1 overflow-y-auto scroll-thin mt-0 px-5 py-4">
          <GroupRankings />
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <Button onClick={onCopy} className="gap-2" data-testid="button-copy-summary">
              <Copy className="size-4" /> Copy summary
            </Button>
            <Button variant="outline" onClick={onDownload} className="gap-2" data-testid="button-download-summary">
              <Download className="size-4" /> Download .txt
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="individual" className="flex-1 overflow-y-auto scroll-thin mt-0 px-5 py-4">
          <IndividualRankings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ParticipantManager({
  participants,
  newName,
  setNewName,
  onAdd,
  onRemove,
}: {
  participants: ReturnType<typeof useAppState>['participants'];
  newName: string;
  setNewName: (v: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
        Crew
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAdd();
        }}
        className="flex gap-2"
      >
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add a friend…"
          maxLength={20}
          data-testid="input-new-participant"
          className="flex-1"
        />
        <Button type="submit" size="icon" data-testid="button-add-participant" aria-label="Add">
          <Plus className="size-4" />
        </Button>
      </form>
      {participants.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <li key={p.id}>
              <span
                className="inline-flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full text-[12.5px] font-semibold border"
                style={{
                  background: `${p.color}1a`,
                  borderColor: `${p.color}55`,
                  color: 'hsl(var(--foreground))',
                }}
              >
                <span
                  className="inline-block size-2 rounded-full"
                  style={{ background: p.color }}
                />
                {p.name}
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="rounded-full size-5 inline-flex items-center justify-center hover:bg-foreground/10"
                  data-testid={`button-remove-${p.id}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RatingPanel({ burger, onPickAnother }: { burger: Burger; onPickAnother: () => void }) {
  const { participants, ratings, setRating, clearRating } = useAppState();

  if (!burger) return null;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="aspect-[16/8] bg-muted overflow-hidden relative">
          {burger.image_url ? (
            <img
              src={burger.image_url}
              alt={`${burger.restaurant} burger`}
              className="size-full object-cover"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
          ) : (
            <div className="size-full flex items-center justify-center text-5xl">🍔</div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center justify-center size-9 rounded-full bg-accent text-accent-foreground font-black text-sm tabular shadow-md">
            {burger.rank}
          </span>
        </div>
        <div className="p-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold tracking-[0.18em] uppercase text-primary">
              Now rating
            </p>
            <p className="font-black text-base leading-tight truncate" data-testid="text-rating-target">
              {burger.restaurant}
            </p>
            <p className="text-[12.5px] text-muted-foreground truncate">{burger.burger_name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onPickAnother} className="text-[12px]">
            Pick another
          </Button>
        </div>
      </div>

      <ul className="space-y-3">
        {participants.map((p) => {
          const rating = ratings.find(
            (r) => r.participantId === p.id && r.burgerRank === burger.rank
          );
          return (
            <li
              key={p.id}
              className="rounded-xl border border-border bg-card p-3.5"
              data-testid={`rating-row-${p.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block size-2.5 rounded-full shrink-0"
                    style={{ background: p.color }}
                  />
                  <span className="font-semibold text-[14px] truncate">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'tabular font-black text-[18px] min-w-[42px] text-right',
                      rating ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {rating ? rating.score.toFixed(1) : '—'}
                  </span>
                  <span className="text-[11px] text-muted-foreground">/10</span>
                </div>
              </div>
              <div className="mt-3">
                <Slider
                  min={0}
                  max={10}
                  step={0.5}
                  value={[rating?.score ?? 5]}
                  onValueChange={(v) =>
                    setRating({
                      participantId: p.id,
                      burgerRank: burger.rank,
                      score: v[0],
                      note: rating?.note,
                      favorite: rating?.favorite,
                    })
                  }
                  data-testid={`slider-${p.id}`}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground tabular mt-1">
                  <span>0</span>
                  <span>2.5</span>
                  <span>5</span>
                  <span>7.5</span>
                  <span>10</span>
                </div>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <Textarea
                  value={rating?.note ?? ''}
                  onChange={(e) =>
                    setRating({
                      participantId: p.id,
                      burgerRank: burger.rank,
                      score: rating?.score ?? 5,
                      note: e.target.value,
                      favorite: rating?.favorite,
                    })
                  }
                  placeholder="Optional note (bun, sear, vibes…)"
                  rows={1}
                  className="flex-1 min-h-9 text-[12.5px] resize-none"
                  data-testid={`note-${p.id}`}
                />
                <label className="flex items-center gap-2 shrink-0 text-[12px] font-semibold cursor-pointer pt-1">
                  <Switch
                    checked={!!rating?.favorite}
                    onCheckedChange={(checked) =>
                      setRating({
                        participantId: p.id,
                        burgerRank: burger.rank,
                        score: rating?.score ?? 5,
                        note: rating?.note,
                        favorite: checked,
                      })
                    }
                    data-testid={`fav-${p.id}`}
                  />
                  <Star
                    className={cn(
                      'size-4',
                      rating?.favorite ? 'fill-accent text-accent' : 'text-muted-foreground'
                    )}
                  />
                </label>
                {rating && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearRating(p.id, burger.rank)}
                    aria-label={`Clear ${p.name}'s rating`}
                    data-testid={`clear-${p.id}`}
                    className="size-9 shrink-0"
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GroupRankings() {
  const { burgers, ratings, participants, setSelectedRank } = useAppState();
  const ranked = useMemo(() => rankBurgersByGroup(burgers, ratings), [burgers, ratings]);
  const rated = ranked.filter((r) => r.group.average != null);

  if (participants.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-8 text-muted-foreground" />}
        title="Add raters to see group rankings"
        body="Once your crew rates a few burgers, the leaderboard fills in here."
      />
    );
  }
  if (rated.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="size-8 text-muted-foreground" />}
        title="No ratings yet"
        body="Head back to Rate and drop a score on your first burger."
      />
    );
  }

  return (
    <ol className="space-y-2">
      {rated.map((r, i) => (
        <li key={r.burger.rank}>
          <button
            type="button"
            onClick={() => setSelectedRank(r.burger.rank)}
            className="w-full text-left rounded-xl border border-border bg-card p-3.5 hover:bg-muted/40 transition-colors"
            data-testid={`ranking-${r.burger.rank}`}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center justify-center size-10 rounded-full font-black text-[15px] tabular border shrink-0',
                  i === 0
                    ? 'bg-accent text-accent-foreground border-accent'
                    : i < 3
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted text-foreground border-border'
                )}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[14px] truncate">{r.burger.restaurant}</p>
                <p className="text-[12px] text-muted-foreground truncate">{r.burger.burger_name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-black tabular text-[20px] leading-none">
                  {r.group.average!.toFixed(1)}
                </p>
                <p className="text-[10px] text-muted-foreground tabular mt-0.5">
                  {r.group.count}/{participants.length} · ±{r.group.spread.toFixed(1)}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {r.group.individual.map((ind) => {
                const p = participants.find((pp) => pp.id === ind.participantId);
                if (!p) return null;
                const isFav = r.group.favorites.includes(ind.participantId);
                return (
                  <span
                    key={ind.participantId}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md border tabular"
                    style={{
                      background: `${p.color}1a`,
                      borderColor: `${p.color}55`,
                    }}
                  >
                    <span className="size-1.5 rounded-full" style={{ background: p.color }} />
                    {p.name}
                    <span className="tabular">{ind.score.toFixed(1)}</span>
                    {isFav && <Star className="size-3 fill-accent text-accent" />}
                  </span>
                );
              })}
            </div>
          </button>
        </li>
      ))}
    </ol>
  );
}

function IndividualRankings() {
  const { burgers, ratings, participants, setSelectedRank } = useAppState();

  if (participants.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-8 text-muted-foreground" />}
        title="Add raters to see individual picks"
        body="Each friend gets their own personal leaderboard once they've scored."
      />
    );
  }

  return (
    <div className="space-y-5">
      {participants.map((p) => {
        const personal = rankBurgersForParticipant(burgers, ratings, p.id).filter(
          (r) => r.score != null
        );
        return (
          <section key={p.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="size-2.5 rounded-full" style={{ background: p.color }} />
              <h3 className="font-black text-[14px]">{p.name}</h3>
              <span className="text-[11px] text-muted-foreground tabular">
                {personal.length} rated
              </span>
            </div>
            {personal.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground italic">No ratings yet.</p>
            ) : (
              <ol className="space-y-1.5">
                {personal.slice(0, 5).map((row, i) => (
                  <li key={row.burger.rank}>
                    <button
                      type="button"
                      onClick={() => setSelectedRank(row.burger.rank)}
                      className="w-full text-left flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 hover:bg-muted/50"
                    >
                      <span className="tabular font-bold text-[12px] text-muted-foreground w-4">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-[13px]">{row.burger.restaurant}</span>
                      {row.favorite && <Star className="size-3.5 fill-accent text-accent" />}
                      <span className="tabular font-black text-[13px]">{row.score!.toFixed(1)}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </section>
        );
      })}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center space-y-2">
      <div className="flex justify-center">{icon}</div>
      <p className="font-bold text-[14px]">{title}</p>
      <p className="text-[12.5px] text-muted-foreground">{body}</p>
    </div>
  );
}

