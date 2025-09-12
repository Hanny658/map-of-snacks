# Map of Snacks

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

##  Introduction

**Map of Snacks** is an interactive snack-sharing platform built with modern web technologies. It’s designed for food lovers who want to discover—or contribute—affordable, local snack spots across their region. Built using Next.js, Prisma ORM, and PostgreSQL, with an interactive map powered by Mapbox (note: requires WebGL 2.0+, so older browsers like legacy Safari may not be supported), this project brings your favorite snack offers' locations to life.  
Check it out live at [snackmap.org](https://snackmap.org) !

##  Tech Stack

| Layer           | Technologies                   |
|----------------|-------------------------------|
| **Frontend**   | Next.js (.tsx), React         |
| **Backend**    | Prisma ORM, PostgreSQL        |
| **Map**        | Mapbox GL (WebGL 2.0+)         |
| **Languages**  | TypeScript,  minimal CSS (since styling with Tailwind)

- **Next.js**: Provides server-side rendering, routing, and static-site capabilities.
- **Prisma + PostgreSQL**: Manages the database of snack locations and user submissions for fast, reliable querying.
- **Mapbox GL**: Delivers an interactive map experience with markers for snack locations.
- TypeScript ensures strong typing and better developer experience, complemented by clean CSS for visual styling.

##  Features

- Browse snacks around your area with an interactive map interface.
- Share your favorite snack finds, making them discoverable to fellow users.
- Lightweight and performant—optimized for usability and speed.
- Deployed and accessible at [snackmap.org](https://snackmap.org) 

##  Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL instance (local or remote)
- Access to a Mapbox access token
- A WebGL 2.0 compatible browser (e.g., modern Chrome, Firefox; older Safari may not work)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hanny658/map-of-snacks.git
cd map-of-snacks

# Install dependencies
npm install

### Environment Setup

Create a `.env` file with your configuration:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-access-token"
```

### Database Migrations (for dev)

```bash
npx prisma migrate dev
```

This will apply schema changes and initialize your local database.

### Run Locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser to explore—or begin adding—snack locations.

## Contributing

We’d love your help to make Map of Snacks even better! Whether you’re suggesting snack spot features, improving the UI/UX, or enhancing performance, your contributions matter. Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m "Add awesome feature"`)
4. Push to your fork (`git push origin feature/YourFeature`)
5. Open a pull request

All contributions are welcome—be it code, documentation, or design improvements.

## Why Try It?

* **Seamless Map Experience**: Easily view and explore snack locations with Mapbox’s sleek interface.
* **Community Powered**: Add your own snack finds to the shared map.
* **Modern Stack**: Learn from a clean, full-stack architecture using Next.js, Prisma, and TypeScript.
* **Deployable and Live**: See the project in action at [snackmap.org](https://snackmap.org)

## License

This project is released under the **MIT License**.

---

Thank you for checking out **Map of Snacks**—we hope it inspires you to explore, contribute, and perhaps even discover your next available favorite snack offers!
To gain a contributer account, feel free to email me at hannyanhai@gmail.com!
