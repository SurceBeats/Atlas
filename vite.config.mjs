import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/atlas-ui/react/dist/" : "/",
  plugins: [react()],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    cors: {
      origin: "http://localhost:42424",
      credentials: true,
    },
    allowedHosts: ["localhost"],
    hmr: {
      clientPort: 5173,
    },
  },
  build: {
    outDir: "atlas-ui/react/dist",
    manifest: true,
    minify: true,
    rollupOptions: {
      input: {
        global: resolve(__dirname, "atlas-ui/react/static/css/global.css"),
        __onboarding__: resolve(__dirname, "atlas-ui/react/static/js/MountPoints/__onboarding__.ts"),
        __error__: resolve(__dirname, "atlas-ui/react/static/js/MountPoints/__error__.ts"),
        __multiverse__: resolve(__dirname, "atlas-ui/react/static/js/MountPoints/__multiverse__.ts"),
        __explore__: resolve(__dirname, "atlas-ui/react/static/js/MountPoints/__explore__.ts"),      },
      output: {
        chunkFileNames: "atlas_[hash:21].js",
        entryFileNames: "atlas_[hash:21].js",
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split(".").pop();
          return `atlas_[hash:21].${ext}`;
        },
        manualChunks: (id) => {
          // IMPORTANTE: React y React-DOM deben estar en el mismo chunk para evitar problemas de dependencias
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/react")) {
            return "react-vendor";
          }

          // Separar Three.js core
          if (id.includes("three/build/three.module")) {
            return "three-core";
          }

          // Separar ShaderChunk y ShaderLib (contienen todos los shaders de Three.js)
          if (id.includes("ShaderChunk") || id.includes("ShaderLib")) {
            return "three-shaders";
          }

          // Separar geometrías de Three.js
          if (id.includes("three") && id.includes("geometries")) {
            return "three-geometries";
          }

          // Separar materiales de Three.js
          if (id.includes("three") && id.includes("materials")) {
            return "three-materials";
          }

          // Separar loaders de Three.js
          if (id.includes("three") && (id.includes("loader") || id.includes("Loader"))) {
            return "three-loaders";
          }

          // Separar examples de Three.js
          if (id.includes("three/examples/jsm/controls")) {
            return "three-controls";
          }

          if (id.includes("three/examples/jsm/postprocessing")) {
            return "three-postprocessing";
          }

          if (id.includes("three/examples")) {
            return "three-examples";
          }

          // Resto de Three.js
          if (id.includes("node_modules/three")) {
            return "three-misc";
          }

          // React-three-fiber y drei juntos para evitar problemas de dependencias
          if (id.includes("@react-three/fiber") || id.includes("@react-three/drei")) {
            return "react-three-ecosystem";
          }

          if (id.includes(".glsl") || id.includes(".vert") || id.includes(".frag")) {
            return "custom-shaders";
          }

          if (id.includes("/3DEffects/")) {
            const fileName = id.split("/3DEffects/")[1]?.split(".")[0];
            if (fileName) {
              if (fileName.toLowerCase().includes("planet")) {
                return "3d-planets";
              }
              if (fileName.toLowerCase().includes("star") || fileName.toLowerCase().includes("galaxy")) {
                return "3d-stars";
              }
              return `3d-${fileName.toLowerCase().substring(0, 10)}`;
            }
          }

          if (id.includes("/3DComponents/")) {
            const fileName = id.split("/3DComponents/")[1]?.split(".")[0];
            if (fileName) {
              return `comp-${fileName.toLowerCase().substring(0, 10)}`;
            }
          }

          if (id.includes("node_modules/gsap")) {
            return "gsap";
          }

          if (id.includes("node_modules/leva")) {
            return "leva";
          }

          if (id.includes("node_modules/zustand")) {
            return "zustand";
          }

          if (id.includes("node_modules/immer")) {
            return "immer";
          }

          if (id.includes("node_modules")) {
            const moduleName = id.split("node_modules/")[1]?.split("/")[0];
            if (moduleName) {
              const smallLibs = ["tslib", "classnames", "prop-types", "object-assign"];
              if (smallLibs.includes(moduleName)) {
                return "vendor-utils";
              }
            }
            return "vendor-misc";
          }
        },
      },
    },
  },
}));
