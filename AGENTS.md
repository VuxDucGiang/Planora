# Planora - Agent Instructions & Workspace Rules

## 1. Testing Policy
- **DO NOT run tests automatically after modifying code**: After editing, creating, or refactoring code, do not automatically run test suites or build tests (e.g., `mvn test`, `./mvnw test`, `npm test`, `npm run build`, etc.).
- **Only run tests when explicitly requested**: Only execute test suites or build verification commands when the user specifically asks for it.
- **Provide clear summaries**: After finishing code changes, report concisely on what was changed and let the user decide when to run tests or start dev servers.

## 2. Design System
- Frontend UI must strictly adhere to the guidelines documented in `.agents/rules/ui-design-system.md` and `PLANORA_DESIGN_SYSTEM.md`.
