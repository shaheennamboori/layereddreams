
// Removed ES module import to support file:// protocol
// Three.js is now loaded via <script> tag in index.html

const canvas = document.querySelector('#bg-canvas');
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// --- PARTICLES ---
const particlesCount = 1500;
const positions = new Float32Array(particlesCount * 3);
const velocities = new Float32Array(particlesCount * 3);
const originalPositions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 15;
    originalPositions[i] = positions[i];
    velocities[i] = (Math.random() - 0.5) * 0.02;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// --- HOLOGRAPHIC GRID ---
const gridHelper = new THREE.GridHelper(20, 40, 0x38bdf8, 0x1e293b);
gridHelper.position.y = -2;
gridHelper.rotation.x = Math.PI / 10;
scene.add(gridHelper);

// --- MOUSE TRACKING ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    // Subtle camera movement
    camera.position.x = targetX * 0.5;
    camera.position.y = targetY * 0.5;
    camera.lookAt(0, 0, 0);

    // Particle animation
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < particlesCount; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // Drift
        positions[ix] += velocities[ix];
        positions[iy] += velocities[iy];
        positions[iz] += velocities[iz];

        // Boundaries
        if (Math.abs(positions[ix]) > 10) positions[ix] = -positions[ix] * 0.9;
        if (Math.abs(positions[iy]) > 10) positions[iy] = -positions[iy] * 0.9;
        if (Math.abs(positions[iz]) > 10) positions[iz] = -positions[iz] * 0.9;

        // Interaction with mouse
        const dx = positions[ix] - (targetX * 5);
        const dy = positions[iy] - (targetY * 5);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 2) {
            positions[ix] += dx * 0.01;
            positions[iy] += dy * 0.01;
        }
    }
    posAttr.needsUpdate = true;

    // Grid pulse
    gridHelper.material.opacity = 0.2 + Math.sin(Date.now() * 0.001) * 0.1;

    renderer.render(scene, camera);
}

// --- RESIZE ---
function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', handleResize);
handleResize();
animate();
