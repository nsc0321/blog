 # Blog Project Guide

 This guide provides step‑by‑step instructions for developing, building, and deploying the **blog** project.

 ## Table of Contents
 1. [Project Overview](#project-overview)
 2. [Prerequisites](#prerequisites)
 3. [Getting Started](#getting-started)
 4. [Development Workflow](#development-workflow)
 5. [Building the Site](#building-the-site)
  6. [Deploying to GitHub Pages](#deploying-to-github-pages)
 7. [Useful Commands](#useful-commands)
 8. [Troubleshooting](#troubleshooting)

 ## Project Overview
 The blog is a **React** application bundled with **Vite**. It is containerized using Docker, making local development and production deployments consistent.

 ## Prerequisites
 - **Node.js** (v20 or later)
 - **npm** (comes with Node)
 - **Docker** (optional, for containerized builds)
 - An existing **GitHub** repository where the site will be hosted via **GitHub Pages**

 ## Getting Started
 1. Clone the repository and navigate to the `blog/` directory:
    ```bash
    git clone https://github.com/nsc0321/ociServer.git
    cd ociServer/blog
    ```
 2. Install dependencies:
    ```bash
    npm ci
    ```
 3. Start the development server:
    ```bash
    npm run dev
    ```
    The site will be available at `http://localhost:5173`.

 ## Development Workflow
 - **Component Development** – Edit files under `src/`.
 - **Styling** – Use the `public/` folder for static assets.
 - **Hot‑Reload** – Vite provides instant reload on file changes.

 ## Building the Site
 To create a production‑ready build, run:
 ```bash
 npm run build
 ```
 The output will be placed in the `dist/` folder.

 ## Deploying to GitHub Pages
 The project is configured to publish the `dist/` folder to the `gh‑pages` branch automatically via GitHub Actions.
 1. Ensure the `homepage` field in `package.json` reflects your GitHub Pages URL:
    ```json
    "homepage": "https://nsc0321.github.io/blog"
    ```
 2. Commit and push your changes to the `main` branch.
 3. GitHub Actions will build the site and push the static files to the `gh‑pages` branch.
 4. Your live site will be accessible at:
    https://nsc0321.github.io/blog/

 ## Useful Commands
 | Command | Description |
 |---|---|
 | `npm ci` | Install exact versions from lock file |
 | `npm run dev` | Start development server |
 | `npm run build` | Produce production build |
 | `npm run preview` | Preview production build locally |

 ## Troubleshooting
 - **Port conflicts** – Change the port in `vite.config.js` if `5173` is in use.
 - **GitHub Pages not updating** – Verify the `gh‑pages` branch is set as the source in repository settings.
 - **Docker build failures** – Ensure Docker Desktop is running and you have sufficient memory allocated.

 For more detailed information, refer to the root `README.md` of the repository.