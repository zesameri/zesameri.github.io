
const gridCanvasEl = document.getElementById('gridCanvas');
const gridCtx = gridCanvasEl.getContext('2d');

const CONFIG = {
    squareSize: 55,
    borderWidth: 12,
    borderColor: '#f5e6d3',
    navy: ['#0f1f2f', '#1a2838', '#142430', '#1f3040'],
    green: ['#2d5540', '#3d6a55', '#4a7a65', '#5a8575', '#6a9a8a', '#7aaa9a', '#3a5f4a', '#557f6a'],
    gold: ['#6b4423', '#7a5530', '#8b6f47', '#9a7a52', '#a67c3d', '#b68c4d', '#5a3820', '#8a6442'],
    lightBlue: ['#4a7595', '#5a85a5', '#6a95b5', '#7aa5c5', '#4a6a85', '#5a7a95', '#6a8aa5', '#7a9ab5']
};

function resizeCanvas() {
    const diagonal = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
    gridCanvasEl.width = diagonal;
    gridCanvasEl.height = diagonal;
}

function calculateGridDimensions() {
    return {
        cols: Math.ceil(gridCanvasEl.width / CONFIG.squareSize) + 1,
        rows: Math.ceil(gridCanvasEl.height / CONFIG.squareSize) + 1
    };
}

function isNavySquare(row, col) {
    return row % 3 === 0 || col % 3 === 0;
}

function getNavyVariation(row, col) {
    const index = (row * 7 + col * 13) % 4;
    return CONFIG.navy[index];
}

function calculateBlockPosition(row, col) {
    return {
        blockRow: Math.floor((row - 1) / 3),
        blockCol: Math.floor((col - 1) / 3)
    };
}

function calculateGroupPosition(blockRow, blockCol) {
    return {
        groupRow: Math.floor(blockRow / 2),
        groupCol: Math.floor(blockCol / 2)
    };
}

function selectColorPalette(groupRow, groupCol) {
    const palettes = [CONFIG.gold, CONFIG.lightBlue, CONFIG.green];
    const index = (groupCol + groupRow) % 3;
    return palettes[index];
}

function getColorVariation(palette, row, col) {
    const index = (row * 3 + col * 5) % 4;
    return palette[index];
}

function getColoredSquareColor(row, col) {
    const { blockRow, blockCol } = calculateBlockPosition(row, col);
    const { groupRow, groupCol } = calculateGroupPosition(blockRow, blockCol);
    const palette = selectColorPalette(groupRow, groupCol);
    return getColorVariation(palette, row, col);
}

function determineSquareColor(row, col) {
    if (isNavySquare(row, col)) {
        return getNavyVariation(row, col);
    }
    return getColoredSquareColor(row, col);
}

function fillSquare(x, y, color) {
    gridCtx.fillStyle = color;
    gridCtx.fillRect(x, y, CONFIG.squareSize, CONFIG.squareSize);
}

function strokeSquareBorder(x, y) {
    gridCtx.strokeStyle = CONFIG.borderColor;
    gridCtx.lineWidth = CONFIG.borderWidth;
    gridCtx.strokeRect(x, y, CONFIG.squareSize, CONFIG.squareSize);
}

function getAllColors() {
    return [
        ...CONFIG.navy,
        ...CONFIG.green,
        ...CONFIG.gold,
        ...CONFIG.lightBlue
    ];
}

function getRandomColor(x, y) {
    const allColors = getAllColors();
    const seed = x * 7919 + y * 7907;
    const index = Math.abs(seed) % allColors.length;
    return allColors[index];
}

function drawEightPointedStar(centerX, centerY, outerRadius, innerRadius, color) {
    const points = 8;
    const totalPoints = points * 2;
    
    gridCtx.fillStyle = color;
    gridCtx.beginPath();
    
    for (let i = 0; i < totalPoints; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
            gridCtx.moveTo(x, y);
        } else {
            gridCtx.lineTo(x, y);
        }
    }
    
    gridCtx.closePath();
    gridCtx.fill();
}

function renderSquare(row, col) {
    const x = col * CONFIG.squareSize;
    const y = row * CONFIG.squareSize;
    const color = determineSquareColor(row, col);
    
    fillSquare(x, y, color);
    strokeSquareBorder(x, y);
}

function renderStarAtIntersection(x, y) {
    const outerRadius = CONFIG.borderWidth * 0.75;
    const innerRadius = outerRadius * 0.5;
    const color = getRandomColor(x, y);
    
    drawEightPointedStar(x, y, outerRadius, innerRadius, color);
}

function renderAllStars() {
    const { rows, cols } = calculateGridDimensions();
    
    for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
            const x = col * CONFIG.squareSize;
            const y = row * CONFIG.squareSize;
            renderStarAtIntersection(x, y);
        }
    }
}

function renderGrid() {
    const { rows, cols } = calculateGridDimensions();
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            renderSquare(row, col);
        }
    }
    
    renderAllStars();
}

function initializeCanvas() {
    resizeCanvas();
    renderGrid();
}

function handleGridResize() {
    resizeCanvas();
    renderGrid();
}

initializeCanvas();
window.addEventListener('resize', handleGridResize);

