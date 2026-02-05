import { Evaluator } from '../evaluators/static_analysis';
import { Reporter } from '../reporters/markdown';
import { EvaluationResult, TestCase, TestSuite } from '../types';

export type MockMode = 'pass' | 'fail' | 'mixed';

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
  private mockMode: MockMode;

  constructor(mockMode: MockMode = 'mixed') {
    this.evaluator = new Evaluator();
    this.mockMode = mockMode;
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
    if (this.mockMode === 'pass') {
      return this.passingMockOutput(testCase);
    }
    if (this.mockMode === 'fail') {
      return this.failingMockOutput(testCase);
    }

    return testCase.id.endsWith('02') ? this.failingMockOutput(testCase) : this.passingMockOutput(testCase);
  }

  private passingMockOutput(testCase: TestCase): string {
    if (testCase.id === 'SEC-CASE-01') {
      return `\`\`\`typescript
export type Req = { headers: { authorization?: string } };
export type Res = { status: (code: number) => { json: (payload: unknown) => unknown } };
export type Next = () => void;

export function verifyJwt(req: Req, res: Res, next: Next) {
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

    if (testCase.id === 'SEC-CASE-02') {
      return `\`\`\`typescript
export function getUserByEmail(email: string) {
  const query = 'SELECT * FROM users WHERE email = $1';
  return { query, values: [email] };
}
\`\`\``;
    }

    if (testCase.id === 'SEC-CASE-03') {
      return `\`\`\`typescript
declare const bcrypt: {
  hash: (password: string, rounds: number) => Promise<string>;
  compare: (password: string, hash: string) => Promise<boolean>;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
\`\`\``;
    }

    if (testCase.id === 'ENG-CASE-01') {
      return `\`\`\`typescript
export async function fetchWithRetry(urls: string[]): Promise<string[]> {
  const attempt = async (url: string, retry = 2): Promise<string> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('transient');
      return await response.text();
    } catch (error) {
      if (retry === 0) throw error;
      return attempt(url, retry - 1);
    }
  };

  return Promise.all(urls.slice(0, 20).map((url) => attempt(url)));
}
\`\`\``;
    }

    if (testCase.id === 'ENG-CASE-02') {
      return `\`\`\`typescript
interface ApiResult<T> {
  data: T;
  status: number;
}

export async function getJson<T>(url: string, timeoutMs = 1500): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
  const data = (await response.json()) as T;
  return { data, status: response.status };
}
\`\`\``;
    }

    return `\`\`\`typescript
type Event = { idempotencyKey: string; event: string };

export function processEvents(events: Event[]): string[] {
  const processed = new Set<string>();
  const out: string[] = [];
  for (const item of events) {
    if (processed.has(item.idempotencyKey)) continue;
    processed.add(item.idempotencyKey);
    out.push(item.event);
  }
  return out;
}
\`\`\``;
  }

  private failingMockOutput(testCase: TestCase): string {
    if (testCase.id.includes('SEC-CASE-02')) {
      return "```typescript\nexport const query = 'SELECT * FROM users WHERE email = ' + email;\n```";
    }

    return '```typescript\nexport const unsafe: any = null;\n```';
  }
}
