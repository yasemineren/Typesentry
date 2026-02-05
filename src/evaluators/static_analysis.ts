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
      const regex = new RegExp(pattern, 'm');
      if (regex.test(code)) {
        errors.push(`SECURITY RISK: Forbidden pattern detected: '${pattern}'`);
      }
    }
  }

  private checkRequiredPatterns(code: string, testCase: TestCase, errors: string[]) {
    const requiredPatterns = [
      ...(testCase.required_patterns ?? []),
      ...(testCase.constraints ?? []).filter((constraint) => this.looksLikeRegex(constraint))
    ];

    for (const pattern of requiredPatterns) {
      const regex = new RegExp(pattern, 'm');
      if (!regex.test(code)) {
        errors.push(`QUALITY ISSUE: Required pattern missing: '${pattern}'`);
      }
    }
  }

  private runCompilationCheck(code: string, errors: string[]) {
    const tempFile = path.resolve(process.cwd(), 'temp_check.ts');
    fs.writeFileSync(tempFile, code, 'utf-8');

    try {
      execSync(`npx tsc ${tempFile} --noEmit --esModuleInterop --strict`, { stdio: 'pipe' });
    } catch (error: unknown) {
      const output = error instanceof Error ? error.message : 'Unknown TypeScript compilation error';
      errors.push(`COMPILATION ERROR: ${output}`);
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  private looksLikeRegex(input: string): boolean {
    return /[.*+?^${}()|[\]\\]/.test(input);
  }
}
