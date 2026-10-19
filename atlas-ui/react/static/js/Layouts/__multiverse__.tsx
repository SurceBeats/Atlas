// atlas-ui/react/static/js/Layouts/__multiverse__.tsx

import React, { useState, useEffect } from "react";
import Header from "../Components/Header.tsx";
import VersionFooter from "../Components/VersionFooter.tsx";
import SpaceshipPanel from "../Components/SpaceshipPanel.tsx";
import TreasureChest from "../Components/TreasureChest.tsx";
import FuelBars from "../Components/FuelBars.tsx";
import DidYouKnow from "../Components/DidYouKnow.tsx";
import MultiverseBanner from "../Components/MultiverseBanner.jsx";
import MultiverseTransitionCanvas from "../Components/MultiverseTransitionCanvas.tsx";
import UniverseIcon from "../Icons/UniverseIcon.jsx";
import SeedIcon from "../Icons/SeedIcon.tsx";
import NodeIdIcon from "../Icons/NodeIdIcon.tsx";
import contentFilter from "../Utils/ContentFilter.jsx";
import { SeedSanitizer } from "../Utils/SeedSanitizer.tsx";
import { t } from "../i18n/i18n.ts";

interface Peer {
  peer_id: string;
  seed: string;
  seed_name: string;
  cosmic_origin_time: number;
  last_seen: number;
  status: "ACTIVE" | "INACTIVE" | "STALE" | "ARCHIVED" | "UNKNOWN";
}

interface PeerGroup {
  seed: string;
  seed_name: string;
  cosmic_origin_time: number;
  count: number;
  peers: Peer[];
}

interface MultiverseData {
  success: boolean;
  groups: PeerGroup[];
  total_peers: number;
  timestamp: number;
  error?: string;
}

