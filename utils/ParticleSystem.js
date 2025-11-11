import { device } from "./constants";

export class ParticleSystem {
    constructor({
        maxParticles = 1000,
        emissionRate = 10,
        startLifetime = 2.0,
        startSpeed = 1.0,
        startSize = 1.0,
        startColor = [1, 1, 1, 1],
        gravity = [0, -9.8, 0],
        looping = true,
        simulationSpace = 'world',  // 'local' or 'world'
    } = {}) {
        this.maxParticles = maxParticles;
        this.emissionRate = emissionRate;
        this.startLifetime = startLifetime;
        this.startSpeed = startSpeed;
        this.startSize = startSize;
        this.startColor = startColor;
        this.gravity = gravity;
        this.looping = looping;
        this.simulationSpace = simulationSpace;

        this.particles = [];
        this.timeAccumulator = 0;
    }

    emitParticle() {
        this.particles.push({
            position: [0, 0, 0],
            velocity: [
                0,
                this.startSpeed,
                0
            ],
            lifetime: this.startLifetime,
            color: [...this.startColor],
            size: this.startSize,
        });
    }

    update(dt) {
        // Emit new particles
        this.timeAccumulator += dt;
        const emitCount = Math.floor(this.timeAccumulator * this.emissionRate);
        this.timeAccumulator -= emitCount / this.emissionRate; // carry over remainder
        for (let i = 0; i < emitCount && this.particles.length < this.maxParticles; i++) {
            this.emitParticle();
        }

        // Update existing particles
        this.particles = this.particles.filter(particle => {
            particle.lifetime -= dt;
            particle.velocity[1] += this.gravity[1] * dt;
            particle.position[0] += particle.velocity[0] * dt;
            particle.position[1] += particle.velocity[1] * dt;
            particle.position[2] += particle.velocity[2] * dt;
            return particle.lifetime > 0;
        });
        // If looping and all dead, reset
        if (this.looping && this.particles.length === 0) {
            this.timeAccumulator = 0;
        }
    }

    render(commandEncoder, passEncoder) {
        // Implement buffer setup, pass data to GPU
        // For illustration only; details depend on your shaders/pipelines
        // Example: update a storage buffer with all particle data, then use instancing to draw
    }
}
