# Automated Misinformation Detection Engine

A full-stack NLP tool that scores the credibility of news content in real time, giving users a 0–100 score instead of a binary "fake/real" label.

**Live demo:** [ai-fake-news-beryl.vercel.app](https://ai-fake-news-beryl.vercel.app/)
**Tech stack:** Python, FastAPI, scikit-learn, React, Tailwind CSS

---

## Why I built this

Most misinformation tools give a binary verdict with no transparency into how they got there. I wanted something that:
- Scores credibility on a spectrum (0–100) instead of a flat true/false
- Explains *why* a score was assigned, not just what it is
- Runs fast enough to be usable in real time, not as a batch job

## What it does

- Takes a news article or block of text as input
- Runs it through a custom NLP pipeline (feature extraction + statistical/ML models) to produce a credibility score
- Returns the score through a REST API, visualized on a React frontend with real-time feedback
- Flags likely low-credibility content while minimizing false positives

## Architecture

```
┌─────────────┐      REST API      ┌──────────────────┐      ┌─────────────────┐
│  React UI    │  ───────────────▶  │   FastAPI backend │ ──▶  │ NLP / ML models  │
│ (Tailwind)   │  ◀───────────────  │                    │ ◀──  │ (scikit-learn)   │
└─────────────┘   score + metadata  └──────────────────┘      └─────────────────┘
```

- **Frontend:** React + Tailwind CSS — renders the 0–100 score, confidence breakdown, and flags in real time
- **Backend:** FastAPI — handles inference requests, input validation, and API integration with external sources
- **Model layer:** scikit-learn — custom data structures and statistical/NLP models trained for credibility classification

## Results

- **~90% classification accuracy** on the evaluation dataset
- **<200ms inference latency** per request
- **25% reduction in false positives** compared to earlier binary-classification baseline, via the 0–100 scoring approach

## Running it locally

```bash
# Clone the repo
git clone https://github.com/kavin-siva/<repo-name>.git
cd <repo-name>

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd ../frontend
npm install
npm run dev
```

Open `http://localhost:5173` (or your Vite/CRA port) and the app will hit the local FastAPI server at `http://localhost:8000`.

## Project structure

```
.
├── backend/
│   ├── main.py            # FastAPI app + routes
│   ├── model/              # scikit-learn model + preprocessing
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Score display, input form, feedback UI
│   │   └── App.jsx
│   └── package.json
└── README.md
```

## Roadmap / future work

- [ ] Expand training data to cover more domains (health, politics, science)
- [ ] Add source-credibility signals (not just text-based features)
- [ ] Deploy model versioning for A/B testing accuracy improvements

---

*Built by [Kavin Sivasubramanian](https://github.com/kavin-siva) — [Live Demo](https://ai-fake-news-beryl.vercel.app/) · [Portfolio](#) · [LinkedIn](#)*
