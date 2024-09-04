// static/vjs/atlasInitializationProtocol.js

document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".option-card");
  const startButton = document.getElementById("start-protocol");
  const universeInput = document.getElementById("universe_type");

  cards.forEach((card) => {
    card.addEventListener("click", function () {
      cards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      const selectedValue = card.getAttribute("data-value");
      universeInput.value = selectedValue;

      startButton.disabled = false;
    });
  });
});
