import fs from 'fs';
import path from 'path';
import { TestCase } from '../types';

export class Reporter {
  static async generateReproPack(testCase: TestCase, code: string, errors: string[]) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dirName = path.join('examples', `repro_pack_${testCase.id}_${timestamp}`);

    fs.mkdirSync(dirName, { recursive: true });
    fs.writeFileSync(path.join(dirName, 'prompt.txt'), testCase.prompt, 'utf-8');
    fs.writeFileSync(path.join(dirName, 'generated_code.ts'), code, 'utf-8');

    const reportContent = [
      `# Failure Report: ${testCase.id}`,
      '',
      `**Prompt**: ${testCase.prompt}`,
      '',
      '## Constraints',
      JSON.stringify(testCase.constraints || [], null, 2),
      '',
      '## Required Patterns',
      JSON.stringify(testCase.required_patterns || [], null, 2),
      '',
      '## Forbidden Patterns',
      JSON.stringify(testCase.forbidden_patterns || [], null, 2),
      '',
      '## Errors Detected',
      ...errors.map((error) => `- ${error}`)
    ].join('\n');

    fs.writeFileSync(path.join(dirName, 'analysis_report.md'), reportContent, 'utf-8');
    console.log(`\n📂 🚨 FAILURE CAPTURED! Artifacts saved to: ${dirName}`);
  }
}
