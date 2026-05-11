import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppState } from '@/state/AppState';
import type { Burger } from '@/types/burger';

function buildIcon(rank: number, selected: boolean, top: boolean) {
  const classes = [
    'burger-pin-inner',
    top ? 'is-top' : '',
    selected ? 'is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return L.divIcon({
    className: 'burger-pin',
    html: `<div class="${classes}" aria-label="Rank ${rank}">${rank}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
            icon={buildIcon(b.rank, b.rank === selectedRank, b.rank <= 3)}
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
