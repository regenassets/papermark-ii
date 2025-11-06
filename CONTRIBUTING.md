# Contributing to Papermark

Thank you for your interest in contributing to Papermark! We welcome contributions from the community.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Be respectful, inclusive, and collaborative.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on GitHub with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (OS, Node version, Docker version if applicable)
- Screenshots if relevant

### Suggesting Features

We welcome feature suggestions! Please create an issue with:
- A clear description of the feature
- Use cases and examples
- Any implementation ideas you might have

### Pull Requests

1. **Fork the repository** and create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Set up your development environment**:
   ```bash
   npm install
   cp .env.example .env
   # Configure your .env file
   npm run dev:prisma
   npm run dev
   ```

3. **Make your changes**:
   - Write clean, readable code
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**:
   ```bash
   npm run test
   npm run build
   ```

5. **Commit your changes**:
   - Use clear, descriptive commit messages
   - Reference any related issues (e.g., "Fix #123")
   - Sign your commits if possible

6. **Push to your fork** and submit a pull request:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Complete the CLA**: By submitting a pull request, you agree to the terms in [CLA.md](CLA.md)

### Pull Request Guidelines

- **Keep PRs focused**: One feature or fix per PR
- **Write descriptive titles**: Clearly describe what the PR does
- **Provide context**: Explain why the change is needed
- **Link related issues**: Reference any related issue numbers
- **Add tests**: Include tests for new functionality
- **Update documentation**: Update README.md or other docs if needed
- **Ensure CI passes**: All tests and checks must pass

## Development Guidelines

### Code Style

- We use TypeScript with strict mode enabled
- Follow the existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Project Structure

```
papermark/
├── app/                  # Next.js app directory
├── components/           # React components
├── lib/                  # Utility functions and shared code
├── pages/               # Next.js pages (API routes)
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── docker/              # Docker setup scripts
└── styles/              # Global styles
```

### Database Changes

If your changes require database schema modifications:

1. Create a Prisma migration:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. Test the migration:
   ```bash
   npx prisma migrate reset
   npm run dev:prisma
   ```

3. Include the migration files in your PR

### Testing

- Write unit tests for utility functions
- Add integration tests for API endpoints
- Test UI components with user interactions
- Ensure tests pass before submitting PR

### Documentation

Update documentation when you:
- Add new features
- Change existing functionality
- Modify environment variables
- Update dependencies
- Change deployment procedures

## Self-Hosting Development

If you're working on Docker/self-hosting features:

1. **Test with Docker**:
   ```bash
   docker compose up --build
   ```

2. **Test the quick-start script**:
   ```bash
   ./docker/quick-start.sh
   ```

3. **Verify migrations run correctly**:
   ```bash
   docker compose logs papermark
   ```

4. **Update documentation** in:
   - `SELF_HOSTING.md`
   - `docker/README.md`
   - `.env.docker` (if env vars change)

## Security

- **Never commit secrets** or credentials
- Use `.env` files for sensitive data (gitignored)
- Report security vulnerabilities to security@papermark.com
- See [SECURITY.md](SECURITY.md) for our security policy

## Getting Help

- **Documentation**: Start with [README.md](README.md) and [SELF_HOSTING.md](SELF_HOSTING.md)
- **GitHub Issues**: Search existing issues before creating new ones
- **GitHub Discussions**: Ask questions and share ideas
- **Discord/Community**: Join our community channels

## License

By contributing to Papermark, you agree that your contributions will be licensed under the [AGPLv3 license](LICENSE).

## Recognition

All contributors will be recognized in our README and on our website. Thank you for helping make Papermark better!
