let weatherData;
let loading = true;
let error = null;

function setup() {
    const canvas = createCanvas(800, 600);
    // canvas.parent('sketch-container');
    
    // Fetch data from NASA API
    fetchNASAData();
}

async function fetchNASAData() {
    try {
        const response = await fetch(
            'https://api.nasa.gov/insight_weather/?api_key=jGQ2kbPW7GKMhBslWrKXgXqeprdz2HoOvfBvuwta&feedtype=json&ver=1.0'
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        weatherData = await response.json();
        console.log('Weather Data:', weatherData); // Debug log
        loading = false;
    } catch (e) {
        console.error('Error fetching data:', e);
        error = e.message;
        loading = false;
    }
}

function draw() {
    background(26);
    
    if (loading) {
        drawLoading();
        return;
    }
    
    if (error) {
        drawError();
        return;
    }
    
    // Debug information
    if (weatherData) {
        drawWeatherData();
        // Also draw raw data for debugging
        drawRawData();
    } else {
        drawNoData();
    }
}

function drawLoading() {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Loading Mars weather data...', width/2, height/2);
}

function drawError() {
    fill(255, 0, 0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('Error loading data: ' + error, width/2, height/2);
}

function drawNoData() {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(24);
    text('No weather data available', width/2, height/2);
}

function drawRawData() {
    // Draw raw data in top-left corner for debugging
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(12);
    text('Raw Data (for debugging):', 10, 10);
    let yPos = 30;
    
    if (weatherData.sol_keys) {
        text('Available Sols: ' + weatherData.sol_keys.join(', '), 10, yPos);
        yPos += 20;
        
        // Show first sol's data as example
        const firstSol = weatherData.sol_keys[0];
        if (firstSol && weatherData[firstSol]) {
            text('First Sol Data Structure:', 10, yPos);
            yPos += 20;
            text(JSON.stringify(weatherData[firstSol], null, 2), 10, yPos);
        }
    }
}

function drawWeatherData() {
    if (!weatherData.sol_keys || weatherData.sol_keys.length === 0) {
        drawNoData();
        return;
    }

    const sols = weatherData.sol_keys;
    const margin = 50;
    const graphWidth = width - 2 * margin;
    const graphHeight = height - 2 * margin;
    
    // Find temperature range
    let minTemp = Infinity;
    let maxTemp = -Infinity;
    let validDataPoints = false;
    
    sols.forEach(sol => {
        const solData = weatherData[sol];
        if (solData && solData.AT) {
            minTemp = min(minTemp, solData.AT.mn);
            maxTemp = max(maxTemp, solData.AT.mx);
            validDataPoints = true;
        }
    });
    
    if (!validDataPoints) {
        text('No valid temperature data found', width/2, height/2);
        return;
    }
    
    // Add padding to temperature range
    const tempRange = maxTemp - minTemp;
    minTemp -= tempRange * 0.1;
    maxTemp += tempRange * 0.1;
    
    // Draw axes
    stroke(255);
    strokeWeight(1);
    line(margin, height - margin, width - margin, height - margin); // X axis
    line(margin, margin, margin, height - margin); // Y axis
    
    // Draw temperature data
    strokeWeight(2);
    stroke(255, 100, 100);
    noFill();
    
    // Draw average temperature line
    beginShape();
    sols.forEach((sol, i) => {
        const solData = weatherData[sol];
        if (solData && solData.AT) {
            const x = map(i, 0, sols.length - 1, margin, width - margin);
            const y = map(solData.AT.av, minTemp, maxTemp, height - margin, margin);
            vertex(x, y);
            
            // Draw point for average temperature
            fill(255, 100, 100);
            circle(x, y, 5);
            noFill();
            
            // Draw temperature range bar
            stroke(255, 100, 100, 100);
            const topY = map(solData.AT.mx, minTemp, maxTemp, height - margin, margin);
            const bottomY = map(solData.AT.mn, minTemp, maxTemp, height - margin, margin);
            line(x, topY, x, bottomY);
        }
    });
    endShape();
    
    // Draw labels
    fill(255);
    noStroke();
    textAlign(RIGHT, CENTER);
    textSize(12);
    
    // Y-axis labels (temperature)
    for (let temp = floor(minTemp); temp <= ceil(maxTemp); temp += 5) {
        const y = map(temp, minTemp, maxTemp, height - margin, margin);
        text(temp.toFixed(1) + '°C', margin - 5, y);
    }
    
    // X-axis labels (sols)
    textAlign(CENTER, TOP);
    sols.forEach((sol, i) => {
        const x = map(i, 0, sols.length - 1, margin, width - margin);
        text('Sol ' + sol, x, height - margin + 5);
    });
    
    // Title
    textAlign(CENTER, TOP);
    textSize(16);
    text('Mars Temperature Over Time', width/2, 20);
    fill(255);
    textSize(12);
    text('Average Temperature with Min/Max Range', width/2, 40);
}