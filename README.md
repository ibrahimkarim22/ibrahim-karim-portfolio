# Ibrahim Karim Portfolio

A custom interactive portfolio built to showcase my web development work, projects, technical experience, and design approach.

🔗 **Live site:** [ibrahimkarim-34158.web.app](https://ibrahimkarim-34158.web.app)

## About

This portfolio was built as more than a traditional project gallery. I wanted each section and project to have its own visual identity while still feeling like part of the same overall experience.

The site includes custom navigation, responsive layouts, animated and 3D elements, project-specific presentations, a resume experience, and separate desktop and mobile treatments.

## Features

- Custom responsive portfolio experience for desktop and mobile
- Animated suspended neon logo and atmospheric home-page lighting
- Custom navigation and project-selection interface
- Individual project presentations instead of generic project cards
- Interactive and animated project experiences
- 3D profile presentation
- Integrated resume viewer and downloadable PDF
- Keyboard and accessibility-focused interactions
- Reduced-motion support for animation-heavy elements
- Responsive layouts designed specifically for smaller screens
- Automated regression testing for navigation, projects, animation behavior, and UI state

## Featured Projects

### TUH-DOO
A personal Kanban productivity application built around task creation, organization, and workflow progression.

### HeyYou
A real-time mobile location-sharing and messaging application built for groups.

### KRISPY
A responsive React media platform for browsing public-domain films and live streams.

### Bard
A React Native learning application focused on Shakespeare, quizzes, progress tracking, and achievements.

### Whack a Mole
An interactive browser game presented through a custom project experience.

### Megaracer
A custom interactive project presented through the portfolio's expanded project system.

## Technologies

### Front End
- React
- JavaScript
- HTML5
- CSS3
- Sass / SCSS
- Three.js / 3D web graphics

### Testing
- Jest
- React Testing Library

### Tools
- Git
- GitHub
- npm
- VS Code
- Browser DevTools

### Hosting
- Firebase Hosting

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd ibrahim-karim-portfolio
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

## Testing

Run the complete test suite:

```bash
CI=true npm test -- --runInBand
```

## Production Build

Create an optimized production build:

```bash
npm run build
```

The compiled application will be generated in the `build` directory.

## Deployment

The portfolio is deployed through Firebase Hosting.

```bash
npx firebase-tools deploy --only hosting
```

## Design

The portfolio uses a dark theatrical visual direction with custom lighting, motion, typography, and project-specific presentation styles.

Rather than using one repeated card layout for every project, each project is given its own visual treatment while sharing the same overall navigation and interaction system.

The responsive experience is intentionally adapted for mobile rather than simply shrinking the desktop layout.

## Author

**Ibrahim Karim**  
Full-Stack Web & Mobile Developer

[View the live portfolio](https://ibrahimkarim-34158.web.app)
