// atlas-ui/react/static/js/MountPoints/__error__.ts
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import ErrorLayout from "../Layouts/__error__.tsx";

const versionMeta = document.querySelector('meta[name="atlas-version"]');
const versionHashMeta = document.querySelector('meta[name="atlas-version-hash"]');
const messageMeta = document.querySelector('meta[name="error-message"]');

const atlasConfig = {
  version: (versionMeta && versionMeta.getAttribute("content")) || "3.0.0",
  versionHash: (versionHashMeta && versionHashMeta.getAttribute("content")) || "",
  message: (messageMeta && messageMeta.getAttribute("content")) || "An unexpected error occurred",
};

const container = document.getElementById("atlas-react-root");
if (container) {
  createRoot(container).render(createElement(ErrorLayout, atlasConfig));
}
