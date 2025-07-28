"use client";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { logout } from "@/app/login/actions";

export function NavUser({ user }: { user: { name: string; email: string; avatar: string } }) {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => {
            console.error('Admin image failed to load:', e);
            e.currentTarget.src = "/avatars/principal.jpg";
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold leading-tight truncate">{user.name}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-8 w-8"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
} 