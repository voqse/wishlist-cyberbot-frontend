# Wishlist Cyberbot Frontend

A Vue 3 + Vite + TypeScript frontend application for a Telegram Web App wishlist bot. Built with modern tooling including Pinia for state management, Vue Router, Vue i18n for internationalization, and SCSS for styling.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Bootstrap and Dependencies
- Install dependencies: `yarn install --immutable --immutable-cache`
  - Takes ~5 seconds. Uses Yarn 4.9.4 with Zero-Installs configuration.
  - Node.js requirement: ^20.19.0 || >=22.12.0
  - May show peer dependency warnings for @twa-dev/sdk (requires React) - these are safe to ignore.

### Build and Type Checking
- Type checking: `yarn type-check`
  - Takes ~4 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
- Production build: `yarn build`
  - Takes ~6 seconds. NEVER CANCEL. Set timeout to 60+ seconds.
  - Equivalent to: `yarn type-check && yarn build-only`
  - Outputs to `dist/` directory with optimized assets and gzip compression details.

### Development Server
- Development server: `yarn dev`
  - Starts Vite dev server on https://localhost:5173/ with HTTPS SSL certificate
  - Takes ~1-2 seconds to start. Sets up Vue DevTools on https://localhost:5173/__devtools__/
  - Hot module replacement and Vue DevTools are enabled.
  - API proxy configured: `/api` routes proxy to http://localhost:3000

### Preview Production Build
- Preview built application: `yarn preview`
  - Serves production build from `dist/` on https://localhost:4173/
  - Use after `yarn build` to test production version locally.

### Linting
- Lint code: `yarn lint`
  - Takes ~5 seconds. Uses @antfu/eslint-config.
  - Fix issues: `yarn lint:fix`
  - **RECOMMENDED**: Run `yarn lint:fix` first to immediately fix what can be auto-fixed, then address any remaining issues manually.
  - ALWAYS run linting before committing - CI build (.github/workflows/deploy.yml) will fail otherwise.

### Testing
- Run unit tests: `yarn test:unit`
  - Uses Vitest with jsdom environment for Vue component testing.
  - Tests are currently passing (28 tests in src/__tests__/utils.spec.ts).
  - Takes ~3 seconds. NEVER CANCEL. Set timeout to 30+ seconds for test suites.

## Manual Validation Scenarios

When making changes, ALWAYS validate through these scenarios:

1. **Development workflow**:
   - Run `yarn dev` and verify app loads on https://localhost:5173/
   - Check browser console for errors
   - Test navigation between views (requires Telegram Web App context for full functionality)

2. **Production build validation**:
   - Run `yarn build && yarn preview`
   - Verify production build serves correctly on https://localhost:4173/
   - Check that assets are properly optimized and gzipped

3. **Code quality checks**:
   - Run `yarn lint` to ensure no style violations
   - Run `yarn type-check` to ensure TypeScript correctness

## Environment Configuration

### Required Environment Variables
The application expects these environment variables (defaults in `.env`):
- `API_BASE`: Backend API base URL (default: https://wishlist.voqse.com/api/v1)
- `API_WS_BASE`: WebSocket API base URL (default: wss://wishlist.voqse.com/api/v1)
- `TG_BOT_NAME`: Telegram bot name (default: WishlistCyberbot)

### Development Environment Variables
Optional for development:
- `DEV_INIT_DATA`: Mock Telegram initData for development
- `DEV_START_PARAM`: Mock start parameter for development
- `DEV_ENV`: Set to enable development mode features
- `TEST_ENV`: Set to enable test mode features

## Project Structure

### Key Directories
- `src/components/`: Vue components (7 components including App lists, forms, user photo)
- `src/views/`: Page components (HomeView, UnauthorisedView)
- `src/stores/`: Pinia stores (app.ts for main application state)
- `src/api/`: API client code (auth, types, WebSocket utilities)
- `src/locales/`: i18n translation files (supports multiple languages including Arabic RTL)
- `src/assets/`: SCSS modules and SVG icons
- `.github/workflows/`: CI/CD pipeline (deploy.yml)

### Important Files
- `vite.config.ts`: Vite configuration with Vue plugins, SCSS processing, SSL, proxy setup
- `package.json`: Dependencies and scripts definition
- `env.d.ts`: TypeScript environment variable declarations
- `eslint.config.ts`: ESLint configuration with @antfu/eslint-config
- `tsconfig.json`: TypeScript project configuration (references multiple config files)

### Technology Stack
- **Frontend Framework**: Vue 3.5+ with Composition API
- **Build Tool**: Vite 7+ with HMR and TypeScript support
- **State Management**: Pinia 3+
- **Router**: Vue Router 4+
- **Internationalization**: Vue i18n with multiple language support
- **Styling**: SCSS with CSS modules, responsive design
- **Testing**: Vitest + jsdom + @vue/test-utils
- **Code Quality**: ESLint with @antfu/eslint-config, TypeScript strict mode
- **Telegram Integration**: @twa-dev/sdk for Telegram Web App features

## Common Commands Reference

```bash
# Quick development cycle
yarn install --immutable --immutable-cache  # ~5 seconds
yarn lint                                    # ~5 seconds
yarn type-check                              # ~4 seconds, NEVER CANCEL
yarn build                                   # ~6 seconds, NEVER CANCEL
yarn dev                                     # Start on https://localhost:5173/

# Testing and quality
yarn test:unit                               # ~3 seconds, NEVER CANCEL
yarn lint                                    # ~5 seconds
yarn lint:fix                               # Auto-fix linting issues - run this first

# Production validation
yarn build && yarn preview                  # Build then serve on https://localhost:4173/
```

## CI/CD Pipeline

The `.github/workflows/deploy.yml` workflow:
- Triggers on pushes to `master` branch
- Uses Node.js 22.x with Yarn caching
- Runs `yarn install --immutable --immutable-cache && yarn build`
- Uploads build artifacts and deploys to production server via SCP

## Known Issues and Workarounds

1. **Peer Dependency Warnings**: @twa-dev/sdk shows peer dependency warnings for React. These are safe to ignore as the SDK works without React in this Vue application.

2. **Telegram Context**: Application requires Telegram Web App context for full functionality. In development, use DEV_INIT_DATA and DEV_START_PARAM environment variables for testing.

## Development Tips

- Always run `yarn lint:fix` before committing to automatically fix common issues, then run `yarn lint` to check for remaining issues
- Use Vue DevTools browser extension for debugging state and components
- The app uses CSS modules with SCSS - class names are automatically scoped
- i18n translations are auto-imported via unplugin-vue-i18n
- SVG files can be imported as Vue components via vite-svg-loader
- WebSocket connections handled through custom API utilities in `src/api/utils.ts`