const MultiverseLayout: React.FC = () => {
  const API_ENDPOINT = "/api/multiverse/peers";
  const REFRESH_INTERVAL = 30000;
  const VERSION = "3.0.1";

  const [data, setData] = useState<MultiverseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(() => {
    const stored = localStorage.getItem("atlasMultiverseAutoRefresh");
    return stored !== null ? stored === "true" : true;
  });
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [isReturningHome, setIsReturningHome] = useState<boolean>(false);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);
  const [universeConfig, setUniverseConfig] = useState<any>(null);
  const [showPortMessage, setShowPortMessage] = useState<boolean>(() => {
    return localStorage.getItem("atlasMultiversePortMessageDismissed") !== "true";
  });

  const formatCosmicTime = (timestamp: number): string => {
    if (!timestamp) return t("Unknown Origin");
    const date = new Date(timestamp * 1000);
    // As the browser's region writes dates
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastSeen = (timestamp: number): { text: string; relative: string } => {
    if (!timestamp) return { text: t("Never"), relative: t("Unknown") };
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let relative = "";
    if (days > 0) {
      relative = t("%lldd ago", days);
    } else if (hours > 0) {
      relative = t("%lldh ago", hours);
    } else if (minutes > 0) {
      relative = t("%lldm ago", minutes);
    } else {
      relative = t("Just now");
    }

    return {
      text: date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      relative,
    };
  };

  const isCurrentlyExploring = (groupSeed: string): boolean => {
    return universeConfig?.remote && universeConfig?.seed_str === groupSeed;
  };

  const getStatusStyle = (status: string): { bgColor: string; textColor: string; opacity: string; animation: string; dotColor: string } => {
    switch (status) {
      case "ACTIVE":
        return {
          bgColor: "bg-green-500/20",
          textColor: "text-green-400",
          opacity: "opacity-100",
          animation: "animate-pulse",
          dotColor: "bg-green-500",
        };
      case "INACTIVE":
        return {
          bgColor: "bg-yellow-500/20",
          textColor: "text-yellow-400",
          opacity: "opacity-75",
          animation: "",
          dotColor: "bg-yellow-500",
        };
      case "STALE":
        return {
          bgColor: "bg-orange-500/20",
          textColor: "text-orange-400",
          opacity: "opacity-60",
          animation: "",
          dotColor: "bg-orange-500",
        };
      case "ARCHIVED":
        return {
          bgColor: "bg-gray-500/20",
          textColor: "text-gray-400",
          opacity: "opacity-40",
          animation: "",
          dotColor: "bg-gray-500",
        };
      default:
        return {
          bgColor: "bg-red-500/20",
          textColor: "text-red-400",
          opacity: "opacity-50",
          animation: "",
          dotColor: "bg-red-500",
        };
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINT);
      const result = await response.json();

      if (result.success) {
        setData(result);
        setError(null);
      } else {
        setError(result.error || t("Failed to fetch multiverse data"));
      }
    } catch (err) {
      setError(t("Network error: %@", err.message));
    } finally {
      setLoading(false);
      setLastUpdate(new Date());
    }
  };

  const handleUniverseExploration = (group: PeerGroup) => {
    const selectedPeer = group.peers.reduce((prev, curr) => (curr.last_seen > prev.last_seen ? curr : prev));
    const params = new URLSearchParams({
      seed: group.seed,
      seed_name: group.seed_name,
      cosmic_origin_time: group.cosmic_origin_time.toString(),
    });
    const targetUrl = `/multiverse/${selectedPeer.peer_id}/explore?${params.toString()}`;

    setTransitionTarget(targetUrl);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (transitionTarget) {
      window.location.href = transitionTarget;
    }
  };

  const handleReturnToOriginalUniverse = () => {
    setIsReturningHome(true);
  };

  const handleReturnTransitionComplete = () => {
    window.location.href = "/multiverse/exit";
  };

  const dismissPortMessage = () => {
    localStorage.setItem("atlasMultiversePortMessageDismissed", "true");
    setShowPortMessage(false);
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh && REFRESH_INTERVAL > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, REFRESH_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

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

  if (loading && !data) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
        <div className="relative z-10 pt-1 flex-1 flex flex-col">
          <Header />
          <div className="flex items-center justify-center h-[60vh] flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-xl text-purple-300">{t("Scanning Multiverse...")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <FuelBars />

      <div className="relative z-10 pt-1 flex-1 flex flex-col">
        <Header />
        <MultiverseBanner />

        <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-8 flex-1">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">{t("Multiverse Network")}</h1>
            <p className="text-sm text-gray-300 mb-4">{t("Connected P2P Universe Instances")}</p>

            <div className="flex items-center justify-center gap-2 text-xs flex-wrap mb-4">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">{t("Total Peers:")}</span>
                <span className="text-purple-300 font-bold">{data?.total_peers || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">{t("Valid Universes:")}</span>
                <span className="text-purple-300 font-bold">
                  {data?.groups?.filter((group) => {
                    const nameFiltered = contentFilter.filterContent(group.seed_name);
                    const seedFiltered = contentFilter.filterContent(group.seed);
                    return !nameFiltered.isBlocked && !seedFiltered.isBlocked;
                  }).length || 0}
                </span>
              </div>
              {data?.groups?.filter((group) => {
                const nameFiltered = contentFilter.filterContent(group.seed_name);
                const seedFiltered = contentFilter.filterContent(group.seed);
                return nameFiltered.isBlocked || seedFiltered.isBlocked;
              }).length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-red-400">{t("Filtered:")}</span>
                  <span className="text-red-300 font-bold">
                    {
                      data.groups.filter((group) => {
                        const nameFiltered = contentFilter.filterContent(group.seed_name);
                        const seedFiltered = contentFilter.filterContent(group.seed);
                        return nameFiltered.isBlocked || seedFiltered.isBlocked;
                      }).length
                    }
                  </span>
                </div>
              )}
              {lastUpdate && (
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">{t("Last Update:")}</span>
                  <span className="text-purple-300">{lastUpdate.toLocaleTimeString()}</span>
                </div>
              )}
              <button onClick={() => fetchData()} className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 rounded-full border border-purple-500/50 transition-colors">
                {t("Refresh")}
              </button>
              <button
                onClick={() => {
                  const newValue = !autoRefresh;
                  setAutoRefresh(newValue);
                  localStorage.setItem("atlasMultiverseAutoRefresh", newValue.toString());
                }}
                className={`px-3 py-1 rounded-full border transition-colors ${autoRefresh ? "bg-green-600/30 hover:bg-green-600/50 border-green-500/50" : "bg-gray-600/30 hover:bg-gray-600/50 border-gray-500/50"}`}
              >
                {autoRefresh ? t("Auto-refresh: ON") : t("Auto-refresh: OFF")}
              </button>
            </div>

            {showPortMessage && (
              <div className="mt-4 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 backdrop-blur-lg rounded-xl border border-blue-500/40 p-4 shadow-xl relative">
                  <button onClick={dismissPortMessage} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1" aria-label={t("Dismiss message")}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-3 pr-8">
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path fill="currentColor" d="m21.17 15.4l-5.91-9.85c-.78-1.3-1.96-2.04-3.26-2.04s-2.48.74-3.26 2.03L2.83 15.4c-.44.73-.66 1.49-.66 2.21c0 .57.14 1.13.42 1.62C3.23 20.35 4.47 21 6 21h12c1.53 0 2.77-.65 3.41-1.77c.28-.49.42-1.02.42-1.58c.01-.74-.21-1.51-.66-2.25M12 8.45c.85 0 1.55.7 1.55 1.55s-.69 1.55-1.55 1.55c-.85 0-1.55-.7-1.55-1.55c0-.86.69-1.55 1.55-1.55m1.69 8.46c-.03.04-.8.92-2.07.92h-.15c-.51-.03-.93-.25-1.18-.63c-.31-.47-.36-1.11-.12-1.82l.41-1.22c.23-.68.01-.79-.11-.85l-.14-.02c-.25 0-.6.15-.71.21c-.1.05-.23.03-.31-.07c-.07-.1-.07-.23.01-.32c.03-.04.87-.99 2.22-.91c.51.03.93.25 1.18.63c.32.47.36 1.11.12 1.83l-.41 1.22c-.23.68-.01.79.11.85l.14.02c.25 0 .6-.15.71-.2c.11-.06.23-.03.31.07c.07.07.07.2-.01.29" strokeWidth="0.5" stroke="currentColor" />
                        </svg>
                        <h3 className="text-blue-200 font-semibold text-sm">{t("Private Network Notice")}</h3>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed text-center">{t("If you're behind a private connection or firewall, make sure to open the Atlas ports to allow communication with other multiverse instances. This enables P2P connectivity across the network.")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {universeConfig?.remote && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-amber-900/30 via-orange-900/30 to-amber-900/30 backdrop-blur-lg rounded-2xl border border-amber-500/40 p-4 sm:p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center sm:text-left">
                      <h3 className="text-amber-200 font-bold text-sm sm:text-lg flex items-center justify-center sm:justify-start">
                        <UniverseIcon className="mr-2" /> {t("Exploring Remote Universe")}
                      </h3>
                      <div className="space-y-1 mt-2">
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <SeedIcon className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300/80">{t("Seed:")}</span>
                          </div>
                          <span className="text-amber-200 font-mono">{SeedSanitizer.sanitizeForDisplay(universeConfig.seed_str) || t("Unknown")}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <NodeIdIcon className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-300/80">{t("Atlas ID:")}</span>
                          </div>
                          <span className="text-amber-200 font-mono truncate max-w-xs sm:max-w-none">{universeConfig.node_id || t("Unknown")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={handleReturnToOriginalUniverse} className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-amber-500/25 flex items-center gap-2 w-full text-center sm:w-auto justify-center">
                    <UniverseIcon size={18} color="white" />
                    <span>{t("Return to Your Universe")}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/50 p-6 mb-8">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {data && data.groups && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {data.groups
                  .filter((group) => {
                    const nameFiltered = contentFilter.filterContent(group.seed_name);
                    const seedFiltered = contentFilter.filterContent(group.seed);
                    return !nameFiltered.isBlocked && !seedFiltered.isBlocked;
                  })
                  .map((group, index) => {
                    const mostRecentPeer = group.peers.reduce((prev, curr) => (curr.last_seen > prev.last_seen ? curr : prev));
                    const statusStyle = getStatusStyle(mostRecentPeer.status);

                    const preferredCosmicTime =
                      group.seed === "1.618033988749895"
                        ? group.peers.find((peer) => {
                            const date = new Date(peer.cosmic_origin_time * 1000);
                            return date.getFullYear() === 1986;
                          })?.cosmic_origin_time || group.cosmic_origin_time
                        : group.cosmic_origin_time;

                    return (
                      <div key={`${group.seed}-${index}`} className={`bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02] ${statusStyle.opacity} relative group ${isCurrentlyExploring(group.seed) ? "border-amber-500/50 ring-2 ring-amber-400/20" : ""}`}>
                        {isCurrentlyExploring(group.seed) && (
                          <div className="absolute -top-2 -left-2 z-10">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                              <UniverseIcon size={12} color="white" />
                              <span>{t("Exploring")}</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle.bgColor} ${statusStyle.textColor} ${statusStyle.animation} flex items-center gap-1`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotColor}`}></div>
                            {t(mostRecentPeer.status)}
                          </div>
                          {group.count > 1 && <div className="px-2 py-1 bg-purple-500/30 rounded-full text-xs font-semibold text-purple-200 flex items-center justify-center">{group.count}</div>}
                        </div>

                        <div className="flex items-start justify-between mb-4 pr-20">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{contentFilter.getDisplayText(group.seed_name)}</h3>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">{t("Seed:")}</span>
                            <span className="text-gray-300 font-mono">{SeedSanitizer.sanitizeForDisplay(contentFilter.getDisplayText(group.seed))}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">{t("Bit Bang:")}</span>
                            <span className="text-gray-300">{formatCosmicTime(preferredCosmicTime)}</span>
                          </div>
                        </div>

                        {group.count > 1 ? (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-xs text-purple-400 hover:text-purple-300">{t("View all %lld instances", group.count)}</summary>
                            <div className="mt-2 space-y-2">
                              {[...group.peers]
                                .sort((a, b) => b.last_seen - a.last_seen)
                                .map((peer) => {
                                  const peerStatus = getStatusStyle(peer.status);
                                  const peerLastSeen = formatLastSeen(peer.last_seen);
                                  return (
                                    <div key={peer.peer_id} className={`p-2 bg-black/20 rounded-lg text-xs ${peerStatus.opacity}`}>
                                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1">
                                        <div className="flex-1 sm:mr-2">
                                          <div className="text-gray-500 text-xs mb-1">{t("Atlas ID")}</div>
                                          <span className="font-mono text-gray-400 truncate block">{peer.peer_id}</span>
                                        </div>
                                        <div className="flex-shrink-0 sm:text-right mt-2 sm:mt-0">
                                          <div className="text-gray-500 text-xs mb-1">{t("Last Seen")}</div>
                                          <span className="text-gray-400">{peerLastSeen.relative}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </details>
                        ) : (
                          <div className="mt-4">
                            {group.peers.map((peer) => {
                              const peerStatus = getStatusStyle(peer.status);
                              const peerLastSeen = formatLastSeen(peer.last_seen);
                              return (
                                <div key={peer.peer_id} className={`p-2 bg-black/20 rounded-lg text-xs ${peerStatus.opacity}`}>
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-1">
                                    <div className="flex-1 sm:mr-2">
                                      <div className="text-gray-500 text-xs mb-1">{t("Atlas ID")}</div>
                                      <span className="font-mono text-gray-400 truncate block">{peer.peer_id}</span>
                                    </div>
                                    <div className="flex-shrink-0 sm:text-right mt-2 sm:mt-0">
                                      <div className="text-gray-500 text-xs mb-1">{t("Last Seen")}</div>
                                      <span className="text-gray-400">{peerLastSeen.relative}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-white/10">
                          {isCurrentlyExploring(group.seed) ? (
                            <div className="w-full bg-gradient-to-r from-amber-600/50 to-orange-600/50 text-amber-200 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 border border-amber-500/30">
                              <span>{t("You are here")}</span>
                            </div>
                          ) : (
                            <button onClick={() => handleUniverseExploration(group)} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/25">
                              {t("Explore this Universe")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {data.groups.filter((group) => {
                const nameFiltered = contentFilter.filterContent(group.seed_name);
                const seedFiltered = contentFilter.filterContent(group.seed);
                return nameFiltered.isBlocked || seedFiltered.isBlocked;
              }).length > 0 && (
                <div className="mt-12">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-red-400 mb-2">⚠️ {t("Filtered Content")}</h2>
                    <p className="text-sm text-red-300">{t("The following universes contain inappropriate content and have been filtered")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                    {data.groups
                      .filter((group) => {
                        const nameFiltered = contentFilter.filterContent(group.seed_name);
                        const seedFiltered = contentFilter.filterContent(group.seed);
                        return nameFiltered.isBlocked || seedFiltered.isBlocked;
                      })
                      .map((group, index) => {
                        const mostRecentPeer = group.peers.reduce((prev, curr) => (curr.last_seen > prev.last_seen ? curr : prev));
                        const lastSeenInfo = formatLastSeen(mostRecentPeer.last_seen);
                        const nameFiltered = contentFilter.filterContent(group.seed_name);
                        const seedFiltered = contentFilter.filterContent(group.seed);

                        const preferredCosmicTime =
                          group.seed === "1.618033988749895"
                            ? group.peers.find((peer) => {
                                const date = new Date(peer.cosmic_origin_time * 1000);
                                return date.getFullYear() === 1986;
                              })?.cosmic_origin_time || group.cosmic_origin_time
                            : group.cosmic_origin_time;

                        return (
                          <div key={`filtered-${group.seed}-${index}`} className="bg-red-900/20 backdrop-blur-lg rounded-lg border border-red-500/30 p-3 shadow-lg opacity-60 relative">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-red-400 truncate">{nameFiltered.isBlocked ? t("Forbidden") : group.seed_name}</h3>
                              </div>
                              {group.count > 1 && <div className="ml-2 bg-red-500/30 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-red-200 flex-shrink-0">{group.count}</div>}
                            </div>

                            <div className="space-y-1 mb-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-red-400 flex-shrink-0">{t("Seed:")}</span>
                                <span className="text-red-300 font-mono text-xs truncate ml-2 min-w-0">{seedFiltered.isBlocked ? t("Forbidden") : SeedSanitizer.sanitizeForDisplay(group.seed)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-red-400 flex-shrink-0">{t("Bit Bang:")}</span>
                                <span className="text-red-300 text-xs truncate ml-2">{formatCosmicTime(preferredCosmicTime)}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-red-500/20">
                              <div className="flex items-center gap-1 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"></div>
                                <span className="text-xs font-semibold text-red-400">{t("FILTERED")}</span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <div className="text-xs text-red-300">{lastSeenInfo.relative}</div>
                              </div>
                            </div>

                            <div className="relative bottom-0 left-0 right-0 bg-red-500/20 rounded-lg mt-2 px-2 py-1">
                              <div className="text-xs text-red-300 text-center truncate">{t("Reason: %@", t(nameFiltered.isBlocked ? nameFiltered.reason : seedFiltered.reason))}</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {data && data.groups && data.groups.length === 0 && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-center">
              <p className="text-xl text-gray-400 mb-2">{t("No Multiverse Connections Found")}</p>
              <p className="text-sm text-gray-500 mb-4">{t("Waiting for P2P peers to connect...")}</p>
            </div>
          )}

          {!data && !loading && (
            <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/50 p-12 text-center">
              <p className="text-xl text-red-400 mb-2">{t("No Data Received")}</p>
              <p className="text-sm text-red-300">{t("Check browser console for details")}</p>
            </div>
          )}
        </div>

        <SpaceshipPanel />
        <TreasureChest />
        <DidYouKnow currentView={"galaxy"} />
        <VersionFooter version={VERSION} />
      </div>

      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] animate-fadeIn">
          <MultiverseTransitionCanvas isActive={isTransitioning} onTransitionComplete={handleTransitionComplete} />
        </div>
      )}

      {/* Return to Original Universe Transition */}
      {isReturningHome && (
        <div className="fixed inset-0 z-[9999] animate-fadeIn">
          <MultiverseTransitionCanvas isActive={isReturningHome} onTransitionComplete={handleReturnTransitionComplete} />
        </div>
      )}
    </div>
  );
};

export default MultiverseLayout;
