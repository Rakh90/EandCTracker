# Energy & Cognition Tracker

A local-first personal app for tracking daily energy, cognition, and sleep, running a short cognitive benchmark, and surfacing trends, correlations, and honest (non-causal) insights.

All data lives in your browser via IndexedDB — nothing is sent anywhere except an optional AI Review call to Anthropic's API using your own key.

## Stack

- React + Vite, mobile-first
- IndexedDB (via Dexie) for storage, no backend server
- recharts for visualization
- CSV/JSON export + import for backups

## Screens

- **Today** — check-in status, streak, and a 7-day baseline comparison
- **Check-ins** — morning / midday / evening, all fields optional
- **Benchmark** — sequence recall, reaction time, and symbol sprint mini-games
- **Dashboard** — trend charts, lag-correlation heatmap, crash map
- **Insights** — rule-based flags, correlation cards, and one weekly experiment suggestion
- **Settings** — export/import, benchmark reminder time, AI Review API key, wipe data

## Development

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run lint     # oxlint
```

## AI Review (optional)

Add an Anthropic API key in Settings to enable the "Generate weekly review" button in Insights. The app is fully functional without it. The key is stored only in your browser's IndexedDB.
