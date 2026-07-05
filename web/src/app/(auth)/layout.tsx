import { AuthShell } from "@/components/layout/AuthShell";
import { PublicRoute } from "@/components/auth/PublicRoute";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PublicRoute>
      <AuthShell>{children}</AuthShell>
    </PublicRoute>
  );
}
