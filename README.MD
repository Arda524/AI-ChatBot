# Chatbot Web App

A Flask-based chatbot web application with chat history, FAQ support, and a simple frontend interface.

## Features

- Conversational chat interface
- FAQ-based responses for common questions
- Persistent chat history using a local database
- Session-based user tracking
- Basic text-to-speech endpoint placeholder

## Project Structure

- app/ - Flask application package
  - api/ - Routes for chat, history, and TTS
  - services/ - Chat processing, FAQ detection, context management
  - models/ - Database layer
  - templates/ - HTML templates
  - utils/ - Session and validation helpers
- static/ - CSS and JavaScript assets
- app.py - Application entry point
- config.py - Configuration settings

## Requirements

Install dependencies with:

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the project root with at least:

```env
OPENAI_API_KEY=your_openai_api_key
FLASK_ENV=development
SECRET_KEY=your-secret-key
```

Optional settings:

```env
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=True
DATABASE_PATH=chat_history.db
```

## Run the Application

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000/
```

## Notes

- The app uses OpenAI models for general chat responses when no FAQ match is found.
- Chat history is stored locally in the database path configured by `DATABASE_PATH`.
- The TTS endpoint is currently a placeholder and can be extended with a speech service later.
