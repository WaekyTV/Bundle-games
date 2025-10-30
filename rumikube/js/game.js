// rumikube/js/game.js

const TILE_COLORS = ['red', 'blue', 'yellow', 'black'];
const TILE_VALUES = Array.from({ length: 13 }, (_, i) => i + 1); // 1 à 13

// Création du deck complet (104 tuiles + 2 jokers)
const FULL_DECK = [];
TILE_COLORS.forEach(color => {
    for (let i = 1; i <= 13; i++) {
        FULL_DECK.push({ color, value: i, id: `${color}-${i}-a`, isJoker: false });
        FULL_DECK.push({ color, value: i, id: `${color}-${i}-b`, isJoker: false });
    }
});
FULL_DECK.push({ color: 'joker', value: 0, id: 'j1', isJoker: true });
FULL_DECK.push({ color: 'joker', value: 0, id: 'j2', isJoker: true });

const handContainer = document.getElementById('hand-container');
const boardContainer = document.getElementById('board-container');
const statusElement = document.getElementById('status');
const newGameBtn = document.getElementById('newGameBtn');
const drawTileBtn = document.getElementById('drawTileBtn');
const validateBtn = document.getElementById('validateBtn');

let deck = []; // Le deck de pioche (106 tuiles au total)
let hand = []; // La main du joueur
let board = []; // Les tuiles posées sur le tapis
let initialMoveMade = false; // Règle: Vrai si le joueur a fait sa première pose (30 points)
let turnState = 'PLAYING'; // 'PLAYING', 'DRAWING'
let hasDrawn = false;

// --- Fonctions de Contrôle de Jeu ---

function newGame() {
    deck = [...FULL_DECK].sort(() => Math.random() - 0.5);
    hand = [];
    board = [];
    initialMoveMade = false;
    turnState = 'PLAYING';
    hasDrawn = false;
    
    // Distribution de 14 tuiles
    for (let i = 0; i < 14; i++) {
        hand.push(deck.pop());
    }

    updateControls();
    renderTiles();
    statusElement.textContent = "Partie commencée. Votre première pose doit valoir 30 points.";
}

function drawTile() {
    if (turnState !== 'DRAWING' || hasDrawn) {
        statusElement.textContent = "Vous êtes en train de jouer. Validez votre coup ou piochez à la fin.";
        return;
    }
    
    if (deck.length === 0) {
        statusElement.textContent = "Le deck est vide !";
        return;
    }
    
    hand.push(deck.pop());
    hasDrawn = true;
    turnState = 'END_TURN'; // Forcer la fin du tour après pioche
    
    renderTiles();
    updateControls();
    statusElement.textContent = `Tuile piochée. Votre tour est terminé. Deck restant: ${deck.length}.`;
}

function validateTurn() {
    if (turnState === 'DRAWING') {
         statusElement.textContent = "Vous avez pioché. Votre tour est terminé. Recommencez pour le tour suivant.";
         turnState = 'END_TURN';
         updateControls();
         return;
    }
    
    // Règle 1: L'ouverture (première pose) doit valoir 30 points.
    const newTiles = getNewTilesOnBoard();
    
    if (!initialMoveMade) {
        const value = calculateTilesValue(newTiles);
        if (value < 30) {
            statusElement.textContent = `❌ Ouverture invalide. Première pose doit valoir au moins 30 points. Valeur actuelle: ${value}.`;
            return;
        }
    }
    
    // Règle 2: Valider que toutes les tuiles sur le plateau forment des combinaisons valides.
    if (!areBoardCombinationsValid()) {
         statusElement.textContent = "❌ Le tapis ne contient pas que des combinaisons valides.";
         return;
    }
    
    // Succès
    initialMoveMade = true;
    turnState = 'DRAWING'; // Prépare l'état pour la pioche ou la fin de tour
    hasDrawn = false; // Réinitialiser pour le tour suivant

    updateControls();
    renderTiles(); // Mettre à jour l'état visuel (les tuiles ne peuvent plus être remises en main)
    statusElement.textContent = `✅ Tour réussi ! Deck restant: ${deck.length}.`;
    
    if (hand.length === 0) {
        statusElement.textContent = "🏆 VOUS AVEZ GAGNÉ LA PARTIE !";
        gameActive = false;
        // Ici on appellerait notifyBotWin(XP)
    }
}

