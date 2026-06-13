import DashboardShell from "@/components/dashboard/DashboardShell";
import { UserProvider } from "@/features/auth/client/UserContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
