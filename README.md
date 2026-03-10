# Karo Pitch

A premium startup discovery and funding platform landing page designed to connect Bharat entrepreneurs with investors. Features a stunning, modern dark/light mode dark glassmorphism aesthetic with engaging scroll animations, dynamic background orbs, an interactive applicant experience, and a lightweight Python backend.

<img width="2000" height="2000" alt="LOGO" src="https://github.com/user-attachments/assets/990d9f07-6b63-4aa5-99a0-ce828c32edfc" />

## Features

- **Dynamic Dark & Light Modes:** Smooth transitions between themes that persist user preferences.
- **Premium Glassmorphism UI:** Blurred backdrop filters, soft gradients, and subtle hover animations.
- **Interactive Funding Timeline:** A visually rich, responsive vertical timeline illustrating the funding journey.
- **Smooth Scroll & Animations:** Uses `IntersectionObserver` for fade-in reveals and parallax mouse-trailing effects for an immersive Hero section.
- **Fully Responsive:** Optimized layouts for mobile, tablet, and desktop viewing.

## Backend Integration

This project includes a lightweight local server to handle form submissions without needing complex dependencies like Node.js or npm.

- **Stack:** Python 3 built-in `http.server` natively connected to a local SQLite database (`database.sqlite`).
- **Functionality:** 
  - Captures full form submissions from `application.html`.
  - Captures User Registration and Login credentials from `auth.html`.
  - Serves static assets gracefully.

## Local Development Setup

To run the platform and local database server on your machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/jdjadhav/karo-pitch.git
   cd karo-pitch
   ```

2. Start the local server:
   ```bash
   python server.py
   ```

3. Open your browser and navigate to: [http://localhost:8000](http://localhost:8000)

## Deployment Disclaimer

If deploying to static hosting environments (like Vercel or GitHub Pages), the HTML/CSS and animations will function perfectly. However, Serverless environments do not support persistent local SQLite files, so database submissions will fail in production unless migrated to a Cloud Database (e.g., Supabase, Firebase, or MongoDB).

--- 
*An initiative by KaroStartup.*
