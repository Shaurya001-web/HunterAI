# Hunter AI

A career intelligence platform that transforms resumes into living skill profiles, ranked role matches, and clearer applications in real time.

## Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 19 |
| **Language** | TypeScript |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 (with custom design system) |
| **Animation** | GSAP 3 + ScrollTrigger |
| **Linting** | ESLint 10 + TypeScript ESLint |
| **Package Manager** | npm |

## Project Structure

```
src/
├── App.tsx              # Main application with all sections
├── main.tsx             # Entry point
├── index.css            # Tailwind v4 + custom design tokens & utilities
├── assets/              # Static assets
└── vite-env.d.ts        # Vite types
```

## Design System

Custom CSS variables defined in `src/index.css`:

```css
:root {
  --paper: #e9e9e9;
  --silver: #b7b7b7;
  --stone: #8f8f8d;
  --charcoal: #535351;
  --black: #050505;
  --white: #fbfbfa;
  --line: rgba(5, 5, 5, 0.1);
  --muted: rgba(5, 5, 5, 0.52);
}
```

- **Typography**: Outfit / Avenir Next system stack
- **Motion**: GSAP context + ScrollTrigger for scroll-linked animations
- **Reduced motion**: Respects `prefers-reduced-motion`

## Key Features

- **Animated workflow visualization** — SVG path drawing + scroll progress
- **Interactive skill graph** — Floating nodes with real-time line sync
- **Glass-morphism dashboard mock** — Backdrop filter panels
- **Staggered entrance animations** — GSAP timelines
- **Scroll-triggered reveals** — IntersectionObserver + GSAP

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Type-check + production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Getting Started

```bash
git clone https://github.com/jagwalansh/ui-hunter-ai.git
cd ui-hunter-ai
npm install
npm run dev
```

## Deployment

The `dist/` folder is production-ready after `npm run build`. Deploy to any static host (Vercel, Netlify, Cloudflare Pages, etc.).
![AI Resume Parser & Profile View](assets/user_profile.png)

### Interactive AI Career Coach
Engage in a two-way conversation with a personalized AI Career Coach (powered by Groq and LLaMA 3) to discuss your resume, identify skill gaps, and explore strategies to improve your candidacy.

![Interactive AI Career Coach](assets/ai_career_coach.png)

### Smart Job Matching & Dynamic Filtering
The recommendation engine displays Match Percentages, Matched vs Missing Skills, and Direct Apply Links to platforms like LinkedIn and Wellfound. Users can also dynamically filter their recommendations by minimum stipend, location, remote-only requirements, and minimum match score thresholds.

![Job Recommendations Dashboard](assets/job_recommendations.png)

---

## 🚀 Getting Started

### Local Development Setup

1. **Configure Environment Variables**
   Copy `.env.example` to your `.env` files in both the frontend and backend directories and populate your API credentials (Supabase, Gemini, Groq).

2. **Start the Backend Service (Python 3.11+)**
   ```bash
   cd backend
   uv run python main.py
   ```
   *The API will boot up on `http://127.0.0.1:8000`*

3. **Start the Frontend Application (Node v18+)**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The client will run locally on `http://localhost:3000`*

---

## 🛠️ Tech Stack

*   **Frontend**: Next.js, React, Tailwind CSS
*   **Backend**: FastAPI (Python 3.11), SQLAlchemy, Uvicorn, UV package manager
*   **AI Engine**: Google Gemini API, Groq -> (Llama 3)
*   **Database & Auth**: Supabase (PostgreSQL, Supabase Authentication, Supabase Storage)

---

## 🌐 Deployment

Production configurations and `Dockerfile`s are provided for both the frontend and backend. 
*   **Frontend**: Easily deployable to platforms like Vercel or Netlify.
*   **Backend**: Deployable to services like Railway, Render, or any standard container hosting provider.
