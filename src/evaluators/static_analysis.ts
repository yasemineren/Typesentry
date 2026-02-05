import { execSync } from 'child_process';
import fs from 'fs';

export class Evaluator {
    async evaluate(code: string, constraints: any) {
        const errors: string[] = [];

        // 1. Security Pattern Check (Regex)
        if (constraints.forbidden_patterns) {
            for (const pattern of constraints.forbidden_patterns) {
                // Basit bir regex kontrolü
                const regex = new RegExp(pattern);
                if (regex.test(code)) {
                    errors.push(`SECURITY RISK: Forbidden pattern detected: '${pattern}'`);
                }
            }
        }

        // 2. Syntax Check (Try to compile)
        const tempFile = 'temp_check.ts';
        fs.writeFileSync(tempFile, code);
        
        try {
            // tsc --noEmit ile sadece tip kontrolü yap
            execSync(`npx tsc ${tempFile} --noEmit --esModuleInterop`, { stdio: 'pipe' });
        } catch (e: any) {
            errors.push(`COMPILATION ERROR: ${e.stdout?.toString()}`);
        }

        return {
            passed: errors.length === 0,
            errors
        };
    }
}