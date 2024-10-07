// P5js client showing getting images and text from OPENAI API
// Using a local server to serve everything. 
// Note: this will not work if there's no python server running
// Note2: this only runs when you open the sketch locally (download it and run)
let address='192.168.0.0'


let generatedImage;
let answer;

let prompt='Oil painting of capitol raid, vivid, styled like civil war era.'

function setup() {
  createCanvas(1200, 800);
  
  // generateImageFromServer(prompt);
  getChatResponse('who is against who?',function(response){
    answer=response;});
  
}

function draw() {
  background(240,200,200); // background color (rgb)
  fill(200,200,200); // lower half color 
  rect(0,height/2,width,height/2);
  strokeWeight(5);
  stroke('blue');
  line(0,height/2,width,height/2);
  if (generatedImage) {
    image(generatedImage, width/2, 50, (width/2)-100,(height/2)-100); 
    // image(generatedImage, 0, 0, width, height);
  } else {
    textAlign(LEFT, TOP);
    textSize(24);
    fill(0);
    strokeWeight(2);
    text("Generating Image...", 100, height / 8);
  }

  if (answer){
    text(answer, 100,height/2+100, width-200,(height/2)-200);
  }
}
function getChatResponse(userMessage,callback) {
  let chatUrl = 'http://'+address+':5000/chat-completion';

  fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userMessage })  // Send the user's message
  })
  .then(response => response.json())
  .then(data => {
    // Display the assistant's reply
    console.log("Assistant's Reply:", data.reply);
    callback (data.reply);

    // You can now use the data.reply for further actions in your p5.js sketch
  })
  .catch(error => {
    console.error('Error fetching chat completion:', error);
  });
}

function generateImageFromServer(prompt) {
  let apiUrl = 'http://'+address+':5000/generate-image';
  
  // First, fetch the image path
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({prompt: prompt})
  })
  .then(response => response.json())
  .then(data => {
    if (data.image_path) {
      console.log("Image Path:", data.image_path);
      
      // Now fetch the base64 image from the /get-image endpoint
      fetch('http://'+address+':5000/get-image', {
        method: 'POST'
      })
      .then(response => response.json())
      .then(data => {
        if (data.image_base64) {
          // Convert the base64 string into a data URL
          let imageUrl = 'data:image/png;base64,' + data.image_base64;
          console.log("works");
          // Load the base64 string as an image in p5.js
          loadImage(imageUrl, img => {
            generatedImage = img;  // Store the loaded image
          });
        }
      })
      .catch(error => {
        console.error('Error fetching image:', error);
      });
    }
  })
  .catch(error => {
    console.error('Error generating image:', error);
  });
}
