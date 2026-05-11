export interface BurgerSource {
  name: string;
  url: string;
}

export interface Burger {
  rank: number;
  restaurant: string;
  burger_name: string;
  address: string;
  neighborhood: string;
  borough: string;
  lat: number;
  lon: number;
  price: number | null;
  price_currency: string;
  price_approximate: boolean;
  price_note?: string;
  price_source_url?: string;
  description: string;
  score_rationale: string;
  list_appearances: string[];
  sources: BurgerSource[];
  image_url?: string;
  image_source_url?: string;
  image_attribution?: string;
  image_confidence?: string;
  image_notes?: string;
}

export interface BurgersFile {
  metadata: {
    title: string;
    compiled_date: string;
    last_updated: string;
    total_entries: number;
    methodology: string;
    data_sources: { name: string; url: string; updated?: string }[];
  };
  burgers: Burger[];
}

export interface Participant {
  id: string;
  name: string;
  color: string;
}

export interface Rating {
  participantId: string;
  burgerRank: number;
  score: number; // 0-10 in 0.5 steps
  note?: string;
  favorite?: boolean;
}
