# SciQuest Heroes - Local Development Setup

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download here](https://git-scm.com/)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd sciquest-heroes
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- **Vite** (v5.0.0) - Lightning-fast development server and build tool
- **@supabase/supabase-js** (v2.39.3) - Supabase client for authentication and database

### 3. Configure Environment Variables

The project already includes a `.env` file with Supabase credentials. If you need to update them:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

**Note:** The current `.env` file already has working credentials configured.

### 4. Start the Development Server

```bash
npm run dev
```

Or simply:

```bash
npm start
```

The application will automatically open in your default browser at:
```
http://localhost:3000
```

### 5. Build for Production

To create a production-ready build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

### 6. Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## 📂 Project Structure

```
sciquest-heroes/
├── index.html                      # Landing page
├── account-type-selection.html     # Account type chooser
├── auth.html                       # Login/signup page
├── auth.js                         # Authentication logic
├── config.js                       # Supabase configuration
├── vite.config.js                  # Vite configuration
├── package.json                    # NPM dependencies and scripts
├── .env                            # Environment variables (DO NOT COMMIT)
├── .env.example                    # Example environment variables
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
├── AUTHENTICATION_README.md        # Auth system documentation
├── AUTHENTICATION_TESTING.md       # Auth testing guide
├── LOCAL_SETUP.md                  # This file
├── images/                         # Avatar images and assets
│   ├── Bolt.png
│   ├── Echo.png
│   ├── Finn.png
│   └── ... (other character images)
├── assets/
│   └── avatars/                    # Additional avatar poses
└── guides/                         # Educational content
    └── mr-chloro-photosynthesis-guide.md
```

## 🛠️ Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm start` | Alias for `npm run dev` |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## 🔧 Development Server Features

### Hot Module Replacement (HMR)
Vite provides instant hot module replacement, so your changes appear immediately without refreshing the page.

### Fast Refresh
The dev server is optimized for speed with:
- Native ES modules
- On-demand compilation
- Optimized dependency pre-bundling

### Port Configuration
The dev server runs on port 3000 by default. To change it, edit `vite.config.js`:

```javascript
server: {
  port: 4000,  // Change to your preferred port
  open: true
}
```

## 🗄️ Database Setup

### Supabase Configuration

The application is already connected to a Supabase database with:

1. **Authentication** configured for:
   - Email/password signup and login
   - Google OAuth (requires additional configuration)
   - Password reset functionality

2. **Database Tables**:
   - `user_profiles` - User profile information with account types

3. **Row Level Security (RLS)** enabled for data protection

### Verify Database Connection

1. Open your browser console (F12)
2. Navigate to the auth page
3. Look for any Supabase connection errors
4. If connected successfully, you'll see no errors

### Google OAuth Setup (Optional)

To enable Google sign-in:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to: Authentication → Providers → Google
3. Enable Google provider
4. Add your OAuth credentials:
   - Client ID
   - Client Secret
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth.html` (for local dev)
   - `https://your-domain.com/auth.html` (for production)

## 🌐 Pages Overview

### 1. Landing Page (`index.html`)
- Main homepage with hero section
- Character avatars showcase
- Features and pricing sections
- All "Start Free Trial" buttons route to account selection

### 2. Account Type Selection (`account-type-selection.html`)
- Choose between Student, Parent, or Teacher
- Animated cards with hover effects
- Routes to auth page with selected account type

### 3. Authentication Page (`auth.html`)
- Unified login and signup interface
- Toggles between modes dynamically
- Google OAuth integration
- Forgot password functionality
- Responsive design for all devices

### 4. Other Pages
- `mr-chloro-guide.html` - Mr. Chloro character guide
- `stella-grade-selector.html` - Grade level selection for Stella
- `stella-photosynthesis-adventure.html` - Photosynthesis adventure
- `stella-space-guide.html` - Space exploration guide

## 🎨 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **Tailwind CSS** (via CDN) - Utility-first CSS framework
- **Vanilla JavaScript** (ES6+) - Modern JavaScript with modules
- **Font Awesome** (via CDN) - Icon library
- **Google Fonts** - Custom typography (Fredoka, Inter, Space Grotesk)

### Build Tool
- **Vite** - Next generation frontend tooling
  - Instant server start
  - Lightning fast HMR
  - Optimized builds with Rollup

### Backend Services
- **Supabase** - Backend as a Service
  - Authentication (email/password, OAuth)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions

### Development
- **npm** - Package manager
- **ES Modules** - Native JavaScript modules
- **Modern Browser APIs** - Fetch, LocalStorage, etc.

## 🔍 Testing the Application

### 1. Test Landing Page
```
http://localhost:3000/
```
- Verify all sections load correctly
- Check that "Start Free Trial" buttons navigate to account selection
- Test responsive design by resizing browser

### 2. Test Account Type Selection
```
http://localhost:3000/account-type-selection.html
```
- Click each account type card
- Verify navigation to auth page with correct parameters
- Test "Already have an account? Log In" link

### 3. Test Authentication
```
http://localhost:3000/auth.html
```
- Test signup flow with email/password
- Test login with existing credentials
- Test forgot password functionality
- Toggle between login and signup modes
- Check error handling with invalid inputs

### 4. Test Database Integration
- Sign up with a new account
- Open Supabase dashboard
- Verify user appears in `auth.users` table
- Verify profile created in `user_profiles` table with correct account type

## 🐛 Troubleshooting

### Issue: "npm: command not found"
**Solution:** Install Node.js which includes npm: https://nodejs.org/

### Issue: Port 3000 already in use
**Solution:**
1. Find and kill the process using port 3000:
   ```bash
   # On Mac/Linux
   lsof -ti:3000 | xargs kill -9

   # On Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Or change the port in `vite.config.js`

### Issue: "Module not found" errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Authentication not working
**Solution:**
1. Check browser console for errors
2. Verify `.env` file exists with correct Supabase credentials
3. Check Supabase dashboard for service status
4. Ensure RLS policies are properly configured

### Issue: Images not loading
**Solution:**
1. Verify image files exist in `images/` directory
2. Check browser console for 404 errors
3. Ensure image paths are correct in HTML files
4. Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Issue: Styles not applying
**Solution:**
1. Check that Tailwind CDN is loading (view page source)
2. Verify Font Awesome CDN is accessible
3. Check browser console for CSS loading errors
4. Clear browser cache

## 📝 Development Tips

### 1. Use Browser DevTools
- **Chrome DevTools** (F12 or Cmd+Option+I)
- **Network Tab** - Monitor API calls to Supabase
- **Console Tab** - View JavaScript errors and logs
- **Application Tab** - Inspect LocalStorage and session data

### 2. Hot Reload
Save any file and see changes instantly. No need to refresh the browser.

### 3. Debug Authentication
Add console logs in `auth.js` to track auth flow:
```javascript
console.log('User signed up:', data.user);
console.log('Profile created:', profile);
```

### 4. Test Different Account Types
Create multiple accounts with different types to test role-based features:
- Student account for learning features
- Parent account for management features
- Teacher account for classroom features

### 5. Mobile Testing
Use Chrome DevTools device emulation to test responsive design:
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select different devices from dropdown

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

This creates optimized files in `dist/` directory:
- Minified HTML, CSS, JavaScript
- Optimized images
- Compressed assets

### Deploy to Hosting
The `dist/` folder can be deployed to:
- **Vercel** - [vercel.com](https://vercel.com)
- **Netlify** - [netlify.com](https://netlify.com)
- **GitHub Pages** - [pages.github.com](https://pages.github.com)
- **Cloudflare Pages** - [pages.cloudflare.com](https://pages.cloudflare.com)
- Any static hosting service

### Environment Variables in Production
Set these environment variables in your hosting platform:
```
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)

## 🎯 Next Steps

1. **Start the dev server**: `npm run dev`
2. **Explore the application**: Navigate through all pages
3. **Test authentication**: Sign up with a test account
4. **Review documentation**: Read `AUTHENTICATION_README.md` and `AUTHENTICATION_TESTING.md`
5. **Start developing**: Add your custom features!

## 💡 Pro Tips

1. **Use .env for sensitive data** - Never commit `.env` to git
2. **Test on multiple browsers** - Ensure cross-browser compatibility
3. **Use git branches** - Create feature branches for new work
4. **Write meaningful commits** - Use descriptive commit messages
5. **Document your changes** - Update README when adding features

## 🤝 Contributing

When contributing to the project:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request with clear description

## 📄 License

MIT License - See LICENSE file for details

---

**Happy Coding! 🚀✨**

For questions or issues, refer to the documentation files or check the browser console for error messages.
