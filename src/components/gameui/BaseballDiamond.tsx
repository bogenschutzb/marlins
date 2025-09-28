type Runner = { fullName?: string } | undefined | null;

export default function BaseballDiamond({ baseRunners }: { baseRunners?: { first?: Runner; second?: Runner; third?: Runner } }) {
  const first = baseRunners?.first?.fullName;
  const second = baseRunners?.second?.fullName;
  const third = baseRunners?.third?.fullName;

  const fillIf = (v?: string) => v ? '#000' : '#fff';

  return (
    <div className="flex items-center justify-end gap-3 mt-3">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-label="baseball diamond" role="img">
        {/* top (2B) */}
        <rect x="13" y="2" width="12" height="12" rx="1" fill={fillIf(second)} stroke="#444" transform="rotate(45 18 9)" />
        {/* right (1B) */}
        <rect x="26" y="17" width="12" height="12" rx="1" fill={fillIf(first)} stroke="#444" transform="rotate(45 36 18)" />
        {/* bottom (home) - always white */}
        <rect x="9" y="24" width="12" height="12" rx="1" fill="#fff" stroke="#444" transform="rotate(45 18 36)" />
        {/* left (3B) */}
        <rect x="0" y="12" width="12" height="12" rx="1" fill={fillIf(third)} stroke="#444" transform="rotate(45 6 24)" />
      </svg>
    </div>
  );
}
