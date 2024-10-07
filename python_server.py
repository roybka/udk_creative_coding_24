## This file is meant for internal usage, If you are brave and you have python - you can play with it. 
# local directory to save images
SAVE_DIR = '/home/Documents/images' # or something like this. 
# Your OpenAI API key
API_KEY = 'yeah_right'
import os
import requests
from flask import Flask, jsonify, send_file, request
from flask_cors import CORS
import logging
import base64
from openai import OpenAI

client = OpenAI(
    # This is the default and can be omitted
    api_key=API_KEY
)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes
print('a')
# Setup logging to debug issues
logging.basicConfig(level=logging.DEBUG)

if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)


@app.route('/generate-image', methods=['POST'])
def generate_image():
    logging.debug(request.headers)
    # Parse the prompt from the request body
    data = request.json
    prompt = data.get('prompt', 'A serene sunset over a mountain')

    logging.debug(f"Received prompt: {prompt}")

    # OpenAI API endpoint for image generation
    api_url = 'https://api.openai.com/v1/images/generations'

    # Request body for the OpenAI API
    payload = {
        'prompt': prompt,
        'n': 1,
        'size': '256x256'
    }

    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {API_KEY}'
    }

    try:
        # Call OpenAI's API
        logging.debug(f"Sending request to OpenAI API with prompt: {prompt}")
        response = requests.post(api_url, json=payload, headers=headers)
        response_data = response.json()

        if response.status_code != 200:
            logging.error(f"OpenAI API error: {response_data}")
            return jsonify({'error': 'Failed to generate image'}), response.status_code

        if 'data' not in response_data or len(response_data['data']) == 0:
            logging.error('No image data in the response')
            return jsonify({'error': 'Failed to generate image, no data found'}), 500

        # Get the image URL
        image_url = response_data['data'][0]['url']
        logging.debug(f"Image URL: {image_url}")

        # Download the image from the URL
        image_response = requests.get(image_url)

        if image_response.status_code != 200:
            logging.error(f"Failed to download image from OpenAI URL: {image_url}")
            return jsonify({'error': 'Failed to download image'}), image_response.status_code

        # Save the image locally
        image_path = os.path.join(SAVE_DIR, 'generated_image.png')
        with open(image_path, 'wb') as f:
            f.write(image_response.content)

        logging.debug(f"Image saved to {image_path}")

        return jsonify({'message': 'Image generated', 'image_path': image_path})

    except Exception as e:
        logging.error(f"Error during image generation: {str(e)}")
        return jsonify({'error': 'An error occurred'}), 500

def convert_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string

@app.route('/get-image', methods=['POST'])
def get_image():
    logging.debug(f"Received get image")

    image_path = os.path.join(SAVE_DIR, 'generated_image.png')

    if os.path.exists(image_path):
        logging.debug(f"Serving image from {image_path}")
        # return send_file(image_path, mimetype='image/png')
        base64_string = convert_image_to_base64(image_path)
        logging.debug(base64_string[:100])
        return jsonify({"image_base64": base64_string})

    else:
        logging.error('No image found to serve')
        return jsonify({'error': 'No image found'}), 404


@app.route('/chat-completion', methods=['POST'])
def chat_completion():
    user_message = request.json.get('message')

    # Define the prompt or message you want to send to the OpenAI Chat API
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": user_message,
            }
        ],
        model="gpt-3.5-turbo",
    )

    # Extract the assistant's reply from the response
    assistant_message = chat_completion.choices[0].message.content

    # Return the assistant's message in a JSON response
    return jsonify({"reply": assistant_message})


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,debug=True)

