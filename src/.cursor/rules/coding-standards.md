---
description: This rule should be used when writing code. It defines coding standards, style guidelines, and best practices for the project.
version: 1.0.0
---

# Coding Standards

This rule defines the coding standards and best practices for the project.

## Code Style

### General Principles

1. **Single Responsibility**: Each function/class/module should do one thing well
2. **DRY (Don't Repeat Yourself)**: Avoid duplicating code; create abstractions when needed
3. **KISS (Keep It Simple)**: Prefer simple solutions over complex ones
4. **YAGNI (You Aren't Gonna Need It)**: Don't add functionality until it's necessary

### Writing Code

1. **Use meaningful names**: Variables, functions, and classes should have descriptive names
2. **Keep functions small**: Aim for functions that fit on one screen
3. **Prefer composition over inheritance**: Use composition for code reuse
4. **Handle errors explicitly**: Don't silently swallow exceptions
5. **Write testable code**: Avoid tight coupling and global state

### Code Review Checklist

- [ ] Is the code clear and readable?
- [ ] Are there any obvious bugs or logic errors?
- [ ] Is error handling appropriate?
- [ ] Are there adequate tests?
- [ ] Does the code follow project conventions?
- [ ] Are there any security concerns?
- [ ] Is the code performant where it matters?

## Type Safety

1. **Prefer explicit types**: Don't use `any` unless absolutely necessary
2. **Use strict mode**: Enable strict TypeScript checking
3. **Leverage generics**: Write reusable, type-safe code
4. **Validate external data**: Always validate data from external sources

## Performance

1. **Measure before optimizing**: Profile before making changes
2. **Avoid premature optimization**: Write clear code first, optimize later
3. **Consider Big-O**: Be aware of algorithmic complexity
4. **Cache when beneficial**: Memoize expensive operations

## Security

1. **Validate all input**: Never trust user input
2. **Escape output**: Prevent XSS vulnerabilities
3. **Use parameterized queries**: Prevent SQL injection
4. **Follow principle of least privilege**: Request minimum permissions
5. **Keep dependencies updated**: Monitor for vulnerabilities

## Documentation

1. **Document public APIs**: Write JSDoc/comments for public interfaces
2. **Explain why, not what**: Comments should explain reasoning
3. **Keep docs updated**: Update documentation with code changes
4. **Use consistent formatting**: Follow project style guide

## Testing

1. **Write tests for new features**: Cover happy path and edge cases
2. **Keep tests independent**: Each test should run in isolation
3. **Use descriptive test names**: Test names should describe the scenario
4. **Follow AAA pattern**: Arrange, Act, Assert

## Refactoring

1. **Make changes in small steps**: Avoid large, risky refactors
2. **Keep tests passing**: Ensure tests pass after each change
3. **Don't mix concerns**: Refactor one thing at a time
4. **Document design decisions**: Explain why changes were made
