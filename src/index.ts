import fs from 'fs';
import path from 'path';
import { MockMode, TypeSentryRunner } from './core/runner';
import { TestSuite } from './types';

function printUsage() {
  console.log('Usage:');
  console.log('  npm start -- run suites/security_suite.json [--mock-mode=mixed|pass|fail]');
  console.log('  npm start -- run src/suites/security_suite.json --mock-mode=pass');
}

function resolveSuitePath(target: string): string {
  const directPath = path.resolve(process.cwd(), target);
  const srcPrefixedPath = path.resolve(process.cwd(), 'src', target);

  if (fs.existsSync(directPath)) {
    return directPath;
  }

  if (fs.existsSync(srcPrefixedPath)) {
    return srcPrefixedPath;
  }

  throw new Error(`Suite file not found. Tried:\n- ${directPath}\n- ${srcPrefixedPath}`);
}

function readSuite(filePath: string): TestSuite {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const suite = JSON.parse(raw) as TestSuite;

  if (!suite?.suite_id || !suite?.name || !Array.isArray(suite?.cases)) {
    throw new Error('Invalid suite format. Required fields: suite_id, name, cases[].');
  }

  return suite;
}

function parseMockMode(args: string[]): MockMode {
  const modeArg = args.find((arg) => arg.startsWith('--mock-mode='));
  const mode = modeArg?.split('=')[1] as MockMode | undefined;

  if (!mode) {
    return 'mixed';
  }

  if (mode !== 'pass' && mode !== 'fail' && mode !== 'mixed') {
    throw new Error(`Invalid mock mode '${mode}'. Use pass, fail, or mixed.`);
  }

  return mode;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const target = args[1];

  console.log('🛡️  TypeSentry CLI v1.2.0');

  if (command !== 'run') {
    printUsage();
    process.exit(command ? 1 : 0);
  }

  if (!target) {
    console.error("❌ Error: Please specify a suite file. Example: 'npm start -- run suites/security_suite.json'");
    process.exit(1);
  }

  try {
    const suitePath = resolveSuitePath(target);
    const suiteData = readSuite(suitePath);
    const runner = new TypeSentryRunner(parseMockMode(args.slice(2)));
    const summary = await runner.runSuite(suiteData);

    if (summary.failed > 0) {
      process.exitCode = 1;
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Error: ${message}`);
    process.exit(1);
  }
}

main();
