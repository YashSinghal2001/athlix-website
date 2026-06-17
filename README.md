# 🚀 ATHLIX - React + Tailwind CSS Landing Page

Clean, modern React landing page starter with Tailwind CSS v4, ready for mobile-first development.

## 📁 Project Structure

```
athlix/
├── client/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx       # Main component
│   │   ├── main.jsx      # React entry point
│   │   └── index.css     # Tailwind imports
│   ├── public/           # Static assets
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

- ⚛️ **React 19** - Latest React with modern features
- ⚡ **Vite 7** - Lightning-fast build tool
- 🎨 **Tailwind CSS 4.1.18** - Utility-first CSS framework
- 📱 **Mobile-First** - Responsive design ready

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Navigate to the project:**

```bash
cd athlix/client
```

2. **Install dependencies:**

```bash
npm install
```

3. **Start development server:**

```bash
npm run dev
```

4. **Open in browser:**

```
http://localhost:5173
```

You should see: **Black background with yellow "ATHLIX READY" text**

## 📝 Available Scripts

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎨 Tailwind CSS v4 Configuration

This project uses **Tailwind CSS v4**, which has a different setup than v3:

### Key Files:

**`postcss.config.js`** - Uses `@tailwindcss/postcss` plugin:

```javascript
export default {
    plugins: {
        "@tailwindcss/postcss": {},
        autoprefixer: {},
    },
};
```

**`src/index.css`** - Uses `@import` instead of `@tailwind` directives:

```css
@import "tailwindcss";

body {
    margin: 0;
    min-height: 100vh;
}
```

**`tailwind.config.js`** - Standard configuration:

```javascript
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {},
    },
    plugins: [],
};
```

## 🎯 Customizing Your Landing Page

### 1. Edit the Main Component

Replace `client/src/App.jsx` with your design:

```jsx
function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
            <nav className="p-6">{/* Your navigation */}</nav>

            <main className="container mx-auto px-4">{/* Your content */}</main>

            <footer className="p-6 text-center">{/* Your footer */}</footer>
        </div>
    );
}

export default App;
```

### 2. Customize Tailwind Theme

Edit `client/tailwind.config.js`:

```javascript
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "brand-primary": "#3B82F6",
                "brand-secondary": "#8B5CF6",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    plugins: [],
};
```

### 3. Add Custom Fonts

Update `client/index.html`:

```html
<head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
</head>
```

## 📦 Project Features

✅ React 19 with latest features  
✅ Vite for instant HMR (Hot Module Replacement)  
✅ Tailwind CSS v4 fully configured  
✅ PostCSS with Autoprefixer  
✅ ESLint for code quality  
✅ Mobile-first responsive design  
✅ Production-ready build setup

## 🎨 Tailwind Utilities Examples

```jsx
// Responsive Design
<div className="w-full md:w-1/2 lg:w-1/3">

// Flexbox
<div className="flex items-center justify-between">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Colors & Gradients
<div className="bg-gradient-to-r from-blue-500 to-purple-600">

// Typography
<h1 className="text-4xl font-bold text-gray-900">

// Spacing
<div className="p-6 m-4 space-y-4">

// Hover & Focus States
<button className="bg-blue-500 hover:bg-blue-600 focus:ring-2">
```

## 🐛 Troubleshooting

### Tailwind styles not working?

1. Ensure `@tailwindcss/postcss` is installed:

```bash
cd client
npm install -D @tailwindcss/postcss
```

2. Restart the dev server:

```bash
npm run dev
```

### Port 5173 already in use?

Change the port in `client/vite.config.js`:

```javascript
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000, // Your preferred port
    },
});
```

### Build errors?

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📱 Responsive Breakpoints

Tailwind's default breakpoints:

| Breakpoint | Min Width | CSS                          |
| ---------- | --------- | ---------------------------- |
| `sm`       | 640px     | `@media (min-width: 640px)`  |
| `md`       | 768px     | `@media (min-width: 768px)`  |
| `lg`       | 1024px    | `@media (min-width: 1024px)` |
| `xl`       | 1280px    | `@media (min-width: 1280px)` |
| `2xl`      | 1536px    | `@media (min-width: 1536px)` |

## 🚀 Deployment

### Build for Production

```bash
cd client
npm run build
```

Output will be in `client/dist/`

### Deploy to Vercel

```bash
npm install -g vercel
cd client
vercel
```

### Deploy to Netlify

```bash
cd client
npm run build
# Drag and drop the 'dist' folder to Netlify
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Tailwind UI Components](https://tailwindui.com)

## 📄 License

MIT

---

**Built with ❤️ for modern web development**

🎨 Ready to build your landing page!
