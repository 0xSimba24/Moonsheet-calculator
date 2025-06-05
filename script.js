// script.js
const STANDARD_PROJECTED_FDVS_BILLION_USD = {
    "1B": 1.0, "3B": 3.0, "5B": 5.0, "10B": 10.0, "50B": 50.0,
};
const STANDARD_TIME_POINTS_MONTHS = [0, 3, 6, 12, 15, 18, 24];
const DEFAULT_MONTHLY_CHANGE_PERCENT = 0.0;
let investmentChartInstance = null; 
let fullChartDataSets = []; 

// DOM Elements
const simulateValueChangeCheckbox = document.getElementById('simulateValueChange');
const monthlyChangePercentInput = document.getElementById('monthlyChangePercent');
const calculateBtn = document.getElementById('calculateBtn');
const resultsArea = document.getElementById('resultsArea');
const valueChangeInfoDiv = document.getElementById('valueChangeInfo');
const summarySectionTitleEl = document.getElementById('summarySectionTitle');
const graphFdvSelect = document.getElementById('graphFdvSelect');

// Event Listeners
simulateValueChangeCheckbox.addEventListener('change', function() {
    monthlyChangePercentInput.disabled = !this.checked;
    if (!this.checked) {
        monthlyChangePercentInput.value = ''; 
    } else {
         monthlyChangePercentInput.value = monthlyChangePercentInput.value || ''; 
    }
});

calculateBtn.addEventListener('click', runCalculations);
graphFdvSelect.addEventListener('change', updateChartDisplay);

document.addEventListener('DOMContentLoaded', () => {
    monthlyChangePercentInput.disabled = !simulateValueChangeCheckbox.checked;
    // Set default values for input fields (can also be done directly in HTML value attributes)
    document.getElementById('projectName').value = "Axie Infinity";
    document.getElementById('valueInvested').value = "5000";
    document.getElementById('valuationInvestedAt').value = "20000000";
    document.getElementById('cliffPeriod').value = "0";
    document.getElementById('initialUnlockPercent').value = "50";
    document.getElementById('vestingPeriodRemaining').value = "6";
    document.getElementById('customFDVs').value = "33, 57";
    
    runCalculations(); // Initial calculation on load
});

// Helper Functions
function formatCurrency(value, K_is_1000 = true, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) return "N/A";
    const absValue = Math.abs(value);
    let suffix = "";
    let divisor = 1;

    if (absValue >= 1_000_000_000) {
        suffix = "B"; divisor = 1_000_000_000;
    } else if (absValue >= 1_000_000) {
        suffix = "M"; divisor = 1_000_000;
    } else if (K_is_1000 && absValue >= 1000) {
        suffix = "K"; divisor = 1000;
    }
    
    const num = value / divisor;
    return "$" + num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
}

function getOwnershipPercentage(valueInvested, valuationAtInvestment) {
    if (valuationAtInvestment === 0) return 0.0;
    return valueInvested / valuationAtInvestment;
}

function calculateTotalUnlockedFraction(
    timeSinceLaunchMonths,
    cliffMonths,
    initialUnlockPercentage, 
    vestingPeriodRemainingMonths
) {
    const iupFraction = initialUnlockPercentage / 100.0;
    const fractionToVestLinearly = 1.0 - iupFraction;

    if (timeSinceLaunchMonths < cliffMonths) {
        return 0.0;
    } else {
        let baseUnlockFromInitial = iupFraction;
        let fractionFromLinearVest = 0.0;

        if (fractionToVestLinearly > 0.000001) { 
            const monthsIntoLinearVestingPhase = timeSinceLaunchMonths - cliffMonths;
            
            if (vestingPeriodRemainingMonths === 0) { 
                fractionFromLinearVest = fractionToVestLinearly;
            } else if (monthsIntoLinearVestingPhase > 0) {
                const proportionOfLinearVested = Math.min(1.0, monthsIntoLinearVestingPhase / vestingPeriodRemainingMonths);
                fractionFromLinearVest = fractionToVestLinearly * proportionOfLinearVested;
            }
        }
        const totalUnlockedFraction = baseUnlockFromInitial + fractionFromLinearVest;
        return Math.min(1.0, totalUnlockedFraction);
    }
}

