import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollRevealProvider from "@/components/ScrollRevealProvider";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ScrollRevealProvider>
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
          <Sidebar />
          <main className="flex-1 flex flex-col" style={{ marginLeft: "230px" }}>
            {children}
          </main>
        </div>
      </ScrollRevealProvider>
    </AuthProvider>
  );
}
