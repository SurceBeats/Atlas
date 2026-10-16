// atlas-ui/react/static/js/Explore/galaxy/galaxy.worker.ts
//
// Owns the galaxy model and its octree tables. The main thread only sends camera
// updates and receives ready-to-upload typed arrays.

import { GalaxyModel, type GalaxyInfo, type PointOfInterest } from "./GalaxyModel.ts";
import { SpatialIndex } from "./SpatialIndex.ts";
import { GalaxyLod, type LodRequest, type LodResult } from "./GalaxyLod.ts";

export type WorkerRequest =
  | { type: "init"; info: GalaxyInfo }
  | { type: "lod"; request: LodRequest }
  | { type: "locate"; id: number; index: number }
  | { type: "leaf"; id: number; position: [number, number, number]; numSystems: number };

export type WorkerResponse =
  | { type: "ready"; pois: PointOfInterest[]; radius: number; halfSize: number; galaxyType: string }
  | { type: "lod"; result: LodResult; coarse: boolean }
  | { type: "located"; id: number; index: number; position: [number, number, number] }
  | { type: "leaf"; id: number; indices: number[] };

let lod: GalaxyLod | null = null;
let index: SpatialIndex | null = null;
let pending: LodRequest | null = null;
let scheduled = false;
let firstRun = true;

const ctx = self as unknown as {
  postMessage: (message: WorkerResponse, transfer?: Transferable[]) => void;
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
};

function transferables(result: LodResult): Transferable[] {
  return [result.glowPositions.buffer, result.glowSizes.buffer, result.glowColors.buffer, result.glowWeights.buffer, result.starPositions.buffer, result.starColors.buffer, result.starSizes.buffer, result.starWeights.buffer, result.starIndices.buffer, result.starExact.buffer, result.starAncestors.buffer];
}

function processPending() {
  scheduled = false;
  if (!pending || !lod) return;
  const request = pending;
  pending = null;

  if (firstRun) {
    // A cheap first pass so something shows up while the full tables are being built
    firstRun = false;
    const coarse = lod.run({ ...request, maxNodes: Math.min(request.maxNodes, 4000), maxStars: Math.min(request.maxStars, 3000) });
    ctx.postMessage({ type: "lod", result: coarse, coarse: true }, transferables(coarse));
  }

  const result = lod.run(request);
  ctx.postMessage({ type: "lod", result, coarse: false }, transferables(result));
}

ctx.onmessage = (event) => {
  const message = event.data;
  switch (message.type) {
    case "init": {
      const model = new GalaxyModel(message.info);
      index = new SpatialIndex(model);
      lod = new GalaxyLod(index);
      firstRun = true;
      ctx.postMessage({ type: "ready", pois: model.pois, radius: model.radius, halfSize: model.halfSize, galaxyType: model.type });
      break;
    }
    case "lod": {
      // Only the latest camera matters: coalesce bursts of requests
      pending = message.request;
      if (!scheduled) {
        scheduled = true;
        setTimeout(processPending, 0);
      }
      break;
    }
    case "locate": {
      if (!index) return;
      ctx.postMessage({ type: "located", id: message.id, index: message.index, position: index.locate(message.index) });
      break;
    }
    case "leaf": {
      if (!index) return;
      const [x, y, z] = message.position;
      ctx.postMessage({ type: "leaf", id: message.id, indices: index.systemsInLeaf(x, y, z, message.numSystems) });
      break;
    }
  }
};
