import { AppShell } from "@/components/layout/AppShell";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

export default function MainAppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PrivateRoute>
      <AppShell>{children}</AppShell>
    </PrivateRoute>
  );
}
