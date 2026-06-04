import { useEffect, useState } from "react";
import { Gem, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { listRelics } from "@/lib/relics";
import type { Relic } from "@/types";
import RelicCard from "@/components/RelicCard";
import RelicCardSkeleton from "@/components/RelicCardSkeleton";
import { Button } from "@/components/ui/button";

function Home() {
  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setRelics(await listRelics());
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      toast.error("Failed to load relics", { description: message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
        <div className="container py-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Gem className="h-4 w-4" />
            Curated collection
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Kolin Relics
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A catalog of relics, their provenance, and current market value.
          </p>
        </div>
      </header>

      <main className="container py-10">
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <RelicCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-destructive/40 bg-destructive/10 p-8 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-medium text-destructive">
                Couldn't load the catalog
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && relics.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
            <Gem className="h-10 w-10 opacity-40" />
            <p>No relics in the collection yet.</p>
          </div>
        )}

        {!loading && !error && relics.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relics.map((relic) => (
              <RelicCard key={relic.id} relic={relic} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
