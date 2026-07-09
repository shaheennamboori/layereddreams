// Three.js Background Animation - Pixelated Voxel Field
// Renders at a fraction of native resolution, then the canvas is scaled up
// with `image-rendering: pixelated` (set in CSS) so every particle reads as
// a chunky, discrete pixel/voxel instead of a soft anti-aliased dot.

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true
});
renderer.setPixelRatio(1); // we control resolution manually for the pixel look

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// How much to downscale the internal render resolution. Smaller = chunkier pixels.
const PIXEL_DOWNSCALE = 0.16;

// --- BUILD A HARD-EDGED "PIXEL" SPRITE TEXTURE (a small filled square, no soft edges) ---
function makePixelTexture() {
    const size = 8;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, 1, size - 2, size - 2); // 1px transparent margin keeps edges crisp
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    return tex;
}
const pixelTexture = makePixelTexture();

// --- PARTICLES CONFIG ---
const particlesCount = 1400;
const positions = new Float32Array(particlesCount * 3);
const homePositions = new Float32Array(particlesCount * 3);
const velocities = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);

// Retro arcade palette: mostly cyan, occasional magenta/lime accent voxels
const cCyan = new THREE.Color(0x38bdf8);
const cMagenta = new THREE.Color(0xff3fa4);
const cLime = new THREE.Color(0xbaff29);

for (let i = 0; i < particlesCount; i++) {
    const x = (Math.random() - 0.5) * 80;
    const y = (Math.random() - 0.5) * 80;
    const z = (Math.random() - 0.5) * 40;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    homePositions[i * 3] = x;
    homePositions[i * 3 + 1] = y;
    homePositions[i * 3 + 2] = z;

    velocities[i * 3] = 0;
    velocities[i * 3 + 1] = 0;
    velocities[i * 3 + 2] = 0;

    const roll = Math.random();
    const col = roll < 0.82 ? cCyan : (roll < 0.94 ? cMagenta : cLime);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const material = new THREE.PointsMaterial({
    size: 0.55,
    map: pixelTexture,
    vertexColors: true,
    transparent: true,
    alphaTest: 0.4,
    opacity: 0.85,
    depthWrite: false
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// --- MOUSE TRACKING ---
let mouseX = 0;
let mouseY = 0;
let mouseActive = false;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    mouseActive = true;
});

window.addEventListener('mouseout', () => {
    mouseActive = false;
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    if (!prefersReducedMotion) {
        requestAnimationFrame(animate);
    }
    const time = clock.getElapsedTime();
    const posAttr = geometry.attributes.position;

    const mouse3D = new THREE.Vector3(mouseX * 20, mouseY * 20, 0);

    for (let i = 0; i < particlesCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        const driftX = Math.sin(time * 0.2 + homePositions[ix]) * 0.005;
        const driftY = Math.cos(time * 0.2 + homePositions[iy]) * 0.005;

        let mouseInfluenceX = 0;
        let mouseInfluenceY = 0;
        let mouseInfluenceZ = 0;

        if (mouseActive && !prefersReducedMotion) {
            const dx = mouse3D.x - positions[ix];
            const dy = mouse3D.y - positions[iy];
            const dz = mouse3D.z - positions[iz];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 12) {
                const strength = (1 - dist / 12) * 0.02;
                mouseInfluenceX = dx * strength;
                mouseInfluenceY = dy * strength;
                mouseInfluenceZ = dz * strength;
            }
        }

        const ax = (homePositions[ix] - positions[ix]) * 0.05;
        const ay = (homePositions[iy] - positions[iy]) * 0.05;
        const az = (homePositions[iz] - positions[iz]) * 0.05;

        velocities[ix] += driftX + mouseInfluenceX + ax;
        velocities[iy] += driftY + mouseInfluenceY + ay;
        velocities[iz] += mouseInfluenceZ + az;

        velocities[ix] *= 0.85;
        velocities[iy] *= 0.85;
        velocities[iz] *= 0.85;

        positions[ix] += velocities[ix];
        positions[iy] += velocities[iy];
        positions[iz] += velocities[iz];
    }

    posAttr.needsUpdate = true;

    if (!prefersReducedMotion) {
        camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.01;
        camera.position.y += (mouseY * 1.5 - camera.position.y) * 0.01;
        camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
}

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Internal resolution is deliberately low-res; CSS scales the canvas back
    // up to full viewport size with `image-rendering: pixelated`.
    const w = Math.max(1, Math.floor(window.innerWidth * PIXEL_DOWNSCALE));
    const h = Math.max(1, Math.floor(window.innerHeight * PIXEL_DOWNSCALE));
    renderer.setSize(w, h, false);
}

window.addEventListener('resize', handleResize);
handleResize();
animate();