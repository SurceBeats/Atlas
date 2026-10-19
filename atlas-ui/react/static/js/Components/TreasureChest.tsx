// atlas-ui/react/static/js/Components/TreasureChest.tsx
import React, { useState, useEffect } from "react";
import { SpaceshipResourceManager } from "../Utils/SpaceshipResources.tsx";
import { ResourceEventManager } from "../Utils/ResourceEventManager.tsx";
import AntimatterIcon from "../Icons/AntimatterIcon.tsx";
import Element115Icon from "../Icons/Element115Icon.tsx";
import DeuteriumIcon from "../Icons/DeuteriumIcon.tsx";
import { createRoot } from "react-dom/client";
import { amount, t } from "../i18n/i18n.ts";

declare global {
  interface Window {
    CHEST_SHOW?: boolean;
    CHEST_PROBABILITY?: number;
  }
}

if (typeof window !== "undefined") {
  window.CHEST_SHOW = false;
  window.CHEST_PROBABILITY = 0.000001;
}

interface TreasureReward {
  antimatter: number;
  element115: number;
  deuterium: number;
}

const TreasureChest: React.FC = () => {
  const [showTreasureChest, setShowTreasureChest] = useState<boolean>(false);
  const [showChestPopup, setShowChestPopup] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isButtonDisappearing, setIsButtonDisappearing] = useState<boolean>(false);
  const [treasureReward, setTreasureReward] = useState<TreasureReward | null>(null);

  useEffect(() => {
    const probability = window.CHEST_PROBABILITY || 0.000001;
    const shouldShow = window.CHEST_SHOW || Math.random() < probability;
    setShowTreasureChest(shouldShow);
  }, []);

  const showTreasureNotification = (reward: TreasureReward) => {
    if (reward.antimatter + reward.element115 + reward.deuterium === 0) return;

    const toast = document.createElement("div");
    toast.className = "fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-900/90 to-amber-900/90 text-white px-4 py-3 rounded-lg shadow-lg border border-yellow-500/50 w-[90vw] max-w-lg";
    toast.style.animation = "slideInDown 0.3s ease-out";

    const container = document.createElement("div");
    container.className = "flex items-center space-x-3";

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "text-2xl";
    emojiSpan.textContent = "💰";

    const contentDiv = document.createElement("div");

    const titleDiv = document.createElement("div");
    titleDiv.className = "text-sm font-bold text-yellow-300";
    titleDiv.textContent = t("Treasure Chest Collected!");

    const resourceDiv = document.createElement("div");
    resourceDiv.className = "text-xs text-yellow-200 mt-1 flex gap-3";

    const amSpan = document.createElement("span");
    amSpan.className = "text-purple-300 flex items-center gap-1";
    const amRoot = createRoot(amSpan);
    amRoot.render(
      <>
        <AntimatterIcon size={12} color="currentColor" />+{amount(reward.antimatter)} AM
      </>
    );

    const e115Span = document.createElement("span");
    e115Span.className = "text-cyan-300 flex items-center gap-1";
    const e115Root = createRoot(e115Span);
    e115Root.render(
      <>
        <Element115Icon size={12} color="currentColor" />+{amount(reward.element115)} E115
      </>
    );

    const deuteriumSpan = document.createElement("span");
    deuteriumSpan.className = "text-orange-300 flex items-center gap-1";
    const deuteriumRoot = createRoot(deuteriumSpan);
    deuteriumRoot.render(
      <>
        <DeuteriumIcon size={12} color="currentColor" />+{amount(reward.deuterium)} D
      </>
    );

    resourceDiv.appendChild(amSpan);
    resourceDiv.appendChild(e115Span);
    resourceDiv.appendChild(deuteriumSpan);

    const sourceDiv = document.createElement("div");
    sourceDiv.className = "text-xs text-yellow-300 mt-1";
    sourceDiv.textContent = `🎉 ${t("Lucky find! Extremely rare treasure!")}`;

    contentDiv.appendChild(titleDiv);
    contentDiv.appendChild(resourceDiv);
    contentDiv.appendChild(sourceDiv);

    container.appendChild(emojiSpan);
    container.appendChild(contentDiv);
    toast.appendChild(container);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = "slideOutUp 0.3s ease-in forwards";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  };

  const handleTreasureChestClick = () => {
    const randomResources: TreasureReward = {
      antimatter: Math.floor(Math.random() * 1001),
      element115: Math.floor(Math.random() * 1001),
      deuterium: Math.floor(Math.random() * 1001),
    };

    setTreasureReward(randomResources);

    setShowChestPopup(true);
  };

  const handleCollectRewards = () => {
    if (treasureReward) {
      SpaceshipResourceManager.addResources(treasureReward);

      showTreasureNotification(treasureReward);

      ResourceEventManager.emit("resources_updated");
    }

    setIsClosing(true);

    setTimeout(() => {
      setShowChestPopup(false);
      setTreasureReward(null);
      setIsClosing(false);

      disappearChestButton();
    }, 300);
  };

  const disappearChestButton = () => {
    setIsButtonDisappearing(true);

    setTimeout(() => {
      setShowTreasureChest(false);
      setIsButtonDisappearing(false);
    }, 800);
  };

  const handleCloseWithoutCollecting = () => {
    setIsClosing(true);

    setTimeout(() => {
      setShowChestPopup(false);
      setTreasureReward(null);
      setIsClosing(false);

      disappearChestButton();
    }, 300);
  };

  if (!showTreasureChest) return null;

  return (
    <>
      <button onClick={isButtonDisappearing ? undefined : handleTreasureChestClick} disabled={isButtonDisappearing} className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-600 via-amber-600 to-yellow-800 text-white rounded-full shadow-2xl border-2 border-yellow-400/30 backdrop-blur-sm ${isButtonDisappearing ? "animate-popAndFadeOut cursor-not-allowed" : "hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"}`} title={isButtonDisappearing ? t("Treasure chest is disappearing...") : t("Treasure Chest - Click for random resources!")}>
        <div className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
            <path fill="currentColor" d="M2 20h20V7c0-.8-.32-1.56-.88-2.12S19.8 4 19 4H5c-.8 0-1.56.32-2.12.88S2 6.2 2 7zm18-9h-5V9H9v2H4V7c0-.26.11-.5.29-.71C4.5 6.11 4.74 6 5 6h14c.27 0 .5.11.71.29c.19.21.29.45.29.71zm-5 2h5v5H4v-5h5l2 2h2zm-4-2h2v2h-2z"></path>
          </svg>
        </div>
        <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
      </button>

      {showChestPopup && treasureReward && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"}`} style={{ zIndex: 10000 }} onClick={isClosing ? undefined : handleCloseWithoutCollecting}>
          <div className={`bg-gradient-to-br from-yellow-900/90 via-amber-900/90 to-yellow-800/90 backdrop-blur-xl rounded-2xl border-2 border-yellow-400/50 shadow-2xl w-full max-w-md ${isClosing ? "animate-slideDown" : "animate-slideUp"}`} style={{ zIndex: 10001 }} onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-yellow-600/30 to-amber-600/30 p-4 border-b border-yellow-400/30 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-yellow-100 font-bold text-xl flex items-center gap-2">🎉 {t("Treasure Found!")} 🎉</h3>
                <button onClick={isClosing ? undefined : handleCloseWithoutCollecting} disabled={isClosing} aria-label={t("Close")} className={`transition-colors duration-200 ${isClosing ? "text-yellow-600 cursor-not-allowed" : "text-yellow-400 hover:text-yellow-200 cursor-pointer"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 text-center">
              <div className="text-lg text-yellow-200 mb-4">{t("You discovered a rare treasure chest!")}</div>

              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="text-sm text-yellow-300 mb-2">{t("Resources to collect:")}</div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-purple-300 font-bold flex items-center justify-center gap-1">
                      <AntimatterIcon size={16} color="currentColor" />+{amount(treasureReward.antimatter)}
                    </div>
                    <div className="text-xs text-purple-400">{t("Antimatter")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-300 font-bold flex items-center justify-center gap-1">
                      <Element115Icon size={16} color="currentColor" />+{amount(treasureReward.element115)}
                    </div>
                    <div className="text-xs text-cyan-400">{t("Element 115")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-300 font-bold flex items-center justify-center gap-1">
                      <DeuteriumIcon size={16} color="currentColor" />+{amount(treasureReward.deuterium)}
                    </div>
                    <div className="text-xs text-orange-400">{t("Deuterium")}</div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-yellow-400 mb-4">✨ {t("Lucky find! These chests are extremely rare!")} ✨</div>

              <div className="flex gap-3">
                <button onClick={isClosing ? undefined : handleCloseWithoutCollecting} disabled={isClosing} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${isClosing ? "bg-gray-700/30 text-gray-500 border-gray-600/30 cursor-not-allowed" : "bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 border-gray-600/50 hover:border-gray-500 cursor-pointer"}`}>
                  {t("Close")}
                </button>
                <button onClick={isClosing ? undefined : handleCollectRewards} disabled={isClosing} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${isClosing ? "bg-yellow-600/20 text-yellow-500 border-yellow-500/30 cursor-not-allowed" : "bg-gradient-to-r from-yellow-600/30 to-amber-600/30 hover:from-yellow-600/40 hover:to-amber-600/40 text-yellow-300 border-yellow-500/50 hover:border-yellow-400/70 cursor-pointer"}`}>
                  🎉 {t("Collect")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TreasureChest;
