// Localization
function toggleLocalization() {
  var content = document.getElementById("localization-content");
  var button = document.querySelector(".dropdown-btn");

  if (content.style.display === "none" || content.style.display === "") {
    content.style.display = "block";
    button.textContent = "Hide Localization";
  } else {
    content.style.display = "none";
    button.textContent = "View Localization";
  }
}

// Hide onload localization contentt
window.onload = function () {
  const localizationContent = document.getElementById("localization-content");

  if (localizationContent) {
    localizationContent.style.display = "none";
  }
};

function generateCoordinates() {
  const xPattern = document.getElementById("x-pattern").value;
  const yPattern = document.getElementById("y-pattern").value;
  const zPattern = document.getElementById("z-pattern").value;

  console.log(`Coordinates generated: X=${xPattern}, Y=${yPattern}, Z=${zPattern}`);
}

function randomizeCoordinates() {
  const maxCoordinate = 10000000;
  const randomX = Math.floor(Math.random() * maxCoordinate);
  const randomY = Math.floor(Math.random() * maxCoordinate);
  const randomZ = Math.floor(Math.random() * maxCoordinate);

  document.getElementById("x-pattern").value = randomX;
  document.getElementById("y-pattern").value = randomY;
  document.getElementById("z-pattern").value = randomZ;

  generateCoordinates();
}

// Random coords home bruh
function getRandomCoordinates() {
  const maxCoordinate = 10000000;
  const randomX = Math.floor(Math.random() * (maxCoordinate + 1));
  const randomY = Math.floor(Math.random() * (maxCoordinate + 1));
  const randomZ = Math.floor(Math.random() * (maxCoordinate + 1));

  document.querySelector('input[name="x"]').value = randomX;
  document.querySelector('input[name="y"]').value = randomY;
  document.querySelector('input[name="z"]').value = randomZ;
}

// Stargate animation
document.addEventListener("DOMContentLoaded", function () {
  const stargateText = document.getElementById("stargate-text");
  const stargateButton = document.querySelector(".stargate");

  if (!stargateText || !stargateButton) {
    return;
  }

  const animationShown = sessionStorage.getItem("stargateAnimationShown");

  if (animationShown) {
    stargateText.textContent = "Stargate system aligned";
  } else {
    sessionStorage.setItem("stargateAnimationShown", "true");

    const finalMessage = "Stargate system aligned";
    let currentPhase = 0;

    function getRandomBinary(length) {
      return Array.from({ length }, () => Math.floor(Math.random() * 2)).join("");
    }

    function getRandomDecimal(length) {
      return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
    }

    function getRandomHexadecimal(length) {
      const hexChars = "0123456789ABCDEF";
      return Array.from({ length }, () => hexChars[Math.floor(Math.random() * 16)]).join("");
    }

    function getRandomAlphanumericSymbols(length) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:'\",.<>?/`~";
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    }

    function typeBinary() {
      stargateText.textContent = getRandomBinary(32);
      currentPhase++;
      if (currentPhase < 20) {
        setTimeout(typeBinary, 40);
      } else {
        currentPhase = 0;
        setTimeout(typeDecimal, 40);
      }
    }

    function typeDecimal() {
      stargateText.textContent = getRandomDecimal(32);
      currentPhase++;
      if (currentPhase < 30) {
        setTimeout(typeDecimal, 25);
      } else {
        currentPhase = 0;
        setTimeout(typeHexadecimal, 25);
      }
    }

    function typeHexadecimal() {
      stargateText.textContent = getRandomHexadecimal(32);
      currentPhase++;
      if (currentPhase < 40) {
        setTimeout(typeHexadecimal, 20);
      } else {
        currentPhase = 0;
        setTimeout(typeAlphanumericSymbols, 20);
      }
    }

    function typeAlphanumericSymbols() {
      stargateText.textContent = getRandomAlphanumericSymbols(32);
      currentPhase++;
      if (currentPhase < 100) {
        setTimeout(typeAlphanumericSymbols, 10);
      } else {
        currentPhase = 0;
        setTimeout(typeFinalMessage, 10);
      }
    }

    function typeFinalMessage() {
      let i = 0;
      stargateText.textContent = "";
      function typeCharacter() {
        if (i < finalMessage.length) {
          stargateText.textContent += finalMessage.charAt(i);
          i++;
          setTimeout(typeCharacter, 30);
        } else {
          animateStargateButton();
        }
      }
      typeCharacter();
    }

    function animateStargateButton() {
      stargateButton.style.transition = "transform 0.3s ease";
      stargateButton.style.transform = "scale(1.1)";
      setTimeout(() => {
        stargateButton.style.transform = "scale(1)";
      }, 300);
    }

    typeBinary();
  }
});
