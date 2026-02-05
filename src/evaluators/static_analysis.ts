import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { EvaluationResult, TestCase } from '../types';

export class Evaluator {
  async evaluate(code: string, testCase: TestCase): Promise<EvaluationResult> {
    const errors: string[] = [];

    if (!code.trim()) {
      return {
        passed: false,
        errors: ['MODEL OUTPUT ERROR: No TypeScript code block could be extracted.']
      };
    }

    this.checkForbiddenPatterns(code, testCase, errors);
    this.checkRequiredPatterns(code, testCase, errors);
    this.runCompilationCheck(code, errors);

    return {
      passed: errors.length === 0,
      errors
    };
  }

  private checkForbiddenPatterns(code: string, testCase: TestCase, errors: string[]) {
    for (const pattern of testCase.forbidden_patterns ?? []) {
      const regex = this.safeRegex(pattern, errors);
      if (regex && regex.test(code)) {
        errors.push(`SECURITY RISK: Forbidden pattern detected: '${pattern}'`);
      }
    }
  }

  private checkRequiredPatterns(code: string, testCase: TestCase, errors: string[]) {
    const requiredPatterns = [...(testCase.required_patterns ?? [])];

    for (const pattern of requiredPatterns) {
      const regex = this.safeRegex(pattern, errors);
      if (regex && !regex.test(code)) {
        errors.push(`QUALITY ISSUE: Required pattern missing: '${pattern}'`);
      }
    }
  }

  private runCompilationCheck(code: string, errors: string[]) {
    const tempFile = path.resolve(process.cwd(), 'temp_check.ts');
    fs.writeFileSync(tempFile, code, 'utf-8');

    try {
      execSync(`npx tsc ${tempFile} --noEmit --esModuleInterop --strict --skipLibCheck --lib es2020,dom --types node`, {
        stdio: 'pipe'
      });
    } catch (error: unknown) {
      const output = this.extractCommandError(error);
      errors.push(`COMPILATION ERROR: ${output}`);
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  private safeRegex(pattern: string, errors: string[]): RegExp | null {
    try {
      return new RegExp(pattern, 'm');
    } catch {
      errors.push(`SUITE ERROR: Invalid regex pattern '${pattern}'`);
      return null;
    }
  }

  private extractCommandError(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const withStderr = error as { stderr?: Buffer; stdout?: Buffer; message?: string };
      if (withStderr.stderr?.length) {
        return withStderr.stderr.toString().trim();
      }
      if (withStderr.stdout?.length) {
        return withStderr.stdout.toString().trim();
      }
      if (withStderr.message) {
        return withStderr.message;
      }
    }

    return 'Unknown TypeScript compilation error';
  }

}
