import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Relic, RelicInput } from "../types";
import {
  listRelics,
  createRelic,
  updateRelic,
  deleteRelic,
} from "../lib/relics";
import RelicForm from "../components/RelicForm";

const ADMIN_USER = "admin";
const ADMIN_PASS = import.meta.env.VITE_BYPASS_ADMIN;

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Relic | null>(null);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setRelics(await listRelics());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthed(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials");
    }
  }

  async function handleCreate(input: RelicInput) {
    await createRelic(input);
    setCreating(false);
    await refresh();
  }

  async function handleUpdate(input: RelicInput) {
    if (!editing) return;
    await updateRelic(editing.id, input);
    setEditing(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this relic?")) return;
    try {
      await deleteRelic(id);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!authed) {
    return (
      <div className="page">
        <header className="topbar">
          <h1>Admin Login</h1>
          <Link className="btn" to="/">
            Home
          </Link>
        </header>
        <form className="form form-narrow" onSubmit={handleLogin}>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {loginError && <p className="error">{loginError}</p>}
          <button type="submit" className="btn btn-primary">
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Admin Dashboard</h1>
        <div className="topbar-actions">
          <Link className="btn" to="/">
            Home
          </Link>
          <button className="btn" onClick={() => setAuthed(false)}>
            Sign out
          </button>
        </div>
      </header>

      {!creating && !editing && (
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          Add relic
        </button>
      )}

      {creating && (
        <RelicForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}
      {editing && (
        <RelicForm
          initial={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <table className="table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Buy</th>
            <th>Current</th>
            <th>Photos</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {relics.map((relic) => (
            <tr key={relic.id}>
              <td>
                {relic.images[0] ? (
                  <img className="table-thumb" src={relic.images[0]} alt={relic.name} />
                ) : (
                  <span className="muted">none</span>
                )}
              </td>
              <td>{relic.name}</td>
              <td>{formatPrice(relic.price_buy)}</td>
              <td>{formatPrice(relic.price_current)}</td>
              <td>{relic.images.length}</td>
              <td className="table-actions">
                <button className="btn" onClick={() => setEditing(relic)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(relic.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
