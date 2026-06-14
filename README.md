# 🏠 RealEstateMate — AI-Powered Real Estate Marketplace

> **Search by lifestyle, not just checkboxes.**  
> Find properties using natural language — *"near a park, quiet workspace, pet-friendly"* — powered by semantic search and a RAG-based AI chatbot.

🔗 **Live Demo:** [realestate-seven-iota.vercel.app](https://realestate-seven-iota.vercel.app)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-47A248?style=flat&logo=mongodb&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=flat)
![Gemini](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat&logo=google&logoColor=white)

---

## ✨ Key Features

### 🔍 Semantic Property Search
Traditional real estate search forces users into rigid filters — price range, BHK, location. RealEstateMate replaces this with **natural language lifestyle queries**. A user can type *"quiet neighbourhood, close to a park, good for remote work"* and get semantically matched listings — even if none of them use those exact words.

- Property descriptions are embedded using **Gemini AI embeddings**
- Stored and queried via **Pinecone vector database**
- Combined with structured NoSQL filters (price, BHK, location) for **hybrid search**

### 🤖 "Ask the House" — RAG Chatbot
Each listing has an AI chatbot that answers tenant questions in real time using **Retrieval-Augmented Generation (RAG)**:
- *"Is this property pet-friendly?"*
- *"What utilities are included?"*
- *"What does the lease say about early termination?"*

The chatbot retrieves relevant chunks from listing metadata and uploaded lease documents, then uses **Gemini Pro** to generate accurate, grounded answers — no hallucinations about listing-specific details.

### 📝 Automated Listing Generator
Landlords input raw property data (dimensions, amenities, location). Gemini Pro converts it into polished, professional marketing copy ready for listing — saving hours of manual writing.

### 📄 Lease Summarizer
Tenants upload lease PDFs. The system extracts and surfaces key clauses — rent amount, notice period, pet policy, maintenance responsibilities — so tenants understand what they're signing without reading 20 pages of legal text.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React + TS)                 │
│         Semantic Search UI  │  Listing Pages  │ Chatbot  │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────────┐
│                   SERVER (Node.js + Express)              │
│                                                           │
│  ┌─────────────────┐      ┌──────────────────────────┐  │
│  │  Hybrid Search  │      │     RAG Pipeline          │  │
│  │                 │      │                           │  │
│  │ Structured ───► │      │  Query → Embed → Retrieve │  │
│  │ (MongoDB Atlas) │      │  → Gemini Pro → Answer    │  │
│  │                 │      │                           │  │
│  │ Semantic ──────►│      └──────────────────────────┘  │
│  │ (Pinecone VDB)  │                                     │
│  └─────────────────┘      ┌──────────────────────────┐  │
│                            │   Content Generation      │  │
│                            │  Listing Generator        │  │
│                            │  Lease Summarizer         │  │
│                            │  (Gemini Pro)             │  │
│                            └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                          │
┌────────▼──────────┐    ┌─────────▼──────────┐
│   MongoDB Atlas   │    │   Pinecone (VDB)    │
│ Structured data   │    │ Vector embeddings   │
│ listings, users   │    │ semantic search     │
└───────────────────┘    └────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (structured data) |
| Vector DB | Pinecone (semantic search embeddings) |
| AI / LLM | Google Gemini Pro (generation), Gemini Embeddings |
| RAG Framework | LangChain |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Pinecone account
- Google Gemini API key

### Clone the repo
```bash
git clone https://github.com/govardhanchinta99/realestate.git
cd realestate
```

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `/server`:
```env
MONGO_URI=your_mongodb_atlas_connection_string
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

```bash
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in `/client`:
```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

---

## 📁 Project Structure

```
realestate/
├── client/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   └── services/     # API calls
│   └── ...
├── server/               # Node.js + Express backend
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── models/           # MongoDB schemas
│   └── services/         # Pinecone, Gemini, RAG logic
└── .github/
    └── workflows/        # GitHub Actions CI/CD
```

---

## 🔄 How the RAG Pipeline Works

```
User Question
     │
     ▼
Embed question using Gemini Embeddings
     │
     ▼
Query Pinecone for top-k relevant chunks
(listing metadata + lease document chunks)
     │
     ▼
Inject retrieved context into Gemini Pro prompt
     │
     ▼
Gemini Pro generates grounded answer
     │
     ▼
Return answer to user via chatbot UI
```

---

## ☁️ Deployment

| Service | Platform | Trigger |
|---------|----------|---------|
| Frontend | Vercel | Push to `main` |
| Backend | Render | Push to `main` |
| CI/CD | GitHub Actions | PR → main |

---

## 👤 Author

**Govardhan Chinta**  
B.Tech — AI & ML, Sasi Institute of Technology and Engineering (2027)  
[GitHub](https://github.com/govardhanchinta99) • [LinkedIn](https://www.linkedin.com/in/govardhan-chinta-000b0528b/)

---

## 📄 License

MIT License — feel free to fork and build on this.
