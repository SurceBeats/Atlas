// atlas-ui/react/static/js/Components/VersionFooter.tsx
import React, { useState, useEffect } from "react";
import { PhotosensitivityManager } from "../Utils/PhotosensitivityManager";
import { t } from "../i18n/i18n.ts";

interface VersionFooterProps {
  version: string;
  showBadge?: boolean;
}

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white transition-colors duration-200">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const WebIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white transition-colors duration-200">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

const MultiverseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white transition-colors duration-200">
    <g fill="none" fillRule="evenodd">
      <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />
      <path fill="currentColor" d="M11 2.423a2 2 0 0 1 1.842-.082l.158.082l3.33 1.922a2 2 0 0 1 .993 1.569l.007.163v3.846l3.33 1.922a2 2 0 0 1 .994 1.569l.006.163v3.846a2 2 0 0 1-.861 1.644l-.139.088l-3.33 1.922a2 2 0 0 1-1.842.082l-.158-.082L12 19.155l-3.33 1.922a2 2 0 0 1-1.843.082l-.157-.082l-3.33-1.922a2 2 0 0 1-.993-1.568l-.007-.164v-3.846a2 2 0 0 1 .861-1.644l.139-.088l3.33-1.922V6.077a2 2 0 0 1 .861-1.644l.139-.088zm0 12.31l-2.33 1.344v2.69L11 17.424zm2 0v2.69l2.33 1.345v-2.69zm6.66 0l-2.33 1.344v2.691l2.33-1.345zm-15.32-.001v2.69l2.33 1.346v-2.69zm11.99-3.077L14 13l2.33 1.345L18.66 13zm-8.66 0L5.34 13l2.33 1.345L10 13zm7.66-4.423L13 8.577v2.691l2.33-1.345zm-6.66 0v2.69L11 11.269v-2.69zM12 4.155L9.67 5.5L12 6.845L14.33 5.5z" />
    </g>
  </svg>
);

const FAQIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white transition-colors duration-200">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white transition-colors duration-200">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400 hover:text-white transition-colors duration-200">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const VersionFooter: React.FC<VersionFooterProps> = ({ version, showBadge = false }) => {
  const [isPhotosensitivityEnabled, setIsPhotosensitivityEnabled] = useState(false);

  useEffect(() => {
    setIsPhotosensitivityEnabled(PhotosensitivityManager.isEnabled());

    const handleChange = (event: CustomEvent) => {
      setIsPhotosensitivityEnabled(event.detail.enabled);
    };

    window.addEventListener("photosensitivityChange", handleChange as EventListener);
    return () => {
      window.removeEventListener("photosensitivityChange", handleChange as EventListener);
    };
  }, []);

  const handleTogglePhotosensitivity = () => {
    PhotosensitivityManager.toggle();
    setIsPhotosensitivityEnabled(PhotosensitivityManager.isEnabled());
  };

  // The author's name highlighted wherever the language puts it
  const [createdBefore, createdAfter = ""] = t("Created by %@", "\u0000").split("\u0000");

  return (
    <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 mt-8 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col">
          {/* Row 1: version + links */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 mb-3">
            <div className="flex flex-row items-center gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-300">Atlas v{version}</span>
              </div>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-500">
                {createdBefore}
                <span className="text-gray-400 font-medium">SurceBeats</span>
                {createdAfter}
              </span>
            </div>

            <div className="flex items-center flex-wrap justify-center gap-3">
              <a href="https://github.com/SurceBeats/Atlas" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group" title={t("View Atlas source on GitHub")}>
                <GitHubIcon />
                <span className="text-sm text-gray-400 group-hover:text-white">Atlas</span>
              </a>
              <a href="https://x.com/SurceBeats" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group" title={t("Follow on Twitter/X")}>
                <TwitterIcon />
                <span className="text-sm text-gray-400 group-hover:text-white">Twitter</span>
              </a>
              <a href="https://www.linkedin.com/in/claudio-gonzalez-medina/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group" title={t("Connect on LinkedIn")}>
                <LinkedInIcon />
                <span className="text-sm text-gray-400 group-hover:text-white">LinkedIn</span>
              </a>
              <a href="https://www.banshee.pro" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group" title={t("Visit %@", "Banshee Technologies")}>
                <WebIcon />
                <span className="text-sm text-gray-400 group-hover:text-white">Banshee</span>
              </a>
              <a href="/multiverse" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group" title={t("Explore the Multiverse")}>
                <MultiverseIcon />
                <span className="text-sm text-gray-400 group-hover:text-white">{t("Multiverse")}</span>
              </a>
              <a href="/universe-faq" className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 group" title={t("Universe FAQ")}>
                <FAQIcon />
                <span className="text-sm text-gray-400 group-hover:text-white">{t("F.A.Q.")}</span>
              </a>
            </div>
          </div>

          {/* Row 2: photosensitive centered */}
          <div className="flex justify-center border-t border-white/5 py-3">
            <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="flex items-center space-x-2">
                <svg className={`w-5 h-5 transition-colors duration-200 ${isPhotosensitivityEnabled ? "text-orange-400" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs text-gray-400 font-medium">{t("Photosensitive Mode")}</span>
              </div>
              <button onClick={handleTogglePhotosensitivity} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${isPhotosensitivityEnabled ? "bg-orange-600 focus:ring-orange-500" : "bg-gray-600 focus:ring-gray-500"}`} title={isPhotosensitivityEnabled ? t("Disable photosensitive mode") : t("Enable photosensitive mode")}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isPhotosensitivityEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Row 3: GOAT badge */}
          {showBadge && (
            <div className="flex flex-col items-center gap-1 pt-3 border-t border-white/5">
              <span className="text-[9px] text-gray-600 tracking-wide uppercase">{t("Running it on elsewhereOS?")}</span>
              <a href="https://github.com/BansheeTech/HomeDockOS" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity duration-500">
                <img src="/static/HDOSDarkSmallBadge.svg" />
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default VersionFooter;
