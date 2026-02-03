# My Daily Compass 🧭

A comprehensive personal productivity and life management application built with React, TypeScript, and modern web technologies. Track your habits, manage goals, monitor finances, and maintain your portfolio all in one place.

## ✨ Features

### 📊 Dashboard
- **Daily Completion Ring** - Visual representation of your daily progress
- **Habit Matrix** - Track multiple habits across days
- **Progress Area Chart** - Visualize your progress over time
- **Weekly Progress Bars** - See your weekly achievements at a glance
- **Top Habits** - Quick overview of your most impactful habits

### 🎯 Habit Tracking
- Create and manage custom habits
- Support for both boolean (done/not done) and numeric habits
- Categorize habits: Health, Learning, Finance, Productivity, Personal
- Set monthly targets and track completion
- View detailed statistics and trends

### 🎓 Goal Management
- Set and track personal goals
- Link goals to habits, finances, or portfolio items
- Support for multiple tracking periods: daily, weekly, monthly, yearly
- Track both per-period and cumulative progress
- Visual progress indicators

### 💰 Finance Tracking
- Monitor income and expenses
- Categorize transactions
- View spending patterns
- Financial goal tracking

### 📈 Portfolio Management
- Track stock investments
- Monitor portfolio performance
- Real-time price updates
- Calculate gains/losses

### ⚙️ Settings
- Customize application preferences
- Manage data and backups
- Configure notification preferences

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.3** - Modern UI library
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Fast build tool and dev server

### UI Components
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful & consistent icons

### State Management & Data
- **Zustand 5.0** - Lightweight state management
- **Dexie 4.3** - IndexedDB wrapper for local storage
- **React Query 5.8** - Async state management
- **React Hook Form 7.6** - Performant form management
- **Zod 3.25** - Schema validation

### Routing & Navigation
- **React Router DOM 6.3** - Client-side routing
- Custom sidebar navigation with responsive design

### Data Visualization
- **Recharts 2.15** - Composable charting library
- Custom progress rings and area charts

### Developer Experience
- **Bun** - Fast JavaScript runtime and package manager
- **ESLint 9.3** - Code linting
- **Vitest 3.2** - Unit testing framework
- **Testing Library** - React component testing

## 📦 Installation

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Modern web browser

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-daily-compass
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```
   
   Or with npm:
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   bun run dev
   ```
   
   Or with npm:
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🚀 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run build:dev` | Build with development mode |
| `bun run preview` | Preview production build |
| `bun run lint` | Run ESLint |
| `bun run test` | Run tests once |
| `bun run test:watch` | Run tests in watch mode |

## 📁 Project Structure

```
my-daily-compass/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── dashboard/   # Dashboard-specific components
│   │   ├── layout/      # Layout components (sidebar, etc.)
│   │   ├── shared/      # Reusable shared components
│   │   └── ui/          # shadcn/ui components
│   ├── db/              # Database configuration (Dexie)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── stores/          # Zustand state stores
│   ├── test/            # Test files
│   └── utils/           # Helper functions
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tailwind.config.ts   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── vitest.config.ts     # Vitest configuration
```

## 💾 Data Storage

The application uses **Dexie.js** with IndexedDB for local data persistence. All data is stored client-side in your browser, ensuring privacy and offline functionality.

### Data Models

- **Habits** - Custom habits with categories and targets
- **Habit Entries** - Daily tracking entries for each habit
- **Goals** - Personal goals linked to habits or other entities
- **Stocks** - Portfolio stock information
- **Finance Records** - Income and expense transactions

## 🎨 Customization

### Adding New Components

The project uses shadcn/ui for UI components. To add a new component:

```bash
bunx --bun shadcn@latest add [component-name]
```

### Styling

- Tailwind CSS classes for styling
- Custom CSS in component-specific files
- Theme customization in `tailwind.config.ts`

## 🧪 Testing

The project uses Vitest and Testing Library for testing:

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch
```

## 🔧 Configuration Files

- `vite.config.ts` - Vite bundler configuration
- `vitest.config.ts` - Test runner configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.js` - ESLint linting rules
- `postcss.config.js` - PostCSS configuration
- `components.json` - shadcn/ui component configuration

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop browsers
- Tablets
- Mobile devices

The sidebar automatically adapts to mobile view with a hamburger menu.

## 🚀 Deployment

### Build for Production

```bash
bun run build
```

The optimized production build will be in the `dist/` folder.

### Preview Production Build

```bash
bun run preview
```

### Deployment Options

The static build can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## 🔐 Privacy & Security

- **Local Storage**: All data is stored locally in your browser using IndexedDB
- **No Server**: No data is sent to external servers
- **Privacy First**: Your personal data never leaves your device

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🐛 Known Issues

- Portfolio real-time price updates may require external API integration
- Some chart animations may lag on older devices

## 🗺️ Roadmap

- [ ] Add data export/import functionality
- [ ] Implement data synchronization across devices
- [ ] Add more visualization options
- [ ] Dark mode support enhancement
- [ ] Mobile app version (React Native)
- [ ] Cloud backup options
- [ ] Social features for accountability

## 📧 Support

For questions, issues, or feature requests, please open an issue on the repository.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
