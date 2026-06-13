import { ConvexClientProvider } from "@/components/ConvexProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
