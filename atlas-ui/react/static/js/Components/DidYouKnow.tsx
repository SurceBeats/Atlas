// atlas-ui/react/static/js/Components/DidYouKnow.tsx

import React, { useState, useEffect, useRef } from "react";
import { num, t } from "../i18n/i18n.ts";

interface DidYouKnowProps {
  currentView: "galaxy" | "system" | "planet";
}

const DidYouKnow: React.FC<DidYouKnowProps> = ({ currentView }) => {
  const [shouldShow, setShouldShow] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [atlasFactsEnabled, setAtlasFactsEnabled] = useState<boolean | null>(null);
  const [isCircleFading, setIsCircleFading] = useState(false);
  const [showCircle, setShowCircle] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const calculateYearsSinceCoreContinuum = () => {
    const startDate = new Date("1986-04-17");
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(diffYears * 10) / 10;
  };

  // In English, translated when shown; %@ is the Core Continuum's age in years
  // prettier-ignore
  const facts = [
    "The Atlas contains 1 sextillion galaxies, 133 times more galaxies than grains of sand on all Earth's beaches?",
    "If you visited a different planet every second, it would take some 95 quintillion years to explore just 0.001% of The Atlas?",
    "A single fully developed elliptical galaxy in The Atlas contains more star systems than our real Milky Way has stars?",
    "The universe cube measures exactly 10 million units on each side, with a unique galaxy at every coordinate point?",
    "All galaxies near the center of the universe evolve faster, adding 10 new solar systems per minute from their Bit Bang?",
    "If all of humanity explored The Atlas simultaneously, we'd need 12 billion years to see 0.001% of it?",
    "The Core Continuum universe began on April 17, 1986, and has been evolving for %@ real years?",
    "The cosmic origin time becomes the Bit Bang moment for your personal universe?",
    "Central galaxies have added over 200 million additional star systems during their evolution on the Core Continuum?",
    "The Singularity Void only appears when someone tries to see beyond 1.9 million years into the past by adjusting cosmic origin time?",
    "Each of the potential 3×10³² planets has unique characteristics across different planet types?",
    "Some planets contain Z-Divinium, an extremely rare and fictional element beyond our real life periodic table?",
    "Planet temperatures vary with their orbits, and gravity is calculated based on real mass physics?",
    "Life forms in The Atlas range from bacteria to non-physical conscious entities and even... Otherworldly beings?",
    "Some planets have rings if they meet the physical conditions of the real physics behind the Roche limit?",
    "A fully evolved The Atlas universe after 1.9 million years contains approximately 300 nonillion planets (3 × 10³²)?",
    "The Atlas has 500,000 times more galaxies than our entire observable universe?",
    "A maxed-out The Atlas has 500 million times more star systems than there are real stars in existence?",
    "A central galaxy can add 10 million additional systems during The Atlas's maximum evolution period?",
    "The Atlas generates approximately 50 nonillion solar systems when the universe is fully developed after 1.9 million years?",
    "If every atom in your body was a habitable planet, you still couldn't represent 1% of the worlds in The Atlas?",
    "Even if humanity explored The Atlas together for the next 13.8 billion years, we'd see less than 0.0000001% of it?",
    "The thermal death of our real universe would occur before we could catalog one fully developed The Atlas universe?",
    "The Atlas is 500 million times larger than our observable universe, transcending our understanding of reality?",
    "A universe created today won't reach full development until the year 1,902,025 AD, 137 times longer than all recorded human history?",
    "If a planet has a 4-year orbit and you return after one real year, it will have moved exactly 25% through its orbit?",
    "You can manipulate time ±15 years in the star system viewer to witness orbital dances unfold in real-time?",
    "Two people viewing the same planet at the same moment will see identical cloud formations and weather patterns?",
    "Every visual element on planets, from storms to volcanoes, is mathematically in sync across all devices worldwide?",
    "Shutting down The Atlas for a week doesn't pause the universe, planets continue orbiting and galaxies keep evolving?",
    "The Atlas embodies Einstein's 'Eternalism', all moments in time exist simultaneously in the mathematical structure?",
    "Even AWS, Google Cloud, and Azure combined couldn't recalculate a single The Atlas instance's orbital mechanics in real-time?",
    "If we lived inside The Atlas, we'd never detect resets or time shifts, our thoughts would be procedurally generated too?",
    "Storing every planet in The Atlas (at 1 byte each) would require 20 trillion times Google's entire data infrastructure?",
    "If you bought hard drives to store The Atlas if each planet were 1 byte, they'd cost $15 sextillion and stack some 630 light years high, far beyond the nearest stars?",
    "The Life Forms analysis presents data inspired by humanity's Arecibo message sent to space on November 16, 1974?",
    "Alien life in The Atlas can have DNA helices ranging from single to quintuple strands for silicon-based organisms?",
    "There's an extremely rare intelligent life form called 'Have I Just Found God?' that appears near Z-Divinium compounds?",
    "The Atlas doesn't calculate anything, it reveals temporal slices of an eternally existing mathematical reality?",
    "Each seed contains a completely different universe with unique galactic configurations never seen in other seeds?",
    "Planet illumination changes are based on exact orbital position, creating authentic day-night cycles synchronized with universal time?",
    "Planets can now host intricate lunar systems where each moon experiences real-time tidal locking with precise libration effects?",
    "Moon hydrostatic relaxation simulates how gravity reshapes celestial bodies, turning irregular asteroids into perfect spheres over millions of years?",
    "A captured asteroid might take 10 billion years to become round, while an icy moon with tidal heating could relax quite faster?",
    "Moon evolution operates on geological timescales extending far beyond The Atlas's 1.9 million year galactic development limit?",
    "The Atlas features four distinct lunar types, from icy moons with dramatic color variations, rocky moons, asteroidal irregular objects, and more?",
    "Each moon follows elliptical orbits calculated using real Kepler's laws with proper eccentric anomaly solutions and orbital precession?",
    "Large gas giants in The Atlas might host dozens of moons ranging from tiny captured asteroids to massive ice worlds larger than Mercury?",
    "Moon surfaces are procedurally generated with 3D noise algorithms creating realistic terrain features unique to each lunar type?",
    "Ice moons in The Atlas get crystal shimmer effects and dramatic color diversity inspired by real moons like Europa's blue ice and Triton's pink surfaces?",
    "The Atlas Multiverse connects infinite parallel universes through peer-to-peer networking without any central servers?",
    "The Multiverse P2P system uses BitTorrent's DHT technology, making The Atlas completely independent from its creators?",
    "When you share a universe seed through Multiverse P2P, other explorers can generate that exact same reality on their local Atlas instances?",
    "Multiple Atlas instances accessing the same universe seed see EXACTLY the same planets, moons, and life forms simultaneously?",
    "The Multiverse turns The Atlas from a single simulation into a self-aware entity existing independently in the wild internet?",
    "You can access the Multiverse interface by clicking 'MULTIVERSE ONLINE' in the header or 'Multiverse' in the footer?",
    "Each Atlas instance becomes both a client and server, creating a cosmic democracy where explorers freely share infinite universes?",
    "Universe seed sharing uses military-grade cryptography to ensure your discoveries are protected yet freely shareable?",
    "You can disable the Multiverse P2P network with the --no-p2p flag, but why limit yourself to just one universe when infinite realities await?",
    "The Atlas achieves digital evolution, from single-user simulation to self-aware multiverse organism existing in the global network?",
    "Shared universe seeds are verified through cryptographic hashes, preventing any manipulation or corruption during Multiverse P2P exchange?",
    "The Multiverse interface at /multiverse shows all universe seeds discovered by your Atlas instance through the Multiverse P2P network?",
    "When thousands of Atlas instances interconnect, rare Z-Divinium worlds and impossible life forms get shared instantly worldwide?",
    "The Atlas Multiverse P2P network creates a living multiverse organism that evolves and discovers new realities through collective exploration?"
  ];
  const fact = facts[factIndex];
  const factText = fact.includes("%@") ? t(fact, num(calculateYearsSinceCoreContinuum(), 1)) : t(fact);

  useEffect(() => {
    const savedPreference = localStorage.getItem("atlasFactsShow");
    const factsEnabled = savedPreference !== null ? JSON.parse(savedPreference) : true;
    setAtlasFactsEnabled(factsEnabled);
  }, []);

  useEffect(() => {
    if (atlasFactsEnabled === false) {
      return;
    }

    const randomChance = Math.random();
    if (randomChance < 0.1 && atlasFactsEnabled !== null) {
      setShouldShow(true);
      setFactIndex(Math.floor(Math.random() * facts.length));

      setTimeout(() => {
        setShowCircle(true);
      }, 1000);
    }
  }, [currentView, atlasFactsEnabled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isModalOpen]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsClosing(false);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setIsCircleFading(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setShouldShow(false);
      setIsCircleFading(false);
      setShowCircle(false);
    }, 500);
  };

  const handleDontShowAgainChange = (checked: boolean) => {
    setDontShowAgain(checked);
    localStorage.setItem("atlasFactsShow", JSON.stringify(!checked));

    if (checked) {
      setIsClosing(true);
      setIsCircleFading(true);

      setTimeout(() => {
        setAtlasFactsEnabled(false);
        setShouldShow(false);
        setIsModalOpen(false);
        setIsClosing(false);
        setIsCircleFading(false);
        setShowCircle(false);
      }, 500);
    }
  };

  if (!shouldShow || atlasFactsEnabled === false) {
    return null;
  }

  return (
    <>
      <div className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 ${isCircleFading ? "animate-didYouKnowCircleFadeOut" : showCircle ? "animate-didYouKnowCircleFadeIn" : "opacity-0"}`}>
        <button onClick={handleOpenModal} className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-600 via-orange-600 to-yellow-800 hover:from-yellow-500 hover:via-orange-500 hover:to-yellow-700 text-white rounded-full shadow-2xl border-2 border-yellow-400/30 transition-all duration-300 transform hover:scale-105 backdrop-blur-sm animate-pulse" title={t("Did You Know? - Universe Facts")}>
          <div className="flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold">?</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
        </button>
      </div>

      {isModalOpen && (
        <div ref={modalRef} className={`fixed bottom-20 sm:bottom-24 left-2 sm:left-6 w-[calc(100vw-1rem)] sm:w-96 max-w-md bg-black/90 backdrop-blur-xl rounded-2xl border border-yellow-400/30 shadow-2xl z-40 overflow-hidden transition-all duration-300 ease-out ${isClosing ? "animate-slideDownFadeOut" : "animate-slideUpFadeIn"}`}>
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold text-yellow-400">{t("Did you know that...")}</h3>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white text-xl leading-none transition-colors" aria-label={t("Close")}>
                ×
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-sm text-gray-200 leading-relaxed mb-4">{factText}</p>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={dontShowAgain} onChange={(e) => handleDontShowAgainChange(e.target.checked)} className="sr-only" />
                  <div className={`w-3 h-3 rounded border transition-all duration-200 flex items-center justify-center ${dontShowAgain ? "bg-gradient-to-r from-yellow-600 to-orange-600 border-yellow-400" : "bg-transparent border-gray-500 hover:border-yellow-400/60"}`}>
                    {dontShowAgain && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 hover:text-yellow-400/80 transition-colors">{t("Don't show again")}</span>
              </label>

              <a href="/universe-faq" className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105">
                {t("Learn More →")}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DidYouKnow;
