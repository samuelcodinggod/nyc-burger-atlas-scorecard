import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { Burger, Participant, Rating } from '@/types/burger';
import burgersJson from '@/data/burgers.json';
import { pickColor } from '@/lib/burger-utils';

type ViewMode = 'map' | 'list';
type Panel = 'detail' | 'scorecard';
type SortMode = 'editorial' | 'group' | 'price-asc' | 'price-desc';

interface AppStateValue {
  burgers: Burger[];
  selectedRank: number | null;
  setSelectedRank: (rank: number | null) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  panel: Panel;
  setPanel: (p: Panel) => void;
  sortMode: SortMode;
  setSortMode: (s: SortMode) => void;
  participants: Participant[];
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  renameParticipant: (id: string, name: string) => void;
  ratings: Rating[];
  setRating: (r: Rating) => void;
  clearRating: (participantId: string, burgerRank: number) => void;
}

const Ctx = createContext<AppStateValue | null>(null);

let idCounter = 0;
const newId = () => `p${++idCounter}_${Date.now().toString(36)}`;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const burgers = useMemo(
    () => (burgersJson as unknown as { burgers: Burger[] }).burgers,
    []
  );

  const [selectedRank, setSelectedRank] = useState<number | null>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [panel, setPanel] = useState<Panel>('detail');
  const [sortMode, setSortMode] = useState<SortMode>('editorial');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  const addParticipant = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setParticipants((prev) => [
      ...prev,
      { id: newId(), name: clean, color: pickColor(prev.length) },
    ]);
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setRatings((prev) => prev.filter((r) => r.participantId !== id));
  }, []);

  const renameParticipant = useCallback((id: string, name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, name: clean } : p)));
  }, []);

  const setRating = useCallback((r: Rating) => {
    setRatings((prev) => {
      const idx = prev.findIndex(
        (x) => x.participantId === r.participantId && x.burgerRank === r.burgerRank
      );
      if (idx === -1) return [...prev, r];
      const next = [...prev];
      next[idx] = r;
      return next;
    });
  }, []);

  const clearRating = useCallback((participantId: string, burgerRank: number) => {
    setRatings((prev) =>
      prev.filter((r) => !(r.participantId === participantId && r.burgerRank === burgerRank))
    );
  }, []);

  const value: AppStateValue = {
    burgers,
    selectedRank,
    setSelectedRank,
    viewMode,
    setViewMode,
    panel,
    setPanel,
    sortMode,
    setSortMode,
    participants,
    addParticipant,
    removeParticipant,
    renameParticipant,
    ratings,
    setRating,
    clearRating,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used inside <AppStateProvider>');
  return v;
}
