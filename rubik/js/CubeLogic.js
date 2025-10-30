/* rubik/js/CubeLogic.js */

// Variables globales Three.js
let scene, camera, renderer, controls;
let cubeSize = 3; // 3x3x3
let cubelets = []; // Tableau contenant les 27 petits cubes (ou 26 si on ignore le centre)
let rotationSpeed = 0.1;
let currentRotation = null; // null ou { axis: 'x', layer: 0, group: new THREE.Group() }

// Couleurs (standard Rubik's)
const COLORS = {
    R: 0xFF0000, // Rouge
    O: 0xFF8C00, // Orange (pour éviter le conflit avec le fond sombre)
    Y: 0xFFFF00, // Jaune
    W: 0xFFFFFF, // Blanc
    B: 0x0000FF, // Bleu
    G: 0x00FF00, // Vert
    D: 0x111111 // Noir (Centre)
};

// --- INITIALISATION ---

function init() {
    const container = document.getElementById('cube-container');
    
    // 1. SCÈNE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e); // Correspond au fond de la page
    
    // 2. CAMÉRA
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 0, 10);
    
    // 3. RENDU
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 4. LUMIÈRES
    scene.add(new THREE.AmbientLight(0x404040));
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(20, 10, 20);
    scene.add(light);

    // 5. CONTRÔLES (Rotation avec la souris)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 6. CRÉER LE CUBE
    createCube();
    
    // 7. ÉVÉNEMENTS
    window.addEventListener('resize', onWindowResize, false);
    
    // 8. DÉMARRER LA BOUCLE
    animate();
}

// Crée les 27 petits cubes (cubelets)
function createCube() {
    const cubeletGeometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const centerOffset = (cubeSize - 1) / 2;

    for (let x = 0; x < cubeSize; x++) {
        for (let y = 0; y < cubeSize; y++) {
            for (let z = 0; z < cubeSize; z++) {
                
                // Ne pas créer le cube central si on veut simuler un cube vide
                // if (x === 1 && y === 1 && z === 1) continue; 

                // Crée le matériel (les 6 faces avec les couleurs)
                const materials = [
                    // Droit (X=2)
                    new THREE.MeshLambertMaterial({ color: x === 2 ? COLORS.R : COLORS.D }), 
                    // Gauche (X=0)
                    new THREE.MeshLambertMaterial({ color: x === 0 ? COLORS.O : COLORS.D }), 
                    // Haut (Y=2)
                    new THREE.MeshLambertMaterial({ color: y === 2 ? COLORS.Y : COLORS.D }), 
                    // Bas (Y=0)
                    new THREE.MeshLambertMaterial({ color: y === 0 ? COLORS.W : COLORS.D }), 
                    // Avant (Z=2)
                    new THREE.MeshLambertMaterial({ color: z === 2 ? COLORS.G : COLORS.D }), 
                    // Arrière (Z=0)
                    new THREE.MeshLambertMaterial({ color: z === 0 ? COLORS.B : COLORS.D })
                ];
                
                const cubelet = new THREE.Mesh(cubeletGeometry, materials);
                
                // Positionner le cubelet (ex: le coin (0,0,0) est à (-1, -1, -1))
                cubelet.position.set(x - centerOffset, y - centerOffset, z - centerOffset);
                
                scene.add(cubelet);
                cubelets.push(cubelet);
            }
        }
    }
}

// --- BOUCLE D'ANIMATION ---

function animate() {
    requestAnimationFrame(animate);
    
    controls.update(); // Mettre à jour les contrôles (damping)
    
    handleRotationAnimation(); // Gérer l'animation de rotation d'une face
    
    renderer.render(scene, camera);
}

