import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppState } from '@/state/AppState';
import type { Burger } from '@/types/burger';

// Escape any characters that could break HTML attribute context inside divIcon markup.
function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildIcon(burger: Burger, selected: boolean, top: boolean) {
  const size = selected ? 60 : top ? 54 : 46;
  const classes = [
    'burger-pin-photo',
    top ? 'is-top' : '',
    selected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const alt = escapeAttr(`${burger.restaurant} burger`);
  const photo = burger.image_url
    ? `<img class="burger-pin-img" src="${escapeAttr(burger.image_url)}" alt="${alt}" referrerpolicy="no-referrer" loading="lazy" onerror="this.parentElement.classList.add('burger-pin-fallback');this.remove();" />`
    : '';
  const fallbackInitial = escapeAttr(burger.restaurant.charAt(0).toUpperCase() || '•');

  return L.divIcon({
    className: 'burger-pin',
    html: `<div class="${classes}" style="width:${size}px;height:${size}px;" role="button" aria-label="Rank ${burger.rank} — ${alt}">${photo}<span class="burger-pin-fallback-letter">${fallbackInitial}</span><span class="burger-pin-rank" aria-hidden="true">${burger.rank}</span></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function FlyToSelected({ burgers, selectedRank }: { burgers: Burger[]; selectedRank: number | null }) {
  const map = useMap();
  const prev = useRef<number | null>(null);
  useEffect(() => {
    if (selectedRank == null) return;
    if (prev.current === selectedRank) return;
    prev.current = selectedRank;
    const b = burgers.find((x) => x.rank === selectedRank);
    if (!b) return;
    map.flyTo([b.lat, b.lon], Math.max(map.getZoom(), 13), { duration: 0.7 });
  }, [selectedRank, burgers, map]);
  return null;
}

export function BurgerMap() {
  const { burgers, selectedRank, setSelectedRank, setPanel } = useAppState();

  const center: [number, number] = useMemo(() => {
    const lat = burgers.reduce((a, b) => a + b.lat, 0) / burgers.length;
    const lon = burgers.reduce((a, b) => a + b.lon, 0) / burgers.length;
    return [lat, lon];
  }, [burgers]);

  return (
    <div className="absolute inset-0" data-testid="burger-map">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        zoomControl
        className="h-full w-full"
        attributionControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        <FlyToSelected burgers={burgers} selectedRank={selectedRank} />
        {burgers.map((b) => (
          <Marker
            key={b.rank}
            position={[b.lat, b.lon]}
            icon={buildIcon(b, b.rank === selectedRank, b.rank <= 3)}
            zIndexOffset={b.rank === selectedRank ? 1000 : b.rank <= 3 ? 200 : 0}
            eventHandlers={{
              click: () => {
                setSelectedRank(b.rank);
                setPanel('detail');
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
