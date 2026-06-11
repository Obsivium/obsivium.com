// WebGL Context & Render Setup
const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");
let mouseX = 0, mouseY = 0;

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

const vertShader = createShader(gl, gl.VERTEX_SHADER, document.getElementById("vertShader").textContent);
const fragShader = createShader(gl, gl.FRAGMENT_SHADER, document.getElementById("fragShader").textContent);
const program = createProgram(gl, vertShader, fragShader);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

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

// Interaction Events
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = window.innerHeight - e.clientY;
});

const cursorGlow = document.getElementById("cursorGlow");
if (window.matchMedia("(hover: hover)").matches) {
  document.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = e.clientX + "px";
    cursorGlow.style.top = e.clientY + "px";
  });
}

// Experience Engine
function experienceYears() {
  const currentYear = new Date().getFullYear();
  const birthYear = 2013;
  const startYear = birthYear + 7; // 2020
  return Math.max(0, currentYear - startYear);
}

document.getElementById("bio").innerText = 
  `I am a systems developer and hardware designer with ${experienceYears()}+ years of continuous engineering experience. I build network automation scripts, low-level templates, and custom machines.`;

// Navigation Control
function showTab(tabId, event) {
  if (event) event.preventDefault();
  
  const tabs = document.querySelectorAll(".tab");
  const navLinks = document.querySelectorAll("nav a");

  tabs.forEach((tab) => tab.classList.remove("active"));
  navLinks.forEach((link) => link.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  if (event) event.target.classList.add("active");
}

window.addEventListener("resize", resizeCanvas);

// Load JSON Showcase Projects
async function loadProjects() {
  const grid = document.querySelector(".project-grid");
  grid.innerHTML = "<p class='loading-text'>Loading projects...</p>";

  try {
    const response = await fetch("./projects.json");
    const projects = await response.json();

    grid.innerHTML = "";
    projects.forEach((project) => {
      const card = document.createElement("div");
      card.className = "project-card";
      
      const tagElements = project.tags.map(t => `<span class="tag">${t}</span>`).join("");

      card.innerHTML = `
        <a href="${project.link}" target="_blank">
          <div class="card-img-wrapper">
            <img src="${project.image}" alt="${project.name}" loading="lazy" />
          </div>
          <div class="card-content">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <div class="tag-container">${tagElements}</div>
          </div>
        </a>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = "<p>Error: Failed to load projects list.</p>";
  }
}

loadProjects();