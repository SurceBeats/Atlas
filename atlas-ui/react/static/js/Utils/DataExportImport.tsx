// atlas-ui/react/static/js/Utils/DataExportImport.tsx

import { getItem, ATLAS_KEYS, getEncodedStorageKey, getUniverseInfo } from "./b64.tsx";

export interface ExportData {
  version: string;
  timestamp: number;
  currentUniverse?: {
    isRemote: boolean;
    nodeId: string | null;
    seedName?: string;
  };
  data: {
    spaceship?: string | null;
    archive?: string | null;
    archives?: { [nodeId: string]: string };
    dailyChallenges?: string | null;
    locations?: string | null;
  };
  hashes: {
    spaceship?: string;
    archive?: string;
    archives?: { [nodeId: string]: string };
    dailyChallenges?: string;
    locations?: string;
  };
  checksum: string;
}

export class DataExportImport {
  private static readonly VERSION = "3.0.1";

  private static generateFallbackHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
  }

  private static async generateHash(data: string): Promise<string> {
    if (!crypto || !crypto.subtle || !crypto.subtle.digest) {
      console.warn("crypto.subtle not available, using fallback hash");
      return this.generateFallbackHash(data);
    }

    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }

  private static async verifyHash(data: string, expectedHash: string): Promise<boolean> {
    const calculatedHash = await this.generateHash(data);

    if (expectedHash === calculatedHash) {
      return true;
    }

    if (expectedHash.length === 8 || calculatedHash.length === 8) {
      if (!crypto || !crypto.subtle || !crypto.subtle.digest) {
        console.warn("Cannot verify SHA-256 hash in non-secure context, accepting");
        return true;
      } else {
        const fallbackHash = this.generateFallbackHash(data);
        return expectedHash === fallbackHash;
      }
    }

    return false;
  }

  static async exportAllData(): Promise<string> {
    const timestamp = Date.now();
    const universeInfo = getUniverseInfo();

    const encodedKeys = {
      spaceship: getEncodedStorageKey(ATLAS_KEYS.SPACESHIP),
      dailyChallenges: getEncodedStorageKey(ATLAS_KEYS.DAILY_CHALLENGES),
      locations: getEncodedStorageKey(ATLAS_KEYS.LOCATIONS),
    };

    const archiveKeys: { [nodeId: string]: string } = {};
    let localArchive: string | null = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const decodedKey = decodeURIComponent(atob(key));
          if (decodedKey.startsWith(ATLAS_KEYS.ARCHIVE)) {
            const value = localStorage.getItem(key);
            if (value) {
              if (decodedKey === ATLAS_KEYS.ARCHIVE) {
                localArchive = value;
              } else {
                const nodeId = decodedKey.substring(ATLAS_KEYS.ARCHIVE.length + 1);
                archiveKeys[nodeId] = value;
              }
            }
          }
        } catch {
          continue;
        }
      }
    }

    const rawData: any = {
      spaceship: localStorage.getItem(encodedKeys.spaceship),
      dailyChallenges: localStorage.getItem(encodedKeys.dailyChallenges),
      locations: localStorage.getItem(encodedKeys.locations),
    };

    if (localArchive) {
      rawData.archive = localArchive;
    }
    if (Object.keys(archiveKeys).length > 0) {
      rawData.archives = archiveKeys;
    }

    const hashes: any = {};
    if (rawData.spaceship) hashes.spaceship = await this.generateHash(rawData.spaceship);
    if (rawData.archive) hashes.archive = await this.generateHash(rawData.archive);
    if (rawData.dailyChallenges) hashes.dailyChallenges = await this.generateHash(rawData.dailyChallenges);
    if (rawData.locations) hashes.locations = await this.generateHash(rawData.locations);

    if (rawData.archives) {
      hashes.archives = {};
      for (const [nodeId, archiveData] of Object.entries(rawData.archives)) {
        hashes.archives[nodeId] = await this.generateHash(archiveData as string);
      }
    }

    const exportDataWithoutChecksum = {
      version: this.VERSION,
      timestamp,
      currentUniverse: universeInfo,
      data: rawData,
      hashes,
    };

    const dataForChecksum = JSON.stringify(exportDataWithoutChecksum);
    const checksum = await this.generateHash(dataForChecksum);

    const exportData = {
      ...exportDataWithoutChecksum,
      checksum,
    };

    const jsonString = JSON.stringify(exportData);
    const compressedData = new TextEncoder().encode(jsonString);
    const base64Data = btoa(String.fromCharCode(...compressedData));

    return base64Data;
  }

  static async downloadExport(): Promise<void> {
    try {
      const exportedData = await this.exportAllData();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `atlas-data-saved-${timestamp}.atl`;

      const blob = new Blob([exportedData], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
      throw new Error("Failed to export data");
    }
  }

  static async importData(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const base64Data = e.target?.result as string;

          const decodedBytes = atob(base64Data)
            .split("")
            .map((char) => char.charCodeAt(0));
          const jsonString = new TextDecoder().decode(new Uint8Array(decodedBytes));
          const importData = JSON.parse(jsonString);

          if (!this.validateImportData(importData)) {
            throw new Error("Invalid import data format");
          }

          const { checksum, ...dataWithoutChecksum } = importData;
          const dataForChecksum = JSON.stringify(dataWithoutChecksum);
          const checksumValid = await this.verifyHash(dataForChecksum, checksum);

          if (!checksumValid) {
            throw new Error("Data integrity check failed. File may have been tampered with.");
          }

          if (importData.data.spaceship && importData.hashes.spaceship) {
            const valid = await this.verifyHash(importData.data.spaceship, importData.hashes.spaceship);
            if (!valid) {
              throw new Error("Spaceship data integrity check failed");
            }
          }

          if (importData.data.archive && importData.hashes.archive) {
            const valid = await this.verifyHash(importData.data.archive, importData.hashes.archive);
            if (!valid) {
              throw new Error("Archive data integrity check failed");
            }
          }

          if (importData.data.dailyChallenges && importData.hashes.dailyChallenges) {
            const valid = await this.verifyHash(importData.data.dailyChallenges, importData.hashes.dailyChallenges);
            if (!valid) {
              throw new Error("Daily challenges data integrity check failed");
            }
          }

          if (importData.data.locations && importData.hashes.locations) {
            const valid = await this.verifyHash(importData.data.locations, importData.hashes.locations);
            if (!valid) {
              throw new Error("Locations data integrity check failed");
            }
          }

          if (importData.data.archives && importData.hashes.archives) {
            for (const [nodeId, archiveData] of Object.entries(importData.data.archives)) {
              if (importData.hashes.archives[nodeId]) {
                const valid = await this.verifyHash(archiveData as string, importData.hashes.archives[nodeId]);
                if (!valid) {
                  throw new Error(`Archive data integrity check failed for universe ${nodeId}`);
                }
              }
            }
          }

          const encodedKeys = {
            spaceship: getEncodedStorageKey(ATLAS_KEYS.SPACESHIP),
            dailyChallenges: getEncodedStorageKey(ATLAS_KEYS.DAILY_CHALLENGES),
            locations: getEncodedStorageKey(ATLAS_KEYS.LOCATIONS),
          };

          if (importData.data.spaceship !== undefined) {
            if (importData.data.spaceship === null) {
              localStorage.removeItem(encodedKeys.spaceship);
            } else {
              localStorage.setItem(encodedKeys.spaceship, importData.data.spaceship);
            }
          }

          if (importData.data.dailyChallenges !== undefined) {
            if (importData.data.dailyChallenges === null) {
              localStorage.removeItem(encodedKeys.dailyChallenges);
            } else {
              localStorage.setItem(encodedKeys.dailyChallenges, importData.data.dailyChallenges);
            }
          }

          if (importData.data.locations !== undefined) {
            if (importData.data.locations === null) {
              localStorage.removeItem(encodedKeys.locations);
            } else {
              localStorage.setItem(encodedKeys.locations, importData.data.locations);
            }
          }

          if (importData.data.archive !== undefined) {
            const localArchiveKey = getEncodedStorageKey(ATLAS_KEYS.ARCHIVE);
            if (importData.data.archive === null) {
              localStorage.removeItem(localArchiveKey);
            } else {
              localStorage.setItem(localArchiveKey, importData.data.archive);
            }
          }

          if (importData.data.archives) {
            for (const [nodeId, archiveData] of Object.entries(importData.data.archives)) {
              const archiveKey = `${ATLAS_KEYS.ARCHIVE}_${nodeId}`;
              const encodedArchiveKey = btoa(encodeURIComponent(archiveKey));
              localStorage.setItem(encodedArchiveKey, archiveData as string);
            }
          }

          window.location.reload();
          resolve();
        } catch (error) {
          console.error("Error importing data:", error);
          reject(new Error(error instanceof Error ? error.message : "Failed to import data. Please ensure the file is valid."));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  }

  private static validateImportData(data: any): data is ExportData {
    return data && typeof data === "object" && typeof data.version === "string" && typeof data.timestamp === "number" && data.data && typeof data.data === "object" && data.hashes && typeof data.hashes === "object" && typeof data.checksum === "string";
  }

  static getDataSummary(): {
    hasSpaceship: boolean;
    hasArchive: boolean;
    hasDailyChallenges: boolean;
    hasLocations: boolean;
    totalSize: number;
  } {
    const spaceshipData = getItem(ATLAS_KEYS.SPACESHIP);
    const archiveData = getItem(ATLAS_KEYS.ARCHIVE);
    const dailyChallengesData = getItem(ATLAS_KEYS.DAILY_CHALLENGES);
    const locationsData = getItem(ATLAS_KEYS.LOCATIONS);

    const calculateSize = (data: string | null): number => {
      if (!data) return 0;
      return new Blob([data]).size;
    };

    return {
      hasSpaceship: !!spaceshipData,
      hasArchive: !!archiveData,
      hasDailyChallenges: !!dailyChallengesData,
      hasLocations: !!locationsData,
      totalSize: calculateSize(spaceshipData) + calculateSize(archiveData) + calculateSize(dailyChallengesData) + calculateSize(locationsData),
    };
  }
}
