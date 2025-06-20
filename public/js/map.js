
// Hex map related functions
let hexMap = [];
let currentScale = 1;
let selectedHex = null;
const HEX_SIZE = 90; // Size of hexagons in pixels

// Variables for drag functionality
let isDragging = false;
let isCanDrag = false;
let hexClickX, hexClickY;
let startX, startY;
let translateX = 0, translateY = 0;
let mapContainerWidth = 0, mapContainerHeight = 0;
let mapWidth = 0, mapHeight = 0;

// Variables for zoom functionality
let mouseX = 0;
let mouseY = 0;

// Map image
let mapBackgroundImage = null;
const MAP_IMAGE_PATH = '../img/TheStolenLands.jpg';
let mapConfig = {
    mapID: -1, // set to -1 by default, and overwrite when saving for the first time
    name: "my map", // TODO: Give user a way to change name of map
    offsetX: -72,          // Horizontal offset of hexes relative to map
    offsetY: -60,          // Vertical offset of hexes relative to map
    hexScale: 1.0,       // Scale factor for hex grid (leave this as 1 - some weird bug when this is changed.  use the image scales instead.)
    imageScaleVertical: 0.265,     // Scale factor for vertical image dimension
    imageScaleHorizontal: 0.264,      // Scale factor for horizontal image dimension
    imageScale: 0.265,          // Scale if X or Y factor not found, or not in use for older functions
    rows: 13,            // Number of rows in hex grid
    cols: 29             // Number of columns in hex grid
};

// Hex Map Data:
/*
hexMap[row][col] = {
    element,
    mapID,
    name,
    x,
    y,
    isExplored,
    isControlled,
    resources,
    notes,
    isVisible
}
*/

// Initialize the hex map when the page loads
document.addEventListener('DOMContentLoaded', async function () {
    await initializeMap();
});

document.addEventListener('DOMContentLoaded', function() {
    // Set up wheel event for zooming
    document.getElementById('map-container').addEventListener('wheel', handleWheel);
});

// Initialize the hex map
async function initializeMap() {

    console.log('Initializing hex map...');
    const mapContainer = document.getElementById('map-container');
    const hexMapContainer = document.getElementById('hex-map');

    hexMapContainer.classList.remove('hidden');
    hexMapContainer.classList.add('visible');

    // Resize map container
    mapContainer.classList.add('with-details');

    // Check if elements exist
    if (!mapContainer || !hexMapContainer) {
        console.error('Map container or hex map container not found');
        return;
    }

    // start with a blank HTML object for the hex map container area
    hexMapContainer.innerHTML = '';

    // Create SVG element
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgElement.id = "hex-svg-map";
    hexMapContainer.appendChild(svgElement);

    // Add background image first (so it's behind hexes)
    addMapBackground(svgElement);

    // Generate or load the map
    const mapID = localStorage.getItem('mapID');
    console.log('map id: ', mapID);

    if(mapID != null){
        mapConfig.mapID = mapID;
        const map = await apiUtils.maps.getMap({id: mapID});
        await loadMap(svgElement, map);
    } else {
        console.log("mapID is null, generating new map...", mapID)
        await generateMap(svgElement);
    }

    // Set up drag functionality
    await setupDragControls(svgElement);

    // Initialize map position
    translateX = 0;
    translateY = 0;
    updateMapDimensions();

    // Set up the rest of your event listeners here
    document.getElementById('map-container').addEventListener('wheel', handleWheel);

    // Return initialized state
    return {
        hexMap,
        selectedHex,
        currentScale,
        mapContainerWidth,
        mapContainerHeight,
        translateX,
        translateY,
        mapWidth,
        mapHeight,
        mapConfig,
        mapBackgroundImage,
        MAP_IMAGE_PATH,
        isDragging,
        startX,
        startY,
        HEX_SIZE
    };
}

