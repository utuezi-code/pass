// Pseudo-aléatoire déterministe (arithmétique entière uniquement — contrairement à
// Math.sin/cos, garanti bit-identique entre le rendu serveur et l'hydratation
// client, ce qui évite les erreurs d'hydratation React).
function seededRandom(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export default function EmberField({ count = 30 }: { count?: number }) {
  const embers = Array.from({ length: count }, (_, i) => ({
    left: (seededRandom(i * 101 + 1) * 100).toFixed(2),
    size: Number((2 + seededRandom(i * 101 + 2) * 4).toFixed(2)),
    duration: Number((8 + seededRandom(i * 101 + 3) * 10).toFixed(2)),
    delay: Number((-seededRandom(i * 101 + 4) * 18).toFixed(2)),
    drift: Number(((seededRandom(i * 101 + 5) - 0.5) * 80).toFixed(2)),
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-orange-400"
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              filter: "blur(0.5px)",
              boxShadow: "0 0 6px 1px rgba(249,115,22,0.8)",
              animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
              "--drift": `${e.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
