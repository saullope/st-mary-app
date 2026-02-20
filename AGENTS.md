# AGENTS.md

This file provides context and guidelines for AI agents working in this repository.

## 1. Project Overview & Toolchain

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** Firebase (Client SDK + Admin SDK for session cookies)
- **State Management:** Redux Toolkit + React Context
- **Styling:** CSS Modules (`*.module.css`) + Bootstrap 5 utility classes
- **Forms:** Formik + Yup validation
- **Internationalization:** next-intl

### Build & Commands
- **Dev Server:** `npm run dev` (starts on localhost:3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint`
- **Test:** `npm test` (Jest is configured)
  - **Run single test file:** `npm test -- <path/to/file>`
  - **Run specific test:** `npm test -- -t "test name"`
  - **Watch mode:** `npm run test:watch`

## 2. Code Style & Conventions

### Formatting & Structure
- **Indentation:** 2 spaces.
- **Semicolons:** Always use semicolons.
- **Quotes:** Double quotes preferred for strings and JSX attributes.
- **Component Structure:**
  - Use Functional Components.
  - Place hooks at the top.
  - Define helper functions outside the component if they don't depend on props/state.
  - Use `export const ComponentName = () => { ... }` syntax (arrow functions) or `export default function ...`.

### Imports
- Use the `@/` alias for internal imports.
  - **Note:** `@/*` maps to `./src/*`, `./public/*`, and `./components/*` in `tsconfig.json`.
- **Order:**
  1. Next.js / React built-ins (`next/*`, `react`)
  2. Third-party libraries (`firebase`, `formik`, `yup`, `redux`, etc.)
  3. Internal components (`@/components/...`)
  4. Internal utilities/hooks/types (`@/lib/...`, `@/hooks/...`)
  5. Styles (`@/styles/...` or CSS modules)

### Naming
- **Files:** Match existing directory style (often `PascalCase.tsx` for components, `kebab-case` for utils).
- **Components:** `PascalCase`.
- **Functions/Variables:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE`.

### Typing
- **Strictness:** `strict: true` is enabled.
- **No `any`:** Avoid `any` types. Define interfaces/types in `@/types` or colocated if specific to a file.
- **Props:** Use `interface` for component props (e.g., `interface Props { ... }`).

## 3. Implementation Details

### API Routes (Next.js App Router)
- Located in `src/app/api/...`.
- Use `NextRequest` and `NextResponse`.
- **Validation:** Use `Yup` for validating request bodies.
- **Error Handling:** Wrap logic in `try/catch`. Return JSON with standard error fields (`error`, `message`, `status`).

### Database (Prisma)
- Client located at `@/lib/db` (or similar).
- Always use `await` for database calls.
- Handle connection errors gracefully.

### Authentication (Firebase)
- Client-side: `signInWithEmailAndPassword`, `signInWithPopup`.
- Server-side: Verify ID tokens via Firebase Admin SDK, create session cookies.
- Middleware: `src/middleware.ts` handles route protection based on session cookies.

### Forms (Formik + Yup)
- Use `Formik` for state and submission.
- Use `Yup` for schema validation.
- Internationalize error messages using `useTranslations`.

## 4. Specific Rules (from Cursor Rules)

**Role:** Senior Full-Stack Expert (Next.js & Educational Apps)

**Goals:**
- **Educational Focus:** Prioritize accessibility (ARIA), gamification logic, and progress tracking.
- **Architecture:** Modular Monolith or Clean Architecture principles.
- **Quality:**
  - Use early returns.
  - Avoid deeply nested conditionals.
  - Remove redundant/dead code.

**Communication (for Agents):**
- **No Emojis:** Do not include emojis in code comments.
- **Comments:** Focus on "Why", not "What". Keep them short and technical.
- **Refactoring:** When modifying code, review the entire file context to ensure consistency.

## 5. Directory Structure
- `src/features`: Feature-based modules (e.g., `auth`, `dashboard`, `activities`). Preferred for new logic.
  - `src/features/auth/components`: Auth UI components.
  - `src/features/auth/services`: Auth business logic.
- `src/app`: App Router pages and API routes.
- `src/components`: Generic/Shared UI components.
- `src/lib`: Utilities, database clients, shared types.
- `src/firebase`: Firebase configuration.
- `src/styles`: Global styles and CSS modules.
- `prisma`: Database schema and migrations.
