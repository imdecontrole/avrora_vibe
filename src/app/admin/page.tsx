import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/dashboard");
  return (
    <div className="min-h-dvh grid place-items-center px-4 bg-white">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6 text-center">Avrora · Админка</h1>
        <LoginForm />
      </div>
    </div>
  );
}
