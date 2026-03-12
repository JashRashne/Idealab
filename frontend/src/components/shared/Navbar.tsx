import { logout } from "../../services/auth.service";
import { useAuthStore } from "../../store/authStore";
import { Button } from "./Button";

export const Navbar = () => {
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);

  const handleLogout = async () => {
    await logout();
    clearUser();
    window.location.href = "/login";
  };

  return (
    <header className="flex items-center justify-between border-b border-black/10 bg-white/80 px-6 py-3 backdrop-blur">
      <h1 className="font-display text-xl font-bold text-ink">IdeaLab</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink/70">{user?.username}</span>
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </header>
  );
};
