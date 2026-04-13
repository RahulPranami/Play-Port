import LoginForm from "./login-form";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import Logo from "@/components/logo";

export const metadata = {
  title: "Staff Login — Play Port",
};

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-pink-50 p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-violet-100/40 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-pink-100/40 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-sm z-10">
        <div className="text-center mb-10">
          <Logo size={120} className="mb-6" />
          <p className="text-sm font-bold text-zinc-400 tracking-[0.2em] uppercase">
            Staff Portal
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">
              Welcome back
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Sign in to manage Play Port
            </p>
          </div>
          <LoginForm />
        </div>
        
        <p className="text-center text-zinc-400 text-xs mt-8 font-medium">
          © {new Date().getFullYear()} PLAY PORT
        </p>
      </div>
    </div>
  );
}
