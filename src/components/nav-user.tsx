import { Settings } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

export function NavUser({ user }: { user: { name: string; email: string; avatar: string } }) {
  return (
    <>

      <Button variant="outline" size="sm" className="gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
      </Button>
      <div className="flex items-center gap-3 p-2">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => (e.currentTarget.src = "/assets/school_logo.png")}
        />
        <div>
          <div className="font-semibold leading-tight">sdfdss{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>
    </>
  );
} 