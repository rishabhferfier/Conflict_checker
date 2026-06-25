# Conflict Checker

> An intelligent AI-powered conflict detection and analysis system leveraging advanced language models and semantic understanding.

## Overview

Conflict Checker is a comprehensive application designed to identify, analyze, and resolve conflicts in data, code, or any textual content. It combines the power of FastAPI for robust backend services, Groq AI for intelligent analysis, and modern database solutions for reliable data persistence.

## Features

- **AI-Powered Analysis**: Leverages Groq's language models for intelligent conflict detection
- **RESTful API**: FastAPI-based REST API for seamless integration
- **Database Support**: SQLAlchemy ORM with PostgreSQL support for reliable data management
- **Vector Search**: ChromaDB integration for semantic similarity and embedding-based queries
- **Web Interface**: Modern static frontend for user interaction
- **CORS Enabled**: Ready for cross-origin requests and multi-domain deployment
- **Scalable Architecture**: Modular design with separated concerns (models, routes, services)

## Tech Stack

- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework for building APIs
- **Database**: PostgreSQL with [SQLAlchemy](https://www.sqlalchemy.org/) ORM
- **AI/ML**: 
  - [Groq API](https://console.groq.com) - High-speed language model inference
  - [Sentence Transformers](https://www.sbert.net/) - Semantic text embeddings
  - [ChromaDB](https://www.trychroma.com/) - Vector database for embeddings
- **Server**: [Uvicorn](https://www.uvicorn.org/) - ASGI web server
- **Frontend**: Static files served through FastAPI

## Project Structure

```
conflict_checker/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Environment variables template
│   ├── db/                   # Database configuration
│   │   └── models.py         # SQLAlchemy models
│   ├── data/                 # Data processing modules
│   ├── models/               # AI/ML model utilities
│   ├── prompts/              # LLM prompt templates
│   ├── routes/               # API endpoint definitions
│   └── services/             # Business logic layer
├── frontend/                 # Frontend application
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- PostgreSQL database
- Groq API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rishabhferfier/Conflict_checker.git
   cd Conflict_checker
   ```

2. **Create and activate a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r app/requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp app/.env.example app/.env
   ```
   Edit `app/.env` and add your configuration:
   ```env
   GROQ_API_KEY=your-groq-api-key
   DATABASE_URL=postgresql://user:password@localhost:5432/conflict_checker
   ```

5. **Initialize the database**
   ```bash
   python -c "from app.db.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

### Running the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Documentation**: `http://localhost:8000/redoc` (ReDoc)
- **Frontend**: `http://localhost:8000/`

## API Endpoints

All API endpoints are prefixed with `/api/v1`

### Analyze Endpoint
```
POST /api/v1/analyze
```
Submit content for conflict analysis and detection.

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | API key for Groq service | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |

### CORS Settings

The application allows requests from all origins by default. Modify the CORS middleware in `app/main.py` for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Usage Examples

### Using cURL
```bash
curl -X POST "http://localhost:8000/api/v1/analyze" \
  -H "Content-Type: application/json" \
  -d '{"content": "your-content-to-analyze"}'
```

### Using Python Requests
```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/analyze",
    json={"content": "your-content-to-analyze"}
)
print(response.json())
```

## Database Models

The application uses SQLAlchemy ORM models located in `app/db/models.py`. Models are automatically initialized on application startup.

## Services & Routes

- **Routes** (`app/routes/`): Define API endpoints and request/response handling
- **Services** (`app/services/`): Contain business logic and orchestration
- **Models** (`app/models/`): AI/ML model utilities and configurations
- **Prompts** (`app/prompts/`): LLM prompt templates for Groq API calls

## Development

### Adding New Features

1. Create a new route in `app/routes/`
2. Implement business logic in `app/services/`
3. Define or update models in `app/db/models.py`
4. Test using Swagger UI at `/docs`

### Running Tests

```bash
pytest
```

## Production Deployment

For production deployment, consider:

1. **Use a production ASGI server** (e.g., Gunicorn with Uvicorn workers)
   ```bash
   gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
   ```

2. **Set secure environment variables** via your deployment platform
3. **Restrict CORS** to known origins
4. **Use HTTPS** for all connections
5. **Configure proper database backups** for PostgreSQL
6. **Enable logging and monitoring**

## Dependencies Highlights

- **fastapi** (0.138.0): Web framework
- **sqlalchemy** (2.0.51): Database ORM
- **chromadb** (1.5.9): Vector database
- **groq** (1.5.0): LLM API client
- **sentence-transformers** (5.6.0): Text embeddings
- **pydantic** (2.13.4): Data validation
- **streamlit** (1.58.0): Optional UI framework

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`
- Ensure database credentials are correct

### Groq API Errors
- Verify `GROQ_API_KEY` is set correctly
- Check Groq API status and rate limits
- Review API documentation at [Groq Console](https://console.groq.com)

### Import Errors
- Ensure all dependencies are installed: `pip install -r app/requirements.txt`
- Verify Python path includes the project root

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is available under the MIT License. See the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an [issue](https://github.com/rishabhferfier/Conflict_checker/issues) on GitHub.

## Author

**Rishabh Ferfier**

- GitHub: [@rishabhferfier](https://github.com/rishabhferfier)
- Project: [Conflict Checker](https://github.com/rishabhferfier/Conflict_checker)

---

<div align="center">

Made with ❤️ using FastAPI and AI

</div>
