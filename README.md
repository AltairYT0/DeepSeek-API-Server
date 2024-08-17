# DeepSeek-API-Server

Welcome to **DeepSeek-API-Server**! This project provides a scalable API server for interacting with the DeepSeek API, enabling advanced chat functionalities with streaming responses. It is built using Node.js and Express, designed for seamless integration and high performance.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Endpoints](#endpoints)

---

## Introduction

**DeepSeek-API-Server** delivers a robust backend service for managing chat interactions with the DeepSeek API. It supports context management, streaming responses, and flexible model configurations, making it ideal for applications that require dynamic, context-aware conversations.

---

## Features

- **Context Management**: Automatically clears the chat context before each new interaction to ensure accurate and clean responses.
- **Streaming Responses**: Handles streaming responses from the DeepSeek API for real-time interactions.
- **Model Flexibility**: Supports various model classes with default settings and validation.
- **Error Handling**: Comprehensive error handling and logging for enhanced diagnostics.

---

## Setup

To set up DeepSeek-API-Server on your local machine, follow these steps:

### Prerequisites

- **Node.js** (version 14 or later)
- **npm** (Node Package Manager)
- **DeepSeek Auth Key**

### Installation

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/yourusername/DeepSeek-API-Server.git
    cd DeepSeek-API-Server
    ```

2. **Install Dependencies:**

    ```bash
    npm install express axios dotenv
    ```

3. **Configure Environment Variables:**

    Create a `.env` file in the root directory with the following content:

    ```env
    PORT=3000
    DEEPSEEK=your_deepseek_api_key
    ```

    Replace `your_deepseek_api_key` with your actual DeepSeek API key. To obtain your API key:
    
    - Create an account at [DeepSeek](https://chat.deepseek.com/).
    - Open the developer tools in your browser and navigate to the Network tab.
    - Send a random message to a chat model (either the coder or chat model).
    - Search for the completion request in the Network tab and copy the `Authorization` token, omitting the `Bearer` prefix.

4. **Start the Server:**

    ```bash
    node server.js
    ```

The server will start and listen on `http://localhost:3000`.

---

## Usage

**DeepSeek-API-Server** provides an endpoint for interacting with the DeepSeek API to obtain chat completions. You can send POST requests to this endpoint with your message and receive streamed responses.

### Example Request

To send a chat message, use `curl` or any HTTP client:

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{
    "model": "deepseek_code",
    "request": {
        "message": "Hello, how are you?"
    }
}'
```

### Example Output

```json
{
	"response": "Hello World!"
}
```