function updateMapDimensions() {
    const svgElement = document.getElementById('hex-svg-map');
    if (svgElement) {
        // Get the actual dimensions from the SVG attributes
        mapWidth = parseFloat(svgElement.getAttribute('width')) || 0;
        mapHeight = parseFloat(svgElement.getAttribute('height')) || 0;
        console.log(`Map dimensions: ${mapWidth}x${mapHeight}`);

        // Center the map initially
        centerMap();
    }
}

function centerMap() {
    const scaledMapWidth = mapWidth * currentScale;
    const scaledMapHeight = mapHeight * currentScale;

    // Calculate centering position
    if (scaledMapWidth < mapContainerWidth) {
        translateX = (mapContainerWidth - scaledMapWidth) / 2;
    } else {
        translateX = 0; // Default to left aligned if larger than container
    }

    if (scaledMapHeight < mapContainerHeight) {
        translateY = (mapContainerHeight - scaledMapHeight) / 2;
    } else {
        translateY = 0; // Default to top aligned if larger than container
    }

    // Apply transform without bounds checking
    const svgElement = document.getElementById('hex-svg-map');
    if (svgElement) {
        svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
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
        const mapWidth = mapConfig.cols * HEX_SIZE * Math.cos(Math.PI / 180 * 30) + 1.5 * HEX_SIZE + mapConfig.offsetX;
        const mapHeight = mapConfig.rows * HEX_SIZE * 0.75 + HEX_SIZE;

        console.log("map width: ", mapWidth);
        console.log("map height: ", mapHeight);

        // Set SVG dimensions
        svgElement.setAttribute('width', Math.max(mapWidth, imageWidth * mapConfig.imageScaleHorizontal));
        svgElement.setAttribute('height', Math.max(mapHeight, imageHeight * mapConfig.imageScaleVertical));

        // Set image dimensions
        mapBackgroundImage.setAttribute('width', imageWidth);
        mapBackgroundImage.setAttribute('height', imageHeight);

        // Position and scale the image
        updateMapImageTransform();

        // Update map dimensions after loading
        updateMapDimensions();
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

async function generateMap(svgElement) {
    // Create a group for the hexes to apply transformations
    const hexGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hexGroup.id = "hex-grid-group";
    svgElement.appendChild(hexGroup);

    // Only apply scale, remove translation
    hexGroup.setAttribute('transform', `scale(${mapConfig.hexScale})`);

    svgElement.appendChild(hexGroup);

    // Generate hexes
    for (let row = 0; row < mapConfig.rows; row++) {
        for (let col = 0; col < mapConfig.cols; col++) {
            await generateHex(hexGroup, row, col);
        }
    }
}

async function loadMap(svgElement, map) {
    // Create a group for the hexes to apply transformations
    const hexGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hexGroup.id = "hex-grid-group";
    svgElement.appendChild(hexGroup);

    // Apply map scale and translation
    hexGroup.setAttribute('transform', `scale(${mapConfig.hexScale})`);
    console.log('map id during LoadMap: ', map.data.map_id);
    const hexData = await apiUtils.hexes.getHexesByMapID({mapID: map.data.map_id});

    // add each hex to the map
    // this is wrong, just leaving for reference for now
    for (let row = 0; row < mapConfig.rows; row++) {
        for (let col = 0; col < mapConfig.cols; col++) {
            const tempHex = hexData.data.rows.find(hexRow =>
                hexRow.y_coord === row && hexRow.x_coord === col
            );
            await generateHex(hexGroup, row, col, tempHex ? tempHex : null);
        }
    }
    updateHexes(hexData.data);
}

async function saveHex() {
    try{
        if(!selectedHex) return;
        selectedHex.name = selectedHex.name || 'zz00';

        console.log('save hex map id:', selectedHex.mapID);
        const response = await apiUtils.hexes.updateHex({
            mapID: selectedHex.mapID,
            x: selectedHex.x,
            y: selectedHex.y,
            name: selectedHex.name,
            isExplored: selectedHex.isExplored,
            isControlled: selectedHex.isExplored,
            isVisible: selectedHex.isVisible
        });

        if(response && response.data && response.data.rows.length > 0 && response.data.rows[0].hex_id) {
            console.log('saved hex successfully');
            // successfully saved hex, therefore change the button in the UI
            const saveHexButton = document.getElementById('save-hex-details');
            saveHexButton.textContent = 'Saved!';
            saveHexButton.classList.add('saved');
        }
    } catch(e){
        console.error('Error saving hex:', e);
        throw e;
    }
}

async function saveMap() {

    // display the saving overlay, to prevent issues while saving
    const overlay = document.getElementById('savingOverlay');
    const text = overlay.querySelector('.overlay-text');
    text.textContent = "Saving...";
    overlay.classList.add('show');

    // Prevent scrolling while overlay is shown
    document.body.style.overflow = 'hidden';

    // Prepare map data to save
    const mapData = {
        config: mapConfig,
        username: localStorage.getItem('username'),
        hexMap: hexMap
    };

    try {
        const mapID = localStorage.getItem('mapID');
        let response;
        if (mapID) { // map exists, update it in storage
            response = await apiUtils.maps.update({
                id: mapID,
                ...mapData
            });
            if(response && response.id){
                localStorage.setItem('mapID', response.id);
            }

            // since map exists, hexes should also exist, but good to check to be certain
            const existingHexData = await apiUtils.hexes.getHexesByMapID({
                mapID: mapID
            });

            console.log('map ID before saving all hexes: ', mapID);
            if (!(existingHexData.data.rows.length > 0)){
                // no hex data exists - shouldn't ever happen
                for(let i = 0; i < mapConfig.rows; i++){
                    for(let j = 0; j < mapConfig.cols; j++){
                        let tempHex = hexMap[i][j];
                        await apiUtils.hexes.updateHex({
                            mapID: mapID,
                            x: tempHex.x,
                            y: tempHex.y,
                            name: tempHex.name,
                            isExplored: tempHex.isExplored,
                            isControlled: tempHex.isControlled,
                            isVisible: tempHex.isVisible
                        });
                    }
                }
            }
        } else {
            // map doesn't exist, create it
            // only for DM since regular players shouldn't save a completely new map
            const isDM = localStorage.getItem('isDM');
            if(isDM){
                response = await apiUtils.maps.create(mapData);
                let mapID;
                // Store the new map ID for future updates
                if (response && response.data.map_id) {
                    mapID = response.data.map_id;
                    localStorage.setItem('mapID', mapID);
                }

                // create the hexes as well, since they must not exist
                for(let i = 0; i < mapConfig.rows; i++){
                    for(let j = 0; j < mapConfig.cols; j++){
                        let tempHex = hexMap[i][j];
                        console.log('hex data being saved: ' + JSON.stringify(tempHex));
                        await apiUtils.hexes.createHex({
                            mapID: mapID,
                            x: tempHex.x,
                            y: tempHex.y,
                            name: tempHex.name,
                            isExplored: tempHex.isExplored,
                            isControlled: tempHex.isControlled,
                            isVisible: tempHex.isVisible,
                            resources: tempHex.resources,
                            notes: tempHex.notes
                        });
                    }
                }
            }
        }
        // remove the saving overlay
        const overlay = document.getElementById('savingOverlay');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        return response;
    } catch (error) {
        console.error('Error saving map:', error);
        throw error;
    }
}

async function setupDragControls(svgElement) {

    // Apply cursor style immediately to indicate draggable area
    svgElement.style.cursor = 'grab';

    // Mouse down event - start dragging
    document.addEventListener('mousedown', (e) => {
        // Always record the start position regardless of target
        startX = e.clientX;
        startY = e.clientY;

        // Check if the click is on a hex
        const gameContainer = document.getElementById('hex-map');
        if (gameContainer.contains(e.target)) {
            isCanDrag = true;
            hexClickX = parseInt(e.target.getAttribute('data-x'));
            hexClickY = parseInt(e.target.getAttribute('data-y'));
        } else {
            isCanDrag = false;
            hexClickX = null;
            hexClickY = null;
        }
    });

    // Small movement threshold to differentiate between click and drag
    document.addEventListener('mousemove', (e) => {

        // save mouse position for global usage
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Only process mousemove if the mouse button is down (isDragging or potential drag)
        if (!isDragging && isCanDrag && e.buttons === 1) {
            // Measure movement distance
            const movedX = Math.abs(startX - startX);
            const movedY = Math.abs(e.clientY - startY);

            // If significant movement detected (works for both hex and non-hex areas)
            if (movedX > 3 || movedY > 3) {
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
        hexClickX = -1;
        hexClickY = -1;
        svgElement.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent text selection during drag
    }

    // Mouse up event - stop dragging
    document.addEventListener('mouseup', (e) => {
        isDragging = false;
        svgElement.style.cursor = 'grab';
    });

    // Mouse leave event - stop dragging if mouse leaves the window
    document.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            svgElement.style.cursor = 'grab';
        }
    });

    // Prevent default drag behavior
    svgElement.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
}

// Create a single hex
async function generateHex(hexGroup, row, col, hexData = null) {
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
    hexElement.style.strokeWidth = '1';
    if(hexData){
        hexElement.style.opacity = hexData.is_visible ? '.6' : '0';
    } else {
        hexElement.style.opacity = '.6';
    }

    // Add click event for hex selection
    hexElement.addEventListener('click', async (e) => {
        if(hexClickX.toString() === e.target.getAttribute('data-x') && hexClickY.toString() === e.target.getAttribute('data-y')){
            isDragging = false;
            await showHexDetails(col, row);
        }
    });

    // Add hex to the hex group
    hexGroup.appendChild(hexElement);

    // Store hex in our data structure
if (!hexMap[row]) hexMap[row] = [];
    hexMap[row][col] = {
        element: hexElement,
        mapID: mapConfig.mapID,
        name: '',
        x: col,
        y: row,
        isExplored: false,
        isControlled: false,
        resources: null,
        notes: null,
        isVisible: true
    };
}

function updateHexes(hexData){
    for(let hex of hexData.rows){
        hexMap[hex.y_coord][hex.x_coord].isVisible = hex.is_visible;
        hexMap[hex.y_coord][hex.x_coord].isExplored = hex.is_explored;
        hexMap[hex.y_coord][hex.x_coord].isControlled = hex.is_controlled;
        hexMap[hex.y_coord][hex.x_coord].resources = hex.resources;
        hexMap[hex.y_coord][hex.x_coord].notes = hex.notes;
        hexMap[hex.y_coord][hex.x_coord].name = hex.name;
    }
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
function updateMapTransform(centerAfterZoom = false, oldScale = null, zoomMouseX = null, zoomMouseY = null, isZoomOut = false) {
    const svgElement = document.getElementById('hex-svg-map');
    if (!svgElement) return;

    // Get map container html object
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Get container dimensions
    mapContainerWidth = mapContainer.clientWidth;
    mapContainerHeight = mapContainer.clientHeight;

    // Calculate boundary --> distance to inset from map container
    const boundaryX = Math.min(100, mapContainerWidth * .05);
    const boundaryY = Math.min(100, mapContainerHeight * .05);

    // Calculate boundaries for positioning the map
    const visibleWidth = mapContainerWidth - boundaryX;
    const visibleHeight = mapContainerHeight - boundaryY;

    // Calculate scaled map dimensions
    const scaledMapWidth = mapWidth * currentScale;
    const scaledMapHeight = mapHeight * currentScale;

    // Handle zoom adjustments if this is a zoom operation
    if (centerAfterZoom && oldScale !== null && zoomMouseX !== null && zoomMouseY !== null) {
        if (isZoomOut) {
            // For zoom out, keep the center of the visible area centered
            const centerX = mapContainerWidth / 2;
            const centerY = mapContainerHeight / 2;

            // Calculate the point in the old scaled coordinate system
            const pointInOldMap = {
                x: (centerX - translateX) / oldScale,
                y: (centerY - translateY) / oldScale
            };

            // Calculate new translation to keep this point at the center
            translateX = centerX - (pointInOldMap.x * currentScale);
            translateY = centerY - (pointInOldMap.y * currentScale);
        } else {
            // For zoom in, zoom towards mouse position
            // Calculate the point in the map coordinate system that the mouse is over
            const pointInMap = {
                x: (zoomMouseX - translateX) / oldScale,
                y: (zoomMouseY - translateY) / oldScale
            };

            // Calculate new translation to keep the mouse over the same map point
            translateX = zoomMouseX - (pointInMap.x * currentScale);
            translateY = zoomMouseY - (pointInMap.y * currentScale);
        }
    }

    // Apply constraints
    if (scaledMapWidth <= mapContainerWidth) {
        // If map is narrower than container, center it horizontally
        translateX = (mapContainerWidth - scaledMapWidth) / 2;
    } else {
        // Calculate how much we need to constrain the dragging
        // Calculating based on visible area
        const excessWidth = scaledMapWidth - visibleWidth;

        // The left bound is negative because moving the map left means negative translate
        const leftBound = -excessWidth;
        const rightBound = boundaryX;

        // Apply constraints
        translateX = Math.max(leftBound, Math.min(rightBound, translateX));
    }

    if (scaledMapHeight <= mapContainerHeight) {
        // If map is shorter than container, center it vertically
        translateY = (mapContainerHeight - scaledMapHeight) / 2;
    } else {
        // Calculate how much we need to constrain the dragging
        const excessHeight = scaledMapHeight - visibleHeight;

        // The top bound is negative because moving the map up means negative translate
        const topBound = -excessHeight;
        const bottomBound = boundaryY;

        // Apply constraints
        translateY = Math.max(topBound, Math.min(bottomBound, translateY));
    }

    // Apply transform
    svgElement.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    svgElement.style.transformOrigin = 'top left';
}

// Show hex details when clicked
async function showHexDetails(x, y) {

    if(isDragging){return;}

    // Get hex data
    const hex = hexMap[y] && hexMap[y][x] ? hexMap[y][x] : null;
    if (!hex) return;

    // Set as selected hex
    selectedHex = hex;

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
    highlightElement.style.stroke = '#eda104';
    highlightElement.style.strokeWidth = '4';
    highlightElement.id = 'hex-highlight';

    // Add highlight to the group
    highlightGroup.appendChild(highlightElement);

    // Show the hex details section
    const hexDetailsElement = document.getElementById('hex-details');
    hexDetailsElement.classList.remove('hidden');
    hexDetailsElement.classList.add('visible');

    // Resize map container
    document.getElementById('map-container').classList.add('with-details');

    // Check if user is DM
    const isDM = localStorage.getItem('isDM') === 'true';

    // gather hex notes
    console.log('hex notes map ID: ', mapConfig.mapID);
    const hexComments = await apiUtils.hexes.getHexNotes({
        x: x,
        y: y,
        mapID: mapConfig.mapID
    });

    // build hex notes section, which will be inserted into the hex details below
    let notesHTML = `<div class="notes-container">`;
    if(hexComments && hexComments.data.rows && hexComments.data.rows.length > 0){
        for (const row of hexComments.data.rows) {
            if(!row.notes) continue;
            for (const note of row.notes) {
                const formattedDate = note.date ? new Date(note.date).toLocaleDateString() : '';
                notesHTML += `
                <div class="note-item">
                    <div class="note-header">
                        <span class="note-player">Player: ${note.player || 'Unknown'}</span>
                        ${formattedDate ? `<span class="note-date">${formattedDate}</span>` : ''}
                    </div>
                    <div class="note-text">${note.text || ''}</div>
                </div>
                `;
            }
        }
    }
    notesHTML += `</div>`;

    // gather the rest of the hex info
    console.log('mapID for GetHexDetails: ', mapConfig.mapID);
    const result = await apiUtils.hexes.getHexDetails({
        x: x,
        y: y,
        mapID: mapConfig.mapID
    });
    const hexDetail = result.data.rows[0];

    document.getElementById('hex-name').textContent = hexDetail.hex_name ? hexDetail.hex_name : "undefined";

    // build the hex details section
    const hexInfoElement = document.getElementById('hex-info');
    hexInfoElement.innerHTML = `
        <p><strong>Coordinates:</strong> ${hexDetail.x_coord}, ${hexDetail.y_coord}</p>
        <p><strong>Status:</strong> ${hexDetail.is_controlled ? 'Controlled' : hexDetail.is_explored ? 'Explored' : 'Unexplored'}</p>
        <p><strong>Resources:</strong> ${hexDetail.resources ? hexDetail.resources : ''}</p>
        <div class=${isDM ? 'hex-actions-admin' : 'hidden'}>
            <button id="change-visibility">${hexDetail.is_visible ? 'Hide This Hex' : 'Show This Hex'}</button>
            <button id="restore-surrounding-hexes">Restore Surrounding Hexes</button>
            <br/>
            <button id="mark-explored">${hexDetail.is_explored ? 'Mark as Unexplored' : 'Mark as Explored'}</button>
            <button id="mark-controlled">${hexDetail.is_controlled ? 'Mark Not Controlled' : 'Mark as Controlled'}</button>
            <br/>
            <button id="change-name">Change Name</button>
        </div>
        <div class="hex-actions">
            <button id="add-note">Add Note</button>
        </div>
        <div class="hex-notes">
            <h1>Notes:</h1>
            ${notesHTML}
        </div>
    `;

    // Add event listeners to buttons
    document.getElementById('mark-explored').addEventListener('click', async () => {
        await markHexAsExplored(x, y, !hex.isExplored);
    });

    document.getElementById('mark-controlled').addEventListener('click', async () => {
        await markHexAsControlled(x, y, !hex.isControlled);
    });

    document.getElementById('add-note').addEventListener('click', async () => {
        const note = prompt('Add a note for this hex:', '');
        if (note !== null) {
            await addNoteToHex(x, y, note);
        }
    });

    document.getElementById('close-hex-details').addEventListener('click', () => {
        closeHexDetails();
    });

    document.getElementById('change-visibility').addEventListener('click', async () => {
        await invertVisibility(x, y);
    });

    document.getElementById('restore-surrounding-hexes').addEventListener('click', async () => {
        await restoreSurroundingHexes(x, y);
    });

    document.getElementById('change-name').addEventListener('click', async () => {
        let newName = prompt('New Name?');
        await apiUtils.hexes.updateHexName({
            x: x,
            y: y,
            mapID: mapConfig.mapID,
            newName: newName
        });
        document.getElementById('hex-name').textContent = newName;
    });
}

function closeHexDetails() {
    const hexDetailsElement = document.getElementById('hex-details');
    hexDetailsElement.classList.remove('visible');
    hexDetailsElement.classList.add('hidden');
    selectedHex = null;

    // Restore map container to full width
    document.getElementById('map-container').classList.remove('with-details');

    // Clear selection
    clearHexSelection();
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

// Mark a hex as explored or unexplored
async function markHexAsExplored(x, y, explored = true) {

    // Update our data structure
    if (hexMap[y] && hexMap[y][x]) {
        hexMap[y][x].isExplored = explored;

        await apiUtils.hexes.updateHexExplored({
            x: x,
            y: y,
            mapID: mapConfig.mapID,
            isExplored: explored
        });

        // Update hex details display if this is the currently selected hex
        if (selectedHex && selectedHex.x === x && selectedHex.y === y) {
            await showHexDetails(x, y);
        }
    }
}

async function markHexAsControlled(x, y, isControlled){
    if (hexMap[y] && hexMap[y][x]) {
        hexMap[y][x].isControlled = isControlled;

        console.log('map ID during hex controlled update: ', mapConfig.mapID);
        await apiUtils.hexes.updateHexControlled({
            x: x,
            y: y,
            mapID: mapConfig.mapID,
            isControlled: isControlled
        });

        // Update hex details display if this is the currently selected hex
        if (selectedHex && selectedHex.x === x && selectedHex.y === y) {
            await showHexDetails(x, y);
        }
    }
}

async function invertVisibility(x, y){
    if(hexMap[y] && hexMap[y][x]) {
        hexMap[y][x].isVisible = !hexMap[y][x].isVisible;
    }
    const hex = hexMap[y][x];
    if(hex.isVisible !== false){
        hex.element.style.display = '';
        hex.element.style.opacity = '1';
        await showHexDetails(x, y);
    } else {
        hex.element.style.display = 'none';
        closeHexDetails();
        selectedHex = null;
    }
    await apiUtils.hexes.updateHexVisibility({
        x: x,
        y: y,
        mapID: mapConfig.mapID,
        isVisible: hexMap[y][x].isVisible
    });
}

async function restoreSurroundingHexes(x, y){

    let skew = y % 2 === 1 ? -1 : 0;

    // hexes above
    await setVisible(x + skew, y - 1);
    await setVisible(x + skew + 1, y - 1);

    // hexes left and right
    await setVisible(x - 1, y);
    await setVisible(x + 1, y);

    // hexes below
    await setVisible(x + skew, y + 1);
    await setVisible(x + skew + 1, y + 1);

    async function setVisible(x, y) {
        if (hexMap[y] && hexMap[y][x]) {
            hexMap[y][x].isVisible = true;
            hexMap[y][x].element.style.display = '';
            hexMap[y][x].element.style.opacity = '1';
            await apiUtils.hexes.updateHexVisibility({
                x: x,
                y: y,
                mapID: mapConfig.mapID,
                isVisible: true
            });
        }
    }
}

// Add a note to a hex
async function addNoteToHex(x, y, note) {
    console.log(`Adding note to hex ${x},${y}: ${note}`);
    const personID = localStorage.getItem('personID');
    const mapID = localStorage.getItem('mapID');
    console.log('added by', personID, 'for map', mapID);

    // Update our data structure
    if (hexMap[y] && hexMap[y][x]) {
        await apiUtils.hexes.addNoteToHex({
            x: x,
            y: y,
            mapID: mapID,
            personID: personID,
            text: note
        })

        // Update hex details display if this is the currently selected hex
        if (selectedHex && selectedHex.x === x && selectedHex.y === y) {
            await showHexDetails(x, y);
        }
    }
}

function handleWheel(e) {
    e.preventDefault();

    // Store the old scale for zoom calculations
    const oldScale = currentScale;

    // Determine zoom direction
    if (e.deltaY < 0) {
        // Zoom in
        if (currentScale < 2.4) {
            currentScale += 0.2;
            updateMapTransform(true, oldScale, mouseX, mouseY);
        }
    } else {
        // Zoom out
        if (currentScale > 0.6) {
            currentScale -= 0.2;
            updateMapTransform(true, oldScale, mouseX, mouseY, true); // Pass true for zoom out
        }
    }
}

window.addEventListener('resize', function() {
    const mapContainer = document.getElementById('map-container');
    mapContainerWidth = mapContainer.clientWidth;
    mapContainerHeight = mapContainer.clientHeight;

    // Re-apply transform with new bounds
    updateMapTransform();
});

window.initializeMap = initializeMap;
window.saveMap = saveMap;

window.mapModule = {
    initializeMap,
    saveMap
};