import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BotMessageSquare,
  GitCompareArrows,
  House,
  Landmark,
  LayoutDashboard,
  ScanSearch
} from "lucide-react";

const navItems = [
  { to: "/", label: "Home", icon: House },
  { to: "/analyzer", label: "Analyzer", icon: ScanSearch },
  { to: "/chat", label: "AI Chat", icon: BotMessageSquare },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
];

const desktopLinkClass = ({ isActive }) =>
  `nav-link relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "nav-link-active bg-white/[0.08] text-white"
      : "text-textSecondary hover:bg-white/5 hover:text-white"
  }`;

const mobileLinkClass = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
    isActive
      ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(59,130,246,0.35)]"
      : "border border-white/5 bg-white/5 text-textSecondary"
  }`;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50"
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div
          className={`glass-nav rounded-[28px] px-4 py-3 transition-all duration-300 sm:px-5 ${
            scrolled
              ? "border-white/10 shadow-[0_18px_65px_rgba(2,6,23,0.45)]"
              : "border-white/[0.08]"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accentBlue/25 to-accentTeal/25 text-accentBlue">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.16em] text-white">
                  Financial Decoder
                </p>
                <p className="text-xs text-textSecondary">
                  Financial intelligence platform
                </p>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <span className="nav-link-line absolute inset-x-3 -bottom-2 rounded-full bg-gradient-to-r from-accentBlue to-accentTeal" />
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/analyzer" className="hidden sm:inline-flex fin-button">
                Analyze Report
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/analyzer"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:border-accentBlue/40 hover:bg-white/10 sm:hidden"
                aria-label="Analyze Report"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
