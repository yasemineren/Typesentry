import { OpenAI } from 'openai'; // Mocklayabilirsin veya gerçek kullanabilirsin
import { Evaluator } from '../evaluators/static_analysis';
import { Reporter } from '../reporters/markdown';

export class TypeSentryRunner {
    private evaluator: Evaluator;

    constructor() {
        this.evaluator = new Evaluator();
    }

    async runSuite(suite: any) {
        console.log(`🚀 Starting Suite: ${suite.name}`);
        
        for (const testCase of suite.cases) {
            console.log(`🧪 Testing Case: ${testCase.id}`);
            
            // 1. Prompt the Model (Simulated for GitHub Demo)
            const modelOutput = await this.mockLLMCall(testCase.prompt);
            
            // 2. Extract Code Block
            const code = this.extractCode(modelOutput);
            
            // 3. Run Checks (Compiler, Linter, Security Regex)
            const result = await this.evaluator.evaluate(code, testCase);
            
            // 4. Handle Failure
            if (!result.passed) {
                console.error(`❌ FAILURE DETECTED: ${testCase.id}`);
                await Reporter.generateReproPack(testCase, code, result.errors);
            } else {
                console.log(`✅ PASSED: ${testCase.id}`);
            }
        }
    }

    private extractCode(output: string): string {
        const match = output.match(/```typescript([\s\S]*?)```/);
        return match ? match[1].trim() : '';
    }

    // GitHub'da kodun çalışması için API key gerekmesin diye mock data
    private async mockLLMCall(prompt: string): Promise<string> {
        // Simulating a common LLM mistake (SQL Injection)
        if (prompt.includes("SQL query")) {
            return "```typescript\nconst query = 'SELECT * FROM users WHERE email = ' + email;\n```";
        }
        return "```typescript\nconsole.log('Valid code');\n```";
    }
}