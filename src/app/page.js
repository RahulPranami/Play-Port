import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Play Port — Kids Play Zone",
  description:
    "A safe, fun, and exciting play zone for kids of all ages. Book a session today!",
};

const features = [
  {
    title: "Safe & Secure",
    description:
      "Every corner of our facility is designed with child safety as the top priority. Padded surfaces, rounded edges, and constant staff supervision.",
    color: "bg-sky-50 border-sky-200",
    badge: "Safety First",
    badgeColor: "bg-sky-100 text-sky-700",
  },
  {
    title: "Adventure Zones",
    description:
      "From climbing walls to ball pits, trampolines to soft play areas — there's something exciting for every age group.",
    color: "bg-violet-50 border-violet-200",
    badge: "Non-stop Fun",
    badgeColor: "bg-violet-100 text-violet-700",
  },
  {
    title: "Experienced Staff",
    description:
      "Our trained and friendly team is always on hand to ensure every child has the best possible experience.",
    color: "bg-amber-50 border-amber-200",
    badge: "Expert Care",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    title: "Party & Events",
    description:
      "Make birthdays unforgettable! Book our venue for private parties, group events, and special celebrations.",
    color: "bg-rose-50 border-rose-200",
    badge: "Special Events",
    badgeColor: "bg-rose-100 text-rose-700",
  },
  {
    title: "Healthy Snacks",
    description:
      "Our café serves kid-friendly meals and healthy snacks so little ones stay energised throughout their visit.",
    color: "bg-green-50 border-green-200",
    badge: "Eat Well",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    title: "Flexible Sessions",
    description:
      "Morning, afternoon, or weekend — choose a session that fits your schedule. Online booking is quick and easy.",
    color: "bg-orange-50 border-orange-200",
    badge: "Easy Booking",
    badgeColor: "bg-orange-100 text-orange-700",
  },
];

const ageGroups = [
  { label: "Toddlers", range: "Ages 1–3", color: "bg-pink-100 text-pink-700" },
  {
    label: "Junior",
    range: "Ages 4–7",
    color: "bg-purple-100 text-purple-700",
  },
  {
    label: "Explorer",
    range: "Ages 8–12",
    color: "bg-blue-100 text-blue-700",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500" />
            <span className="text-xl font-bold tracking-tight">Play Port</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#ages" className="hover:text-zinc-900 transition-colors">Age Groups</a>
            <a href="#visit" className="hover:text-zinc-900 transition-colors">Visit Us</a>
          </nav>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Staff Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-pink-50 py-24 md:py-36">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-16 left-8 size-64 rounded-full bg-violet-200/40 blur-3xl" />
            <div className="absolute bottom-8 right-16 size-80 rounded-full bg-pink-200/40 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 size-48 rounded-full bg-amber-200/30 blur-3xl -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="mx-auto max-w-6xl px-6 text-center">
            <Badge className="mb-6 rounded-full bg-violet-100 text-violet-700 border-violet-200 px-4 py-1 text-sm font-medium">
              Now Open 7 Days a Week
            </Badge>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1] mb-6">
              Where Every Day
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                Is an Adventure
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg md:text-xl text-zinc-500 leading-relaxed mb-10">
              Play Port is a premium indoor play zone built for curious, energetic kids. Safe, fun, and endlessly entertaining.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-700 hover:to-pink-600 text-white shadow-lg shadow-violet-200"
              >
                Book a Session
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
              >
                Take a Tour
              </Button>
            </div>
          </div>
        </section>

        {/* Age Groups */}
        <section id="ages" className="py-16 bg-zinc-50 border-y">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
                Age Groups
              </span>
              {ageGroups.map((group) => (
                <div
                  key={group.label}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-sm ${group.color}`}
                >
                  <span className="font-semibold">{group.label}</span>
                  <span className="opacity-70">{group.range}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 md:py-32">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
                Everything Kids Love
              </h2>
              <p className="text-zinc-500 text-lg max-w-lg mx-auto">
                We've thought of everything to make every visit special, safe, and full of memories.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className={`rounded-2xl border p-6 ${feature.color}`}
                >
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold mb-4 ${feature.badgeColor}`}
                  >
                    {feature.badge}
                  </span>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="visit"
          className="py-24 bg-gradient-to-br from-violet-600 to-pink-500"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Ready for the Fun to Begin?
            </h2>
            <p className="text-violet-100 text-lg mb-10 max-w-lg mx-auto">
              Open daily from 9am – 8pm. Drop in or book ahead to guarantee your spot.
            </p>
            <Button
              size="lg"
              className="rounded-full px-10 bg-white text-violet-700 hover:bg-violet-50 font-semibold shadow-xl"
            >
              Book Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-white">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-gradient-to-br from-violet-500 to-pink-500" />
            <span className="font-semibold text-zinc-700">Play Port</span>
          </div>
          <p>© {new Date().getFullYear()} Play Port. All rights reserved.</p>
          <Link href="/login" className="hover:text-zinc-700 transition-colors">
            Staff Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
