import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/animated-logo";

export const metadata = {
  title: "Play Port — Kids Play Zone",
  description: "A safe, fun, and exciting play zone for kids of all ages.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfdfd] relative overflow-hidden">
      {/* Dynamic Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-100/50 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-100/50 rounded-full blur-[120px] -z-10" />
      
      <main className="flex flex-col items-center gap-12 z-10">
        {/* The Animated Logo */}
        <AnimatedLogo size={400} />

        <div className="flex flex-col items-center gap-6">
          <Link href="/login">
            <Button 
              size="lg" 
              className="rounded-full px-12 h-14 text-lg font-bold bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white shadow-[0_8px_30px_rgb(124,58,237,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              Enter Play Port
            </Button>
          </Link>
          
          <p className="text-zinc-400 text-sm font-medium tracking-widest uppercase">
            Kids Play Zone
          </p>
        </div>
      </main>

      {/* Subtle bottom footer */}
      <footer className="absolute bottom-8 text-zinc-300 text-xs font-medium tracking-tight">
        © {new Date().getFullYear()} PLAY PORT. ALL RIGHTS RESERVED.
      </footer>
    </div>
  );
}
