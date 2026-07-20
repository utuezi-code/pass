export default function CircleFormation() {
  const count = 8;
  const radius = 88;
  const totalDuration = 6.4;
  const stepDelay = 0.5;

  const dots = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    return {
      x: Number((Math.cos(angle) * radius).toFixed(2)),
      y: Number((Math.sin(angle) * radius).toFixed(2)),
      delay: i * stepDelay,
    };
  });

  return (
    <div className="relative mx-auto h-52 w-52 sm:h-56 sm:w-56">
      <div className="absolute inset-0 rounded-full border border-orange-400/20" />
      <div
        className="absolute inset-6 rounded-full border border-dashed border-orange-400/30"
        style={{ animation: `ring-pulse ${totalDuration}s ease-in-out infinite` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-3xl">🔥</div>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute h-4 w-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-[0_0_10px_2px_rgba(249,115,22,0.6)]"
          style={{
            left: `calc(50% + ${d.x}px - 8px)`,
            top: `calc(50% + ${d.y}px - 8px)`,
            animation: `dot-join ${totalDuration}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
