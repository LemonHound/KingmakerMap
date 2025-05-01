// Hex map related functions
let hexMap = [];
let currentScale = 1;
let selectedHex = null;
const HEX_SIZE = 90; // Size of hexagons in pixels

// Variables for drag functionality
let isDragging = false;
let startX, startY;
let translateX = 0, translateY = 0;

// Map image
let mapBackgroundImage = null;
const MAP_IMAGE_PATH = '../img/TheStolenLands.jpg';
let mapConfig = {
    offsetX: -72,          // Horizontal offset of hexes relative to map
    offsetY: -60,          // Vertical offset of hexes relative to map
    hexScale: 1.0,       // Scale factor for hex grid (independent of zoom)
    imageScaleVertical: 0.265,     // Scale factor for vertical image dimension
    imageScaleHorizontal: 0.264,      // Scale factor for horizontal image dimension
    imageScale: 0.265,          // Scale if X or Y factor not found, or not in use for older functions
    rows: 20,            // Number of rows in hex grid
    cols: 40             // Number of columns in hex grid
};

// Initialize the hex map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
});

// Initialize the hex map
function initializeMap() {
    console.log('Initializing hex map');
    const mapContainer = document.getElementById('hex-map');
    mapContainer.innerHTML = '';

    // Create SVG element
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.id = "hex-svg-map";
    mapContainer.appendChild(svgElement);

    // Add background image first (so it's behind hexes)
    addMapBackground(svgElement);

    // Generate the hex grid
    GenerateMap(svgElement);

    // Set up zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        currentScale += 0.1;
        updateMapTransform();
    });
    document.getElementById('zoom-out').addEventListener('click', () => {
        if (currentScale > 0.5) {
            currentScale -= 0.1;
            updateMapTransform();
        }
    });

    // Set up drag functionality
    setupDragControls(svgElement);
}

function addMapBackground(svgElement) {
    // Create a group for the image to apply transformations
    const imageGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    imageGroup.id = "map-image-group";

    // Create image element
    mapBackgroundImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
    mapBackgroundImage.setAttribute('href', MAP_IMAGE_PATH);
    mapBackgroundImage.setAttribute('x', '0');
    mapBackgroundImage.setAttribute('y', '0');
    mapBackgroundImage.id = "map-background";

    // Add image to group
    imageGroup.appendChild(mapBackgroundImage);

    // Add group to SVG
    svgElement.appendChild(imageGroup);

    // Load the image to get its dimensions
    const img = new Image();
    img.onload = function() {
        const imageWidth = this.width;
        const imageHeight = this.height;

        // Calculate map dimensions based on hex grid size
        const mapWidth = mapConfig.cols * HEX_SIZE * 1.5;
        const mapHeight = mapConfig.rows * HEX_SIZE * 0.75 + HEX_SIZE;

        // Set SVG dimensions
        svgElement.setAttribute('width', Math.max(mapWidth, imageWidth * mapConfig.imageScaleHorizontal));
        svgElement.setAttribute('height', Math.max(mapHeight, imageHeight * mapConfig.imageScaleVertical));

        // Set image dimensions
        mapBackgroundImage.setAttribute('width', imageWidth);
        mapBackgroundImage.setAttribute('height', imageHeight);

        // Position and scale the image
        updateMapImageTransform();
    };
    img.src = MAP_IMAGE_PATH;
}

function updateMapImageTransform() {
    if (mapBackgroundImage) {
        // Apply offsets in reverse direction
        const offsetX = -mapConfig.offsetX;
        const offsetY = -mapConfig.offsetY;

        // Use separate x and y scale factors
        // Add these to mapConfig
        const scaleX = mapConfig.imageScaleHorizontal || mapConfig.imageScale;
        const scaleY = mapConfig.imageScaleVertical || mapConfig.imageScale;

        // Apply transform with separate x/y scaling
        const imageGroup = document.getElementById('map-image-group');
        imageGroup.setAttribute('transform',
            `translate(${offsetX}, ${offsetY}) scale(${scaleX}, ${scaleY})`);
    }
}

function GenerateMap(svgElement) {
    // Create a group for the hexes to apply transformations
    const hexGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hexGroup.id = "hex-grid-group";

    // Only apply scale, remove translation
    hexGroup.setAttribute('transform', `scale(${mapConfig.hexScale})`);

    svgElement.appendChild(hexGroup);

    // Generate hexes
    for (let row = 0; row < mapConfig.rows; row++) {
        for (let col = 0; col < mapConfig.cols; col++) {
            createHex(hexGroup, row, col);
        }
    }
}

