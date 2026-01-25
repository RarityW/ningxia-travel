# 🧪 Tests

This directory contains all test files for the project.

## Structure

- `backend/` - Backend API tests (Go)
- `admin/` - Admin panel tests (React)
- `e2e/` - End-to-end integration tests

## Running Tests

```bash
# Backend tests
cd tests/backend
go test ./...

# Frontend tests
cd tests/admin
npm test

# E2E tests
cd tests/e2e
npm run test:e2e
```