// Gère le redimensionnement de la fenêtre
function onWindowResize() {
    const container = document.getElementById('cube-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// --- LOGIQUE DE ROTATION (Manuelle via boutons) ---

// Fonction pour déclencher une rotation
function rotateFace(axis, layer) {
    if (currentRotation) return; // Une rotation est déjà en cours

    const layerIndex = layer - 1; // 1 -> 0, 2 -> 1, 3 -> 2

    // 1. Créer un groupe Three.js temporaire
    const rotationGroup = new THREE.Group();
    scene.add(rotationGroup);

    // 2. Identifier les cubelets de la couche
    const affectedCubelets = cubelets.filter(cubelet => {
        if (axis === 'x') return Math.round(cubelet.position.x + centerOffset) === layerIndex;
        if (axis === 'y') return Math.round(cubelet.position.y + centerOffset) === layerIndex;
        if (axis === 'z') return Math.round(cubelet.position.z + centerOffset) === layerIndex;
        return false;
    });

    // 3. Attacher les cubelets au groupe
    affectedCubelets.forEach(cubelet => {
        rotationGroup.attach(cubelet);
    });

    // 4. Stocker l'état de la rotation
    currentRotation = {
        axis: axis,
        layer: layer,
        group: rotationGroup,
        targetAngle: Math.PI / 2, // 90 degrés
        totalRotated: 0,
        direction: 1 // Toujours dans le sens positif pour l'instant
    };
    
    // Désactiver les boutons pendant la rotation
    setControlButtons(false);
}

// Gère l'animation de rotation image par image
function handleRotationAnimation() {
    if (!currentRotation) return;

    const { axis, group, targetAngle, totalRotated, direction } = currentRotation;
    
    // Angle à appliquer à cette frame
    const angleToRotate = Math.min(rotationSpeed, targetAngle - totalRotated);

    // Appliquer la rotation
    if (angleToRotate > 0) {
        if (axis === 'x') group.rotation.x += angleToRotate * direction;
        if (axis === 'y') group.rotation.y += angleToRotate * direction;
        if (axis === 'z') group.rotation.z += angleToRotate * direction;
        
        currentRotation.totalRotated += angleToRotate;
    } else {
        // La rotation est terminée (snap to grid)
        
        // Finaliser la rotation et détacher les cubelets
        currentRotation.group.updateMatrixWorld(true);
        currentRotation.group.children.forEach(cubelet => {
            // S'assurer que le cubelet retourne dans la scène et a la bonne position
            scene.attach(cubelet);
            // Réinitialiser la rotation du cubelet pour éviter l'accumulation
            cubelet.rotation.set(0, 0, 0); 
        });
        
        // Retirer le groupe temporaire
        scene.remove(currentRotation.group);

        // Terminer la rotation
        currentRotation = null;
        
        // Réactiver les boutons
        setControlButtons(true);
    }
}

// --- ÉVÉNEMENTS BOUTONS ---

const centerOffset = (cubeSize - 1) / 2;
// (La logique de l'offset est nécessaire pour le filtre des cubes)

// Fonction pour créer les boutons de rotation (appelée une fois)
function createRotationControls() {
    const controlsDiv = document.getElementById('controls');
    
    // U (Up), E (Equator), D (Down)
    controlsDiv.innerHTML += '<div>Haut/Bas: ' +
        '<button onclick="rotateFace(\'y\', 3)">U</button>' +
        '<button onclick="rotateFace(\'y\', 2)">E</button>' +
        '<button onclick="rotateFace(\'y\', 1)">D</button>' +
        '</div>';
    
    // R (Right), M (Middle), L (Left)
    controlsDiv.innerHTML += '<div>Gauche/Droite: ' +
        '<button onclick="rotateFace(\'x\', 3)">R</button>' +
        '<button onclick="rotateFace(\'x\', 2)">M</button>' +
        '<button onclick="rotateFace(\'x\', 1)">L</button>' +
        '</div>';
    
    // F (Front), S (Slice), B (Back)
    controlsDiv.innerHTML += '<div>Avant/Arrière: ' +
        '<button onclick="rotateFace(\'z\', 3)">F</button>' +
        '<button onclick="rotateFace(\'z\', 2)">S</button>' +
        '<button onclick="rotateFace(\'z\', 1)">B</button>' +
        '</div>';
}

function setControlButtons(enabled) {
    const buttons = document.getElementById('controls').querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = !enabled);
}

// Mélange le cube (simple, applique une série de rotations aléatoires)
function scrambleCube() {
    if (currentRotation) return;
    
    // Désactive les contrôles
    setControlButtons(false);
    
    const moves = [];
    const axes = ['x', 'y', 'z'];
    const layers = [1, 2, 3];
    const numMoves = 15; // 15 rotations pour un mélange simple
    
    for (let i = 0; i < numMoves; i++) {
        const axis = axes[Math.floor(Math.random() * axes.length)];
        const layer = layers[Math.floor(Math.random() * layers.length)];
        moves.push({ axis, layer });
    }
    
    // Joue les rotations avec un délai pour l'animation
    let i = 0;
    const interval = setInterval(() => {
        if (i < moves.length && !currentRotation) {
            rotateFace(moves[i].axis, moves[i].layer);
            i++;
        } else if (i >= moves.length && !currentRotation) {
            clearInterval(interval);
            setControlButtons(true);
        }
    }, 150); // Attendre la fin de la rotation précédente + 50ms
}

function resetCube() {
    // Supprimer tous les cubelets et recréer la scène
    cubelets.forEach(cubelet => scene.remove(cubelet));
    cubelets = [];
    createCube();
    // Centrer la caméra
    controls.reset(); 
    document.getElementById('status').textContent = "Cube résolu.";
}

// Lancement au chargement du script
window.onload = function() {
    init();
    createRotationControls();
    document.getElementById('scrambleBtn').addEventListener('click', scrambleCube);
    document.getElementById('resetBtn').addEventListener('click', resetCube);
};
