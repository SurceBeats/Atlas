// static/vjs/atlasRuntimeFactor.js

function updateValue(coordinate) {
  const slider = document.getElementById(`${coordinate}-slider`);
  const input = document.getElementById(`${coordinate}-value`);
  const select = document.getElementById(`${coordinate}-name`);

  input.value = slider.value;

  updateSelectOption(select, slider.value);
}

function syncSlider(coordinate) {
  const slider = document.getElementById(`${coordinate}-slider`);
  const input = document.getElementById(`${coordinate}-value`);
  const select = document.getElementById(`${coordinate}-name`);

  input.addEventListener("input", function () {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 10000000) {
      value = 10000000;
    }
    input.value = value;
    slider.value = value;

    updateSelectOption(select, value);
  });

  input.addEventListener("change", function () {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) {
      value = 0;
    } else if (value > 10000000) {
      value = 10000000;
    }
    input.value = value;
    slider.value = value;

    updateSelectOption(select, value);
  });
}

function updateSelectOption(select, value) {
  const options = select.options;
  let optionFound = false;

  for (let i = 0; i < options.length; i++) {
    const optionValue = parseInt(options[i].value);
    const nextOptionValue = i < options.length - 1 ? parseInt(options[i + 1].value) : 10000001;

    if ((i === 0 && value <= 999999) || (value >= optionValue && value < nextOptionValue) || (i === options.length - 1 && value >= 9000000 && value <= 10000000)) {
      select.selectedIndex = i;
      optionFound = true;
      break;
    }
  }

  if (!optionFound) {
    select.selectedIndex = -1;
  }
}

function updateCoordinate(coordinate) {
  const select = document.getElementById(`${coordinate}-name`);
  const slider = document.getElementById(`${coordinate}-slider`);
  const input = document.getElementById(`${coordinate}-value`);

  slider.value = select.value;
  input.value = select.value;
}

function randomizeCoordinates() {
  const maxCoordinate = 10000000;
  const randomX = Math.floor(Math.random() * maxCoordinate);
  const randomY = Math.floor(Math.random() * maxCoordinate);
  const randomZ = Math.floor(Math.random() * maxCoordinate);

  document.getElementById("x-slider").value = randomX;
  document.getElementById("y-slider").value = randomY;
  document.getElementById("z-slider").value = randomZ;

  updateValue("x");
  updateValue("y");
  updateValue("z");
}

document.addEventListener("DOMContentLoaded", function () {
  syncSlider("x");
  syncSlider("y");
  syncSlider("z");
  randomizeCoordinates();
});
