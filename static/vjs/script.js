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

// Hide on load
window.onload = function () {
  document.getElementById("localization-content").style.display = "none";
};

// Random coords bruh
function getRandomCoordinates() {
  const maxCoordinate = 10000000;
  const randomX = Math.floor(Math.random() * (maxCoordinate + 1));
  const randomY = Math.floor(Math.random() * (maxCoordinate + 1));
  const randomZ = Math.floor(Math.random() * (maxCoordinate + 1));

  document.querySelector('input[name="x"]').value = randomX;
  document.querySelector('input[name="y"]').value = randomY;
  document.querySelector('input[name="z"]').value = randomZ;
}
