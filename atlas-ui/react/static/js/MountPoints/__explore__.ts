// atlas-ui/react/static/js/MountPoints/__explore__.ts
import React from "react";
import { createRoot } from "react-dom/client";
import ExploreLayout from "../Layouts/__explore__.tsx";

const mount = () => {
  const rootElement = document.getElementById("atlas-react-root");
  if (!rootElement) return;
  createRoot(rootElement).render(React.createElement(ExploreLayout));
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
else mount();