let predefinedColors = [];
const colorPalette = [ 
    'rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 
    'rgb(75, 192, 192)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)',
    'rgb(231, 76, 60)', 'rgb(46, 204, 113)', 'rgb(52, 152, 219)',
    'rgb(142, 68, 173)', 'rgb(241, 196, 15)', 'rgb(26, 188, 156)'
];

function getColor(index) {
    return colorPalette[index % colorPalette.length];
}

// Main Calculation and Display Logic
function runCalculations() {
    // Get Input Values
    const projectName = document.getElementById('projectName').value || "N/A Project";
    const valueInvested = parseFloat(document.getElementById('valueInvested').value) || 0;
    const valuationInvestedAt = parseFloat(document.getElementById('valuationInvestedAt').value) || 0;
    const cliffPeriod = parseInt(document.getElementById('cliffPeriod').value) || 0;
    const initialUnlockPercent = parseFloat(document.getElementById('initialUnlockPercent').value) || 0;
    const vestingPeriodRemaining = parseInt(document.getElementById('vestingPeriodRemaining').value) || 0;
    
    const customFDVsString = document.getElementById('customFDVs').value;
    const customFDVInputsBillions = customFDVsString
        .split(',')
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n) && n > 0);

    const isValueChangeSimulated = simulateValueChangeCheckbox.checked;
    let monthlyChangeRate = 0; 
    
    summarySectionTitleEl.textContent = "Summary & Total Potential Worth (100% Vested at Static FDV)"; 

    if (isValueChangeSimulated) {
        monthlyChangeRate = parseFloat(monthlyChangePercentInput.value);
        if (isNaN(monthlyChangeRate)) { 
            monthlyChangeRate = DEFAULT_MONTHLY_CHANGE_PERCENT;
        }
        
        let changeDescription = "0.00% monthly token value change (static)";
        if (monthlyChangeRate > 0) {
            changeDescription = `an estimated +${monthlyChangeRate.toFixed(2)}% monthly token value appreciation.`;
        } else if (monthlyChangeRate < 0) {
            changeDescription = `an estimated ${monthlyChangeRate.toFixed(2)}% monthly token value depreciation.`;
        }
        valueChangeInfoDiv.textContent = `Projections adjusted for ${changeDescription}`;
        valueChangeInfoDiv.classList.remove('hidden');
        summarySectionTitleEl.textContent = "Summary & Total Potential Worth (Adjusted for Full Vesting Period Value Change)";
    } else {
        valueChangeInfoDiv.classList.add('hidden');
    }

    // Prepare FDV list
    const allProjectedFDVsFullValues = { "Valuation Invested At": valuationInvestedAt };
    for (const [name, valB] of Object.entries(STANDARD_PROJECTED_FDVS_BILLION_USD)) {
        allProjectedFDVsFullValues[name] = valB * 1_000_000_000;
    }
    customFDVInputsBillions.forEach((valB) => {
        allProjectedFDVsFullValues[`$${valB}B (Custom)`] = valB * 1_000_000_000;
    });
    
    const sortedFDVNames = Object.keys(allProjectedFDVsFullValues).sort((a, b) => allProjectedFDVsFullValues[a] - allProjectedFDVsFullValues[b]);
    const ownershipPct = getOwnershipPercentage(valueInvested, valuationInvestedAt);

    // Effective full vesting month
    let effectiveFullVestingMonth = cliffPeriod;
    if (initialUnlockPercent < 100) { 
        effectiveFullVestingMonth += vestingPeriodRemaining;
    }
    
    // --- A. Section 1: Summary & Total Potential Worth ---
    const summaryDetailsDiv = document.getElementById('summaryDetails');
    summaryDetailsDiv.innerHTML = `
        <p><strong>Project Name:</strong> ${projectName}</p>
        <p><strong>Value Invested:</strong> ${formatCurrency(valueInvested, false)}</p>
        <p><strong>Valuation Invested At:</strong> ${formatCurrency(valuationInvestedAt)}</p>
        <p><strong>Your Ownership Pct:</strong> ${(ownershipPct * 100).toFixed(6)}%</p>
        <p><strong>Cliff:</strong> ${cliffPeriod}m | <strong>Initial Unlock @ Cliff:</strong> ${initialUnlockPercent.toFixed(2)}% | <strong>Remaining Vest:</strong> ${vestingPeriodRemaining}m</p>
        <p><strong>Effective Full Vesting At:</strong> Month ${effectiveFullVestingMonth}</p>
        ${customFDVInputsBillions.length > 0 ? `<p><strong>Custom FDVs:</strong> ${customFDVInputsBillions.map(v => formatCurrency(v*1_000_000_000)).join(', ')}</p>` : ''}
    `;

    const totalWorthTable = document.getElementById('totalPotentialWorthTable');
    totalWorthTable.querySelector('thead').innerHTML = `
        <tr><th>Projected FDV (at Full Vesting)</th><th>Your Investment Potential</th><th>Multiplier</th></tr>`;
    const totalWorthTbody = totalWorthTable.querySelector('tbody');
    totalWorthTbody.innerHTML = ''; // Clear previous
    sortedFDVNames.forEach(fdvName => {
        const projectedFDV_at_T0 = allProjectedFDVsFullValues[fdvName]; 
        let totalPotentialWorth = ownershipPct * projectedFDV_at_T0;
        
        if (isValueChangeSimulated && effectiveFullVestingMonth > 0) {
            const priceChangeFactorAtFullVesting = Math.pow(1 + (monthlyChangeRate / 100), effectiveFullVestingMonth);
            totalPotentialWorth *= priceChangeFactorAtFullVesting;
        }

        const multiplier = valueInvested > 0 ? totalPotentialWorth / valueInvested : 0;
        const displayFDVName = fdvName === "Valuation Invested At" ? formatCurrency(projectedFDV_at_T0) : formatCurrency(projectedFDV_at_T0);
        
        const row = totalWorthTbody.insertRow();
        row.insertCell().textContent = displayFDVName;
        row.insertCell().textContent = formatCurrency(totalPotentialWorth, false);
        row.insertCell().textContent = `${multiplier.toFixed(2)}x`;
    });

    // --- B. Section 2: Unlocked Investment Value Over Time ---
    const unlockedValueTable = document.getElementById('unlockedValueTable');
    const unlockedValueThead = unlockedValueTable.querySelector('thead');
    let headerRowHTML = `<tr><th>Time Since Launch</th><th>Unlocked Fraction (%)</th>`;
    sortedFDVNames.forEach(fdvName => {
        const displayFDVName = fdvName === "Valuation Invested At" ? formatCurrency(allProjectedFDVsFullValues[fdvName]) : formatCurrency(allProjectedFDVsFullValues[fdvName]);
        headerRowHTML += `<th>Worth at ${displayFDVName}</th>`;
    });
    headerRowHTML += `</tr>`;
    unlockedValueThead.innerHTML = headerRowHTML;
    
    const unlockedValueTbody = unlockedValueTable.querySelector('tbody');
    unlockedValueTbody.innerHTML = ''; // Clear previous

    // Dynamic time points for table B and graph
    let dynamicTimePoints = new Set([0, cliffPeriod, effectiveFullVestingMonth]);
    STANDARD_TIME_POINTS_MONTHS.forEach(p => {
        if (p <= effectiveFullVestingMonth) {
            dynamicTimePoints.add(p);
        }
    });
    if (effectiveFullVestingMonth === 0) dynamicTimePoints.add(0); // Ensure 0 is present if vesting is immediate
    const finalSortedTimePoints = [...dynamicTimePoints].sort((a,b) => a-b);

    // --- Graph Data Preparation ---
    fullChartDataSets = []; // Clear and repopulate
    predefinedColors = sortedFDVNames.map((_, index) => getColor(index)); 

    sortedFDVNames.forEach((fdvName, index) => {
        fullChartDataSets.push({
            label: `${fdvName === "Valuation Invested At" ? formatCurrency(allProjectedFDVsFullValues[fdvName],true,0) : fdvName.replace(" (Custom)","")}`,
            data: [],
            fill: false,
            borderColor: predefinedColors[index],
            backgroundColor: predefinedColors[index], 
            borderWidth: 2, 
            pointRadius: 3,
            pointHoverRadius: 5,
            tension: 0.1
        });
    });
    
    finalSortedTimePoints.forEach(tSlMonths => {
        const unlockedFraction = calculateTotalUnlockedFraction(
            tSlMonths, cliffPeriod, initialUnlockPercent, vestingPeriodRemaining
        );
        const row = unlockedValueTbody.insertRow();
        row.insertCell().textContent = `Month ${tSlMonths}`;
        row.insertCell().textContent = `${(unlockedFraction * 100).toFixed(2)}%`;

        sortedFDVNames.forEach((fdvName, index) => {
            const projectedFDV_at_T0 = allProjectedFDVsFullValues[fdvName];
            let currentTotalPotentialAtFDV = ownershipPct * projectedFDV_at_T0;
            
            if (isValueChangeSimulated && tSlMonths > 0) { 
                const priceChangeFactor = Math.pow(1 + (monthlyChangeRate / 100), tSlMonths);
                currentTotalPotentialAtFDV *= priceChangeFactor;
            }

            const unlockedValue = unlockedFraction * currentTotalPotentialAtFDV;
            row.insertCell().textContent = formatCurrency(unlockedValue, false);
            fullChartDataSets[index].data.push(unlockedValue); 
        });
    });
    
    // Populate FDV Select Dropdown for Graph
    graphFdvSelect.innerHTML = '<option value="all">All Projected FDVs</option>'; // Default option
    sortedFDVNames.forEach((fdvName, index) => {
        const option = document.createElement('option');
        option.value = index; 
        option.textContent = `${fdvName === "Valuation Invested At" ? formatCurrency(allProjectedFDVsFullValues[fdvName],true,0) : fdvName.replace(" (Custom)","")}`;
        graphFdvSelect.appendChild(option);
    });
    graphFdvSelect.value = "all"; // Set default selection
    updateChartDisplay(); // Initial chart display

    resultsArea.classList.remove('hidden');
}

