import fs from 'fs';
import path from 'path';

export class Reporter {
    static async generateReproPack(testCase: any, code: string, errors: string[]) {
        // Hata raporunu kaydedecek klasör adı (Tarih damgasıyla)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const dirName = path.join('examples', `repro_pack_${testCase.id}_${timestamp}`);
        
        // Klasörü oluştur
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }

        // Dosyaları yaz
        fs.writeFileSync(path.join(dirName, 'prompt.txt'), testCase.prompt);
        fs.writeFileSync(path.join(dirName, 'generated_code.ts'), code);
        
        const reportContent = `# Failure Report: ${testCase.id}\n\n**Constraints:**\n${JSON.stringify(testCase.constraints || [], null, 2)}\n\n## Errors Detected:\n${errors.map(e => `- ${e}`).join('\n')}`;
        fs.writeFileSync(path.join(dirName, 'analysis_report.md'), reportContent);
        
        console.log(`\n📂 🚨 FAILURE CAPTURED! Artifacts saved to: ${dirName}`);
    }
}