function setupDragControls(svgElement) {
    let isHexClick = false;

    // Apply cursor style immediately to indicate draggable area
    svgElement.style.cursor = 'grab';

    // Mouse down event - start dragging
    svgElement.addEventListener('mousedown', (e) => {
        // Always record the start position regardless of target
        startX = e.clientX;
        startY = e.clientY;

        // Check if the click is on a hex
        if (e.target.tagName.toLowerCase() === 'polygon') {
            // Mark this as a potential hex click
            isHexClick = true;
            // We don't prevent default here so the event can be used for drag if needed
        } else {
            // If not clicking on a hex, start dragging immediately
            isHexClick = false;
            startDrag(e);
        }
    });

    // Small movement threshold to differentiate between click and drag
    document.addEventListener('mousemove', (e) => {
        // Only process mousemove if the mouse button is down (isDragging or potential drag)
        if (!isDragging && e.buttons === 1) {
            // Measure movement distance
            const movedX = Math.abs(e.clientX - startX);
            const movedY = Math.abs(e.clientY - startY);

            // If significant movement detected (works for both hex and non-hex areas)
            if (movedX > 3 || movedY > 3) {
                if (isHexClick) {
                    // If it started on a hex but moved enough, it's a drag not a click
                    isHexClick = false;
                }
                // Start dragging
                startDrag(e);
            }
        }
        else if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Update the translation values
            translateX += dx;
            translateY += dy;

            // Update the transform
            updateMapTransform();

            // Reset the start position
            startX = e.clientX;
            startY = e.clientY;

            // Prevent default behavior
            e.preventDefault();
        }
    });

    // Helper function to start dragging
    function startDrag(e) {
        isDragging = true;
        svgElement.style.cursor = 'grabbing';
        svgElement.classList.add('grabbing');
        e.preventDefault(); // Prevent text selection during drag
    }

    // Mouse up event - stop dragging
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            svgElement.style.cursor = 'grab';
            svgElement.classList.remove('grabbing');
        }
        isHexClick = false;
    });

    // Mouse leave event - stop dragging if mouse leaves the window
    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            svgElement.style.cursor = 'grab';
            svgElement.classList.remove('grabbing');
        }
        isHexClick = false;
    });

    // Prevent default drag behavior
    svgElement.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
}

// Create a single hex
function createHex(hexGroup, row, col) {
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
    hexElement.style.fill = 'rgba(0,0,0,0)';
    hexElement.style.stroke = 'white';
    hexElement.style.strokeWidth = '2';

    // Add click event for hex selection
    hexElement.addEventListener('click', (e) => {
        if (!isDragging) {
            showHexDetails(col, row);
        }
    });

    // Add hex to the hex group
    hexGroup.appendChild(hexElement);

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

// Update map transform (scale and position)
function updateMapTransform() {
    const svgElement = document.getElementById('hex-svg-map');
    if (svgElement) {
        svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
        svgElement.style.transformOrigin = 'top left';
    }
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

    // Create a highlight overlay that sits on top of the existing hex
    const hexPoints = hex.element.getAttribute('points');
    const svgElement = document.getElementById('hex-svg-map');
    const highlightGroup = document.getElementById('hex-highlight-group') || createHighlightGroup(svgElement);

    // Clear any existing highlights
    highlightGroup.innerHTML = '';

    // Create the highlight element
    const highlightElement = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    highlightElement.setAttribute('points', hexPoints);
    highlightElement.setAttribute('data-x', x);
    highlightElement.setAttribute('data-y', y);
    highlightElement.style.fill = 'rgba(0,0,0,0)';
    highlightElement.style.stroke = 'yellow';
    highlightElement.style.strokeWidth = '3';
    highlightElement.id = 'hex-highlight';

    // Add highlight to the group
    highlightGroup.appendChild(highlightElement);

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

function createHighlightGroup(svgElement) {
    const highlightGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    highlightGroup.id = "hex-highlight-group";
    svgElement.appendChild(highlightGroup); // This will be the last element, always on top
    return highlightGroup;
}

// Clear any hex selection highlighting
function clearHexSelection() {
    const highlightGroup = document.getElementById('hex-highlight-group');
    if (highlightGroup) {
        highlightGroup.innerHTML = '';
    }
}

function updateHexHighlight(x, y, highlight = true) {
    if (hexMap[y] && hexMap[y][x]) {
        if (highlight) {
            hexMap[y][x].element.style.stroke = 'yellow';
            hexMap[y][x].element.style.strokeWidth = '3';
        } else {
            hexMap[y][x].element.style.stroke = 'white';
            hexMap[y][x].element.style.strokeWidth = '2';
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
            hexMap[y][x].element.style.opacity = '1.0'; // do something to visually indicate it was explored
        } else {
            hexMap[y][x].element.style.opacity = '0.7'; // do something to visually indicate it is unexplored
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

    // Update our data structure
    if (hexMap[y] && hexMap[y][x]) {
        hexMap[y][x].notes = note;

        // Update hex details display if this is the currently selected hex
        if (selectedHex && selectedHex.x === x && selectedHex.y === y) {
            showHexDetails(x, y);
        }
    }
}