import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Archive, Trash2 } from "lucide-react";
import { DecisionRecord, deleteDecision, clearAll } from "@/lib/decisions";
import { format } from "date-fns";

interface Props {
  history: DecisionRecord[];
  onSelect: (rec: DecisionRecord) => void;
  onChange: () => void;
}

export function HistoryDrawer({ history, onSelect, onChange }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-ink-soft hover:text-leaf-deep gap-2"
        >
          <Archive className="w-4 h-4" />
          <span className="hidden sm:inline">Past reflections</span>
          {history.length > 0 && (
            <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full bg-secondary text-leaf-deep">
              {history.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-background border-border w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-3xl text-ink">Past reflections</SheetTitle>
          <p className="text-sm text-ink-soft text-pretty">
            A quiet record of how your thinking has moved.
          </p>
        </SheetHeader>

        {history.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground italic font-display text-xl">
            Nothing here yet.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {history.map((rec) => (
              <button
                key={rec.id}
                onClick={() => onSelect(rec)}
                className="w-full text-left bg-card border border-border rounded-md p-4 hover:shadow-soft transition-shadow group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-ink leading-tight line-clamp-2 text-balance">
                      {rec.decision}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{format(new Date(rec.createdAt), "d MMM yyyy · HH:mm")}</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        clarity {rec.reflection.clarityScore}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDecision(rec.id);
                      onChange();
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </button>
            ))}

            <button
              onClick={() => {
                if (confirm("Clear all past reflections? This cannot be undone.")) {
                  clearAll();
                  onChange();
                }
              }}
              className="w-full mt-6 text-xs text-muted-foreground hover:text-destructive py-2"
            >
              Clear all
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
