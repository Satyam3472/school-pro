export function NavUser({ user }: { user: { name: string; email: string; avatar: string } }) {
  return (
    <>
      <div className="flex items-center gap-3 p-2">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => (e.currentTarget.src = "/assets/school_logo.png")}
        />
        <div>
          <div className="font-semibold leading-tight">{user.name}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>
    </>
  );
} 