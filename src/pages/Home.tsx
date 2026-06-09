import { useEffect, useState } from "react";
import { Gem, AlertCircle, MessageCircle, Phone } from "lucide-react";
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
        <div className="container py-10 text-center sm:py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Kolin Relics
          </h1>
          <div className="mt-4 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            <a
              href="https://line.me/ti/p/~kolinpakec"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              Line: kolinpakec (username: kolin)
            </a>
            <a
              href="https://wa.me/6285716915343"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Phone className="h-4 w-4" />
              WhatsApp: 085716915343
            </a>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-10">
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
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
