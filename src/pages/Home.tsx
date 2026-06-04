import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listRelics } from "../lib/relics";
import type { Relic } from "../types";
import RelicCard from "../components/RelicCard";

function Home() {
  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listRelics()
      .then(setRelics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <h1>Kolin Relics</h1>
        <Link className="btn" to="/admin">
          Admin
        </Link>
      </header>

      {loading && <p className="muted">Loading relics...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && relics.length === 0 && (
        <p className="muted">No relics yet.</p>
      )}

      <section className="grid">
        {relics.map((relic) => (
          <RelicCard key={relic.id} relic={relic} />
        ))}
      </section>
    </div>
  );
}

export default Home;
