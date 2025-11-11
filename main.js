import ParticleSystem from './ParticleSystem.js';

// Setup canvas and WebGPU context
const canvas = document.getElementById('canvas');
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    // If needed, update WebGPU render target size here as well
}
window.addEventListener('resize', resizeCanvas);

// Create Particle System
const particleSystem = new ParticleSystem({
    maxParticles: 2000,
    emissionRate: 100,
    startLifetime: 2.5,
    startSpeed: 200,
    startSize: 4,
    startColor: [1, 0.5, 0.2, 1],
    gravity: [0, -300, 0],
});

// Animation loop
/**
 * @type {Timestamp}
 */
let lastTime;
function animate(time) {
    if (!lastTime) lastTime = time;
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    
    particleSystem.update(dt);
    // Set up your WebGPU command encoder and pass encoder here
    // particleSystem.render(commandEncoder, passEncoder);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);