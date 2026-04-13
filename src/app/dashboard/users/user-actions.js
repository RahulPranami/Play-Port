"use client";

import { useTransition } from "react";
import { updateUserRole, deleteUser } from "@/actions/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function UserActions({ user, currentUserId }) {
  const [pending, startTransition] = useTransition();
  const isSelf = user.id === currentUserId;

  function handleRoleChange(newRole) {
    if (newRole === user.role) return;
    startTransition(() => updateUserRole(user.id, newRole));
  }

  function handleDelete() {
    if (!confirm(`Remove ${user.name} from the system?`)) return;
    startTransition(() => deleteUser(user.id));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-700"
          disabled={pending}
        >
          <span className="sr-only">Open menu</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={() => handleRoleChange("ADMIN")}
          disabled={user.role === "ADMIN"}
          className="text-sm"
        >
          Make Admin
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("FRONT_DESK")}
          disabled={user.role === "FRONT_DESK"}
          className="text-sm"
        >
          Make Front Desk
        </DropdownMenuItem>
        {!isSelf && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-sm text-destructive focus:text-destructive"
            >
              Remove User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
