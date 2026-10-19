// atlas-ui/react/static/js/Components/Header.tsx
import React, { useState, useEffect } from "react";
import { UniverseDetection } from "../Utils/UniverseDetection.tsx";
import { useMultiverseGlitch } from "../Utils/useMultiverseGlitch.tsx";
import MultiverseHeaderConnectedIcon from "../Icons/MultiverseHeaderConnectedIcon.jsx";
import { t } from "../i18n/i18n.ts";

const Header: React.FC = () => {
  const [isRemoteUniverse, setIsRemoteUniverse] = useState(false);
  const glitchText = useMultiverseGlitch(isRemoteUniverse);

  useEffect(() => {
    const checkUniverseType = () => {
      setIsRemoteUniverse(UniverseDetection.isRemoteUniverse());
    };

    checkUniverseType();
    const interval = setInterval(checkUniverseType, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
      <div className="w-full flex items-center justify-between">
        <a href="/" className="flex items-center space-x-3 sm:space-x-4">
          <img src="/static/atlas-logo.jpg" alt={t("Atlas Logo")} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-blue-400 shadow-lg" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">The Atlas</h1>
            <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">{t("Universal Navigation System")}</p>
          </div>
        </a>

        <div className="flex items-center space-x-3 sm:space-x-6">
          <a href="/" className="px-3 py-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-xs sm:text-sm font-medium hover:bg-cyan-500/20 hover:scale-105 transition-all">
            {t("Back to your ship")}
          </a>
          <a href="/multiverse" className="hover:scale-105 transition-transform">
            <div className="flex items-center space-x-2 text-green-400 relative">
              {isRemoteUniverse ? <MultiverseHeaderConnectedIcon className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>}
              <div className="relative">
                <span className="text-xs sm:text-sm font-medium font-mono">{/* The glitch scrambles the English text; at rest it reads in the pilot's language */}
                {isRemoteUniverse && glitchText !== "MULTIVERSE ONLINE" ? glitchText : t("MULTIVERSE ONLINE")}</span>
                {isRemoteUniverse && (
                  <div className="absolute top-full left-0 w-full h-0.5 bg-green-900 overflow-hidden -mt-0.5 rounded-3xl">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse-slow relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300 to-transparent animate-data-stream"></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </a>
          <div className="text-xs sm:text-sm hidden lg:block text-gray-400">{t("Quantum Navigation Ready")}</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
