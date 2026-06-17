import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted">Завантаження…</div>}>
      <Dashboard />
    </Suspense>
  );
}
