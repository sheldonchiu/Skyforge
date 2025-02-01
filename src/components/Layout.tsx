/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';

// Components
import Home from './Home';
import ControlPanel from './Control';

interface NavItem {
  id: string;
  component: React.ComponentType;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', component: Home },
  { id: 'controlPanel', component: ControlPanel },
];

// Memoized Language Switcher Component for performance
const LanguageSwitcher: React.FC = React.memo(() => {
  const { i18n } = useTranslation();

  return (
    <select
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      value={i18n.language}
      className="select select-bordered select-sm rounded-selecter"
    >
      <option value="en">EN</option>
      <option value="zh">中文</option>
    </select>
  );
});

const Layout: React.FC = () => {
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('home');

  // Memoize the active component to avoid recomputation
  const ActiveComponent = useMemo(() => {
    return NAV_ITEMS.find((item) => item.id === activeTab)?.component || Home;
  }, [activeTab]);

  return (
    <div className="min-h-screen">
      <div className="flex flex-col min-h-screen bg-base-100">
        {/* Navbar */}
        <div>
          <div className="navbar container mx-auto">
            <div className="navbar-start">
              <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </div>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                >
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id}>
                      <button onClick={() => setActiveTab(item.id)} className="text-md">
                        {t(`nav.${item.id}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Logo/Website Title */}
              <div className="flex-shrink-0 flex items-center gap-2">
                <img src="/src/assets/icon.png" alt="logo" className="w-8 h-8" />
                <h1 className="text-xl font-bold text-base-content">Skyforge</h1>
              </div>
            </div>
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button onClick={() => setActiveTab(item.id)} className="text-md">
                      {t(`nav.${item.id}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="navbar-end">
              <div className="flex items-center gap-4">
                <LanguageSwitcher />
                {/* Dark Mode Toggle Button */}
                <label className="swap swap-rotate">
                  {/* this hidden checkbox controls the state */}
                  <input type="checkbox" className="theme-controller" value="cupcake" />
                  {/* sun icon */}
                  <Sun className="swap-off w-5 h-5" />
                  {/* moon icon */}
                  <Moon className="swap-on w-5 h-5" />
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ActiveComponent />
        </main>
        {/* Footer */}
        <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
          <aside>
            <p>© {new Date().getFullYear()} Skyforge. All rights reserved.</p>
          </aside>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(Layout);
