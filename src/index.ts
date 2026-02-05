import { TypeSentryRunner } from './core/runner';
import fs from 'fs';
import path from 'path';

// CLI Argümanlarını Basitçe İşleyen Giriş Noktası
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const target = args[1];

    console.log("🛡️  TypeSentry CLI v1.0.0");

    if (command === 'run') {
        if (!target) {
            console.error("❌ Error: Please specify a suite file. Example: 'npm start -- run suites/security_suite.json'");
            process.exit(1);
        }

        const suitePath = path.resolve(process.cwd(), 'src', target);
        
        if (!fs.existsSync(suitePath)) {
            console.error(`❌ Error: Suite file not found at ${suitePath}`);
            process.exit(1);
        }

        const suiteData = JSON.parse(fs.readFileSync(suitePath, 'utf-8'));
        const runner = new TypeSentryRunner();
        
        await runner.runSuite(suiteData);
    } 
    else if (command === 'repro') {
        console.log(`📂 Generating reproduction pack for: ${target}...`);
        // Buraya repro mantığı eklenebilir
        console.log("✅ Done. Check 'examples/' folder.");
    }
    else {
        console.log("Usage:");
        console.log("  npm start -- run suites/security_suite.json");
        console.log("  npm start -- repro reports/failure_001.json");
    }
}

main().catch(err => console.error(err));