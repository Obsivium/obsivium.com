// WebGL Setup
const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");
let mouseX = 0,
  mouseY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vShader, fShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vShader);
  gl.attachShader(program, fShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
  }
  return program;
}

const vertShader = createShader(
  gl,
  gl.VERTEX_SHADER,
  document.getElementById("vertShader").textContent,
);
const fragShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  document.getElementById("fragShader").textContent,
);
const program = createProgram(gl, vertShader, fragShader);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
  gl.STATIC_DRAW,
);

const positionLocation = gl.getAttribLocation(program, "a_position");
const timeLocation = gl.getUniformLocation(program, "u_time");
const resLocation = gl.getUniformLocation(program, "u_res");
const mouseLocation = gl.getUniformLocation(program, "u_mouse");

function render(time) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(timeLocation, time * 0.001);
  gl.uniform2f(resLocation, canvas.width, canvas.height);
  gl.uniform2f(mouseLocation, mouseX, mouseY);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

// Mouse tracking
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = window.innerHeight - e.clientY;
});

// Cursor glow effect
const cursorGlow = document.getElementById("cursorGlow");
if (window.matchMedia("(hover: hover)").matches) {
  document.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top = e.clientY + "px";
  });
}

// Calculate age
function calculateAge() {
  const birth = new Date(2013, 1, 1);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

document.getElementById("bio").innerText =
  `I'm Obsivium. I am a ${calculateAge()}/yo developer. I am interested in CLI Tools, Kernel Stuff and Fun Stuff`;

// Tab switching with animation
function showTab(tabId) {
  const tabs = document.querySelectorAll(".tab");
  const navLinks = document.querySelectorAll("nav a");

  tabs.forEach((tab) => tab.classList.remove("active"));
  navLinks.forEach((link) => link.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  event.target.classList.add("active");
}

// Resize handler
window.addEventListener("resize", resizeCanvas);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
  });
});

// Add subtle parallax effect on scroll
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector(".info-box");
  if (parallax) {
    parallax.style.transform = `translateY(${scrolled * 0.3}px)`;
  }
});

async function loadProjects() {
  const grid = document.getElementsByClassName("project-grid")[0];
  grid.innerHTML = "<p>Loading projects...</p>";

  try {
    const response = await fetch(
      "https://api.github.com/users/obsivium/repos?sort=updated",
    );
    const repos = await response.json();

    grid.innerHTML = "";
    repos.forEach((repo) => {
      if (repo.fork) return; // skip forks

      const card = document.createElement("div");
      card.className = "project-card";
      card.innerHTML = `
<a href="${repo.html_url}" target="_blank">
  <h3>${repo.name}</h3>
  <p>${repo.description || "No description provided."}</p>
  <span class="tag">${repo.language || "Unknown"}</span>
  <span class="tag">⭐ ${repo.stargazers_count}</span>
</a>
`;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>⚠️ Failed to load projects.</p>";
  }
}

loadProjects();
