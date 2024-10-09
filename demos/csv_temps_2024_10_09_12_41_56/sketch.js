// just a demo for loading a file. 
// YOU can and should make much better visualizations. 
let table;
let tempByYear = {};

function preload() {
  // Load the CSV file
  table = loadTable('temperature_kh.csv', 'csv', 'header', () => {
    console.log('CSV loaded successfully');
  }, (err) => {
    console.error('Error loading CSV:', err);
  });
}

function setup() {
  createCanvas(800, 400);
  
  // Check if table has been loaded
  if (!table) {
    console.error('Table could not be loaded.');
    return;
  }
  
  // Process and log the data to see if it's loaded correctly
  processData();
  console.log('Data processed:', tempByYear);
  
  displayData(); // Only call display if data was processed correctly
}

function processData() {
  // Loop through the table and store temperature by year
  for (let i = 0; i < table.getRowCount(); i++) {
    let year = table.getString(i, 'year');
    let temp = table.getString(i, 'temp[c]'); // We fetch as string first to handle missing data
    
    // Check if the data is valid
    if (!year || !temp || isNaN(parseFloat(temp))) {
      console.warn(`Skipping invalid row at index ${i}: year = ${year}, temp = ${temp}`);
      continue; // Skip this iteration if data is invalid
    }
    
    temp = parseFloat(temp); // Convert temperature to a number
    
    if (!tempByYear[year]) {
      tempByYear[year] = [];
    }
    tempByYear[year].push(temp);
  }
}

function displayData() {
  background(255);
  
  let years = Object.keys(tempByYear);
  if (years.length === 0) {
    console.error('No valid data to display.');
    return;
  }
  
  let minYear = Math.min(...years);
  let maxYear = Math.max(...years);
  let maxTemp = 15; // Based on the temperature range you provided
  let minTemp = 5;

  // Add margins for the graph display
  let margin = 50;
  let graphWidth = width - 2 * margin;
  let graphHeight = height - 2 * margin;

  // Draw the y-axis (temperature)
  stroke(0);
  line(margin, margin, margin, height - margin); // Vertical line
  
  // Draw the x-axis (years)
  line(margin, height - margin, width - margin, height - margin); // Horizontal line

  // Add labels to the axes
  fill(0);
  textAlign(CENTER);
  textSize(12);
  
  // Y-axis labels (temperature)
  for (let t = minTemp; t <= maxTemp; t += 1) {
    let y = map(t, minTemp, maxTemp, height - margin, margin);
    text(t + '°C', margin - 30, y);
    line(margin - 5, y, margin, y); // Ticks on the y-axis
  }

  // X-axis labels (years)
  let yearStep = Math.ceil((maxYear - minYear) / 10); // Dynamically calculate step for year labels
  for (let y = minYear; y <= maxYear; y += yearStep) {
    let x = map(y, minYear, maxYear, margin, width - margin);
    text(y, x, height - margin + 20);
    line(x, height - margin, x, height - margin + 5); // Ticks on the x-axis
  }

  // Display each year's average temperature as a bar chart
  let barWidth = (graphWidth / years.length) * 0.8;
  for (let i = 0; i < years.length; i++) {
    let year = years[i];
    let avgTemp = average(tempByYear[year]);
    
    // Map temperature to a height value
    let barHeight = map(avgTemp, minTemp, maxTemp, 0, graphHeight);
    
    // Draw the bar
    let x = map(year, minYear, maxYear, margin, width - margin) - barWidth / 2;
    fill(100, 150, 255);
    rect(x, height - margin - barHeight, barWidth, barHeight);
  }
}

// Helper function to calculate average temperature
function average(arr) {
  let sum = arr.reduce((acc, temp) => acc + temp, 0);
  return sum / arr.length;
}

function draw() {
  // Optional: if you want to redraw regularly
}
