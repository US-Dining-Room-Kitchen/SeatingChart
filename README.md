# Visual Seating Planner

A professional, production-ready web application for managing restaurant seating arrangements and guest reservations with visual table layouts.

## Features

- **Visual Table Layout**: Interactive grid-based table arrangement system
- **Guest Management**: Import guest lists from CSV/Excel files
- **Smart Assignment**: Drag-and-drop or click to assign guests to tables
- **Party Merging**: Combine multiple parties into larger groups
- **Multi-Table Parties**: Automatically split large parties across multiple tables
- **Touch Support**: Full pinch-to-zoom support for mobile/tablet devices
- **Layout Creator**: Design custom floor plans with the built-in layout creator
- **Real-Time Capacity Tracking**: Color-coded tables show availability at a glance
- **Notes & Details**: Add notes to guests and view detailed table assignments

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 with custom animations
- **Routing**: React Router DOM
- **File Processing**: SheetJS (xlsx) for Excel/CSV parsing
- **State Management**: React Hooks (useState, useMemo, useRef)

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## Installation

1. Clone the repository: 
   ```bash
   git clone https://github.com/US-Dining-Room-Kitchen/SeatingChart.git
   cd SeatingChart
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Pull Request Previews

When you open a pull request, GitHub Actions will automatically:
1. Build the application
2. Create a build artifact
3. Post a comment with instructions for testing

### Option 1: Download Build Artifact
1. Go to the PR's "Checks" tab
2. Find the "Build PR" workflow
3. Download the `pr-build-{number}` artifact
4. Extract and serve: `npx serve dist`

### Option 2: Test Locally
```bash
git fetch origin pull/{PR_NUMBER}/head:pr-{PR_NUMBER}
git checkout pr-{PR_NUMBER}
npm install
npm run dev
```

### Option 3: Netlify Preview (if configured)
If Netlify is set up with `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets, PR previews will be automatically deployed and a preview URL will be posted as a comment.

## Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

## Project Structure

```
SeatingChart/
├── public/
│   └── layouts/              # Pre-made table layout JSON files
│       ├── layouts.json      # Layout options index
│       ├── patterson.json
│       ├── wallkill.json
│       └── warwick.json
├── src/
│   ├── components/
│   │   ├── ui/               # Generic UI components
│   │   │   ├── ConfirmationModal.tsx
│   │   │   ├── Notification.tsx
│   │   │   └── icons/
│   │   │       ├── UserIcon.tsx
│   │   │       └── PencilIcon.tsx
│   │   └── seating/          # Domain-specific components
│   │       ├── GuestCard.tsx
│   │       ├── TableVisual.tsx
│   │       ├── ReservationDetailsModal.tsx
│   │       ├── AddPartyModal.tsx
│   │       ├── SplashScreen.tsx
│   │       ├── SettingsMenu.tsx
│   │       ├── ZoomControls.tsx
│   │       ├── EditablePartySize.tsx
│   │       ├── EditableAssignedSeats.tsx
│   │       └── EditableNote.tsx
│   ├── hooks/
│   │   ├── usePinchZoom.ts   # Pinch-to-zoom gesture handling
│   │   └── useLocalStorage.ts # Local storage state management
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── utils/
│   │   ├── fileParser.ts     # CSV/Excel file parsing
│   │   └── layoutParser.ts   # Layout JSON parsing
│   ├── pages/
│   │   ├── SeatingPlanner.tsx    # Main seating planner application
│   │   └── LayoutCreator.tsx     # Visual layout creator tool
│   ├── styles/
│   │   └── index.css         # Tailwind directives + custom styles
│   ├── App.tsx               # Main app with routing
│   └── main.tsx              # Application entry point
├── index.html                # HTML template
├── package.json
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── postcss.config.js         # PostCSS configuration
└── README.md
```

## Usage

### Importing Guests

1. Click **Menu** → **Import Guests**
2. Select a CSV or Excel file with guest data
3. Supported format:
   - **Header row** (optional): "Host Name", "Seats Required", "Notes"
   - **No header**: First column = name, second column = party size, third = notes

Example CSV:
```csv
Host Name,Seats Required,Notes
Smith Family,4,Vegetarian options needed
Johnson Party,6,High chair required
Anderson,2,Window seat preferred
```

### Assigning Guests to Tables

1. Click on a guest in the left panel to select them
2. Click on a table in the floor plan to assign
3. The app automatically calculates available seats
4. For large parties, assign to multiple tables as needed

### Creating Custom Layouts

1. Click **Menu** → **Create Layout**
2. Click empty cells to add tables
3. Click existing tables to rotate them
4. Click the **× button** on a table to delete it
5. Click **Export layout.json** to save your custom layout

### Merging Parties

1. Click the **Merge** button in the guest list header
2. Select multiple parties using checkboxes
3. Click **Confirm** to merge them into a single party
4. To unmerge, click **Unmerge** button on the merged party

## Layout Validation

Validate layout JSON files:

```bash
node test/validateLayouts.js
```

This checks for:
- Required fields (internalId, displayId, orientation, gridRow, gridCol)
- Valid orientation values
- Duplicate internal IDs

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with touch support

## Performance

- **Bundle Size**: ~598 KB (197 KB gzipped)
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Mobile Optimized**: Touch gestures, responsive layout, pinch-to-zoom

## Deployment

### Static Hosting (Netlify, Vercel, GitHub Pages)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider

### Environment Variables

No environment variables required. All configuration is in the codebase.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Acknowledgments

- React Team for the excellent framework
- Vite Team for the blazing-fast build tool
- Tailwind CSS for the utility-first CSS framework
- SheetJS for Excel/CSV processing capabilities
