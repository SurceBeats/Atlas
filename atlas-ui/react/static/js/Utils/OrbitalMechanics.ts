// atlas-ui/react/static/js/Utils/OrbitalMechanics.ts
//
// Orbital elements shared by the planet renderer and the /explore system view, so a
// planet sits in the same place of its orbit in both.

import * as THREE from "three";

export const getOrbitalInclination = (planetName: string): number => {
  let hash = 0;
  for (let i = 0; i < planetName.length; i++) {
    hash = (hash << 5) - hash + planetName.charCodeAt(i);
    hash = hash & hash;
  }
  return ((Math.abs(hash) % 10000) / 10000) * 0.15;
};

export const getAscendingNode = (planetName: string): number => {
  let hash = 0;
  for (let i = 0; i < planetName.length; i++) {
    hash = (hash << 3) - hash + planetName.charCodeAt(i) * 7;
    hash = hash & hash;
  }
  return ((Math.abs(hash) % 10000) / 10000) * Math.PI * 2;
};

export const calculateEllipticalPosition = (angle: number, semiMajorAxis: number, eccentricity: number, inclination: number, ascendingNode: number, out: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 => {
  const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(angle));

  const xOrbital = r * Math.cos(angle);
  const yOrbital = r * Math.sin(angle);

  const x = xOrbital * Math.cos(ascendingNode) - yOrbital * Math.sin(ascendingNode) * Math.cos(inclination);
  const z = xOrbital * Math.sin(ascendingNode) + yOrbital * Math.cos(ascendingNode) * Math.cos(inclination);
  const y = yOrbital * Math.sin(inclination);

  return out.set(x, y, z);
};
