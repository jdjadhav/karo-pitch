// globe.js
const canvas = document.getElementById('globe-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const PARTICLE_COUNT = 1100;
let baseRadius = 300;
let SPHERE_RADIUS = 300;

let rotationX = 0;
let rotationY = 0;

function resize() {
    if (!canvas) return;

    // Size canvas to match hero section
    const parent = canvas.parentElement;
    width = parent.clientWidth;
    height = parent.clientHeight;

    // Handle high DPI displays for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    if (width < 768) {
        SPHERE_RADIUS = width * 1.0;
    } else {
        // Increase base radius significantly so the globe covers the background fully
        SPHERE_RADIUS = Math.min(width, height) * 0.95;
    }
}

class Particle {
    constructor() {
        this.theta = Math.random() * 2 * Math.PI;
        this.phi = Math.acos(2 * Math.random() - 1);

        // Add subtle organic drifting motion varying per particle
        this.thetaSpeed = (Math.random() - 0.5) * 0.003;
        this.phiSpeed = (Math.random() - 0.5) * 0.003;

        this.size = Math.random() * 3.0 + 1.5; // Slightly larger base

        // Randomly assign more particles to be cyan/blue highlight (20%)
        this.isAccent = Math.random() > 0.8;
    }

    updateRadius() {
        // Apply drifting
        this.theta += this.thetaSpeed;
        this.phi += this.phiSpeed;

        // Ease the drifting back when hitting vertical poles so they don't snap
        if (this.phi <= 0.1 || this.phi >= Math.PI - 0.1) {
            this.phiSpeed *= -1;
        }

        this.baseX = Math.sin(this.phi) * Math.cos(this.theta);
        this.baseY = Math.sin(this.phi) * Math.sin(this.theta);
        this.baseZ = Math.cos(this.phi);

        this.x = this.baseX * SPHERE_RADIUS;
        this.y = this.baseY * SPHERE_RADIUS;
        this.z = this.baseZ * SPHERE_RADIUS;
    }
}

function init() {
    if (!canvas) return;
    window.addEventListener('resize', resize);
    resize();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
    particles.forEach(p => p.updateRadius());
    requestAnimationFrame(draw);
}

function rotateX(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: p.x,
        y: p.y * cos - p.z * sin,
        z: p.y * sin + p.z * cos
    };
}

function rotateY(p, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: p.x * cos + p.z * sin,
        y: p.y,
        z: -p.x * sin + p.z * cos
    };
}

let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;

window.addEventListener('mousemove', (e) => {
    // Normalize mouse coordinates to -0.5 to 0.5
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
});

function draw() {
    // Recompute radius if screen resized
    particles.forEach(p => p.updateRadius());

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);

    // Additive blending for a beautiful glowing neon effect
    ctx.globalCompositeOperation = 'screen';

    // Auto rotate very slowly + smooth response to mouse position
    targetRotationY = mouseX * 1.5;
    targetRotationX = mouseY * 1.5;

    rotationY += 0.0015 + (targetRotationY - rotationY) * 0.03;
    rotationX += 0.0005 + (targetRotationX - rotationX) * 0.03;

    let projectedParticles = [];

    particles.forEach(p => {
        let pRotated = rotateX(p, rotationX);
        pRotated = rotateY(pRotated, rotationY);

        const perspective = 900;
        const z = pRotated.z + SPHERE_RADIUS * 1.8;

        if (z > 0) {
            const scale = perspective / z;
            const x2d = width / 2 + pRotated.x * scale;
            const y2d = height / 2 + pRotated.y * scale;

            projectedParticles.push({
                orig: p,
                rx: pRotated.x,
                ry: pRotated.y,
                rz: pRotated.z,
                x2d: x2d,
                y2d: y2d,
                scale: scale,
                size: p.size,
                isAccent: p.isAccent
            });
        }
    });

    // Sort by z-index for back-to-front rendering
    projectedParticles.sort((a, b) => a.rz - b.rz);

    const connectMaxDist = SPHERE_RADIUS * 0.28;
    const connectMaxDistSq = connectMaxDist * connectMaxDist;

    for (let i = 0; i < projectedParticles.length; i++) {
        const p1 = projectedParticles[i];

        // Depth mapping (front is opaque, back is transparent)
        const depth = (p1.rz + SPHERE_RADIUS) / (SPHERE_RADIUS * 2);
        // Clamp depth between 0 and 1 just in case
        const clampedDepth = Math.max(0, Math.min(1, depth));

        // Boost opacity for better visibility
        const zOpacity = 0.2 + clampedDepth * 0.8;

        // Colors: Purple (139, 92, 246) or Blue/Cyan accent (0, 200, 255)
        const r = p1.isAccent ? 0 : 139;
        const g = p1.isAccent ? 200 : 92;
        const b = p1.isAccent ? 255 : 246;

        // Draw node
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${zOpacity})`;
        ctx.beginPath();
        ctx.arc(p1.x2d, p1.y2d, p1.size * p1.scale, 0, Math.PI * 2);
        ctx.fill();

        // Connect only if they are close in 3D space
        for (let j = i + 1; j < projectedParticles.length; j++) {
            const p2 = projectedParticles[j];

            // Fast bounding box check before expensive Math operations
            if (Math.abs(p1.rx - p2.rx) > connectMaxDist ||
                Math.abs(p1.ry - p2.ry) > connectMaxDist ||
                Math.abs(p1.rz - p2.rz) > connectMaxDist) {
                continue;
            }

            const dx = p1.rx - p2.rx;
            const dy = p1.ry - p2.ry;
            const dz = p1.rz - p2.rz;
            const distSq = dx * dx + dy * dy + dz * dz;

            if (distSq < connectMaxDistSq) {
                const distRate = 1 - (Math.sqrt(distSq) / connectMaxDist);
                // Lines are more subtle than points
                const lineOpacity = distRate * zOpacity * 0.25;

                // Color lines purple for consistency
                ctx.strokeStyle = `rgba(139, 92, 246, ${lineOpacity})`;
                ctx.lineWidth = 0.5 * p1.scale;
                ctx.beginPath();
                ctx.moveTo(p1.x2d, p1.y2d);
                ctx.lineTo(p2.x2d, p2.y2d);
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(draw);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
