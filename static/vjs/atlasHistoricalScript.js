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

// Console logs
(function () {
  const coordinates = document.body.getAttribute("data-coordinates");
  const systemIndex = document.body.getAttribute("data-system-index");
  const planetName = document.body.getAttribute("data-planet-name");

  function hasVisitedGalaxy(coords) {
    let viewedPlanets = JSON.parse(localStorage.getItem("atlasHistoricalData")) || {};
    return coords in viewedPlanets;
  }

  function hasVisitedSystem(coords, systemId) {
    let viewedPlanets = JSON.parse(localStorage.getItem("atlasHistoricalData")) || {};
    return viewedPlanets[coords] && systemId in viewedPlanets[coords];
  }

  function hasVisitedPlanet(coords, systemId, planetName) {
    let viewedPlanets = JSON.parse(localStorage.getItem("atlasHistoricalData")) || {};
    return viewedPlanets[coords] && viewedPlanets[coords][systemId] && viewedPlanets[coords][systemId].includes(planetName);
  }

  // Verificación y salida en consola
  if (coordinates) {
    console.log(`Galaxia con coordenadas ${coordinates} ha sido visitada: ${hasVisitedGalaxy(coordinates)}`);

    if (systemIndex) {
      console.log(`Sistema ${systemIndex} en la galaxia con coordenadas ${coordinates} ha sido visitado: ${hasVisitedSystem(coordinates, systemIndex)}`);

      if (planetName) {
        console.log(`Planeta ${planetName} en el sistema ${systemIndex} de la galaxia con coordenadas ${coordinates} ha sido visitado: ${hasVisitedPlanet(coordinates, systemIndex, planetName)}`);
      }
    }
  }
})();

// Set Storage
(function () {
  const coordinates = document.body.getAttribute("data-coordinates");
  const systemIndex = document.body.getAttribute("data-system-index");
  const planetName = document.body.getAttribute("data-planet-name");

  function markLocationAsViewed(coords, systemIdx = null, planet = null) {
    let viewedPlanets = JSON.parse(localStorage.getItem("atlasHistoricalData")) || {};

    // Verificar si las coordenadas de la galaxia ya están en el almacenamiento
    if (!viewedPlanets[coords]) {
      viewedPlanets[coords] = {};
    }

    // Si se proporciona un systemIndex, verificar si existe
    if (systemIdx !== null) {
      const systemKey = systemIdx.toString();

      if (!viewedPlanets[coords][systemKey]) {
        viewedPlanets[coords][systemKey] = [];
      }

      // Si se proporciona un planeta, verificar si ya está registrado
      if (planet && !viewedPlanets[coords][systemKey].includes(planet)) {
        viewedPlanets[coords][systemKey].push(planet);
      }
    }

    // Guardar los datos actualizados en localStorage
    localStorage.setItem("atlasHistoricalData", JSON.stringify(viewedPlanets));
  }

  // Lógica principal para marcar elementos como vistos
  if (coordinates) {
    if (systemIndex && planetName) {
      // Marca el planeta como visto
      markLocationAsViewed(coordinates, systemIndex, planetName);
    } else if (systemIndex) {
      // Marca el sistema como visto
      markLocationAsViewed(coordinates, systemIndex);
    } else {
      // Marca la galaxia como vista
      markLocationAsViewed(coordinates);
    }
  }
})();
