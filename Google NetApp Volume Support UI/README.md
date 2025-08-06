# UI Code - Next.js with Ant Design

A modern and responsive dashboard built with Next.js and Ant Design components.

## Features

- ✨ Modern dashboard layout with sidebar navigation
- 📱 Responsive design that works on all devices
- 🎨 Beautiful UI components from Ant Design
- 📊 Data visualization with charts and statistics
- 🔍 Search functionality in the header
- 🔔 Notification system with badges
- 👤 User avatar and profile section

## Getting Started

### Prerequisites

- Node.js 16.0 or later
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
ui-code/
├── components/
│   └── Layout.js          # Main layout component
├── pages/
│   ├── _app.js           # App configuration
│   ├── _document.js      # Document structure
│   └── index.js          # Dashboard page
├── styles/
│   └── globals.css       # Global styles
└── package.json
```

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint for code quality

## Components Used

- Layout with Header, Sidebar, and Content
- Statistics cards with icons and trends
- Data tables with actions
- Activity feed with avatars
- Progress bars for metrics
- Quick action buttons
- Responsive grid system

## Customization

You can easily customize the dashboard by:

- Modifying the menu items in `components/Layout.js`
- Adding new pages in the `pages/` directory
- Updating the dashboard content in `pages/index.js`
- Customizing styles in `styles/globals.css`

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [Ant Design](https://ant.design/) - UI component library
- [React](https://reactjs.org/) - JavaScript library 