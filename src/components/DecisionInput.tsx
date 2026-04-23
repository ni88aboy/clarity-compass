import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2 } from "lucide-react";

interface Props {
  onSubmit: (decision: string, context?: string) => void;
  loading: boolean;
}

const PROMPTS = [
  "Should I accept the job offer in Dubai?",
  "Should I start my own business?",
  "Should I move to a new city?",
  "Should I end this relationship?",
  "Should I buy the apartment?",
];

export function DecisionInput({ onSubmit, loading }: Props) {
  const [decision, setDecision] = useState("");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (decision.trim().length < 3 || loading) return;
        onSubmit(decision.trim(), context.trim() || undefined);
      }}
      className="space-y-5"
    >
      <div className="relative">
        <Textarea
          value={decision}
          onChange={(e) => setDecision(e.target.value.slice(0, 500))}
          placeholder="Should I…"
          rows={3}
          className="font-display text-2xl md:text-3xl leading-snug bg-card border-border rounded-md p-6 resize-none shadow-soft focus-visible:ring-leaf focus-visible:ring-1 placeholder:text-muted-foreground/50"
        />
        <div className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-muted-foreground">
          {decision.length}/500
        </div>
      </div>

      {!showContext ? (
        <button
          type="button"
          onClick={() => setShowContext(true)}
          className="text-sm text-ink-soft hover:text-leaf-deep underline underline-offset-4 decoration-border"
        >
          + add context (optional)
        </button>
      ) : (
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value.slice(0, 1500))}
          placeholder="What's surrounding this decision? Anything pressing on you, anyone affected, what you've already considered…"
          rows={4}
          className="bg-card/60 border-border rounded-md p-4 resize-none text-[15px] leading-relaxed"
        />
      )}

      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setDecision(p)}
            className="text-xs px-3 py-1.5 rounded-full border border-border bg-card/60 text-ink-soft hover:bg-secondary hover:text-leaf-deep transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground italic max-w-sm text-pretty">
          Nothing here is advice. This is a quiet space to think more clearly.
        </p>
        <Button
          type="submit"
          disabled={decision.trim().length < 3 || loading}
          className="bg-gradient-leaf text-primary-foreground hover:opacity-90 rounded-sm px-6 py-6 text-sm uppercase tracking-[0.2em] shadow-soft"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Thinking
            </>
          ) : (
            <>
              Reflect <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
