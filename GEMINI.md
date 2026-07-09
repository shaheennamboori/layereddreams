# Layered Dreams

A professional static website for **Layered Dreams**, a 3D printing and custom design service. This project showcases a product catalogue, service offerings, and provides interactive UI elements to engage visitors.

## Project Overview

- **Purpose:** To serve as a digital storefront and portfolio for 3D printing services, including personalized figurines, lithophane art, and custom prototyping.
- **Core Technologies:** 
  - **HTML5/CSS3:** Semantic structure and responsive design with embedded CSS variables.
  - **JavaScript (Vanilla):** Custom interactivity for mouse-tracking "eyes" and scroll animations.
  - **Three.js:** Powers an interactive 3D particle displacement background (`background.js`).
  - **AOS (Animate On Scroll):** Used for smooth reveal animations of sections and product cards.
  - **Font Awesome:** Iconography for social links and service descriptions.

## Building and Running

Since this is a static website, there is no build process required.

### Local Development
To view the site locally, you can use any static file server:

- **Python:** `python -m http.server 8000`
- **Node.js:** `npx serve .`
- **Manual:** Simply open `index.html` in a modern web browser.

### Deployment
The project is configured for static hosting (e.g., GitHub Pages) as evidenced by the `CNAME` file.

## Project Structure

- `index.html`: The main entry point containing the UI structure, styles, and eye-tracking logic.
- `background.js`: Contains the Three.js logic for the particle-based background animation.
- `catalog/`: A directory containing high-quality images (`.heic`, `.png`) of 3D printed products.
- `Logo.png`: The primary brand logo used in the header.
- `CNAME`: Domain configuration for hosting.

## Development Conventions

- **Interactive Elements:** UI components like the "logo eyes" and background particles react to mouse movement and touch events.
- **Styling:** Adheres to a dark-themed aesthetic using the Inter font family. Global styles and component-specific CSS are located in the `<style>` block within `index.html`.
- **Media Support:** The catalogue uses a mix of `.png` and `.heic` formats. Ensure browsers or hosting environments support these for optimal viewing.
- **Services:** Current service pricing and material details (e.g., Rs 2.5/gram, Galaxy3D/Numakers filaments) are hardcoded in the "Services" section of `index.html`.
