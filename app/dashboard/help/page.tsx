import DashboardShell from "@/components/dashboard/DashboardShell";

export default function HelpPage() {
  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Help Center</h1>
        <p className="text-muted-foreground">
          Welcome to the help center. How can we help you today?
        </p>
      </div>
    </DashboardShell>
  );
}
