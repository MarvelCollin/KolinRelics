import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type ConnectionStatus = "checking" | "connected" | "error";

function App() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.auth.getSession();
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }
      setStatus("connected");
      setMessage("Supabase client initialized");
    }
    checkConnection();
  }, []);

  return (
    <main className="app">
      <h1>Kolin Relics</h1>
      <p>React + TypeScript + Vite + Supabase</p>
      <div className={`status status-${status}`}>
        <span>Supabase: {status}</span>
        {message && <small>{message}</small>}
      </div>
    </main>
  );
}

export default App;
