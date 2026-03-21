# AI Skill Gap Analyzer

A full-stack AI-powered career tool that analyzes your resume against job roles, identifies skill gaps, and tells you exactly what to learn next.

---

## Features

- **Skill Gap Analysis** — upload your resume, pick a target role, get a detailed gap report with match score and ATS score
- **ATS Scanner** — paste any job description and get a Claude-powered compatibility score with missing skills and learning paths
- **Learning Roadmap** — personalized study plan based on your gaps and weekly availability
- **Market Insights** — trending skills by role
- **XP & Levels** — gamified system that rewards you for every analysis

---

## Tech Stack

**Backend** — FastAPI, MongoDB, Anthropic Claude API, JWT auth  
**Frontend** — React 18, Framer Motion, Recharts, React Router

---

## Setup

### Backend
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create a `.env` file in the root:
```env
MONGODB_URI=your_mongodb_uri
DB_NAME=skillgap
SECRET_KEY=your_jwt_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
```

---

## Supported Roles

for now role-specific.

---

<div align="center">
  <sub>Built by <a href="https://github.com/Anushka-002">Anushka</a></sub>
</div>
