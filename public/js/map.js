// Hex map related functions
let hexMap = [];
let currentScale = 1;
let selectedHex = null;
const HEX_SIZE = 90; // Size of hexagons in pixels

// Initialize the hex map
function initializeMap() {
    console.log('Initializing hex map');
    const mapContainer = document.getElementById('hex-map');

    // Clear any existing hexes
    mapContainer.innerHTML = '';

    // Create SVG element
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.id = "hex-svg-map";
    mapContainer.appendChild(svgElement);

    // Generate the map
    GenerateMap(svgElement);

    // Set up zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        currentScale += 0.1;
        updateMapScale();
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        if (currentScale > 0.5) {
            currentScale -= 0.1;
            updateMapScale();
        }
    });
}

// Create a demo map with sample hexes
function GenerateMap(svgElement) {
    // Create a sample 5x5 grid of hexes
    const rows = 5;
    const cols = 5;

    // Calculate map dimensions
    const mapWidth = cols * HEX_SIZE * 2;
    const mapHeight = rows * HEX_SIZE;

    svgElement.setAttribute('width', mapWidth);
    svgElement.setAttribute('height', mapHeight);
    svgElement.style.display = 'block';

    // Generate hexes
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            createHex(svgElement, row, col);
        }
    }
}

// Create a single hex
function createHex(svgElement, row, col) {
    // Calculate center position for the hex
    const width = HEX_SIZE;
    const height = HEX_SIZE;

    // Offset each row to create the hex grid pattern
    const hexHalfLength = HEX_SIZE * Math.cos(Math.PI / 180 * 30);
    const hexOffset = width * (0.5 * (1 - (Math.sqrt(3) / 2)));
    const x = col * hexHalfLength + (row % 2 === 1 ? width * 0.5 + hexOffset : width);
    const y = row * (3/4) * height + height * 0.5;

    // Calculate the points for the hexagon
    const points = calculateHexPoints(x, y, width / 2);

    // Create the SVG polygon element
    const hexElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hexElement.setAttribute('points', points);
    hexElement.setAttribute('data-x', col);
    hexElement.setAttribute('data-y', row);

    // Style the hexagon
    hexElement.style.fill = 'rgba(0,0,0,0)'; // Fill color
    hexElement.style.stroke = 'white'; // Border color
    hexElement.style.strokeWidth = '2'; // Border width

    // Add click event
    hexElement.addEventListener('click', () => showHexDetails(col, row));

    // Add hex to the SVG
    svgElement.appendChild(hexElement);

    // Store hex in our data structure
    if (!hexMap[row]) hexMap[row] = [];
    hexMap[row][col] = {
        element: hexElement,
        x: col,
        y: row,
        isExplored: false,
        controlledBy: null,
        resources: null,
        notes: null
    };
}

// Calculate the six points of a hexagon
function calculateHexPoints(centerX, centerY, size) {
    const points = [];

    for (let i = 0; i < 6; i++) {
        const angleDeg = 60 * i - 30; // Start at 12 o'clock (-30 degrees)
        const angleRad = Math.PI / 180 * angleDeg;
        const x = centerX + size * Math.cos(angleRad);
        const y = centerY + size * Math.sin(angleRad);
        points.push(`${x},${y}`);
    }

    return points.join(' ');
}

// Update map scale for zoom functionality
function updateMapScale() {
    const svgElement = document.getElementById('hex-svg-map');
    svgElement.style.transform = `scale(${currentScale})`;
    svgElement.style.transformOrigin = 'top left';
}

// Show hex details when clicked
function showHexDetails(x, y) {
    console.log(`Hex clicked: x=${x}, y=${y}`);

    // Set as selected hex
    selectedHex = { x, y };

    // Get hex data
    const hex = hexMap[y] && hexMap[y][x] ? hexMap[y][x] : null;
    if (!hex) return;

    // Update visual selection
    clearHexSelection();
    hex.element.style.stroke = 'yellow';
    hex.element.style.strokeWidth = '3';

    // Move the selected hex to be the last element
    const svgElement = document.getElementById('hex-svg-map');
    svgElement.appendChild(hex.element);

    // Show the hex details section
    const hexDetailsElement = document.getElementById('hex-details');
    hexDetailsElement.classList.remove('hidden');

    // Check if user is DM
    const isDM = localStorage.getItem('isDM') === 'true';

    // Update hex info
    const hexInfoElement = document.getElementById('hex-info');
    hexInfoElement.innerHTML = `
        <p><strong>Coordinates:</strong> X:${x}, Y:${y}</p>
        <p><strong>Status:</strong> ${hex.isExplored ? 'Explored' : 'Unexplored'}</p>
        ${hex.controlledBy ? `<p><strong>Controlled By:</strong> ${hex.controlledBy}</p>` : ''}
        ${hex.resources ? `<p><strong>Resources:</strong> ${hex.resources}</p>` : ''}
        ${hex.notes ? `<p><strong>Notes:</strong> ${hex.notes}</p>` : ''}
        <div class="hex-actions">
            <button id="mark-explored">${hex.isExplored ? 'Mark as Unexplored' : 'Mark as Explored'}</button>
            <button id="add-note">Add Note</button>
        </div>
    `;

    // Add event listeners to buttons
    document.getElementById('mark-explored').addEventListener('click', () => {
        markHexAsExplored(x, y, !hex.isExplored);
    });

    document.getElementById('add-note').addEventListener('click', () => {
        const note = prompt('Add a note for this hex:', hex.notes || '');
        if (note !== null) {
            addNoteToHex(x, y, note);
        }
    });
}

// Clear any hex selection highlighting
function clearHexSelection() {
    // Reset all hex styling
    for (let row in hexMap) {
        for (let col in hexMap[row]) {
            const hex = hexMap[row][col];
            hex.element.style.stroke = 'white';
            hex.element.style.strokeWidth = '2';
        }
    }
}

// Mark a hex as explored or unexplored
function markHexAsExplored(x, y, explored = true) {
    console.log(`Marking hex ${x},${y} as ${explored ? 'explored' : 'unexplored'}`);

    // Update our data structure
    if (hexMap[y] && hexMap[y][x]) {
        hexMap[y][x].isExplored = explored;

        // Visual indication
        if (explored) {
            hexMap[y][x].element.style.opacity = '1.0';
        } else {
            hexMap[y][x].element.style.opacity = '0.7';
        }

        // Update hex details display if this is the currently selected hex
        if (selectedHex && selectedHex.x === x && selectedHex.y === y) {
            showHexDetails(x, y);
        }
    }
}

// Add a note to a hex
function addNoteToHex(x, y, note) {
    console.log(`Adding note to hex ${x},${y}:`);
    // logic to handle notes goes here
}