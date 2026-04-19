import { Moon, Sun, Palette } from "lucide-react";

export default function Header({ dark, onToggle, companyName, companyLogo, view, onViewChange }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-5 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-2.5 w-36">
        {companyLogo ? (
          <img src={companyLogo} alt="" className="h-6 w-6 rounded object-cover" />
        ) : (
          <Palette size={15} className="text-gray-400 dark:text-gray-500" />
        )}
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-50 tracking-tight truncate">
          {companyName || "Theme Generator"}
        </span>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/60 rounded-lg p-0.5">
        {["Generator", "Dashboard"].map(tab => {
          const active = view === tab.toLowerCase();
          return (
            <button
              key={tab}
              onClick={() => onViewChange(tab.toLowerCase())}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                active
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className="flex justify-end w-36">
        <button
          onClick={onToggle}
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
    </header>
  );
}
