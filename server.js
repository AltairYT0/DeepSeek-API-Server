const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from a .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Port to run the server on
const DEEPSEEK_API_URL = 'https://chat.deepseek.com/api/v0/chat'; // Base URL for the DeepSeek API
const DEEPSEEK_MODEL_CLASS = 'deepseek_code'; // Default model class to use for requests
const VALID_MODELS = ['deepseek_code', 'deepseek_chat']; // List of valid model classes

app.use(express.json()); // Middleware to parse JSON request bodies

/**
 * Clears the chat context by making a POST request to the DeepSeek API's clear_context endpoint.
 * This ensures that each interaction starts with a clean context.
 */
async function clearChatContext() {
    try {
        // Payload to clear chat context
        const clearPayload = {
            model_class: DEEPSEEK_MODEL_CLASS,
            append_welcome_message: false
        };

        // POST request to the clear_context endpoint
        const response = await axios.post(`${DEEPSEEK_API_URL}/clear_context`, clearPayload, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK}`, // Authorization header using API key
                'Content-Type': 'application/json' // Content type for JSON payload
            }
        });

        console.log("Chat context cleared:", response.data);

        // Introduce a delay to ensure context is fully cleared
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
    } catch (error) {
        console.error('Error clearing chat context:', error.message);
        throw error;
    }
}

/**
 * Sends a message to the DeepSeek API and returns the response.
 * This function handles streaming responses from the API.
 * @param {string} message - The message content to send to the API.
 * @param {string} model - The model class to use for the request (optional).
 * @returns {Promise<string>} - The response content from the API.
 */
async function sendMessage(message, model) {
    try {
        // Payload for the message completion request
        const userPayload = {
            message: message,
            stream: true, // Enable streaming for responses
            model_preference: null, // Optional model preference
            model_class: model || DEEPSEEK_MODEL_CLASS, // Use provided model or default
            temperature: 1.0 // Controls randomness of the response
        };

        // POST request to the completions endpoint
        const response = await axios.post(`${DEEPSEEK_API_URL}/completions`, userPayload, {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK}`, // Authorization header using API key
                'Content-Type': 'application/json' // Content type for JSON payload
            },
            responseType: 'stream' // Receive response as a stream
        });

        let combinedResponse = '';

        return new Promise((resolve, reject) => {
            // Event listener for incoming data chunks
            response.data.on('data', (chunk) => {
                const lines = chunk.toString('utf8').split(/\r?\n/);
                for (let line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        try {
                            // Parse and accumulate the response data
                            const chunkData = JSON.parse(line.trim().substring(6));
                            if (chunkData.choices && chunkData.choices[0] && chunkData.choices[0].delta && chunkData.choices[0].delta.content) {
                                combinedResponse += chunkData.choices[0].delta.content;
                            }
                        } catch (e) {
                            console.error('Error parsing chunk data:', e.message);
                        }
                    }
                }
            });

            // Resolve promise when streaming ends
            response.data.on('end', () => {
                resolve(combinedResponse);
            });

            // Reject promise on stream error
            response.data.on('error', (err) => {
                reject(err);
            });
        });
    } catch (error) {
        console.error('Error sending message:', error.message);
        throw error;
    }
}

/**
 * POST /api/v1/chat/completions
 * Endpoint to interact with the DeepSeek API for chat completions.
 * @param {Request} req - The request object containing message and model data.
 * @param {Response} res - The response object to send the API result.
 */
app.post('/api/v1/chat/completions', async (req, res) => {
    try {
        // Check if the DeepSeek API key is set in environment variables
        if (!process.env.DEEPSEEK) {
            console.error('DeepSeek API key is not provided in environment variables.');
            return res.status(500).json({ error: 'DeepSeek API key is not provided in environment variables.' });
        }

        const { model, request } = req.body;
        const { message } = request || {};

        // Check if the message is provided in the request body
        if (!message) {
            console.error('Message is required.');
            return res.status(400).json({ error: 'Message is required.' });
        }

        // Validate the model parameter
        if (model && !VALID_MODELS.includes(model)) {
            console.error(`Invalid model: ${model}. Valid models are: ${VALID_MODELS.join(', ')}`);
            return res.status(400).json({ error: `Invalid model. Valid models are: ${VALID_MODELS.join(', ')}` });
        }

        let combinedResponse = '';

        // Clear the chat context before processing the new message
        await clearChatContext();

        // Log request data for debugging
        console.log('Request Body:', req.body);

        // Send the user message and accumulate the response
        const userResponse = await sendMessage(message, model);
        combinedResponse += userResponse;

        // Send the final combined response back to the client
        console.log('Combined Response:', combinedResponse);
        res.json({ response: combinedResponse });

    } catch (error) {
        console.error('Error interacting with DeepSeek API:', error.message);
        res.status(500).json({ error: `Failed to process the request. Details: ${error.message}` });
    }
});

// Start the server and listen on the specified port
const IP_ADDRESS = '0.0.0.0'; // Bind to all network interfaces
app.listen(PORT, IP_ADDRESS, () => {
    console.log(`Server running on http://${IP_ADDRESS}:${PORT}/api/v1/chat/completions`);
});
