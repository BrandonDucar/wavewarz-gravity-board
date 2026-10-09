# WaveWarZ Gravity Board

Standalone prototype for the ZAO/WaveWarZ analytics lane.

This app uses simulated battle telemetry to demonstrate the dashboard concepts before a live WaveWarZ repo, contract, or API is connected.

## Modules

- Battle momentum curve
- Artist liquidity heatmap
- Trader vs. fan split
- Volatility alert timeline
- ZAO/ZABAL creator leaderboard
- Technical handoff panel for future Solana log indexing

## Local Use

Open `index.html` directly, or run:

```powershell
pnpm dev
```

## Deploy

```powershell
npx wrangler pages deploy . --project-name wavewarz-gravity-board
```

## License

Original software and project documentation are licensed under Apache-2.0. See [LICENSE](LICENSE). See [NOTICE](NOTICE) for attribution, licensing scope and third-party/media exclusions.
