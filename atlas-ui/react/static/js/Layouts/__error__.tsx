// atlas-ui/react/static/js/Layouts/__error__.tsx
import React from "react";
import VersionFooter from "../Components/VersionFooter.tsx";
import { t } from "../i18n/i18n.ts";

interface ErrorLayoutProps {
  version: string;
  versionHash: string;
  // The server's own message, shown as it is; without one, ours in the pilot's language
  message: string | null;
}

const ErrorLayout: React.FC<ErrorLayoutProps> = ({ version, message }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 text-white flex flex-col">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-md w-full">
          <div className="flex justify-center mb-8">
            <img src="/static/atlas-logo.jpg" alt={t("Atlas Logo")} className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 border-red-400 shadow-lg shadow-red-400/20" />
          </div>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/30">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-red-400">{t("System Error")}</h1>
            <p className="text-gray-300 text-lg leading-relaxed">{message ?? t("An unexpected error occurred")}</p>
          </div>

          <div className="pt-8">
            <a href="/" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {t("Return to Home")}
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <VersionFooter version={version} />
      </div>
    </div>
  );
};

export default ErrorLayout;
