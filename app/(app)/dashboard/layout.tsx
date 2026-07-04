import DashboardShell from "@/components/dashboard/DashboardShell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/features/auth/client/UserContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TooltipProvider delayDuration={200}>
        <DashboardShell>{children}</DashboardShell>
      </TooltipProvider>
    </UserProvider>
  );
}
