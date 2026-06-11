# Collaborative Accessible Spaces Map

A web app for registering and consulting public spaces with accessibility features — built with a full DevSecOps pipeline.

**[Live Demo →](https://ferogv.github.io/accesible-map/)**

---

## Overview

Users can collaboratively register public spaces (parks, plazas, libraries, etc.) with accessibility attributes, view them on an interactive map, and manage associated accessories per space. The project integrates telemetry, role-based access control, automated testing, and CI/CD.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES Modules) |
| Maps | Leaflet.js 1.9.4 |
| Backend / Database | Firebase Firestore (modular SDK v9.22.2) |
| Auth | Firebase Auth (anonymous sign-in + custom claims RBAC) |
| Cloud Functions | Firebase Functions v6 (Node.js 22) |
| Telemetry | Google Apps Script Web App + Google Sheets + Looker Studio |
| Testing | Jest (unit tests) |
| CI/CD | GitHub Actions |
| Hosting | GitHub Pages |
| Security | Firestore Security Rules (RBAC), `npm audit`, Snyk, SonarCloud |

---

## Features

- **Interactive map** with Leaflet markers and click-to-register coordinates
- **Space registration** with validation: name, address, category, coordinates, accessibility features (ramp, adapted bathroom, signage, parking), and image URLs
- **Filters and search** by category, accessibility features, and free-text (name/address), with debounced input
- **Detail panel** displaying space info, images, and accessories per space
- **Accessories management** — add, remove, increment/decrement quantities with atomic Firestore updates (`increment`)
- **Dynamic statistics bar** with live counts per accessibility feature
- **Dual telemetry** — structured events written to Firestore `logs` collection and POSTed to a Google Apps Script Web App, which appends rows to Google Sheets for Looker Studio dashboards
- **Atomic metrics counters** via Firestore `increment` on a `counters/global` document
- **Role-based access control** via Firebase Auth custom claims (`admin`, `editor`, `viewer`) enforced at Firestore Security Rules level
- **Cloud Function trigger** — `onLogCreate` appends every new log document to a configured Google Sheet via the Sheets API
- **Automated unit tests** with Jest covering accessory CRUD and telemetry
- **CI pipeline** with lint, test, `npm audit`, optional Snyk and SonarCloud scans
- **CD pipeline** deploying to GitHub Pages on every push to `main`

---

## Project Structure

```
accesible-map/
├── index.html              # Main map view
├── accessories.html        # Accessories management view
├── app.js                  # Map init, space loading, filters, registration
├── accesorios.js           # Accessory CRUD logic + telemetry
├── detalle.js              # Detail panel rendering
├── estadisticas.js         # Stats bar updates
├── filtros.js              # Filter form logic with debounce
├── firebase.js             # Firebase init and Firestore re-exports
├── telemetry.js            # Dual-write: Firestore logs + Apps Script POST
├── styles.css              # CSS Grid layout + component styles
├── accesorios.test.js      # Jest unit tests — accessory CRUD
├── telemetry.test.js       # Jest unit tests — telemetry
├── firestore.rules         # RBAC security rules
├── functions/
│   └── index.js            # Cloud Function: onLogCreate → Google Sheets
├── scripts/
│   └── setCustomClaims.js  # Admin script to assign RBAC roles
└── .github/workflows/
    ├── ci.yml              # Lint, test, audit, Snyk, SonarCloud
    └── deploy.yml          # GitHub Pages deployment
```

---

## Architecture

```
Client (GitHub Pages)
    │
    ├── Firestore ──── spaces / accessories / logs / counters
    │
    ├── Firebase Auth (anonymous + custom claims RBAC)
    │
    └── Telemetry POST ──── Apps Script Web App
                                │
                          Google Sheets
                                │
                          Looker Studio

Firestore trigger (onLogCreate)
    └── Cloud Function ──── Google Sheets API
```

---

## Security Rules Summary

| Collection | Read | Create | Update / Delete |
|---|---|---|---|
| `spaces` | Public | Authenticated | Admin only |
| `spaces/{id}/accessories` | Public | Editor or Admin | Editor (update), Admin (delete) |
| `logs` | Editor or Admin | Authenticated | Never |
| `counters` | Authenticated | Admin | Admin |

---

## Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint
```

No local server required — the app runs directly from the filesystem or any static host via ES Modules and Firebase's CDN SDK.

To deploy Cloud Functions:

```bash
cd functions
npm install
firebase deploy --only functions
```

To assign roles to a user:

```bash
node scripts/setCustomClaims.js <uid> <admin|editor|viewer>
```

---

## Author

**Fernando Gorostieta Vargas**
[linkedin.com/in/ferogv](https://linkedin.com/in/ferogv) · [github.com/ferogv](https://github.com/ferogv)

---

## License

MIT — see [`LICENSE`](LICENSE)
