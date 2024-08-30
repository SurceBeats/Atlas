document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let stars = [];
  const numStars = 800;
  let centerX, centerY;
  const maxCanvasSize = 800;

  function init() {
    resizeCanvas();
    centerX = canvas.width / 2;
    centerY = canvas.height / 2;

    for (let i = 0; i < numStars; i++) {
      let star = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * canvas.width,
        o: Math.random(),
      };
      stars.push(star);
    }

    window.requestAnimationFrame(update);
  }

  function resizeCanvas() {
    const width = Math.min(window.innerWidth, maxCanvasSize);
    const height = Math.min(window.innerHeight, maxCanvasSize);

    canvas.width = width;
    canvas.height = height;

    centerX = canvas.width / 2;
    centerY = canvas.height / 2;
  }

  let speed = 0.5;
  let decelerate = false;

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
      star.z -= speed;

      if (star.z <= 0) {
        star.z = canvas.width;
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
        star.o = Math.random();
      }

      let k = canvas.width / star.z;
      let x = (star.x - centerX) * k + centerX;
      let y = (star.y - centerY) * k + centerY;
      let r = 2 * k;
      let o = star.o;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${o})`;
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    });

    if (!decelerate && speed < 60) {
      speed += 1;
    }

    if (decelerate && speed > 2) {
      speed -= 2;
    }

    window.requestAnimationFrame(update);
  }

  window.addEventListener("resize", resizeCanvas);
  init();

  const imgElement = document.getElementById("blob-image");
  const highResImageUrl = imgElement.getAttribute("data-high-res-url");
  const img = new Image();
  img.src = highResImageUrl;

  img.onload = () => {
    decelerate = true;

    imgElement.src = highResImageUrl;
    imgElement.classList.add("loaded");

    canvas.classList.add("hidden");

    setTimeout(() => {
      canvas.style.display = "none";
    }, 2500);
  };
});
