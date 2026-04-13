import LoginForm from "./login-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Staff Login — Play Port",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-pink-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 mb-4 shadow-lg shadow-violet-200">
            <div className="size-5 rounded-sm bg-white/80" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Play Port</h1>
          <p className="text-sm text-zinc-500 mt-1">Staff Portal</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">
            Welcome back
          </h2>
          <p className="text-sm text-zinc-500 mb-6">
            Sign in to your staff account
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
