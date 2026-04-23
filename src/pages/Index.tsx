import { useEffect, useMemo, useState } from "react";
import { DecisionInput } from "@/components/DecisionInput";
import { ReflectionView } from "@/components/ReflectionView";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { DecisionRecord, Reflection, loadDecisions, saveDecision } from "@/lib/decisions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<DecisionRecord | null>(null);
  const [history, setHistory] = useState<DecisionRecord[]>([]);

  useEffect(() => {
    setHistory(loadDecisions());
  }, []);

  const refreshHistory = () => setHistory(loadDecisions());

  const handleSubmit = async (decision: string, context?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("clarify", {
        body: { decision, context },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const reflection = data as Reflection;
      const rec: DecisionRecord = {
        id: crypto.randomUUID(),
        decision,
        context,
        reflection,
        createdAt: Date.now(),
      };
      saveDecision(rec);
      refreshHistory();
      setCurrent(rec);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      toast({
        title: "Couldn't reflect right now",
        description: e instanceof Error ? e.message : "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen">
      <header className="container max-w-5xl pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrent(null)}
          className="flex items-center gap-2 group"
          aria-label="Home"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-sm bg-gradient-leaf text-primary-foreground animate-breathe">
            <Leaf className="w-4 h-4" />
          </span>
          <span className="font-display text-xl text-ink tracking-tight">Clearing</span>
        </button>
        <HistoryDrawer
          history={history}
          onSelect={(rec) => {
            setCurrent(rec);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onChange={refreshHistory}
        />
      </header>

      <main className="container max-w-5xl pb-24">
        {!current ? (
          <section className="pt-10 md:pt-20 animate-fade-up">
            <div className="max-w-3xl">
              <div className="text-[10px] uppercase tracking-[0.3em] text-leaf-deep mb-5">
                A quiet space for hard decisions
              </div>
              <h1 className="font-display text-5xl md:text-7xl text-ink leading-[1.05] text-balance">
                Think more clearly.
                <br />
                <span className="italic text-ink-soft">Decide on your own terms.</span>
              </h1>
              <p className="mt-6 text-lg text-ink-soft max-w-xl leading-relaxed text-pretty">
                Clearing helps you see your decision from six angles — pros, cons, risks,
                opportunities, short and long term — then offers a neutral reflection.
                It will never tell you what to do.
              </p>
            </div>

            <div className="mt-12 md:mt-16 max-w-3xl">
              <DecisionInput onSubmit={handleSubmit} loading={loading} />
            </div>

            <div className="mt-24 grid md:grid-cols-3 gap-8 max-w-4xl">
              {[
                {
                  n: "01",
                  t: "Name the decision",
                  d: "Write the choice you're sitting with. One line is enough.",
                },
                {
                  n: "02",
                  t: "See it from six angles",
                  d: "Pros, cons, risks, opportunities, short and long term — laid out gently.",
                },
                {
                  n: "03",
                  t: "Receive a clarity score",
                  d: "Not yes or no. A sense of how clear this currently feels.",
                },
              ].map((s) => (
                <div key={s.n} className="border-t border-border pt-5">
                  <div className="text-xs tabular-nums text-leaf-deep tracking-widest mb-3">
                    {s.n}
                  </div>
                  <h3 className="font-display text-2xl text-ink mb-2">{s.t}</h3>
                  <p className="text-sm text-ink-soft leading-relaxed text-pretty">{s.d}</p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="pt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrent(null)}
              className="mb-8 text-ink-soft hover:text-leaf-deep gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> New decision
            </Button>
            <ReflectionView decision={current.decision} reflection={current.reflection} />
          </section>
        )}
      </main>

      <footer className="border-t border-border">
        <div className="container max-w-5xl py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {year} Clearing — a space to think.</span>
          <span className="italic">Your reflections stay on this device.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
