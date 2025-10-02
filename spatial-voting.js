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
    updateResults();
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
    updateResults();
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
        updateResults();
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

// Calculate voter preferences (ranked ballot for each voter)
function calculateVoterPreferences() {
    const preferences = [];
    
    for (let voter of voters) {
        // Calculate distances to all candidates
        const distances = candidates.map((candidate, index) => ({
            candidateId: index,
            distance: distance(voter.x, voter.y, candidate.x, candidate.y)
        }));
        
        // Sort by distance (closest first = highest preference)
        distances.sort((a, b) => a.distance - b.distance);
        
        // Store ranked preference (array of candidate IDs)
        preferences.push(distances.map(d => d.candidateId));
    }
    
    return preferences;
}

// Plurality Voting (First-Past-the-Post)
function calculatePlurality() {
    if (voters.length === 0) return null;
    
    const votes = new Array(candidates.length).fill(0);
    const preferences = calculateVoterPreferences();
    
    // Each voter votes for their top choice
    for (let pref of preferences) {
        votes[pref[0]]++;
    }
    
    // Find winner
    let maxVotes = Math.max(...votes);
    let winnerId = votes.indexOf(maxVotes);
    
    return {
        winnerId,
        votes,
        winner: `Candidate ${winnerId + 1}`,
        voteCount: maxVotes
    };
}

// Instant Runoff Voting (IRV)
function calculateIRV() {
    if (voters.length === 0) return null;
    
    const preferences = calculateVoterPreferences();
    let remainingCandidates = candidates.map((_, i) => i);
    let rounds = [];
    
    while (remainingCandidates.length > 1) {
        // Count first-choice votes for remaining candidates
        const votes = new Array(candidates.length).fill(0);
        
        for (let pref of preferences) {
            // Find first remaining candidate in this voter's preference
            for (let candidateId of pref) {
                if (remainingCandidates.includes(candidateId)) {
                    votes[candidateId]++;
                    break;
                }
            }
        }
        
        // Check if any candidate has majority
        const majority = voters.length / 2;
        let maxVotes = 0;
        let winnerId = -1;
        
        for (let id of remainingCandidates) {
            if (votes[id] > maxVotes) {
                maxVotes = votes[id];
                winnerId = id;
            }
        }
        
        rounds.push({ votes: [...votes], remaining: [...remainingCandidates] });
        
        if (maxVotes > majority) {
            return {
                winnerId,
                winner: `Candidate ${winnerId + 1}`,
                rounds,
                voteCount: maxVotes
            };
        }
        
        // Eliminate candidate with fewest votes
        let minVotes = Infinity;
        let eliminateId = -1;
        
        for (let id of remainingCandidates) {
            if (votes[id] < minVotes) {
                minVotes = votes[id];
                eliminateId = id;
            }
        }
        
        remainingCandidates = remainingCandidates.filter(id => id !== eliminateId);
    }
    
    return {
        winnerId: remainingCandidates[0],
        winner: `Candidate ${remainingCandidates[0] + 1}`,
        rounds
    };
}

// Borda Count
function calculateBorda() {
    if (voters.length === 0) return null;
    
    const preferences = calculateVoterPreferences();
    const scores = new Array(candidates.length).fill(0);
    const n = candidates.length;
    
    // Each voter gives points: n-1 for 1st choice, n-2 for 2nd, ..., 0 for last
    for (let pref of preferences) {
        for (let rank = 0; rank < pref.length; rank++) {
            scores[pref[rank]] += (n - 1 - rank);
        }
    }
    
    // Find winner
    let maxScore = Math.max(...scores);
    let winnerId = scores.indexOf(maxScore);
    
    return {
        winnerId,
        scores,
        winner: `Candidate ${winnerId + 1}`,
        score: maxScore
    };
}

// Condorcet Winner
function calculateCondorcet() {
    if (voters.length === 0) return null;
    
    const preferences = calculateVoterPreferences();
    const n = candidates.length;
    
    // Build pairwise comparison matrix
    // matrix[i][j] = number of voters who prefer candidate i over candidate j
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    
    for (let pref of preferences) {
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const candidateI = pref[i];
                const candidateJ = pref[j];
                matrix[candidateI][candidateJ]++;
            }
        }
    }
    
    // Find Condorcet winner (beats all others in pairwise comparisons)
    for (let i = 0; i < n; i++) {
        let isCondorcetWinner = true;
        
        for (let j = 0; j < n; j++) {
            if (i !== j && matrix[i][j] <= matrix[j][i]) {
                isCondorcetWinner = false;
                break;
            }
        }
        
        if (isCondorcetWinner) {
            return {
                winnerId: i,
                winner: `Candidate ${i + 1}`,
                exists: true
            };
        }
    }
    
    return {
        exists: false
    };
}

// Update election results display
function updateResults() {
    if (voters.length === 0) {
        document.getElementById('pluralityResult').innerHTML = '<span class="no-voters">Initialize voters to see results</span>';
        document.getElementById('irvResult').innerHTML = '<span class="no-voters">Initialize voters to see results</span>';
        document.getElementById('bordaResult').innerHTML = '<span class="no-voters">Initialize voters to see results</span>';
        document.getElementById('condorcetResult').innerHTML = '<span class="no-voters">Initialize voters to see results</span>';
        return;
    }
    
    // Plurality
    const plurality = calculatePlurality();
    if (plurality) {
        const votesText = plurality.votes.map((v, i) => 
            `Candidate ${i + 1}: ${v} votes`
        ).join(' | ');
        document.getElementById('pluralityResult').innerHTML = 
            `<span class="winner">Winner: ${plurality.winner}</span> (${plurality.voteCount} votes)<br>${votesText}`;
    }
    
    // IRV
    const irv = calculateIRV();
    if (irv) {
        let irvText = `<span class="winner">Winner: ${irv.winner}</span>`;
        if (irv.rounds) {
            irvText += `<br>Rounds: ${irv.rounds.length}`;
        }
        document.getElementById('irvResult').innerHTML = irvText;
    }
    
    // Borda Count
    const borda = calculateBorda();
    if (borda) {
        const scoresText = borda.scores.map((s, i) => 
            `Candidate ${i + 1}: ${s} points`
        ).join(' | ');
        document.getElementById('bordaResult').innerHTML = 
            `<span class="winner">Winner: ${borda.winner}</span> (${borda.score} points)<br>${scoresText}`;
    }
    
    // Condorcet
    const condorcet = calculateCondorcet();
    if (condorcet.exists) {
        document.getElementById('condorcetResult').innerHTML = 
            `<span class="winner">Condorcet Winner: ${condorcet.winner}</span>`;
    } else {
        document.getElementById('condorcetResult').innerHTML = 
            '<span class="condorcet-none">No Condorcet winner exists</span><br>(No candidate beats all others in head-to-head matchups)';
    }
}

// Initialize on page load
init();
