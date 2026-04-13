import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import AddUserDialog from "./add-user-dialog";
import UserActions from "./user-actions";

export const metadata = {
  title: "User Management — Play Port",
};

export default async function UsersPage() {
  const session = await getSession();

  if (session?.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">User Management</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {users.length} {users.length === 1 ? "user" : "users"} registered
          </p>
        </div>
        <AddUserDialog />
      </div>

      <Card className="border shadow-none overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-zinc-50">
              <tr>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Name
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Email
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Role
                </th>
                <th className="px-5 py-3.5 text-left font-semibold text-zinc-600">
                  Joined
                </th>
                <th className="px-5 py-3.5 text-right font-semibold text-zinc-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-zinc-900">
                        {user.name}
                      </span>
                      {user.id === session?.id && (
                        <span className="text-xs text-zinc-400">(you)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-600">{user.email}</td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="secondary"
                      className={
                        user.role === "ADMIN"
                          ? "bg-violet-100 text-violet-700 border-violet-200"
                          : "bg-sky-100 text-sky-700 border-sky-200"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-zinc-500">
                    {new Date(user.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <UserActions user={user} currentUserId={session?.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="py-16 text-center text-zinc-400 text-sm">
              No users yet. Add your first team member above.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
