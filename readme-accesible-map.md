# Accessible Map · Mapa Colaborativo de Espacios Accesibles

A collaborative web application that allows users to report and explore accessible spaces in CDMX. Built as a community-driven tool to help people with disabilities navigate the city.

🗺️ **[Live Demo](https://ferogv.github.io/accesible-map)**

---

## Features

- Interactive map for locating and reporting accessible spaces
- Community-driven: any user can add or validate a location
- Real-time data sync powered by Firebase
- Responsive design — works on mobile and desktop
- Automated deployment via GitHub Actions CI/CD pipeline

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML · CSS · Vanilla JavaScript |
| Database | Firebase Realtime Database |
| Maps | Google Maps API |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |

## Getting Started

### Prerequisites

- A Firebase project with Realtime Database enabled
- A Google Maps API key

### Setup

```bash
# Clone the repo
git clone https://github.com/ferogv/accesible-map.git
cd accesible-map
```

Create a `.env` file (or update `config.js`) with your credentials:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
};

const MAPS_API_KEY = "YOUR_GOOGLE_MAPS_KEY";
```

Open `index.html` in your browser or deploy to any static host.

## CI/CD

Every push to `main` triggers a GitHub Actions workflow that validates the build and deploys automatically to GitHub Pages.

```
push to main → lint/validate → deploy to GitHub Pages
```

## Project Context

Developed as part of a software engineering project focused on **accessibility and social impact**. The goal was to build a real tool that could be used by the community, not just a demo.

---

## Author

**Fernando Gorostieta Vargas**  
Fullstack Developer · CDMX  
[linkedin.com/in/ferogv](https://linkedin.com/in/ferogv) · [github.com/ferogv](https://github.com/ferogv)
