import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const Navbar = () => {
  const { currentUser, logout, notifications, markNotificationRead, unreadCount } = useApp();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/85 backdrop-blur-md border-b border-foreground/5" : "bg-transparent"}`}>
      <nav className="w-full px-6 md:px-12 py-5 md:py-6 flex justify-between items-center">
        <div className="hidden md:flex gap-8 uppercase text-[10px] tracking-[0.25em] font-medium">
          <a href="/#fleet" className="text-foreground/60 hover:text-foreground transition-colors">The Fleet</a>
          <a href="/#process" className="text-foreground/60 hover:text-foreground transition-colors">How It Works</a>
          <Link to="/market" className="text-foreground/60 hover:text-foreground transition-colors">Car Market</Link>
        </div>

        <Link to="/" className="font-display text-xl md:text-2xl tracking-[0.35em] uppercase text-foreground">Pakinda Limited</Link>

        <div className="hidden md:flex items-center gap-8 uppercase text-[10px] tracking-[0.25em] font-medium">
          <a href="/#consign" className="text-foreground/60 hover:text-foreground transition-colors">Sell Your Car</a>
          {currentUser?.role === "admin" && <Link to="/admin" className="text-steel hover:text-foreground transition-colors">Admin ↗</Link>}

          {/* Notification bell */}
          {currentUser && (
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }} className="relative text-foreground/60 hover:text-foreground transition-colors">
                <span className="text-base">🔔</span>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-8 bg-background border border-foreground/10 shadow-xl w-80 z-50 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-foreground/10 flex justify-between items-center">
                    <p className="text-xs font-medium uppercase tracking-wider">Notifications</p>
                    <button onClick={() => setNotifOpen(false)} className="text-foreground/30 hover:text-foreground text-lg">×</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-foreground/5">
                    {notifications.length === 0 ? (
                      <p className="text-center text-foreground/30 text-xs py-8">No notifications yet.</p>
                    ) : notifications.slice(0, 10).map(n => (
                      <div key={n.id} onClick={() => markNotificationRead(n.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-surface transition-colors ${!n.read ? "bg-steel/5" : ""}`}>
                        <p className={`text-xs font-medium mb-0.5 ${!n.read ? "text-foreground" : "text-foreground/60"}`}>{n.title}</p>
                        <p className="text-xs text-foreground/40 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-foreground/25 mt-1">{new Date(n.createdAt).toLocaleString("en-KE")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentUser ? (
            <div className="relative">
              <button onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }} className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors">
                <span className="w-6 h-6 rounded-full bg-foreground/15 flex items-center justify-center text-[9px] font-bold">{currentUser.name.charAt(0).toUpperCase()}</span>
                {currentUser.name.split(" ")[0]}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 bg-background border border-foreground/10 shadow-lg min-w-[160px] z-50 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-foreground/10">
                    <p className="text-xs text-foreground/50 truncate">{currentUser.email}</p>
                  </div>
                  <button onClick={() => { logout(); setMenuOpen(false); navigate("/"); }}
                    className="w-full text-left px-4 py-3 text-xs uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground hover:bg-surface transition-colors">Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="text-foreground/60 hover:text-foreground transition-colors">Sign In</Link>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-3">
          <Link to="/market" className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">Market</Link>
          {currentUser ? (
            <button onClick={() => { logout(); navigate("/"); }} className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">Out</button>
          ) : (
            <Link to="/auth" className="text-[10px] uppercase tracking-[0.25em] font-medium text-foreground">Sign In</Link>
          )}
          <a href="/#fleet" className="text-[10px] uppercase tracking-[0.25em] font-medium text-foreground">Fleet</a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
