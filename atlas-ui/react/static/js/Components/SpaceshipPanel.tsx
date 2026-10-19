// atlas-ui/react/static/js/Components/SpaceshipPanel.tsx

import React, { useState, useEffect, useRef } from "react";
import { getStorageStats } from "../Utils/VisitHistory.tsx";
import { LocationBookmarks, SavedLocation } from "../Utils/LocationBookmarks.tsx";
import { DailyChallengesManager, DailyChallenges } from "../Utils/DailyChallenges.tsx";
import { SpaceshipResourceManager, SpaceshipResource, SpaceshipUpgrade, TravelCost } from "../Utils/SpaceshipResources.tsx";
import { UnifiedSpaceshipStorage } from "../Utils/UnifiedSpaceshipStorage.tsx";
import { ResourceEventManager } from "../Utils/ResourceEventManager.tsx";
import { getItem, setItem } from "../Utils/b64.tsx";
import { DataExportImport } from "../Utils/DataExportImport.tsx";
import ProgressBar from "./ProgressBar.tsx";
import AntimatterIcon from "../Icons/AntimatterIcon.tsx";
import DeuteriumIcon from "../Icons/DeuteriumIcon.tsx";
import Element115Icon from "../Icons/Element115Icon.tsx";
import { UniverseDetection } from "../Utils/UniverseDetection.tsx";
import { amount, num, t } from "../i18n/i18n.ts";

interface SpaceshipPanelProps {
  currentLocation?: {
    type: "galaxy" | "system" | "planet";
    name: string;
    coordinates: string;
    systemIndex?: number;
    planetName?: string;
  };
}

