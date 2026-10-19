// atlas-ui/react/static/js/MountPoints/__error__.ts
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import ErrorLayout from "../Layouts/__error__.tsx";
import { loadLanguage } from "../i18n/i18n.ts";

const versionMeta = document.querySelector('meta[name="atlas-version"]');
const versionHashMeta = document.querySelector('meta[name="atlas-version-hash"]');
const messageMeta = document.querySelector('meta[name="error-message"]');

const atlasConfig = {
  version: (versionMeta && versionMeta.getAttribute("content")) || "3.0.1",
  versionHash: (versionHashMeta && versionHashMeta.getAttribute("content")) || "",
  message: (messageMeta && messageMeta.getAttribute("content")) || null,
};

const container = document.getElementById("atlas-react-root");
if (container) {
  loadLanguage().then(() => createRoot(container).render(createElement(ErrorLayout, atlasConfig)));
}
