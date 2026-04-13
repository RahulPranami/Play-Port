import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ReportsClient from "./reports-client";

export const metadata = { title: "Reports — Play Port" };

export default async function ReportsPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");

  return <ReportsClient />;
}
