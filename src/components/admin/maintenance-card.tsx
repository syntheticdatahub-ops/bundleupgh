"use client";

import * as React from "react";
import { AlertTriangleIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DEFAULT_MESSAGE =
  "Oops, sorry… Play Ato is making a few changes for a better experience. Sorry for any inconvenience.";

type MaintenanceResponse = {
  enabled: boolean;
  message: string;
  updatedAt: string;
  source: string;
};

export function MaintenanceCard() {
  const [enabled, setEnabled] = React.useState(true);
  const [message, setMessage] = React.useState(DEFAULT_MESSAGE);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadState() {
      try {
        const response = await fetch("/api/admin/maintenance", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load maintenance state");
        }

        const payload = (await response.json()) as MaintenanceResponse;

        if (!isMounted) return;
        setEnabled(Boolean(payload.enabled));
        setMessage(payload.message || DEFAULT_MESSAGE);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Unable to load maintenance state.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadState();
    return () => {
      isMounted = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, message: message.trim() || DEFAULT_MESSAGE }),
      });

      const payload = (await response.json().catch(() => null)) as Partial<MaintenanceResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update maintenance mode.");
      }

      setEnabled(Boolean(payload.enabled));
      setMessage(payload.message || message);
    } catch (err: any) {
      setError(err?.message || "Unable to update maintenance mode.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>Temporary site shutdown for public visitors while the platform is being repaired.</CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium">
            <span className={`inline-block size-2 rounded-full ${enabled ? "bg-red-500" : "bg-emerald-500"}`} />
            {enabled ? "ON" : "OFF"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangleIcon className="size-4 text-amber-500" />
            Maintenance status
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Maintenance mode toggle" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Maintenance message</label>
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={DEFAULT_MESSAGE}
            disabled={loading}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs text-muted-foreground">
            {loading ? "Loading…" : enabled ? "Public visitors are being redirected to the maintenance page." : "Public visitors can access the live website."}
          </div>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? <Loader2Icon className="mr-2 size-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
