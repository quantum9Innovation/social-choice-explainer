// Spatial Voting Model Visualization
// This implements a 2D spatial voting model where voters support the nearest candidate

const canvas = document.getElementById('spatialCanvas');
const ctx = canvas.getContext('2d');

// State
let candidates = [];
let voters = [];
let showRegions = true;
let draggedCandidate = null;

// Colors for candidates
const candidateColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#C06C84'
];

// Initialize
function init() {
    resetSimulation();
    setupEventListeners();
    draw();
}

// Setup event listeners for dragging
function setupEventListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
}

// Reset the simulation with new candidates
function resetSimulation() {
    const numCandidates = parseInt(document.getElementById('numCandidates').value);
    candidates = [];
    voters = [];
    
    // Spawn candidates at random positions
    for (let i = 0; i < numCandidates; i++) {
        candidates.push({
            x: Math.random() * (canvas.width - 40) + 20,
            y: Math.random() * (canvas.height - 40) + 20,
            color: candidateColors[i % candidateColors.length],
            id: i
        });
    }
    
    updateLegend();
    draw();
}

// Spawn voters based on selected distribution
function spawnVoters() {
    const numVoters = parseInt(document.getElementById('numVoters').value);
    const distribution = document.getElementById('voterDistribution').value;
    
    voters = [];
    
    for (let i = 0; i < numVoters; i++) {
        let x, y;
        
        switch (distribution) {
            case 'uniform':
                x = Math.random() * canvas.width;
                y = Math.random() * canvas.height;
                break;
                
            case 'normal':
                // Box-Muller transform for normal distribution
                x = normalRandom(canvas.width / 2, canvas.width / 4);
                y = normalRandom(canvas.height / 2, canvas.height / 4);
                // Clamp to canvas bounds
                x = Math.max(0, Math.min(canvas.width, x));
                y = Math.max(0, Math.min(canvas.height, y));
                break;
                
            case 'clustered':
                // Random cluster around a random candidate
                const targetCandidate = candidates[Math.floor(Math.random() * candidates.length)];
                x = normalRandom(targetCandidate.x, 80);
                y = normalRandom(targetCandidate.y, 80);
                // Clamp to canvas bounds
                x = Math.max(0, Math.min(canvas.width, x));
                y = Math.max(0, Math.min(canvas.height, y));
                break;
        }
        
        voters.push({ x, y });
    }
    
    draw();
}

// Generate random number with normal distribution
function normalRandom(mean, stdDev) {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
}

// Clear all voters
function clearVoters() {
    voters = [];
    draw();
}

// Toggle region coloring
function toggleRegions() {
    showRegions = !showRegions;
    draw();
}

// Calculate distance between two points
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// Find nearest candidate to a point
function findNearestCandidate(x, y) {
    let minDist = Infinity;
    let nearest = null;
    
    for (let candidate of candidates) {
        const dist = distance(x, y, candidate.x, candidate.y);
        if (dist < minDist) {
            minDist = dist;
            nearest = candidate;
        }
    }
    
    return nearest;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw regions if enabled
    if (showRegions && candidates.length > 0) {
        drawRegions();
    }
    
    // Draw voters
    for (let voter of voters) {
        const nearest = findNearestCandidate(voter.x, voter.y);
        ctx.fillStyle = nearest ? nearest.color : '#888888';
        ctx.beginPath();
        ctx.arc(voter.x, voter.y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw candidates
    for (let candidate of candidates) {
        // Draw shadow/glow
        ctx.shadowColor = candidate.color;
        ctx.shadowBlur = 10;
        
        // Draw candidate circle
        ctx.fillStyle = candidate.color;
        ctx.beginPath();
        ctx.arc(candidate.x, candidate.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(candidate.id + 1, candidate.x, candidate.y);
    }
    
    ctx.shadowBlur = 0;
}

// Draw Voronoi-like regions
function drawRegions() {
    const pixelData = ctx.createImageData(canvas.width, canvas.height);
    const data = pixelData.data;
    
    // Sample every few pixels for performance
    const step = 4;
    
    for (let x = 0; x < canvas.width; x += step) {
        for (let y = 0; y < canvas.height; y += step) {
            const nearest = findNearestCandidate(x, y);
            if (nearest) {
                // Convert hex color to RGB
                const color = hexToRgb(nearest.color);
                
                // Fill a step x step block
                for (let dx = 0; dx < step && x + dx < canvas.width; dx++) {
                    for (let dy = 0; dy < step && y + dy < canvas.height; dy++) {
                        const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                        data[idx] = color.r;
                        data[idx + 1] = color.g;
                        data[idx + 2] = color.b;
                        data[idx + 3] = 50; // Alpha for transparency
                    }
                }
            }
        }
    }
    
    ctx.putImageData(pixelData, 0, 0);
}

// Convert hex color to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Mouse event handlers
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a candidate
    for (let candidate of candidates) {
        if (distance(x, y, candidate.x, candidate.y) <= 15) {
            draggedCandidate = candidate;
            canvas.style.cursor = 'grabbing';
            break;
        }
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggedCandidate) {
        // Update candidate position
        draggedCandidate.x = Math.max(15, Math.min(canvas.width - 15, x));
        draggedCandidate.y = Math.max(15, Math.min(canvas.height - 15, y));
        draw();
    } else {
        // Update cursor based on hover
        let hovering = false;
        for (let candidate of candidates) {
            if (distance(x, y, candidate.x, candidate.y) <= 15) {
                hovering = true;
                break;
            }
        }
        canvas.style.cursor = hovering ? 'grab' : 'default';
    }
}

function handleMouseUp(e) {
    if (draggedCandidate) {
        draggedCandidate = null;
        canvas.style.cursor = 'default';
    }
}

// Update legend
function updateLegend() {
    const legend = document.getElementById('legend');
    legend.innerHTML = '';
    
    for (let i = 0; i < candidates.length; i++) {
        const item = document.createElement('div');
        item.className = 'legend-item';
        
        const color = document.createElement('div');
        color.className = 'legend-color';
        color.style.backgroundColor = candidates[i].color;
        
        const label = document.createElement('span');
        label.textContent = `Candidate ${i + 1}`;
        
        item.appendChild(color);
        item.appendChild(label);
        legend.appendChild(item);
    }
}

// Initialize on page load
init();
