# 🚀 SciQuest Heroes - AI-Powered Science Education Platform

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/vite-5.0.0-646CFF)](https://vitejs.dev/)

AI-powered storytelling platform that turns science into personalized voice-narrated comics for kids. Your child becomes the hero of their own science adventure!

## ✨ Features

### 🎨 Design Excellence
- **Animated Gradient Backgrounds** - Dynamic purple-pink gradient theme
- **Glassmorphism UI** - Modern frosted glass effects with backdrop blur
- **3D Card Hover Effects** - Interactive depth transformations
- **Floating Particle Animations** - Magical atmospheric effects
- **Smooth Scroll Animations** - Reveal effects on scroll
- **Responsive Design** - Perfect on mobile, tablet, and desktop

### 🔐 Complete Authentication System
- **Account Type Selection** - Choose between Student, Parent, or Teacher
- **Email/Password Authentication** - Secure signup and login
- **Google OAuth Integration** - One-click sign-in (configurable)
- **Password Reset** - Forgot password with email verification
- **User Profiles** - Database-backed user data with account types
- **Row Level Security** - Supabase RLS for data protection

### 📚 Educational Content
- **Character Avatars** - 10 unique science guides (Bolt, Echo, Finn, Kira, Leo, Max, Ruby, Stella, Gale, Rex)
- **Interactive Stories** - Personalized 6-panel comics with voice narration
- **Science Topics** - Photosynthesis, Space Exploration, and more
- **Grade Level Selection** - Age-appropriate content (5-12 years)
- **Parent Dashboard** - Track child progress and manage accounts
- **COPPA Compliant** - Safe and secure for children

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18.0.0 or higher - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd sciquest-heroes

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will automatically open at `http://localhost:3000`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm start` | Alias for `npm run dev` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 📂 Project Structure

```
sciquest-heroes/
├── index.html                      # Landing page
├── account-type-selection.html     # Account type chooser
├── auth.html                       # Login/signup page
├── auth.js                         # Authentication logic
├── config.js                       # Supabase configuration
├── vite.config.js                  # Vite build configuration
├── package.json                    # Dependencies and scripts
├── .env                            # Environment variables
├── .env.example                    # Example environment variables
├── .gitignore                      # Git ignore rules
├── LOCAL_SETUP.md                  # Local development guide
├── AUTHENTICATION_README.md        # Auth system documentation
├── AUTHENTICATION_TESTING.md       # Auth testing guide
├── images/                         # Character avatars and assets
├── assets/avatars/                 # Avatar poses
├── guides/                         # Educational content
└── dist/                           # Production build output
```

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup with accessibility features
- **Tailwind CSS** (CDN) - Utility-first CSS framework
- **JavaScript (ES6+)** - Modern JavaScript with ES modules
- **Font Awesome** (CDN) - Icon library
- **Google Fonts** - Fredoka, Inter, Space Grotesk typography

### Build & Development
- **Vite** - Next-generation frontend build tool
  - Instant server start with native ES modules
  - Lightning-fast Hot Module Replacement (HMR)
  - Optimized production builds with Rollup
- **npm** - Package manager

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
  - Authentication (email/password, OAuth)
  - PostgreSQL database with RLS
  - Real-time subscriptions
  - Auto-generated REST APIs
- **@supabase/supabase-js** - Supabase JavaScript client

## 🔐 Authentication

### Features
✅ Account type selection (Student, Parent, Teacher)
✅ Email/password signup and login
✅ Google OAuth integration (requires configuration)
✅ Password reset with email verification
✅ User profile creation with account types
✅ Session management and persistence
✅ Row Level Security (RLS) policies
✅ Secure user isolation

### Database Schema

**Table: `user_profiles`**
```sql
- id (uuid, primary key) → References auth.users
- email (text, not null)
- account_type (text, not null) → 'student', 'parent', or 'teacher'
- full_name (text)
- child_name (text)
- grade_level (text)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### User Flow

```
Landing Page
    ↓ Click "Start Free Trial"
Account Type Selection
    ↓ Choose Student/Parent/Teacher
Authentication Page
    ↓ Sign up or Log in
Dashboard (Coming Soon)
```

## 📖 Documentation

- **[LOCAL_SETUP.md](LOCAL_SETUP.md)** - Complete local development setup guide
- **[AUTHENTICATION_README.md](AUTHENTICATION_README.md)** - Authentication system overview
- **[AUTHENTICATION_TESTING.md](AUTHENTICATION_TESTING.md)** - Testing guide for auth features

## 🎨 Design System

### Color Palette
- **Primary Gradient:** Purple (#667eea) → Pink (#f093fb)
- **Accent:** Yellow (#fbbf24) → Orange (#f59e0b)
- **Button Shadow:** Deep Orange (#92400e)
- **Text:** Slate (#1e293b, #475569, #64748b)
- **Background:** Dark Navy (#0f0f1e)

### Typography
- **Headings:** Fredoka (700, 800, 900 weights)
- **Body:** Inter (400, 600, 700 weights)
- **Special:** Space Grotesk (500, 600, 700 weights)

### Spacing
- 8px base unit grid system
- Generous padding for better UX
- Clear visual hierarchy

## 🌐 Pages

### 1. Landing Page (`index.html`)
- Hero section with animated gradients
- Character avatar showcase (10 avatars)
- How It Works section
- Comic preview with audio sample
- Science guides introduction (Mr. Chloro, Rex Explorer, Captain Aqua)
- Parent features and safety information
- Pricing tiers (Free, Monthly, Family)
- Multiple CTAs throughout

### 2. Account Type Selection (`account-type-selection.html`)
- Three animated cards: Student, Parent, Teacher
- Glassmorphism design with hover effects
- "Already have an account? Log In" link
- Floating particles background

### 3. Authentication Page (`auth.html`)
- Unified login/signup interface
- Dynamic mode switching
- Google OAuth button
- Email and password inputs
- Forgot password modal
- Error handling and validation
- Loading states

### 4. Character Guides
- `mr-chloro-guide.html` - Plant science with Mr. Chloro
- `stella-space-guide.html` - Space exploration with Stella
- `stella-grade-selector.html` - Grade level selection
- `stella-photosynthesis-adventure.html` - Photosynthesis adventure

## 🧪 Testing

### Run Locally
```bash
npm run dev
```

### Test Authentication Flow
1. Navigate to `http://localhost:3000`
2. Click "Start Free Trial"
3. Choose account type
4. Sign up with email/password
5. Verify profile created in Supabase
6. Test login with credentials
7. Test password reset flow

See **[AUTHENTICATION_TESTING.md](AUTHENTICATION_TESTING.md)** for detailed testing guide.

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

Output: Optimized files in `dist/` directory

### Deploy To
- **Vercel** - [vercel.com](https://vercel.com) (Recommended)
- **Netlify** - [netlify.com](https://netlify.com)
- **Cloudflare Pages** - [pages.cloudflare.com](https://pages.cloudflare.com)
- **GitHub Pages** - [pages.github.com](https://pages.github.com)

### Environment Variables
Set in your hosting platform:
```
VITE_SUPABASE_URL=your-production-url
VITE_SUPABASE_ANON_KEY=your-production-key
```

## 🔧 Configuration

### Google OAuth Setup (Optional)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to: Authentication → Providers → Google
3. Enable Google provider
4. Add OAuth credentials (Client ID, Client Secret)
5. Configure redirect URIs

### Custom Styling
Colors and styles can be customized in each HTML file's `<style>` section.

## 📊 Performance

### Optimizations
- Vite's lightning-fast HMR for development
- Optimized production builds with code splitting
- CSS animations using GPU acceleration
- Lazy loading for images
- CDN-hosted dependencies
- Minimal JavaScript bundle size

### Build Output
```
dist/index.html                          66.37 kB │ gzip: 10.47 kB
dist/account-type-selection.html         13.26 kB │ gzip:  3.17 kB
dist/auth.html                          15.35 kB │ gzip:  3.71 kB
dist/assets/auth-[hash].js               6.24 kB │ gzip:  2.36 kB
```

## 🔐 Security Features

- **Row Level Security (RLS)** on all database tables
- **Password hashing** via Supabase Auth
- **Session tokens** and secure cookies
- **CORS protection** on API endpoints
- **SQL injection prevention** with parameterized queries
- **XSS protection** with content security policies

## 🎯 Roadmap

### Phase 1: MVP (Current)
✅ Landing page with character showcases
✅ Account type selection
✅ Authentication system
✅ User profiles with account types
✅ Database integration with RLS

### Phase 2: Core Features
- [ ] User dashboards for each account type
- [ ] Profile editing functionality
- [ ] Parent-child account linking
- [ ] Teacher classroom management
- [ ] Progress tracking system

### Phase 3: Content
- [ ] Story generation with AI
- [ ] Voice narration integration
- [ ] Interactive quizzes
- [ ] Badge and reward system
- [ ] PDF export for comics

### Phase 4: Growth
- [ ] Payment integration (Stripe)
- [ ] Subscription management
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile apps (iOS/Android)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Module not found errors**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Authentication not working**
- Check `.env` file has correct Supabase credentials
- Verify Supabase project is active
- Check browser console for errors

See **[LOCAL_SETUP.md](LOCAL_SETUP.md)** for more troubleshooting tips.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- **Supabase** - For providing excellent BaaS platform
- **Vite** - For the amazing build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **Font Awesome** - For the icon library

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the documentation files
- Review browser console for error messages

---

**Built with ❤️ for science education**

Making science magical for every child! 🚀✨🌟