// --- Fonctions de Rendu et Manipulation (Mises à jour) ---

function renderTiles() {
    renderContainer(handContainer, hand, 'hand');
    renderContainer(boardContainer, board, 'board');
}

function renderContainer(container, tiles, source) {
    container.innerHTML = '';
    if (source === 'hand') {
        tiles.sort((a, b) => a.value - b.value || a.color.localeCompare(b.color));
    }

    tiles.forEach((tile, index) => {
        const tileElement = createTileElement(tile, index, source);
        container.appendChild(tileElement);
    });
}

function createTileElement(tile, index, source) {
    const tileElement = document.createElement('div');
    tileElement.classList.add('tile', tile.color);
    tileElement.textContent = tile.isJoker ? 'J' : tile.value;
    tileElement.dataset.color = tile.color;
    tileElement.dataset.value = tile.value;
    tileElement.dataset.id = tile.id;
    
    // Double-clic pour poser/reprendre
    tileElement.addEventListener('dblclick', () => {
        if (source === 'hand' && turnState === 'PLAYING') {
            moveTile(hand, board, index);
        } else if (source === 'board' && turnState === 'PLAYING') {
            // Seulement si la tuile n'a pas été posée lors d'un tour précédent
             if (!tile.isFixed) {
                moveTile(board, hand, index);
             }
        }
        renderTiles();
        updateControls();
    });

    return tileElement;
}

function moveTile(sourceArray, targetArray, index) {
    const [tile] = sourceArray.splice(index, 1);
    targetArray.push(tile);
    // Marquer les tuiles posées pour la première fois
    if (targetArray === board) {
        tile.isNew = true;
    }
}

// --- Fonctions de Validation des Règles ---

function calculateTilesValue(tiles) {
    return tiles.reduce((sum, tile) => sum + (tile.isJoker ? 0 : tile.value), 0);
}

function getNewTilesOnBoard() {
    return board.filter(t => t.isNew);
}

function areBoardCombinationsValid() {
    // Dans cette version simplifiée, nous traitons TOUT le board comme UNE SEULE combinaison.
    // Dans le vrai Rummikub, on aurait besoin d'un algorithme de détection de groupes de combinaisons distincts.
    
    // Vérifie si le board est vide (valide)
    if (board.length === 0) return true;
    
    // Si toutes les tuiles forment une seule grande série ou un seul grand groupe (simplification extrême)
    return isRun(board) || isSet(board);
}


function isRun(tiles) {
    if (tiles.length < 3) return false;
    const sortedTiles = [...tiles].sort((a, b) => a.value - b.value);
    
    let uniqueColors = new Set(sortedTiles.map(t => t.color)).size;
    if (uniqueColors !== tiles.length) return false;
    
    for (let i = 1; i < sortedTiles.length; i++) {
        if (sortedTiles[i].value !== sortedTiles[i-1].value + 1) return false;
    }
    return true;
}

function isSet(tiles) {
    if (tiles.length < 3 || tiles.length > 4) return false;
    let uniqueValues = new Set(tiles.map(t => t.value)).size;
    if (uniqueValues !== 1) return false;
    
    let uniqueColors = new Set(tiles.map(t => t.color)).size;
    return uniqueColors === tiles.length; // Toutes les couleurs doivent être différentes
}

// --- Mise à Jour de l'Interface ---

function updateControls() {
    // Le joueur ne peut plus modifier le plateau après avoir pioché ou validé
    const canPlay = turnState === 'PLAYING';
    const canDraw = turnState === 'DRAWING' && !hasDrawn;
    const canValidate = turnState === 'PLAYING';

    drawTileBtn.disabled = !canDraw;
    validateBtn.disabled = !canValidate;

    // Mise à jour de l'affichage des tuiles après chaque action
    renderTiles(); 
}


// --- Événements et Démarrage ---
newGameBtn.addEventListener('click', newGame);
drawTileBtn.addEventListener('click', drawTile);
validateBtn.addEventListener('click', validateTurn);

newGame(); // Démarrage initial
