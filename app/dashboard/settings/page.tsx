import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configuration options for your creator workspace.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account & Integrations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          This page is intentionally minimal for MVP stabilization. Existing
          flows are available in Dashboard, Create, Drafts, and Lists.
        </CardContent>
      </Card>
    </div>
  );
}
