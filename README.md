# TypeSentry
# 🧪 TypeSentry: The LLM Torture-Test Harness for TypeScript

> **"Trust, but Verify."** TypeSentry evaluates Large Language Models with adversarial TypeScript prompts and catches failures in security, async logic, and type safety before code reaches production.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Status](https://img.shields.io/badge/Status-Experimental-orange)

## Why this project exists
LLMs can produce convincing code that still fails in critical ways:
- **Concurrency bugs** (`forEach(async ...)`, race conditions)
- **Security footguns** (SQL injection, leaking secrets)
- **Type hallucinations** (`as any`, broken generic assumptions)
- **Operational gaps** (weak error paths, no reproducible artifacts)

TypeSentry turns these into measurable test cases.

## Architecture
1. **Suite definitions** (`src/suites/*.json`) model real-world engineering tasks.
2. **Runner** (`src/core/runner.ts`) executes each case against model output (mocked by default).
3. **Static evaluator** (`src/evaluators/static_analysis.ts`) checks:
   - forbidden regex patterns
   - required regex patterns
   - strict TypeScript compilation
4. **Repro pack reporter** (`src/reporters/markdown.ts`) stores prompt/code/errors per failure in `examples/`.

## Included suites
- `src/suites/security_suite.json`
  - JWT handling
  - SQL query safety
  - password hashing hygiene
- `src/suites/engineering_suite.json`
  - async concurrency and retry patterns
  - typed REST client expectations
  - event-driven idempotency workflows

## Usage
```bash
npm install
npm start -- run suites/security_suite.json
npm start -- run suites/security_suite.json --mock-mode=pass
npm start -- run suites/engineering_suite.json --mock-mode=fail
```

### Mock modes
- `mixed` (default): deterministic mix of pass and fail cases.
- `pass`: generate outputs expected to satisfy the suite.
- `fail`: generate intentionally unsafe/low-quality outputs.

The process exits with non-zero status when at least one case fails.

You can pass either `suites/...` or `src/suites/...`; CLI resolves both.

## Output example
On failure, TypeSentry creates:
```
examples/repro_pack_<CASE_ID>_<TIMESTAMP>/
  ├── prompt.txt
  ├── generated_code.ts
  └── analysis_report.md
```

## Scripts
- `npm start -- run <suite-path> [--mock-mode=...]`: run suite
- `npm run typecheck`: TypeScript compile check

## Next steps (recommended)
- Plug real model providers (OpenAI/Anthropic) behind a provider interface.
- Add deterministic scoring weights per failure category.
- Add CI job that uploads repro packs as artifacts.
