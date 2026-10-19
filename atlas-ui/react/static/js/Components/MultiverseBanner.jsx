// atlas-ui/react/static/js/Components/MultiverseBanner.jsx

import { useState, useEffect, useRef } from "react";
import NodeIdIcon from "../Icons/NodeIdIcon.tsx";
import SeedIcon from "../Icons/SeedIcon.tsx";
import BitBangIcon from "../Icons/BitBangIcon.tsx";
import UniverseIcon from "../Icons/UniverseIcon.jsx";
import MultiverseTransitionCanvas from "./MultiverseTransitionCanvas.tsx";
import { t } from "../i18n/i18n.ts";

const MultiverseBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [universeConfig, setUniverseConfig] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const bannerRef = useRef(null);

  useEffect(() => {
    const checkUniverseConfig = () => {
      const configElement = document.getElementById("data-universe-config");
      if (configElement) {
        try {
          const config = JSON.parse(configElement.textContent);
          setUniverseConfig(config);
        } catch (e) {
          console.error("Error parsing universe config:", e);
        }
      }
    };

    checkUniverseConfig();

    const interval = setInterval(checkUniverseConfig, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleExitUniverse = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(true);
    }, 300);
  };

  const handleTransitionComplete = () => {
    window.location.href = "/multiverse/exit";
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 300);
  };

  const handleToggle = () => {
    if (isExpanded) {
      handleCloseModal();
    } else {
      setIsExpanded(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExpanded && !isClosing && bannerRef.current && !bannerRef.current.contains(event.target)) {
        handleCloseModal();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded, isClosing]);

  const formatNodeId = (nodeId) => {
    if (!nodeId) return t("Unknown");
    return nodeId;
  };

  const formatCosmicTime = (timestamp) => {
    if (!timestamp) return t("Unknown");
    const date = new Date(timestamp * 1000);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  if (!universeConfig?.remote) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50">
        <button onClick={handleToggle} className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-900 via-slate-900 to-black hover:from-emerald-800 hover:via-slate-800 hover:to-gray-900 text-white rounded-full shadow-2xl border-2 border-emerald-400/40 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm" title={t("Remote Universe Info")}>
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" className="text-emerald-200">
              <rect width="24" height="24" fill="none" />
              <g fill="none" fillRule="evenodd">
                <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
                <path fill="currentColor" d="M11 2.423a2 2 0 0 1 1.842-.082l.158.082l3.33 1.922a2 2 0 0 1 .993 1.569l.007.163v3.846l3.33 1.922a2 2 0 0 1 .994 1.569l.006.163v3.846a2 2 0 0 1-.861 1.644l-.139.088l-3.33 1.922a2 2 0 0 1-1.842.082l-.158-.082L12 19.155l-3.33 1.922a2 2 0 0 1-1.843.082l-.157-.082l-3.33-1.922a2 2 0 0 1-.993-1.568l-.007-.164v-3.846a2 2 0 0 1 .861-1.644l.139-.088l3.33-1.922V6.077a2 2 0 0 1 .861-1.644l.139-.088zm0 12.31l-2.33 1.344v2.69L11 17.424zm2 0v2.69l2.33 1.345v-2.69zm6.66 0l-2.33 1.344v2.691l2.33-1.345zm-15.32-.001v2.69l2.33 1.346v-2.69zm11.99-3.077L14 13l2.33 1.345L18.66 13zm-8.66 0L5.34 13l2.33 1.345L10 13zm7.66-4.423L13 8.577v2.691l2.33-1.345zm-6.66 0v2.69L11 11.269v-2.69zM12 4.155L9.67 5.5L12 6.845L14.33 5.5z" />
              </g>
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
        </button>
      </div>

      {isExpanded && (
        <div
          ref={bannerRef}
          className="fixed bottom-36 sm:bottom-40 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-96 max-w-md max-h-[70vh] sm:max-h-96 bg-black/90 backdrop-blur-xl rounded-2xl border border-purple-400/30 shadow-2xl z-40 overflow-hidden transition-all duration-300 ease-out"
          style={{
            animation: isClosing ? "slideDownFadeOut 0.3s ease-out forwards" : "slideUpFadeIn 0.3s ease-out forwards",
          }}
        >
          <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                <h3 className="text-white font-bold text-lg">🌌 {t("Remote Universe")}</h3>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={t("Close")}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="text-purple-200 text-sm">{universeConfig.seed_name || t("Unknown Universe")}</div>

            <div className="bg-white/5 rounded-lg p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <NodeIdIcon size={14} color="#c084fc" />
                <span className="text-gray-400 text-xs">{t("Atlas Node ID")}</span>
              </div>
              <div className="text-purple-400 font-mono text-[10px] pl-5 truncate">{formatNodeId(universeConfig.node_id)}</div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-1">
                <SeedIcon size={14} color="#60a5fa" />
                <span className="text-gray-400 text-xs">{t("Remote Seed")}</span>
              </div>
              <div className="text-blue-400 font-mono text-[10px] pl-5 truncate">{universeConfig.seed_str || t("Not available")}</div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-1">
                <BitBangIcon size={14} color="#06b6d4" />
                <span className="text-gray-400 text-xs">{t("Remote Bit Bang (Cosmic Origin Time)")}</span>
              </div>
              <div className="text-cyan-400 font-mono text-[10px] pl-5 truncate">{formatCosmicTime(universeConfig.cosmic_origin_time) || t("Not available")}</div>
            </div>

            <button onClick={handleExitUniverse} className="w-full bg-gray-700/30 hover:bg-gray-600/40 text-gray-300 hover:text-white text-sm py-2 px-3 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50">
              <div className="flex items-center justify-center space-x-2">
                <UniverseIcon size={16} color="currentColor" />
                <span>{t("Return to Your Universe")}</span>
              </div>
            </button>

            <a href="/multiverse" className="block w-full bg-purple-700/20 hover:bg-purple-600/30 text-purple-300 hover:text-purple-200 text-xs py-1.5 px-2 rounded-md transition-all duration-200 border border-purple-500/20 hover:border-purple-400/30 text-center mt-2">
              <div className="flex items-center justify-center space-x-1">
                <span>🌌</span>
                <span>{t("Explore more Universes")}</span>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Multiverse Transition Animation */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] animate-fadeIn">
          <MultiverseTransitionCanvas isActive={isTransitioning} onTransitionComplete={handleTransitionComplete} />
        </div>
      )}
    </>
  );
};

export default MultiverseBanner;
