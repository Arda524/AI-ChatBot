# Chatbot Web App

A Flask-based AI chatbot web application with a modern, responsive frontend, chat history, FAQ support, and OpenAI integration.

## Features

- Interactive chat interface with real-time messages
- FAQ matching for common user questions
- Persistent user chat history saved in a local SQLite database
- Session-based user tracking through cookies
- REST API endpoints for chat, history, and TTS integration
- Styled single-page frontend with history, stats, and settings panels

## Tech stack

- Python 3.x
- Flask
- OpenAI API
- HTML/CSS/JavaScript frontend
- SQLite for local history storage

## Prerequisites

- Python 3.10+ installed
- `pip` package manager
- OpenAI API key

## Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd chatbot
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

## Configuration

Create a `.env` file in the project root with the following values:

```env
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your-secret-key
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
DATABASE_PATH=chat_history.db
```

Notes:

- `OPENAI_API_KEY` is required for chat responses when no FAQ match is found.
- `DATABASE_PATH` defaults to `chat_history.db` if not set.

## Run the application

```bash
python app.py
```

Open your browser at:

```text
http://127.0.0.1:5000/
```

## API Endpoints

- `POST /api/chat` - Send a chat message and receive a response
- `GET /api/history` - Retrieve the current user's chat history
- `DELETE /api/history/clear` - Clear the current user's chat history
- `GET /api/history/stats` - Retrieve usage statistics for the current user
- `POST /api/tts` - Placeholder TTS endpoint for future integration

## Project structure

- `app/` - Flask application package
  - `api/` - Blueprint routes for chat, history, TTS, and health checks
  - `models/` - Database models and persistence logic
  - `services/` - Chat processing, FAQ matching, and context management
  - `templates/` - HTML templates
  - `static/` - Frontend assets (CSS, JS)
  - `utils/` - Session and input validation helpers
- `app.py` - Application entry point
- `config.py` - Environment-based configuration
- `requirements.txt` - Python dependencies for development
- `requirements-prod.txt` - Production dependency list
- `Dockerfile` - Container build instructions
- `docker-compose.yml` - Service definition for local deployment
- `Procfile` - Deployment process entry for platforms like Heroku
- `runtime.txt` - Python runtime version for platform deployment
- `wsgi.py` - WSGI application entrypoint for production servers
- `tests/` - Automated test suite

## Notes

- The app currently includes a placeholder TTS route; you can extend it with any speech service.
- Frontend assets are served from `app/templates/static` via Flask's static file routing.

## License

This project is available under the terms of the `LICENSE` file.
