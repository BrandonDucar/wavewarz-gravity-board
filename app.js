const battles = [
  {
    id: "glow-rush",
    label: "Glow Rush vs Static Choir",
    artists: [
      { name: "Glow Rush", pool: 42.6, wallets: 184, fanShare: 0.61 },
      { name: "Static Choir", pool: 38.2, wallets: 139, fanShare: 0.49 }
    ],
    momentum: [2.4, 2.9, 3.1, 4.8, 5.2, 4.7, 7.6, 8.1, 6.4, 9.3, 12.1, 10.8],
    alerts: [
      ["00:18", "+31% in 2m", "Glow Rush link share hit the room"],
      ["00:23", "Fan wave", "41 new single-swap wallets"],
      ["00:27", "Late swing", "Static Choir recovered 5.3 SOL"]
    ]
  },
  {
    id: "bass-orchid",
    label: "Bass Orchid vs Paper Saints",
    artists: [
      { name: "Bass Orchid", pool: 51.4, wallets: 203, fanShare: 0.43 },
      { name: "Paper Saints", pool: 29.7, wallets: 111, fanShare: 0.67 }
    ],
    momentum: [1.8, 2.1, 2.6, 5.9, 8.8, 9.4, 6.9, 5.3, 7.1, 9.9, 11.4, 12.8],
    alerts: [
      ["00:09", "Spec spike", "Recurring wallets drove early pool lead"],
      ["00:16", "+44% in 4m", "Bass Orchid momentum breakout"],
      ["00:30", "Organic hold", "Paper Saints fan ratio still strong"]
    ]
  },
  {
    id: "solar-ska",
    label: "Solar Ska vs Night Ledger",
    artists: [
      { name: "Solar Ska", pool: 35.1, wallets: 172, fanShare: 0.72 },
      { name: "Night Ledger", pool: 33.9, wallets: 166, fanShare: 0.58 }
    ],
    momentum: [3.8, 3.6, 4.1, 4.4, 4.3, 5.8, 5.5, 6.2, 6.8, 7.1, 7.7, 8.4],
    alerts: [
      ["00:12", "Clean climb", "Both artists gained without botty churn"],
      ["00:21", "Balanced battle", "Pool gap under 2 SOL"],
      ["00:29", "Final push", "Solar Ska fan wallets accelerating"]
    ]
  }
];

let activeBattle = structuredClone(battles[0]);

const battleSelect = document.querySelector("#battleSelect");
const windowSelect = document.querySelector("#windowSelect");
const simulateButton = document.querySelector("#simulateButton");
const copyBriefButton = document.querySelector("#copyBriefButton");

function setupControls() {
  battles.forEach((battle) => {
    const option = document.createElement("option");
    option.value = battle.id;
    option.textContent = battle.label;
    battleSelect.append(option);
  });

  battleSelect.addEventListener("change", () => {
    const next = battles.find((battle) => battle.id === battleSelect.value);
    activeBattle = structuredClone(next);
    render();
  });

  windowSelect.addEventListener("change", render);
  simulateButton.addEventListener("click", () => {
    simulateTick();
    render();
  });
  copyBriefButton.addEventListener("click", copyBrief);
}

function getWindowedMomentum() {
  const size = Number(windowSelect.value);
  return activeBattle.momentum.slice(-size);
}

function calculateStats() {
  const momentum = getWindowedMomentum();
  const latest = momentum.at(-1) ?? 0;
  const previous = momentum.at(-2) ?? latest;
  const delta = latest - previous;
  const avg = momentum.reduce((sum, value) => sum + value, 0) / momentum.length;
  const max = Math.max(...momentum);
  const min = Math.min(...momentum);
  const totalPool = activeBattle.artists.reduce((sum, artist) => sum + artist.pool, 0);
  const fanWeight = activeBattle.artists.reduce((sum, artist) => sum + artist.wallets * artist.fanShare, 0);
  const walletCount = activeBattle.artists.reduce((sum, artist) => sum + artist.wallets, 0);
  const fanShare = Math.round((fanWeight / walletCount) * 100);
  const volatility = Math.round(((max - min) / Math.max(avg, 1)) * 100);
  const heat = Math.round(Math.min(100, totalPool + latest * 3 + fanShare * 0.32));

  return { latest, delta, avg, max, min, totalPool, fanShare, volatility, heat };
}

function render() {
  const stats = calculateStats();
  renderKpis(stats);
  renderMomentumChart();
  renderLiquidityMap(stats.totalPool);
  renderSplit(stats.fanShare);
  renderAlerts();
  renderLeaderboard();
}

function renderKpis(stats) {
  document.querySelector("#kpiHeat").textContent = stats.heat;
  document.querySelector("#kpiHeatLabel").textContent =
    stats.heat > 82 ? "arena hot" : stats.heat > 62 ? "battle live" : "warming";
  document.querySelector("#kpiMomentum").textContent = `${stats.latest.toFixed(1)} SOL/min`;
  document.querySelector("#kpiMomentumLabel").textContent =
    stats.delta > 1.2 ? "accelerating" : stats.delta < -1.2 ? "cooling" : "steady";
  document.querySelector("#kpiFan").textContent = `${stats.fanShare}%`;
  document.querySelector("#kpiVolatility").textContent = `${stats.volatility}%`;
}

