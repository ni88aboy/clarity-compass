import { useEffect, useState } from "react";

interface Props {
  score: number; // 0-100
  label: string;
}

export function ClarityMeter({ score, label }: Props) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setVal(score), 80);
    return () => clearTimeout(t);
  }, [score]);

  // Arc parameters
  const r = 70;
  const c = Math.PI * r; // half circumference for semicircle
  const dash = (val / 100) * c;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="200" height="120" viewBox="0 0 200 120" className="overflow-visible">
          <defs>
            <linearGradient id="clarityGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--secondary))" />
              <stop offset="50%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--leaf-deep))" />
            </linearGradient>
          </defs>
          <path
            d={`M 30 110 A ${r} ${r} 0 0 1 170 110`}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d={`M 30 110 A ${r} ${r} 0 0 1 170 110`}
            fill="none"
            stroke="url(#clarityGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.22,0.61,0.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <div className="font-display text-5xl text-ink leading-none tabular-nums">
            {Math.round(val)}
          </div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">
            clarity
          </div>
        </div>
      </div>
      <div className="mt-3 text-sm italic text-ink-soft font-display text-lg">{label}</div>
      <p className="mt-2 text-xs text-muted-foreground max-w-[260px] text-center text-pretty">
        Not a yes or no. Just a sense of how clear this decision currently feels.
      </p>
    </div>
  );
}
