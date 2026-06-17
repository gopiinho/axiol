import DashboardShell from "@/components/dashboard/DashboardShell";

export default function HelpPage() {
  return (
    <DashboardShell>
      <div className="p-8">
        <h1 className="mb-4 text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">
          Welcome to the help center. How can we help you today?
        </p>
      </div>
    </DashboardShell>
  );
}
