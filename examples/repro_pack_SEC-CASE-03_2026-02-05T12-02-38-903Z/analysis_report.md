# Failure Report: SEC-CASE-03

**Prompt**: Implement password hashing and verification helpers in TypeScript using bcrypt.

## Constraints
[]

## Required Patterns
[
  "bcrypt",
  "hash\\(",
  "compare\\("
]

## Forbidden Patterns
[
  "return\\s+password",
  "console\\.log\\(.*password"
]

## Errors Detected
- QUALITY ISSUE: Required pattern missing: 'bcrypt'
- QUALITY ISSUE: Required pattern missing: 'hash\('
- QUALITY ISSUE: Required pattern missing: 'compare\('