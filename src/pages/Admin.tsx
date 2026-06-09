import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Lock, ImageOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Relic, RelicInput } from "@/types";
import {
  listRelics,
  createRelic,
  updateRelic,
  deleteRelic,
} from "@/lib/relics";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import RelicForm from "@/components/RelicForm";
import RelicRowSkeleton from "@/components/RelicRowSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const [relics, setRelics] = useState<Relic[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Relic | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Relic | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(Boolean(data.session));
      setCheckingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      setRelics(await listRelics());
    } catch (err) {
      toast.error("Failed to load relics", {
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setSigningIn(true);
    setLoginError("");
    const raw = username.trim().toLowerCase();
    const email = raw.includes("@") ? raw : `${raw}@kolinrelics.local`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSigningIn(false);
    if (error) {
      setLoginError(error.message);
      return;
    }
    toast.success("Welcome back, admin");
    setPassword("");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(relic: Relic) {
    setEditing(relic);
    setDialogOpen(true);
  }

  async function handleSubmit(input: RelicInput) {
    const isEdit = Boolean(editing);
    if (editing) {
      await updateRelic(editing.id, input);
    } else {
      await createRelic(input);
    }
    setDialogOpen(false);
    setEditing(null);
    toast.success(isEdit ? "Relic updated" : "Relic added", {
      description: input.name,
    });
    await refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteRelic(pendingDelete.id);
      toast.success("Relic deleted", { description: pendingDelete.name });
      setPendingDelete(null);
      await refresh();
    } catch (err) {
      toast.error("Failed to delete", { description: (err as Error).message });
    } finally {
      setDeleting(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-muted">
              <Lock className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">Admin Access</CardTitle>
            <CardDescription>Sign in to manage the catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-full" disabled={signingIn}>
                {signingIn && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {relics.length} {relics.length === 1 ? "relic" : "relics"} in the
              catalog
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={openCreate} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4" />
              Add relic
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex-1 sm:flex-none">
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-8">
        {loading ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Relic</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Buy</th>
                    <th className="px-4 py-3 font-medium">Current</th>
                    <th className="px-4 py-3 font-medium">Photos</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <RelicRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : relics.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
            <p>No relics yet. Add your first one.</p>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add relic
            </Button>
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Relic</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Buy</th>
                    <th className="px-4 py-3 font-medium">Current</th>
                    <th className="px-4 py-3 font-medium">Photos</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {relics.map((relic) => (
                    <tr
                      key={relic.id}
                      className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {relic.images[0] ? (
                            <img
                              src={relic.images[0]}
                              alt={relic.name}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <ImageOff className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{relic.name}</div>
                            <div className="line-clamp-1 max-w-xs text-xs text-muted-foreground">
                              {relic.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={relic.status === "sold" ? "muted" : "info"} className="uppercase">
                          {relic.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatPrice(relic.price_buy)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="success">
                          {formatPrice(relic.price_current)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {relic.images.length}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEdit(relic)}
                            aria-label="Edit relic"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => setPendingDelete(relic)}
                            aria-label="Delete relic"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit relic" : "New relic"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details and photos."
                : "Add a relic with details and photos."}
            </DialogDescription>
          </DialogHeader>
          <RelicForm
            initial={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this relic?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name} will be permanently removed from the catalog.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Admin;
