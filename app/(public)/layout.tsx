import { ConvexPublicProvider } from "@/components/ConvexProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <ConvexPublicProvider>{children}</ConvexPublicProvider>;
}
