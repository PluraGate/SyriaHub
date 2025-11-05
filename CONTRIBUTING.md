# Contributing to Syrealize

Thank you for considering contributing to Syrealize! This document outlines the guidelines for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SyriaHub.git
   cd SyriaHub
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

1. Make your changes in your feature branch
2. Test your changes locally:
   ```bash
   npm run dev
   npm run build
   npm run lint
   ```
3. Commit your changes with clear commit messages:
   ```bash
   git commit -m "feat: add new feature"
   ```
4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

## Commit Message Convention

We follow the Conventional Commits specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add user profile editing
fix: resolve auth redirect issue
docs: update README with new instructions
style: format code with prettier
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Adding New Features

When adding new features:

1. Check existing issues/PRs to avoid duplication
2. Create an issue to discuss the feature first (for major changes)
3. Follow the project's architecture patterns
4. Update documentation as needed
5. Add types for new data structures in `/types`

## Testing

Currently, the project doesn't have automated tests, but please:

- Test your changes manually
- Test on different screen sizes (mobile, tablet, desktop)
- Test authentication flows if you modify auth code
- Verify Supabase queries work correctly

## Pull Request Guidelines

- Keep PRs focused on a single feature/fix
- Provide a clear description of changes
- Reference related issues
- Ensure code builds without errors
- Update README/SETUP if needed

## Questions?

Feel free to open an issue for questions or discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
