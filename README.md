# PathFinder (Path Weaver)

An interactive **shortest‑path algorithm explorer** with two modes:

- **Algorithm Visualizer:** build your own weighted graph and watch **Dijkstra** / **A\*** run step‑by‑step with explanations and pseudocode highlighting.
- **Real‑World Pathfinding:** pick two points on a real map and compute a drivable route using **A\*** concepts on real road network data, with route + “explored area” visualization.

---

## What this application achieves

### 1) Algorithm Visualizer (Graphs)
A hands-on learning and debugging environment for shortest‑path algorithms.

**You can:**
- Create and edit a weighted graph (add nodes, add edges with weights, drag nodes to reposition)
- Choose an algorithm: **Dijkstra** or **A\***
- Select **source** and **target** nodes
- Run the algorithm with:
  - play / pause / resume
  - next / previous step navigation
  - adjustable speed
  - beginner vs advanced explanations
- See learning aids:
  - pseudocode panel (highlighted line per step)
  - insights/explanations per step
  - live visual states for nodes/edges (visited, in-queue, current, final path, etc.)

### 2) Real‑World Pathfinding (Maps)
A map-based route finder to understand how “shortest path” applies to real roads.

**You can:**
- Search locations (geocoding) and jump the map to a place
- Click to place **Start (A)** and **End (B)** markers (drag to adjust)
- Calculate a route and visualize it on the map
- Toggle a visualization of **explored nodes** (simulated exploration to illustrate how A\* expands the search)
- Swap start/end markers, or clear everything

**Data sources used by the app (no API keys required):**
- Map tiles + geocoding: **OpenStreetMap** (via Nominatim search)
- Routing: **OSRM public demo server** (`router.project-osrm.org`)

---

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Leaflet (maps)

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (recommended: LTS)
- npm

### Setup

```sh
git clone https://github.com/Aryan-jain07/path-weaver.git
cd path-weaver
npm install
npm run dev
```

---

## Scripts

```sh
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # run eslint
```

---

## Notes / Limitations

- Routing uses a **public OSRM demo server**, so it may be rate-limited or temporarily unavailable.
- Real‑world routing results depend on road coverage near your selected points (choose points close to roads).

---

## License

No `LICENSE` file is currently included. If you plan to open-source this project, add a license (e.g., MIT).
