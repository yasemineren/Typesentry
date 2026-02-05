import { Evaluator } from '../evaluators/static_analysis';
import { Reporter } from '../reporters/markdown';
import { EvaluationResult, TestCase, TestSuite } from '../types';

export interface SuiteRunSummary {
  suiteId: string;
  suiteName: string;
  total: number;
  passed: number;
  failed: number;
  results: Array<{ caseId: string; result: EvaluationResult }>;
}

export class TypeSentryRunner {
  private evaluator: Evaluator;

  constructor() {
    this.evaluator = new Evaluator();
  }

  async runSuite(suite: TestSuite): Promise<SuiteRunSummary> {
    console.log(`🚀 Starting Suite: ${suite.name}`);

    const summary: SuiteRunSummary = {
      suiteId: suite.suite_id,
      suiteName: suite.name,
      total: suite.cases.length,
      passed: 0,
      failed: 0,
      results: []
    };

    for (const testCase of suite.cases) {
      console.log(`🧪 Testing Case: ${testCase.id}`);

      const modelOutput = await this.mockLLMCall(testCase);
      const code = this.extractCode(modelOutput);
      const result = await this.evaluator.evaluate(code, testCase);

      summary.results.push({ caseId: testCase.id, result });

      if (!result.passed) {
        summary.failed += 1;
        console.error(`❌ FAILURE DETECTED: ${testCase.id}`);
        await Reporter.generateReproPack(testCase, code, result.errors);
      } else {
        summary.passed += 1;
        console.log(`✅ PASSED: ${testCase.id}`);
      }
    }

    console.log(`\n📊 Suite Summary: ${summary.passed}/${summary.total} passed, ${summary.failed} failed.`);
    return summary;
  }

  private extractCode(output: string): string {
    const match = output.match(/```(?:typescript|ts)?\n([\s\S]*?)```/i);
    return match ? match[1].trim() : output.trim();
  }

  private async mockLLMCall(testCase: TestCase): Promise<string> {
    const prompt = testCase.prompt.toLowerCase();

    if (prompt.includes('sql query')) {
      return "```typescript\nconst query = 'SELECT * FROM users WHERE email = ' + email;\n```";
    }

    if (prompt.includes('jwt') || prompt.includes('authorization')) {
      return `\`\`\`typescript
import { Request, Response, NextFunction } from 'express';

export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = auth.slice('Bearer '.length);
  if (!process.env.JWT_SECRET || !token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}
\`\`\``;
    }

    return "```typescript\nexport const ok = true;\n```";
  }
}