function renderMomentumChart() {
  const svg = document.querySelector("#momentumChart");
  const values = getWindowedMomentum();
  const width = 860;
  const height = 286;
  const pad = 24;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);

  const points = values.map((value, index) => {
    const x = pad + (index / Math.max(values.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const area = [
    `M ${points[0][0]} ${height - pad}`,
    ...points.map(([x, y], index) => `${index === 0 ? "L" : "L"} ${x} ${y}`),
    `L ${points.at(-1)[0]} ${height - pad}`,
    "Z"
  ].join(" ");

  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const grid = [0, 1, 2, 3].map((step) => {
    const y = pad + step * ((height - pad * 2) / 3);
    return `<line x1="${pad}" x2="${width - pad}" y1="${y}" y2="${y}" class="grid-line" />`;
  });

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="waveArea" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#59e4ff" stop-opacity="0.42" />
        <stop offset="100%" stop-color="#b9ff63" stop-opacity="0.03" />
      </linearGradient>
    </defs>
    ${grid.join("")}
    <path d="${area}" fill="url(#waveArea)" />
    <path d="${line}" fill="none" stroke="#59e4ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    ${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#b9ff63" />`).join("")}
  `;
}

function renderLiquidityMap(totalPool) {
  const map = document.querySelector("#liquidityMap");
  map.innerHTML = activeBattle.artists
    .map((artist) => {
      const percent = Math.round((artist.pool / totalPool) * 100);
      return `
        <div class="artist-row">
          <header><b>${artist.name}</b><span>${artist.pool.toFixed(1)} SOL / ${percent}%</span></header>
          <div class="track"><div class="fill" style="width:${percent}%"></div></div>
        </div>
      `;
    })
    .join("");
}

function renderSplit(fanShare) {
  const traderShare = 100 - fanShare;
  document.querySelector("#fanBar").style.width = `${fanShare}%`;
  document.querySelector("#traderBar").style.width = `${traderShare}%`;
  document.querySelector("#splitNote").textContent =
    fanShare >= 60
      ? "This battle is being carried by unique listener support, not just repeat traders."
      : "Speculator pressure is high. Add wallet-age and frequency filters before calling this organic.";
}

function renderAlerts() {
  const rail = document.querySelector("#alertRail");
  rail.innerHTML = activeBattle.alerts
    .map(
      ([time, title, detail]) => `
        <div class="alert">
          <strong>${time}</strong>
          <span>${title}</span>
          <em>${detail}</em>
        </div>
      `
    )
    .join("");
}

function renderLeaderboard() {
  const board = document.querySelector("#leaderboard");
  const sorted = [...activeBattle.artists].sort((a, b) => b.pool + b.wallets * 0.08 - (a.pool + a.wallets * 0.08));
  board.innerHTML = sorted
    .map((artist, index) => {
      const score = Math.round(artist.pool * 2 + artist.wallets * artist.fanShare * 0.35);
      return `
        <div class="leader-row">
          <span class="rank">${index + 1}</span>
          <span><b>${artist.name}</b><span>${artist.wallets} wallets / ${Math.round(artist.fanShare * 100)}% fan signal</span></span>
          <strong>${score}</strong>
        </div>
      `;
    })
    .join("");
}

function simulateTick() {
  const last = activeBattle.momentum.at(-1);
  const drift = (Math.random() - 0.28) * 2.8;
  const next = Math.max(1, Number((last + drift).toFixed(1)));
  activeBattle.momentum.push(next);
  activeBattle.momentum = activeBattle.momentum.slice(-24);

  activeBattle.artists = activeBattle.artists.map((artist, index) => {
    const boost = index === (Math.random() > 0.5 ? 1 : 0) ? Math.random() * 2.4 : Math.random() * 1.2;
    return {
      ...artist,
      pool: Number((artist.pool + boost).toFixed(1)),
      wallets: artist.wallets + Math.round(Math.random() * 8),
      fanShare: Math.max(0.35, Math.min(0.82, artist.fanShare + (Math.random() - 0.5) * 0.04))
    };
  });

  if (Math.random() > 0.58) {
    const minute = String(30 + Math.round(Math.random() * 24)).padStart(2, "0");
    activeBattle.alerts = [
      ...activeBattle.alerts.slice(-2),
      [`00:${minute}`, "New pulse", `${activeBattle.artists[0].name} and ${activeBattle.artists[1].name} both gained fresh wallet activity`]
    ];
  }
}

async function copyBrief() {
  const stats = calculateStats();
  const winner = [...activeBattle.artists].sort((a, b) => b.pool - a.pool)[0];
  const brief = [
    `WaveWarZ Gravity Board brief: ${activeBattle.label}`,
    `Heat: ${stats.heat}/100`,
    `Momentum: ${stats.latest.toFixed(1)} SOL/min`,
    `Fan pressure: ${stats.fanShare}%`,
    `Current pool lead: ${winner.name} at ${winner.pool.toFixed(1)} SOL`,
    "Dashboard thesis: show battle gravity, not just cumulative volume."
  ].join("\n");

  await navigator.clipboard.writeText(brief);
  copyBriefButton.textContent = "Copied";
  setTimeout(() => {
    copyBriefButton.textContent = "Copy Brief";
  }, 1300);
}

setupControls();
render();
