import { CATEGORY_ORDER, Reflection } from "@/lib/decisions";
import { ClarityMeter } from "./ClarityMeter";
import { Leaf, AlertCircle, Sparkles, Clock, Mountain, ThumbsUp, ThumbsDown } from "lucide-react";

const ICONS = {
  pros: ThumbsUp,
  cons: ThumbsDown,
  risks: AlertCircle,
  opportunities: Sparkles,
  shortTermImpact: Clock,
  longTermImpact: Mountain,
} as const;

interface Props {
  decision: string;
  reflection: Reflection;
}

export function ReflectionView({ decision, reflection }: Props) {
  return (
    <div className="space-y-10 animate-fade-up">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Your decision
        </div>
        <h2 className="font-display text-3xl md:text-4xl text-ink text-balance max-w-2xl mx-auto leading-tight">
          {decision}
        </h2>
        <p className="mt-4 text-ink-soft italic max-w-xl mx-auto text-pretty">
          {reflection.summary}
        </p>
      </div>

      <div className="divider-leaf" />

      <div className="grid md:grid-cols-2 gap-5">
        {CATEGORY_ORDER.map((key) => {
          const cat = reflection.categories?.[key];
          if (!cat) return null;
          const Icon = ICONS[key];
          return (
            <article
              key={key}
              className="grain relative bg-card border border-border rounded-md p-6 shadow-soft hover:shadow-paper transition-shadow duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-sm bg-secondary text-leaf-deep">
                  <Icon className="w-4 h-4" />
                </span>
                <h3 className="font-display text-xl text-ink">{cat.title}</h3>
              </div>
              <ul className="space-y-2.5">
                {cat.points.map((p, i) => (
                  <li key={i} className="flex gap-3 text-[15px] text-ink-soft leading-relaxed">
                    <span className="mt-2 w-1 h-1 rounded-full bg-primary shrink-0" />
                    <span className="text-pretty">{p}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <section className="grain relative bg-gradient-paper border border-border rounded-md p-8 md:p-10 shadow-paper">
        <div className="flex items-center gap-2 text-leaf-deep mb-4">
          <Leaf className="w-4 h-4" />
          <span className="text-[10px] uppercase tracking-[0.3em]">Reflection</span>
        </div>
        <p className="font-display text-2xl md:text-3xl text-ink leading-snug text-balance">
          {reflection.reflection}
        </p>
      </section>

      <div className="grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
            Questions to sit with
          </div>
          <ul className="space-y-3">
            {reflection.questions?.map((q, i) => (
              <li
                key={i}
                className="font-display text-xl md:text-2xl text-ink-soft italic leading-snug text-pretty"
              >
                — {q}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:border-l md:border-border md:pl-10">
          <ClarityMeter score={reflection.clarityScore} label={reflection.clarityLabel} />
        </div>
      </div>
    </div>
  );
}
