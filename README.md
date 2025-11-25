# Temperature Monitor UI

A React + TypeScript frontend with Bun backend to visualize temperature data from InfluxDB.

## Features

- Real-time temperature monitoring 
- Multiple time range options (1 hour to 1 week)
- Multiple chart visualizations:
  - Temperature comparison (Tado, Sensor, Target, Outside)
  - Humidity tracking
  - Heating power and offset
- Live statistics cards
- Auto-refresh every 30 seconds

## Setup

1. Install dependencies:
```bash
bun install
```

2. Start the development servers:

**Option 1: Run both servers together (recommended)**
```bash
# Terminal 1: Backend
bun run dev:server

# Terminal 2: Frontend
bun run dev:frontend
```

**Option 2: Run separately**
```bash
bun run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000` (proxies API calls to backend)

## Build

Build for production:
```bash
bun run build
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Bun + Express + TypeScript
- **Charts**: Recharts
- **Database**: InfluxDB

