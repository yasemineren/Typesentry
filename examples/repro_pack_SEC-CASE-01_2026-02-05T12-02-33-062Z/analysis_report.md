# Failure Report: SEC-CASE-01

**Prompt**: Write a TypeScript Express middleware function that validates a JWT token from the Authorization header.

## Constraints
[
  "Must use process.env for secret",
  "Must handle 'Bearer ' prefix",
  "Must return 401 on failure"
]

## Required Patterns
[
  "process\\.env\\.",
  "Bearer\\s",
  "status\\(401\\)"
]

## Forbidden Patterns
[
  "secret_key_string_literal",
  "console\\.log\\(token\\)"
]

## Errors Detected
- QUALITY ISSUE: Required pattern missing: 'Must use process.env for secret'
- COMPILATION ERROR: Command failed: npx tsc /workspaces/Typesentry/temp_check.ts --noEmit --esModuleInterop --strict