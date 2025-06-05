# Moonsheet-calculator
Crypto Investment Dashboard
🚀 Overview
This Crypto Investment Dashboard is a web-based tool designed to help users project the potential worth of their crypto investments, particularly for projects yet to undergo a Token Generation Event (TGE) or public launch. Users can input various investment details and see how their investment might perform under different future market valuations and vesting schedules. The dashboard also allows for simulating monthly token value changes (appreciation or depreciation) to provide more nuanced projections.

✨ Features
Detailed Investment Input:

Project/Token Name

Value Invested

Valuation Invested At (FDV)

Cliff Period (months)

Initial Unlock Percentage at Cliff End

Vesting Period for Remaining Tokens (months)

Custom Projected Fully Diluted Valuations (FDVs)

Projection Tables:

Summary & Total Potential Worth: Shows your ownership percentage and what your total investment could be worth at various FDVs, assuming 100% vesting. This table can also be adjusted to reflect simulated monthly token value changes up to the full vesting period.

Unlocked Investment Value Over Time: Details how much of your investment value is unlocked at standard time intervals (e.g., TGE, 3M, 6M, 12M, etc.) across different projected FDVs, considering the cliff and vesting schedule. This table also reflects simulated monthly token value changes.

Interactive Line Chart:

Visualizes the "Unlocked Investment Value Over Time" for each projected FDV.

Includes a dropdown to filter the graph to show "All Projected FDVs" or a single, specific FDV scenario.

Token Value Change Simulation:

Option to simulate a compounded monthly percentage change (positive for appreciation, negative for depreciation) in the token's value over the vesting period.

Provides a more dynamic view of potential outcomes.

User-Friendly Interface:

Clean layout with tooltips to explain input fields.

Responsive design for use on different screen sizes.

🛠️ How to Use
Clone or Download the Project:

If you have this project in a Git repository, clone it.

Otherwise, ensure you have the three main files (index.html, style.css, script.js) in the same folder.

Open index.html:

Navigate to the project folder on your computer.

Open the index.html file in any modern web browser (e.g., Chrome, Firefox, Edge, Safari).

Input Your Investment Details:

Fill in the various input fields with the specifics of your investment.

Use the tooltips (ⓘ icon) for guidance on specific fields.

Simulate Value Change (Optional):

Check the "Simulate Monthly Token Value Change?" box.

Enter a positive percentage for monthly appreciation (e.g., 2 for +2%) or a negative percentage for monthly depreciation (e.g., -3 for -3%). If left blank while the box is checked, a 0% change is assumed.

Calculate Projections:

Click the "Calculate Projections" button.

Review Results:

The summary table, detailed vesting table, and graph will appear with your projected investment values.

Use the dropdown above the graph to filter which FDV scenarios are displayed.

📁 File Structure
The project is organized into three main files:

index.html: The main HTML structure of the dashboard.

style.css: Contains custom CSS styles. (Note: Most styling is handled by Tailwind CSS via a CDN link in index.html).

script.js: Contains all the JavaScript logic for calculations, DOM manipulation, and chart generation.

💻 Technologies Used
HTML5

CSS3

Tailwind CSS (via CDN): For utility-first styling and rapid UI development.

Custom CSS (style.css): For specific styles not covered by Tailwind or for overrides.

JavaScript (ES6+): For all the client-side logic, calculations, and interactivity.

Chart.js (via CDN): For rendering the interactive line chart.

Google Fonts (Inter): For typography.

🔮 Potential Future Enhancements
Ability to save and load multiple investment scenarios.

More advanced vesting schedule options (e.g., non-linear vesting).

Export data to CSV.

User accounts and persistent storage (e.g., using Firebase).

Integration with live market data APIs for token prices (where applicable).

This README should provide a good starting point for anyone looking to understand or use your Crypto Investment Dashboard!
