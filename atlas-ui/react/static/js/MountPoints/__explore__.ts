// atlas-ui/react/static/js/MountPoints/__explore__.ts
import React from "react";
import { createRoot } from "react-dom/client";
import ExploreLayout from "../Layouts/__explore__.tsx";
import { loadLanguage } from "../i18n/i18n.ts";

const mount = () => {
  const rootElement = document.getElementById("atlas-react-root");
  if (!rootElement) return;
  createRoot(rootElement).render(React.createElement(ExploreLayout));
};

const language = loadLanguage();
const ready = () => language.then(mount);
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready);
else ready();
