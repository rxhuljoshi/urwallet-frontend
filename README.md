# urWallet Frontend

A modern React dashboard for personal expense tracking with AI-powered insights.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | **React 19** with Create React App |
| Styling | **TailwindCSS** + **shadcn/ui** components |
| Auth | **Firebase Authentication** |
| Charts | **Recharts** |
| Build | **CRACO** (Create React App Config Override) |
| Container | **Docker** + **Nginx** |

## Features

- 📊 **Dashboard** - Monthly expense summary with charts
- 💰 **Add Expense** - Quick transaction entry with AI categorization
- 🤖 **AI Insights** - Monthly spending analysis and recommendations
- ⚠️ **Spike Detection** - Alerts when spending increases significantly
- 🔐 **Firebase Auth** - Google Sign-In and Email/Password
- 🌙 **Dark/Light Mode** - Theme customization
- 💵 **Multi-Currency** - USD, EUR, GBP, INR, and more

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Auth.js            # Login/Register page
│   │   ├── Dashboard.js       # Main dashboard
│   │   ├── AddExpense.js      # Transaction entry
│   │   ├── AIInsights.js      # AI analysis page
│   │   ├── Settings.js        # User preferences
│   │   └── CurrencySelector.js # First-time setup
│   ├── components/ui/         # shadcn/ui components
│   ├── context/               # React context (Auth)
│   ├── hooks/                 # Custom React hooks
│   └── lib/
│       ├── firebase.js        # Firebase configuration
│       └── utils.js           # Helper functions
├── public/
├── Dockerfile
├── nginx.conf
├── package.json
└── tailwind.config.js
```

## Quick Start

### Prerequisites

- **Node.js 18+** (or Yarn)
- **Backend API** running at `http://localhost:8000`
- **Firebase project** with Authentication enabled

### 1. Setup Environment

```bash
cd frontend

# Copy environment template
cp .env.example .env

# Edit .env with your Firebase config
```

### 2. Install Dependencies

```bash
yarn install
# or
npm install --legacy-peer-deps
```

### 3. Run Development Server

```bash
yarn start
# or
npm start
```

The app will be available at `http://localhost:3000`

## Docker Deployment

### Build and Run

```bash
cd frontend

# Build with backend URL
docker build -t urwallet-frontend \
  --build-arg REACT_APP_BACKEND_URL=http://localhost:8000 .

# Run container
docker run -d -p 3000:80 urwallet-frontend
```

### Using Docker Compose

```bash
docker-compose up --build -d
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `REACT_APP_BACKEND_URL` | Backend API URL |
| `REACT_APP_FIREBASE_API_KEY` | Firebase API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `REACT_APP_FIREBASE_APP_ID` | Firebase app ID |

## Authentication Flow

1. User signs in via Firebase (Google or Email/Password)
2. Firebase returns an ID token
3. Frontend includes token in `Authorization: Bearer <token>` header
4. Backend verifies token and returns user data

## Available Scripts

| Command | Description |
|---------|-------------|
| `yarn start` | Start development server |
| `yarn build` | Build production bundle |
| `yarn test` | Run tests |

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components:

- Button, Card, Input, Label
- Dialog, Dropdown Menu, Select
- Toast notifications (Sonner)
- Charts (Recharts)

---

**Backend Repository**: [urwallet-backend](https://github.com/rxhuljoshi/urwallet-backend)
