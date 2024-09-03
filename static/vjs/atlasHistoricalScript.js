// Seen indicator logic
(function () {
  const coordinates = document.body.getAttribute("data-coordinates");
  const systemIndex = document.body.getAttribute("data-system-index");

  function hasVisitedSystem(coords, systemId) {
    let viewedPlanets = JSON.parse(localStorage.getItem("atlasHistoricalData")) || {};
    return viewedPlanets[coords] && systemId in viewedPlanets[coords];
  }

  function hasVisitedPlanet(coords, systemId, planetName) {
    let viewedPlanets = JSON.parse(localStorage.getItem("atlasHistoricalData")) || {};
    return viewedPlanets[coords] && viewedPlanets[coords][systemId] && viewedPlanets[coords][systemId].includes(planetName);
  }

  // System marked
  const systemIndicators = document.querySelectorAll(".seen-indicator[data-system]");

  systemIndicators.forEach((indicator) => {
    const systemIdx = indicator.getAttribute("data-system");

    if (hasVisitedSystem(coordinates, systemIdx)) {
      indicator.style.display = "block";
      indicator.style.opacity = "1";
    }
  });

  // Planet marked
  const planetIndicators = document.querySelectorAll(".seen-indicator[data-planet]");

  planetIndicators.forEach((indicator) => {
    const planetName = indicator.getAttribute("data-planet");

    if (hasVisitedPlanet(coordinates, systemIndex, planetName)) {
      indicator.style.display = "block";
      indicator.style.opacity = "1";
    }
  });
})();

// Set Storage
(function () {
  const coordinates = document.body.getAttribute("data-coordinates");
  const systemIndex = document.body.getAttribute("data-system-index");
  const planetName = document.body.getAttribute("data-planet-name");

  function markLocationAsViewed(coords, systemIdx = null, planet = null) {
    let viewedPlanets = JSON.parse(localStorage.getItem("atlasHistoricalData")) || {};

    // Verificar si coordenadas la galaxia están
    if (!viewedPlanets[coords]) {
      viewedPlanets[coords] = {};
    }

    // Si systemIndex, verificar si existe
    if (systemIdx !== null) {
      const systemKey = systemIdx.toString();

      if (!viewedPlanets[coords][systemKey]) {
        viewedPlanets[coords][systemKey] = [];
      }

      // Si planeta, verificar si existe
      if (planet && !viewedPlanets[coords][systemKey].includes(planet)) {
        viewedPlanets[coords][systemKey].push(planet);
      }
    }

    localStorage.setItem("atlasHistoricalData", JSON.stringify(viewedPlanets));
  }

  // Marcar como vistos
  if (coordinates) {
    if (systemIndex && planetName) {
      markLocationAsViewed(coordinates, systemIndex, planetName);
    } else if (systemIndex) {
      markLocationAsViewed(coordinates, systemIndex);
    } else {
      markLocationAsViewed(coordinates);
    }
  }
})();
