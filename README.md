# HunterAI

HunterAI is an intelligent, multi-user web application designed to automatically parse user resumes, extract skills and experiences, and seamlessly match users with the most relevant internship opportunities. 

## Features

- **Automated Resume Parsing**: Upload your PDF resume, and HunterAI uses Large Language Models (Gemini & Llama 3 via Groq) to accurately extract your profile details.
- **Smart Job Matching**: The built-in recommendation engine cross-references your parsed skills with live job postings to find your perfect fit.
- **Secure Authentication**: Integrated with Supabase Auth to provide seamless, secure user sign-ups and multi-user isolation.
- **Cloud Storage Integration**: Automatically uploads and persists user resumes securely via Supabase Storage.
- **Modern Full-Stack Architecture**: Built with Next.js (Frontend) and FastAPI (Backend), containerized via Docker for reliable production deployments.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, Uvicorn
- **AI Models**: Google Gemini, Groq (Llama 3)
- **Database & Auth**: Supabase (PostgreSQL, Authentication, Storage)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.11+)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shaurya001/HunterAI.git
   cd HunterAI
   ```

2. **Setup Environment Variables**
   Copy `.env.example` to your `.env` files and populate your API keys (Supabase, Gemini, Groq).

3. **Run the Backend**
   ```bash
   cd backend
   uv run python main.py
   ```
   *The backend will run on `http://127.0.0.1:8000`*

4. **Run the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`*

## Deployment

Production `Dockerfile`s are provided for both the frontend and backend. You can deploy the frontend directly to Vercel, and the backend to platforms like Railway or Render.
# HunterAI
