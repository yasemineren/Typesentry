# Typesentry
# 🧪 TypeSentry: The LLM Torture-Test Harness

> **"Trust, but Verify."** — An automated evaluation framework designed to stress-test Large Language Models (LLMs) on complex TypeScript scenarios, catching failures in concurrency, security, and type safety before they reach production.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Status](https://img.shields.io/badge/Status-Experimental-orange)

## 🎯 The Problem
LLMs are great at generating boilerplate, but they often struggle with:
* **Subtle Concurrency Bugs:** Race conditions in `async/await` loops.
* **Security Footguns:** Suggesting raw SQL strings or hardcoded secrets.
* **Type Hallucinations:** Inventing generic constraints that don't exist.

**TypeSentry** is not just a linter; it's an **adversarial testing agent** that prompts models with known "trap" scenarios and rigorously validates their output.

## 🏗 Architecture

1.  **Challenge Suites:** JSON-based scenario definitions (OOP, REST, Security).
2.  **Runner Engine:** Orchestrates the prompt-response cycle with OpenAI/Anthropic APIs.
3.  **Static Analysis Guard:** Runs `tsc`, `eslint`, and custom security regex patterns on generated code.
4.  **Repro Pack Generator:** Automatically creates a folder with artifacts (prompt, code, error log) when a failure is detected.

## 🚀 Usage

### 1. Run a Test Suite
```bash
# Runs the security suite against GPT-4 (or mock mode)
npm start -- run suites/security_suite.json