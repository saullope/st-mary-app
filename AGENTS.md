# AGENTS.md

This file provides crucial context, rules, and guidelines for AI coding agents operating within the `st-mary-app` repository. It is designed to ensure consistency, quality, and adherence to established architectural patterns.

## 1. Project Overview & Toolchain

### Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** Firebase (Client SDK) + Firebase Admin SDK (Session Cookies for SSR/Middleware)
- **State Management:** Redux Toolkit + React Context
- **Styling:** React Bootstrap (Bootstrap 5) + CSS Modules (`*.module.css`) + `clsx` utility
- **Forms/Validation:** Formik + Yup
- **Animations:** Lottie, canvas-confetti
- **Internationalization:** next-intl
- **Testing:** Jest + React Testing Library

### Build, Lint & Test Commands

**Core Scripts:**
- **Start Dev Server:** `npm run dev` (starts on localhost:3000)
- **Build Production:** `npm run build`
- **Start Production:** `npm start`
- **Lint Code:** `npm run lint`

**Testing Commands (Jest):**
- **Run all tests:** `npm test`
- **Run a single test file (CRITICAL FOR AGENTS):** `npm test -- <path/to/test.file.test.ts>`
- **Run a specific test by name:** `npm test -- -t "test name"`
- **Run in watch mode:** `npm run test:watch`

When developing features, always execute the relevant tests individually using the single test command before submitting changes or claiming completion.

## 2. Code Style & Architecture Guidelines

### Formatting & Structure
- **Indentation:** 2 spaces.
- **Semicolons:** Always required.
- **Quotes:** Double quotes preferred for strings and JSX attributes.
- **Components:** Use functional components with arrow syntax: `export const ComponentName = () => { ... }`.
- **Hooks:** Always place hooks at the very top of components. Avoid complex logic directly in the render path.
- **Modularity:** Extract complex helper functions outside of components if they don't depend on React state or props.
- **Component Props:** Always destructure props within the function signature.

### Imports
- Use the `@/` alias for internal paths (mapped to `src/*`, `public/*`, `components/*` in `tsconfig.json`).
- **Import Order:**
  1. React and Next.js built-ins (`react`, `next/link`, `next/navigation`)
  2. Third-party packages (`firebase`, `redux`, `react-bootstrap`, `formik`)
  3. Internal features (`@/features/...`)
  4. Internal shared components (`@/components/...`)
  5. Internal utilities, hooks, and types (`@/lib/...`, `@/hooks/...`)
  6. Stylesheets and CSS Modules (`@/styles/...` or `./styles.module.css`)

### Types & Strictness
- **Strict Mode:** TypeScript `strict: true` is strictly enforced.
- **No `any`:** Avoid using `any` under any circumstance. Define robust interfaces or types.
- **Props:** Define component props using an interface named `Props` defined locally above the component: `interface Props { ... }`.

### Naming Conventions
- **Files:** `PascalCase.tsx` for React components. `kebab-case.ts` for utilities, custom hooks, and configurations.
- **Components:** `PascalCase`.
- **Functions/Variables:** `camelCase`.
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Interfaces/Types:** `PascalCase` (e.g., `UserProfile`, `ActivityConfig`).

### Error Handling & API Routes
- **API Routes:** Located in `src/app/api/...`. Use App Router syntax (`export async function GET(req: NextRequest) { ... }`).
- **Validation:** Always use Yup for validating incoming request bodies or query parameters.
- **Responses:** Wrap all server logic in `try/catch` blocks. Return consistent JSON error objects containing standard fields: `{ error: true, message: string, status: number }`.
- **Database Operations:** Always use `await` for Prisma database calls. Centralize error handling for database failures.

### Feature Implementations
- **Auth (Firebase):** Use `signInWithEmailAndPassword` or `signInWithPopup` on the client. For protected routes, rely on `src/middleware.ts` which uses Firebase Admin to verify session cookies.
- **Forms (Formik):** Use Formik for state management and submission, paired with Yup for schema validation. Integrate `next-intl` for localized error messages.
- **UI Components:** Favor `react-bootstrap` components over raw HTML when a suitable component exists. Use `clsx` for dynamic class assignment.

## 3. Cursor Rules & Agent Directives (MANDATORY)

Agents must adhere to the project's Cursor rules (from `.cursor/rules/st-mary-rule.mdc`):

**Role & Focus:**
- Act as a Senior Full-Stack Expert specialized in Next.js & Educational Applications.
- Prioritize accessibility (ARIA standards), gamification logic, and robust progress tracking structures.
- For architectural decisions, strictly adhere to Modular Monolith or Clean Architecture principles.
- Before writing complex architectural components, proactively suggest 2-3 best-practice patterns or alternatives.

**Communication & Style (STRICTLY ENFORCED):**
- **NO Emojis/Symbols:** Do not use emojis in code, comments, or your conversational output.
- **Comments:** Keep them extremely short, clear, and technical. Focus entirely on "Why", not "What". Do not over-comment obvious code.
- **Code Quality:**
  - Aggressively use early returns to reduce indentation depth (guard clauses).
  - Avoid deeply nested conditionals.
  - Automatically identify and remove redundant or dead code when refactoring.
  - Practice functional programming principles (e.g., pure functions, immutability) where applicable.

## 4. Directory Structure

- `src/features/`: Feature-sliced modules (e.g., `auth`, `gamification`). This is the preferred location for all new domain logic.
  - `[feature]/components/`: UI components specific to the domain.
  - `[feature]/services/`: Feature-specific business logic, API calls, or hooks.
- `src/app/`: Next.js App Router definitions (pages, layouts, and API routes).
- `src/components/`: Generic, shared UI components (buttons, modals, layout wrappers).
- `src/lib/`: Shared utilities, Prisma database clients, and global configurations.
- `src/hooks/`: Reusable custom React hooks not tied to a specific feature.
- `src/styles/`: Global stylesheets and shared CSS Modules.
- `prisma/`: Database schema definition (`schema.prisma`), migrations directory, and database seed scripts.