function updateChartDisplay() {
    const selectedFdvIndex = graphFdvSelect.value;
    let datasetsToShow = [];

    if (selectedFdvIndex === "all") {
        datasetsToShow = fullChartDataSets;
    } else if (fullChartDataSets[selectedFdvIndex]) {
        // Ensure that the selected dataset is an array for Chart.js
        datasetsToShow = [fullChartDataSets[selectedFdvIndex]];
    }


    // Regenerate labels for the chart based on the current vesting period
    let effectiveFullVestingMonthForLabels = parseInt(document.getElementById('cliffPeriod').value) || 0;
    const initialUnlock = parseFloat(document.getElementById('initialUnlockPercent').value) || 0;
    if (initialUnlock < 100) {
         effectiveFullVestingMonthForLabels += parseInt(document.getElementById('vestingPeriodRemaining').value) || 0;
    }

    let dynamicTimePointsForLabels = new Set([0, effectiveFullVestingMonthForLabels]);
     STANDARD_TIME_POINTS_MONTHS.forEach(p => {
        if (p <= effectiveFullVestingMonthForLabels) {
            dynamicTimePointsForLabels.add(p);
        }
    });
    if (effectiveFullVestingMonthForLabels === 0) dynamicTimePointsForLabels.add(0);
    const finalSortedTimePointsForLabels = [...dynamicTimePointsForLabels].sort((a,b)=>a-b);


    if (investmentChartInstance) {
        investmentChartInstance.destroy(); 
    }
    const ctx = document.getElementById('investmentChart').getContext('2d');
    investmentChartInstance = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: finalSortedTimePointsForLabels.map(m => `Month ${m}`), 
            datasets: datasetsToShow 
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false, 
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { 
                        callback: (value) => formatCurrency(value, true, 0),
                        color: '#6b7280' // Tailwind gray-500 for tick color
                    },
                    grid: {
                        color: '#e5e7eb' // Tailwind gray-200 for grid lines
                    }
                },
                x: {
                     ticks: { 
                        color: '#6b7280' 
                    },
                    grid: {
                        display: false // Hide vertical grid lines for cleaner look
                    }
                }
            },
            plugins: {
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14, weight: 'bold'},
                    bodyFont: { size: 12 },
                    padding: 10,
                    cornerRadius: 4,
                    callbacks: {
                        label: (context) => `${context.dataset.label || ''}: ${formatCurrency(context.parsed.y, false)}`
                    }
                },
                legend: { 
                    position: 'bottom', 
                    labels: { 
                        boxWidth: 15, 
                        padding: 20,
                        font: { size: 12},
                        color: '#374151' // Tailwind gray-700
                    } 
                }
            },
            elements: {
                line: {
                    tension: 0.2 // Smoother lines
                }
            }
        }
    });
}