const SpaceshipPanel: React.FC<SpaceshipPanelProps> = ({ currentLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "ship" | "saved">("stats");
  const [stats, setStats] = useState<any>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [locationStats, setLocationStats] = useState<any>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenges | null>(null);
  const [spaceshipResources, setSpaceshipResources] = useState<SpaceshipResource>({ antimatter: 0, element115: 0, deuterium: 0 });
  const [spaceshipUpgrade, setSpaceshipUpgrade] = useState<SpaceshipUpgrade>({ level: 1, efficiency: 1.0, range: 300, storage: 500, multiplier: 1.0 });
  const [upgradeCost, setUpgradeCost] = useState<TravelCost>({ antimatter: 0, element115: 0, deuterium: 0 });
  const [passiveGeneration, setPassiveGeneration] = useState<any>({ antimatter: 0, element115: 0, deuterium: 0, sources: { planets: 0, systems: 0, galaxies: 0 } });
  const [baseGeneration, setBaseGeneration] = useState<any>({ antimatter: 0, element115: 0, deuterium: 0, sources: { planets: 0, systems: 0, galaxies: 0 } });
  const [showCollectionPopup, setShowCollectionPopup] = useState<boolean>(false);
  const [isCollectionClosing, setIsCollectionClosing] = useState<boolean>(false);
  const [, forceUpdate] = useState({});
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [isRemoteUniverse, setIsRemoteUniverse] = useState<boolean>(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const collectionModalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStats(getStorageStats());
      setSavedLocations(LocationBookmarks.getLocations());
      setLocationStats(LocationBookmarks.getLocationStats());

      const challenges = DailyChallengesManager.updateProgress();
      setDailyChallenges(challenges);

      setSpaceshipResources(SpaceshipResourceManager.getResources());
      setSpaceshipUpgrade(SpaceshipResourceManager.getUpgrade());
      const upgrade = SpaceshipResourceManager.getUpgrade();
      setUpgradeCost(SpaceshipResourceManager.getUpgradeCost(upgrade.level));

      const passiveInfo = SpaceshipResourceManager.getAccumulatedResourcesWithLimit();
      setPassiveGeneration(passiveInfo);

      const baseGenerationInfo = SpaceshipResourceManager.calculatePassiveGeneration();
      setBaseGeneration(baseGenerationInfo);

      setIsRemoteUniverse(UniverseDetection.isRemoteUniverse());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const checkUniverseType = () => {
      setIsRemoteUniverse(UniverseDetection.isRemoteUniverse());
    };

    const interval = setInterval(checkUniverseType, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePassiveDisplay = () => {
      const passiveInfo = SpaceshipResourceManager.getAccumulatedResourcesWithLimit();
      setPassiveGeneration(passiveInfo);

      const baseGenerationInfo = SpaceshipResourceManager.calculatePassiveGeneration();
      setBaseGeneration(baseGenerationInfo);
    };

    const updateSpaceshipResources = () => {
      setSpaceshipResources(SpaceshipResourceManager.getResources());
    };

    const interval = setInterval(updatePassiveDisplay, 15000);

    const unsubscribeResources = ResourceEventManager.subscribe("resources_updated", updateSpaceshipResources);

    let cooldownInterval: NodeJS.Timeout | null = null;
    if (activeTab === "saved") {
      cooldownInterval = setInterval(() => {
        forceUpdate({});
      }, 30000);
    }

    return () => {
      clearInterval(interval);
      if (cooldownInterval) clearInterval(cooldownInterval);
      unsubscribeResources();
    };
  }, [isOpen, activeTab]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleExport = async () => {
    try {
      await DataExportImport.downloadExport();
    } catch (error) {
      console.error("Export failed:", error);
      setImportError(t("Export failed. Please try again."));
      setTimeout(() => setImportError(null), 3000);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".atl")) {
      setImportError(t("Please select a valid .atl file"));
      setTimeout(() => setImportError(null), 3000);
      return;
    }

    try {
      await DataExportImport.importData(file);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : t("Import failed"));
      setTimeout(() => setImportError(null), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !isClosing && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, isClosing]);

  useEffect(() => {
    const handleCollectionModalClickOutside = (event: MouseEvent) => {
      if (showCollectionPopup && !isCollectionClosing && collectionModalRef.current && !collectionModalRef.current.contains(event.target as Node)) {
        closeCollectionPopup();
      }
    };

    document.addEventListener("mousedown", handleCollectionModalClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleCollectionModalClickOutside);
    };
  }, [showCollectionPopup, isCollectionClosing]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return amount(bytes / Math.pow(k, i), 2) + " " + sizes[i];
  };

  const formatLocationName = (name: string) => {
    return name.replace(/_/g, " ");
  };

  const handleRemoveLocation = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation();
    LocationBookmarks.removeLocation(locationId);
    setSavedLocations(LocationBookmarks.getLocations());
    setLocationStats(LocationBookmarks.getLocationStats());
  };

  const closeCollectionPopup = () => {
    setIsCollectionClosing(true);
    setTimeout(() => {
      setShowCollectionPopup(false);
      setIsCollectionClosing(false);
    }, 300);
  };

  return (
    <>
      <div ref={panelRef} className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
        <button onClick={handleToggle} className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 hover:from-blue-500 hover:via-purple-500 hover:to-blue-700 text-white rounded-full shadow-2xl border-2 border-blue-400/30 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm" title={t("Spaceship Control Panel")}>
          <div className="flex items-center justify-center">
            <svg className="flex items-center justify-center" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
                <path d="M12 3a6.02 6.02 0 0 0-5.923 4.9c-.086.466-.13.699.032 1.005c.161.307.39.409.847.613c1.38.614 3.134.982 5.044.982s3.665-.368 5.044-.982c.457-.204.686-.306.847-.613c.162-.306.118-.54.032-1.005A6.02 6.02 0 0 0 12 3"></path>
                <path d="M17 5.5c2.989.788 5 2.26 5 3.945C22 11.961 17.523 14 12 14S2 11.96 2 9.445C2 7.76 4.011 6.288 7 5.5M12 18v3m5-4l1 4M7 17l-1 4"></path>
              </g>
            </svg>
          </div>

          <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping"></div>
        </button>

        {isOpen && (
          <div
            className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-96 max-w-md max-h-[70vh] sm:max-h-96 bg-black/90 backdrop-blur-xl rounded-2xl border border-blue-400/30 shadow-2xl z-40 overflow-hidden transition-all duration-300 ease-out"
            style={{
              animation: isClosing ? "slideDownFadeOut 0.3s ease-out forwards" : "slideUpFadeIn 0.3s ease-out forwards",
            }}
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-white font-bold text-lg">🚀 {t("Spaceship Control")}</h3>
                </div>
                <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={t("Close")}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex mt-3 space-x-1 overflow-x-auto">
                <button onClick={() => setActiveTab("stats")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${activeTab === "stats" ? "bg-blue-500/30 text-blue-300 border border-blue-500/50" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
                  📊 {t("Stats")}
                </button>
                <button onClick={() => setActiveTab("ship")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${activeTab === "ship" ? "bg-green-500/30 text-green-300 border border-green-500/50" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
                  🚀 {t("Ship")}
                </button>
                <button onClick={() => setActiveTab("saved")} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${activeTab === "saved" ? "bg-purple-500/30 text-purple-300 border border-purple-500/50" : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
                  📍 {t("Saved (%lld)", locationStats?.total || 0)}
                </button>
              </div>
            </div>

            <div className="p-4 max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {activeTab === "stats" && (
                <div className="space-y-2">
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-xs">🌟 {t("Daily Challenges")}</h4>

                    <div className="bg-white/5 rounded p-2 border border-indigo-500/20">
                      {dailyChallenges && (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-gray-400">{t("Today's Progress")}</span>
                            <span className="text-[9px] text-indigo-400">
                              {t("Day %lld", dailyChallenges.dayNumber)} • x{DailyChallengesManager.getDayInfo().multiplier}
                            </span>
                          </div>

                          <div className="space-y-1.5 mb-2">
                            {dailyChallenges.challenges.map((challenge) => {
                              const colors = {
                                galaxies: "indigo" as const,
                                systems: "blue" as const,
                                planets: "purple" as const,
                              };

                              const labels = {
                                galaxies: "Galaxies",
                                systems: "Systems",
                                planets: "Planets",
                              };

                              return (
                                <div key={challenge.type} className="relative">
                                  <div className="text-[10px] text-gray-400 mb-0.5">{t(labels[challenge.type])}</div>
                                  <ProgressBar value={challenge.current} max={challenge.target} label={`${challenge.current}/${challenge.target}`} color={colors[challenge.type]} showPercentage={true} />
                                  {challenge.completed && (
                                    <div className="absolute -right-2 top-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 128 128">
                                        <path fill="#40c0e7" stroke="#40c0e7" strokeMiterlimit={10} strokeWidth={6} d="M48.3 103.45L12.65 67.99a2.2 2.2 0 0 1 0-3.12l9-9.01c.86-.86 2.25-.86 3.11 0l23.47 23.33c.86.86 2.26.85 3.12-.01l51.86-52.36c.86-.87 2.26-.87 3.13-.01l9.01 9.01c.86.86.86 2.25.01 3.11l-56.5 57.01l.01.01l-7.45 7.49c-.86.86-2.26.86-3.12.01z" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            <div className="bg-black/30 rounded p-1.5 border border-indigo-500/30">
                              <div className="text-gray-400 text-[9px]">{t("Completed")}</div>
                              <div className="text-indigo-400 font-bold">
                                {dailyChallenges.challenges.filter((c) => c.completed).length}/{dailyChallenges.challenges.length}
                              </div>
                            </div>
                            <div className="bg-black/30 rounded p-1.5 border border-green-500/30">
                              <div className="text-gray-400 text-[9px]">{t("Atlas Size")}</div>
                              <div className="text-green-400 font-bold">{stats ? formatBytes(stats.size) : "0 B"}</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2 text-xs">📍 {t("Saved Locations")}</h4>

                    <div className="bg-white/5 rounded p-2 border border-purple-500/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-gray-400">{t("Storage Usage")}</span>
                        <span className="text-[9px] text-purple-400">
                          {t("%lld/%lld slots", locationStats?.total || 0, locationStats?.maxAllowed || 50)}
                        </span>
                      </div>

                      <div className="mb-2">
                        <ProgressBar value={locationStats?.total || 0} max={locationStats?.maxAllowed || 50} label={`${locationStats?.total || 0}/${locationStats?.maxAllowed || 50}`} color="purple" showPercentage={true} />
                      </div>

                      <div className="grid grid-cols-3 gap-1 text-[10px]">
                        <div className="bg-black/30 rounded p-1 text-center border border-indigo-500/30">
                          <div className="text-gray-400 text-[9px]">{t("Galaxies")}</div>
                          <div className="text-indigo-400 font-bold">{locationStats?.galaxies || 0}</div>
                        </div>
                        <div className="bg-black/30 rounded p-1 text-center border border-blue-500/30">
                          <div className="text-gray-400 text-[9px]">{t("Systems")}</div>
                          <div className="text-blue-400 font-bold">{locationStats?.systems || 0}</div>
                        </div>
                        <div className="bg-black/30 rounded p-1 text-center border border-purple-500/30">
                          <div className="text-gray-400 text-[9px]">{t("Planets")}</div>
                          <div className="text-purple-400 font-bold">{locationStats?.planets || 0}</div>
                        </div>
                      </div>

                      <div className="text-[8px] text-gray-500 mt-2">{t("Complete daily tasks to save more locations")}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2 text-xs">💾 {t("Data Management")}</h4>

                    <div className="space-y-2">
                      <div className="bg-white/5 rounded p-2 border border-blue-500/20">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-400">{t("Export/Import Atlas Data")}</span>
                          <span className="text-[9px] text-blue-400">
                            {(() => {
                              const summary = DataExportImport.getDataSummary();
                              const count = [summary.hasSpaceship, summary.hasArchive, summary.hasDailyChallenges, summary.hasLocations].filter(Boolean).length;
                              return t("%lld/4 keys", count);
                            })()}
                          </span>
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button onClick={handleExport} className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] px-2 py-1.5 rounded border border-blue-500/50 transition-colors duration-200 flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24">
                              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.5}>
                                <path d="M4 12a8 8 0 1 0 16 0"></path>
                                <path strokeLinejoin="round" d="M12 14V4m0 0l3 3m-3-3L9 7"></path>
                              </g>
                            </svg>
                            <span>{t("Export")}</span>
                          </button>
                          <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 text-[10px] px-2 py-1.5 rounded border border-green-500/50 transition-colors duration-200 flex items-center justify-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24">
                              <path fill="currentColor" d="M14.47 10.47a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V4a.75.75 0 0 1 1.5 0v8.19z"></path>
                              <path fill="currentColor" d="M20.75 12a.75.75 0 0 0-1.5 0a7.25 7.25 0 1 1-14.5 0a.75.75 0 0 0-1.5 0a8.75 8.75 0 1 0 17.5 0"></path>
                            </svg>
                            <span>{t("Import")}</span>
                          </button>
                        </div>

                        <input ref={fileInputRef} type="file" accept=".atl" onChange={handleImport} className="hidden" />

                        {importError && <div className="mt-2 text-[9px] text-red-400 bg-red-500/10 p-1 rounded">{importError}</div>}

                        {importSuccess && <div className="mt-2 text-[9px] text-green-400 bg-green-500/10 p-1 rounded">{t("Data imported successfully! Reloading...")}</div>}

                        <div className="text-[8px] text-gray-500 mt-2">{t("Saves all localStorage keys to .atl file")}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ship" && (
                <div className="space-y-2">
                  <div>
                    <h4 className="text-white font-semibold mb-2 text-xs flex items-center gap-1">
                      ⚡ {t("Resources")}
                      <div className="text-[10px] text-gray-400">{t("Lv.%lld", spaceshipUpgrade.level)}</div>
                    </h4>

                    <div className="space-y-1 mb-2">
                      <div className="bg-white/5 rounded p-1.5 border border-purple-500/20">
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-purple-300 flex items-center gap-1">
                            <AntimatterIcon size={12} color="currentColor" />
                            {t("Antimatter")}
                          </span>
                          <span className="text-white font-mono">
                            {amount(spaceshipResources.antimatter)}/{amount(spaceshipUpgrade.storage)}
                          </span>
                        </div>
                        <ProgressBar value={spaceshipResources.antimatter} max={spaceshipUpgrade.storage} label="" color="purple" showPercentage={false} />
                      </div>

                      <div className="bg-white/5 rounded p-1.5 border border-cyan-500/20">
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-cyan-300 flex items-center gap-1">
                            <Element115Icon size={12} color="currentColor" />
                            {t("Element 115")}
                          </span>
                          <span className="text-white font-mono">
                            {amount(spaceshipResources.element115)}/{amount(spaceshipUpgrade.storage)}
                          </span>
                        </div>
                        <ProgressBar value={spaceshipResources.element115} max={spaceshipUpgrade.storage} label="" color="cyan" showPercentage={false} />
                      </div>

                      <div className="bg-white/5 rounded p-1.5 border border-orange-500/20">
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-orange-300 flex items-center gap-1">
                            <DeuteriumIcon size={12} color="currentColor" />
                            {t("Deuterium")}
                          </span>
                          <span className="text-white font-mono">
                            {amount(spaceshipResources.deuterium)}/{amount(spaceshipUpgrade.storage)}
                          </span>
                        </div>
                        <ProgressBar value={spaceshipResources.deuterium} max={spaceshipUpgrade.storage} label="" color="orange" showPercentage={false} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2 text-xs">🔧 {t("Ship Upgrade")}</h4>

                    <div className="grid grid-cols-3 gap-1 text-[10px] mb-2">
                      <div className="bg-white/5 rounded p-1 border border-blue-500/20">
                        <div className="text-gray-400 text-[9px]">{t("Efficiency")}</div>
                        <div className="text-blue-400 font-bold">{num(spaceshipUpgrade.efficiency, 1)}x</div>
                      </div>
                      <div className="bg-white/5 rounded p-1 border border-yellow-500/20">
                        <div className="text-gray-400 text-[9px]">{t("Storage")}</div>
                        <div className="text-yellow-400 font-bold">{amount(spaceshipUpgrade.storage)}</div>
                      </div>
                      <div className="bg-white/5 rounded p-1 border border-indigo-500/20">
                        <div className="text-gray-400 text-[9px]">{t("Multiplier")}</div>
                        <div className="text-indigo-400 font-bold">{num(spaceshipUpgrade.multiplier, 1)}x</div>
                      </div>
                    </div>

                    {spaceshipUpgrade.level < 100 && !SpaceshipResourceManager.canAffordUpgrade() && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded p-1.5 mb-2">
                        <div className="text-[10px] text-red-300 font-semibold mb-0.5">{t("Missing resources:")}</div>
                        <div className="text-[9px] text-red-200 space-y-0.5">
                          {/* The icon ahead of the sentence, so each language orders its words freely */}
                          {upgradeCost.antimatter > spaceshipResources.antimatter && (
                            <div className="flex items-center gap-1">
                              • <AntimatterIcon size={10} color="currentColor" /> {t("Need %lld more %@", upgradeCost.antimatter - spaceshipResources.antimatter, t("Antimatter"))}
                            </div>
                          )}
                          {upgradeCost.element115 > spaceshipResources.element115 && (
                            <div className="flex items-center gap-1">
                              • <Element115Icon size={10} color="currentColor" /> {t("Need %lld more %@", upgradeCost.element115 - spaceshipResources.element115, t("Element 115"))}
                            </div>
                          )}
                          {upgradeCost.deuterium > spaceshipResources.deuterium && (
                            <div className="flex items-center gap-1">
                              • <DeuteriumIcon size={10} color="currentColor" /> {t("Need %lld more %@", upgradeCost.deuterium - spaceshipResources.deuterium, t("Deuterium"))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (SpaceshipResourceManager.upgradeShip()) {
                          setSpaceshipResources(SpaceshipResourceManager.getResources());
                          setSpaceshipUpgrade(SpaceshipResourceManager.getUpgrade());
                          const upgrade = SpaceshipResourceManager.getUpgrade();
                          setUpgradeCost(SpaceshipResourceManager.getUpgradeCost(upgrade.level));

                          const passiveInfo = SpaceshipResourceManager.getAccumulatedResourcesWithLimit();
                          setPassiveGeneration(passiveInfo);

                          ResourceEventManager.emit("resources_updated");
                        }
                      }}
                      disabled={!SpaceshipResourceManager.canAffordUpgrade()}
                      className={`w-full px-2 py-1.5 rounded text-[10px] font-medium transition-all duration-200 ${SpaceshipResourceManager.canAffordUpgrade() ? "bg-gradient-to-r from-green-600/30 to-blue-600/30 hover:from-green-600/40 hover:to-blue-600/40 text-green-300 border border-green-500/50 hover:border-green-400/70 cursor-pointer" : "bg-gray-700/30 text-gray-500 border border-gray-600/30 cursor-not-allowed"}`}
                    >
                      {spaceshipUpgrade.level >= 100 ? (
                        <div className="text-yellow-400">🌟 {t("MAX LEVEL - Ultimate Spaceship!")}</div>
                      ) : (
                        <div>
                          <div className="font-bold">{t("Upgrade to Level %lld", spaceshipUpgrade.level + 1)}</div>
                          <div className="opacity-80 flex gap-2 justify-center mt-0.5">
                            <span className="text-purple-300 flex items-center gap-0.5">
                              <AntimatterIcon size={10} color="currentColor" />
                              {amount(upgradeCost.antimatter)}AM
                            </span>
                            <span className="text-cyan-300 flex items-center gap-0.5">
                              <Element115Icon size={10} color="currentColor" />
                              {amount(upgradeCost.element115)}E115
                            </span>
                            <span className="text-orange-300 flex items-center gap-0.5">
                              <DeuteriumIcon size={10} color="currentColor" />
                              {amount(upgradeCost.deuterium)}D
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === "saved" && (
                <div className="space-y-2">
                  <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-2 border border-purple-500/30">
                    <h4 className="text-white font-semibold text-xs flex items-center gap-1 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
                        <path fill="currentColor" fillRule="evenodd" d="M3.5 8V6.5l4-3l3 1.5l4-3l6 4.5V8zm-.476 8.124L1.184 9.5h21.632l-1.84 6.624a4.5 4.5 0 0 0-7.364 4.376h-3.224q.111-.483.112-1a4.5 4.5 0 0 0-7.476-3.376M6 22.5a3 3 0 1 0 0-6a3 3 0 0 0 0 6m12 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6" clipRule="evenodd"></path>
                      </svg>
                      {t("Mining Operations")}
                    </h4>

                    {passiveGeneration.sources.planets === 0 && passiveGeneration.sources.systems === 0 ? (
                      <div className="text-[10px] text-gray-400">💡 {t("Save planets and systems to enable mining operations")}</div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-purple-300">{t("Generating/hour:")}</span>
                          <div className="flex gap-2">
                            <span className="text-purple-300 flex items-center gap-0.5">
                              <AntimatterIcon size={8} color="currentColor" />+{amount(Math.round(baseGeneration.antimatter * 60))} AM
                            </span>
                            <span className="text-cyan-300 flex items-center gap-0.5">
                              <Element115Icon size={8} color="currentColor" />+{amount(Math.round(baseGeneration.element115 * 60))} E115
                            </span>
                            <span className="text-orange-300 flex items-center gap-0.5">
                              <DeuteriumIcon size={8} color="currentColor" />+{amount(Math.round(baseGeneration.deuterium * 60))} D
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] mb-2">
                          <span className="text-gray-400">{t("Ready to collect:")}</span>
                          <div className="flex gap-2">
                            <span className="text-purple-300 flex items-center gap-0.5">
                              <AntimatterIcon size={8} color="currentColor" />+{amount(Math.round(passiveGeneration.antimatter))} AM
                            </span>
                            <span className="text-cyan-300 flex items-center gap-0.5">
                              <Element115Icon size={8} color="currentColor" />+{amount(Math.round(passiveGeneration.element115))} E115
                            </span>
                            <span className="text-orange-300 flex items-center gap-0.5">
                              <DeuteriumIcon size={8} color="currentColor" />+{amount(Math.round(passiveGeneration.deuterium))} D
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setShowCollectionPopup(true);
                          }}
                          disabled={passiveGeneration.antimatter + passiveGeneration.element115 + passiveGeneration.deuterium === 0}
                          className={`w-full px-2 py-1.5 rounded text-[10px] font-medium transition-all duration-200 ${passiveGeneration.antimatter + passiveGeneration.element115 + passiveGeneration.deuterium > 0 ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 text-purple-300 border border-purple-500/50 hover:border-purple-400/70 cursor-pointer" : "bg-gray-700/30 text-gray-500 border border-gray-600/30 cursor-not-allowed"}`}
                        >
                          🚀 {t("Collect From %@", `${amount(passiveGeneration.sources.planets)}🪐 ${amount(passiveGeneration.sources.systems)}⭐`)}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {savedLocations.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-gray-400 text-xs mb-1">{t("No saved locations")}</div>
                        <div className="text-gray-500 text-[10px]">{t("Use the 📍 button to save locations")}</div>
                      </div>
                    ) : (
                      savedLocations.map((location) => {
                        const getLocationIdFromUrl = (url: string, type: string) => {
                          try {
                            const parts = url.split("/stargate/")[1];
                            if (!parts) return "";

                            const decoded = atob(parts.replace(/-/g, "+").replace(/_/g, "/"));
                            const params = new URLSearchParams(decoded);
                            const coords = params.get("coordinates");
                            const system = params.get("system");
                            const planet = params.get("planet");

                            if (!coords) return "";

                            if (type === "galaxy") {
                              return `galaxy_${coords}`;
                            } else if (type === "system" && system) {
                              return `system_${coords}_${system}`;
                            } else if (type === "planet" && system && planet) {
                              return `planet_${coords}_${system}_${planet}`;
                            }
                            return "";
                          } catch (e) {
                            return "";
                          }
                        };

                        const locationId = getLocationIdFromUrl(location.stargateUrl, location.type);
                        const canCollect = locationId ? UnifiedSpaceshipStorage.canCollectFromLocation(locationId) : true;
                        const timeRemaining = locationId ? UnifiedSpaceshipStorage.getTimeUntilNextCollection(locationId) : 0;

                        const cooldowns = {
                          planet: 15 * 60 * 1000,
                          system: 45 * 60 * 1000,
                          galaxy: 8 * 60 * 60 * 1000,
                        };

                        const maxCooldown = cooldowns[location.type] || cooldowns.planet;
                        const timeRemainingMs = timeRemaining * 60 * 60 * 1000;
                        const progress = maxCooldown - timeRemainingMs;
                        const progressPercent = Math.max(0, Math.min(100, (progress / maxCooldown) * 100));

                        const formatTimeRemaining = (hours: number) => {
                          if (hours <= 0) return t("Ready");
                          const totalMinutes = Math.floor(hours * 60);
                          const h = Math.floor(totalMinutes / 60);
                          const m = totalMinutes % 60;
                          if (h > 0) {
                            return `${h}h ${m}m`;
                          }
                          return `${m}m`;
                        };

                        const stargateIndex = location.stargateUrl.indexOf("/stargate/");
                        const cleanUrl = stargateIndex !== -1 ? location.stargateUrl.substring(stargateIndex) : location.stargateUrl;
                        const fullUrl = `${window.location.origin}${cleanUrl}`;

                        return isRemoteUniverse ? (
                          <div key={location.id} className="block bg-red-500/10 rounded p-1.5 border border-red-500/30 opacity-60 cursor-not-allowed" title={t("Cannot travel to saved locations from remote universes - return to local universe first")}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1">
                                  <div className="text-[8px]">
                                    {location.type === "galaxy" && "🌌"}
                                    {location.type === "system" && "⭐"}
                                    {location.type === "planet" && "🪐"}
                                  </div>
                                  <div className="text-red-300 text-[10px] font-medium truncate">{formatLocationName(location.name)}</div>
                                  <div className="text-red-400 text-[8px] shrink-0">{t("REMOTE")}</div>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveLocation(e, location.id);
                                }}
                                className="text-gray-400 hover:text-red-400 transition-all duration-200 ml-1 p-0.5"
                                title="Remove location"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="text-[8px] text-red-400 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              {t("Navigation disabled in remote universe")}
                            </div>
                          </div>
                        ) : (
                          <a key={location.id} href={fullUrl} className="block bg-white/5 hover:bg-white/10 rounded p-1.5 border border-white/10 hover:border-white/20 transition-all duration-200 hover:text-blue-300" title={t("Navigate to %@", formatLocationName(location.name))}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1">
                                  <div className="text-[8px]">
                                    {location.type === "galaxy" && "🌌"}
                                    {location.type === "system" && "⭐"}
                                    {location.type === "planet" && "🪐"}
                                  </div>
                                  <div className="text-white text-[10px] font-medium truncate">{formatLocationName(location.name)}</div>
                                  <div className="text-gray-500 text-[8px] shrink-0">
                                    {(() => {
                                      try {
                                        const date = new Date(location.timestamp);
                                        return isNaN(date.getTime()) ? t("N/A") : date.toLocaleDateString();
                                      } catch (e) {
                                        return t("N/A");
                                      }
                                    })()}
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveLocation(e, location.id);
                                }}
                                className="text-gray-400 hover:text-red-400 transition-all duration-200 ml-1 p-0.5"
                                title="Remove location"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            {!canCollect && timeRemaining > 0 && (
                              <div className="mt-1">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-[8px] text-gray-400">{t("Manual mining cooldown")}</span>
                                  <span className="text-[8px] text-orange-400">{formatTimeRemaining(timeRemaining)}</span>
                                </div>
                                <div className="w-full bg-gray-800/50 rounded-full h-1 overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                                </div>
                              </div>
                            )}

                            {canCollect && locationId && (
                              <div className="mt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] text-green-400">✓ {t("Ready to mine")}</span>
                                </div>
                              </div>
                            )}
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showCollectionPopup && (
          <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isCollectionClosing ? "animate-fadeOut" : "animate-fadeIn"}`}>
            <div ref={collectionModalRef} className={`bg-black/90 backdrop-blur-xl rounded-2xl border border-purple-400/30 shadow-2xl w-full max-w-md ${isCollectionClosing ? "animate-slideDown" : "animate-slideUp"}`}>
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-4 py-3 border-b border-white/10 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                      <path fill="currentColor" fillRule="evenodd" d="M3.5 8V6.5l4-3l3 1.5l4-3l6 4.5V8zm-.476 8.124L1.184 9.5h21.632l-1.84 6.624a4.5 4.5 0 0 0-7.364 4.376h-3.224q.111-.483.112-1a4.5 4.5 0 0 0-7.476-3.376M6 22.5a3 3 0 1 0 0-6a3 3 0 0 0 0 6m12 0a3 3 0 1 0 0-6a3 3 0 0 0 0 6" clipRule="evenodd"></path>
                    </svg>
                    {t("Mass Collection")}
                  </h3>
                  <button onClick={closeCollectionPopup} className="text-gray-400 hover:text-white transition-colors duration-200" aria-label={t("Close")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="text-sm text-gray-300 mb-4">{t("Collect resources from all your saved mining locations at once.")}</div>

                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-400 mb-2">{t("Available to collect:")}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className={`font-bold flex items-center justify-center gap-1 ${passiveGeneration.antimatter > 0 ? "text-purple-300" : "text-gray-500"}`}>
                        <AntimatterIcon size={12} color="currentColor" />+{amount(Math.round(passiveGeneration.antimatter))}
                      </div>
                      <div className="text-gray-500">{t("Antimatter")}</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold flex items-center justify-center gap-1 ${passiveGeneration.element115 > 0 ? "text-cyan-300" : "text-gray-500"}`}>
                        <Element115Icon size={12} color="currentColor" />+{amount(Math.round(passiveGeneration.element115))}
                      </div>
                      <div className="text-gray-500">{t("Element 115")}</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-bold flex items-center justify-center gap-1 ${passiveGeneration.deuterium > 0 ? "text-orange-300" : "text-gray-500"}`}>
                        <DeuteriumIcon size={12} color="currentColor" />+{amount(Math.round(passiveGeneration.deuterium))}
                      </div>
                      <div className="text-gray-500">{t("Deuterium")}</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  🌟 {t("Sources: %@", t("%@ and %@", t("%lld planets", passiveGeneration.sources.planets), t("%lld star systems", passiveGeneration.sources.systems)))}
                </div>

                <div className="flex gap-3">
                  <button onClick={closeCollectionPopup} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 border border-gray-600/50 transition-all duration-200">
                    {t("Cancel")}
                  </button>
                  <button
                    onClick={() => {
                      SpaceshipResourceManager.addResources({
                        antimatter: Math.round(passiveGeneration.antimatter),
                        element115: Math.round(passiveGeneration.element115),
                        deuterium: Math.round(passiveGeneration.deuterium),
                      });

                      SpaceshipResourceManager.showPassiveGenerationNotification(passiveGeneration);

                      const data = JSON.parse(getItem("_atlasSpaceShip") || "{}");
                      if (!data.t) data.t = {};
                      data.t.lp = Date.now();
                      setItem("_atlasSpaceShip", JSON.stringify(data));

                      setSpaceshipResources(SpaceshipResourceManager.getResources());
                      const passiveInfo = SpaceshipResourceManager.getAccumulatedResourcesWithLimit();
                      setPassiveGeneration(passiveInfo);

                      ResourceEventManager.emit("resources_updated");

                      closeCollectionPopup();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 text-purple-300 border border-purple-500/50 hover:border-purple-400/70 transition-all duration-200"
                  >
                    🚀 {t("Collect All")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SpaceshipPanel;
