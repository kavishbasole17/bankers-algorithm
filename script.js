document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DEFINE INITIAL STATE ---
    // This is the same data from your Java example
    let numProcesses = 5;
    let numResources = 3;

    let available = [3, 3, 2];
    let max = [
        [7, 5, 3], // P0
        [3, 2, 2], // P1
        [9, 0, 2], // P2
        [2, 2, 2], // P3
        [4, 3, 3]  // P4
    ];
    let allocation = [
        [0, 1, 0], // P0
        [2, 0, 0], // P1
        [3, 0, 2], // P2
        [2, 1, 1], // P3
        [0, 0, 2]  // P4
    ];
    let need = Array(numProcesses).fill(0).map(() => Array(numResources).fill(0));

    // --- 2. GET DOM ELEMENTS ---
    const availableContainer = document.getElementById('available-container');
    const allocTable = document.getElementById('allocation-table').getElementsByTagName('tbody')[0];
    const maxTable = document.getElementById('max-table').getElementsByTagName('tbody')[0];
    const needTable = document.getElementById('need-table').getElementsByTagName('tbody')[0];
    const logContainer = document.getElementById('simulation-log');
    const form = document.getElementById('request-form');
    const processSelect = document.getElementById('process-select');

    // --- 3. CORE LOGIC FUNCTIONS ---

    /**
     * Calculates the 'need' matrix (Need = Max - Allocation)
     */
    function calculateNeed() {
        for (let i = 0; i < numProcesses; i++) {
            for (let j = 0; j < numResources; j++) {
                need[i][j] = max[i][j] - allocation[i][j];
            }
        }
    }

    /**
     * Checks if the current system state is safe.
     * @returns {Array|null} A safe sequence if one exists, otherwise null.
     */
    function getSafeSequence() {
        let work = [...available];
        let finish = Array(numProcesses).fill(false);
        let safeSequence = [];
        let count = 0;

        while (count < numProcesses) {
            let found = false;
            for (let i = 0; i < numProcesses; i++) {
                if (!finish[i]) {
                    // Check if need[i] <= work
                    let canAllocate = true;
                    for (let j = 0; j < numResources; j++) {
                        if (need[i][j] > work[j]) {
                            canAllocate = false;
                            break;
                        }
                    }

                    if (canAllocate) {
                        // "Release" resources
                        for (let j = 0; j < numResources; j++) {
                            work[j] += allocation[i][j];
                        }
                        finish[i] = true;
                        safeSequence.push(i);
                        found = true;
                        count++;
                    }
                }
            }

            if (!found) {
                // No process could be allocated. State is unsafe.
                return null;
            }
        }
        // If we got here, all processes finished. State is safe.
        return safeSequence;
    }

    /**
     * Handles a resource request from a process.
     */
    function handleRequest(e) {
        e.preventDefault(); // Stop form from reloading page

        // Get values from form
        const processNum = parseInt(processSelect.value);
        const request = [
            parseInt(document.getElementById('req-a').value) || 0,
            parseInt(document.getElementById('req-b').value) || 0,
            parseInt(document.getElementById('req-c').value) || 0,
        ];

        log(`--- New Request from P${processNum} for [${request.join(', ')}] ---`, 'info');

        // 1. Check if request > need
        for (let j = 0; j < numResources; j++) {
            if (request[j] > need[processNum][j]) {
                log(`Request DENIED. P${processNum} exceeded its max claim.`, 'error');
                return;
            }
        }

        // 2. Check if request > available
        for (let j = 0; j < numResources; j++) {
            if (request[j] > available[j]) {
                log(`Request DENIED. P${processNum} must wait. Not enough resources.`, 'warn');
                return;
            }
        }

        // 3. "Pretend" to allocate
        for (let j = 0; j < numResources; j++) {
            available[j] -= request[j];
            allocation[processNum][j] += request[j];
            need[processNum][j] -= request[j];
        }

        // 4. Check if the new state is safe
        const safeSeq = getSafeSequence();

        if (safeSeq) {
            // If safe, grant the request and update UI
            log(`Request GRANTED. New state is safe.`, 'success');
            log(`Safe Sequence: ${safeSeq.map(p => `P${p}`).join(' -> ')}`, 'success');
            renderAll(); // Re-draw everything with new data
        } else {
            // If unsafe, "roll back" the allocation
            log(`Request DENIED. Granting would lead to an unsafe state. Rolling back.`, 'error');
            for (let j = 0; j < numResources; j++) {
                available[j] += request[j];
                allocation[processNum][j] -= request[j];
                need[processNum][j] += request[j];
            }
            // Note: We don't call renderAll() because the state is unchanged.
        }
    }

    // --- 4. UI RENDERING FUNCTIONS ---

    /**
     * Adds a new message to the simulation log.
     */
    function log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        entry.textContent = message;
        logContainer.appendChild(entry);
        // Scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * Renders the 'Available' resource pills.
     */
    function renderAvailable() {
        availableContainer.innerHTML = ''; // Clear old data
        const labels = ['A', 'B', 'C'];
        available.forEach((val, i) => {
            const el = document.createElement('div');
            el.className = 'resource';
            el.innerHTML = `<span>${labels[i]}</span>${val}`;
            availableContainer.appendChild(el);
        });
    }

    /**
     * Helper to render a single data table (Alloc, Max, Need).
     */
    function renderTable(tableBody, data) {
        tableBody.innerHTML = ''; // Clear old data
        data.forEach((row, i) => {
            const tr = document.createElement('tr');
            let rowHtml = `<td><strong>P${i}</strong></td>`;
            row.forEach(cell => {
                rowHtml += `<td>${cell}</td>`;
            });
            tr.innerHTML = rowHtml;
            tableBody.appendChild(tr);
        });
    }

    /**
     * Renders all tables and the available resources.
     */
    function renderAll() {
        renderTable(allocTable, allocation);
        renderTable(maxTable, max);
        renderTable(needTable, need);
        renderAvailable();
    }

    // --- 5. INITIALIZE THE SIMULATOR ---
    function init() {
        calculateNeed();
        renderAll();
        form.addEventListener('submit', handleRequest);
        
        log('System initialized. Checking initial state...', 'info');
        const seq = getSafeSequence();
        if (seq) {
            log(`Initial state is SAFE.`, 'success');
            log(`Safe Sequence: ${seq.map(p => `P${p}`).join(' -> ')}`, 'success');
        } else {
            log('Initial state is UNSAFE.', 'error');
        }
    }

    init(); // Run the simulator
});