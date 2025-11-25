const fs = require('fs');
const path = require('path');

const beforeFile = path.join(__dirname, 'lighthouse_reports', 'product-mobile.json');
const afterFile = path.join(__dirname, 'lighthouse_reports', 'product-mobile-after.json');

function getMetrics(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const audits = data.audits;
    return {
        score: data.categories.performance.score * 100,
        fcp: audits['first-contentful-paint'].displayValue,
        lcp: audits['largest-contentful-paint'].displayValue,
        tti: audits['interactive'].displayValue,
        tbt: audits['total-blocking-time'].displayValue,
        cls: audits['cumulative-layout-shift'].displayValue,
        jsSize: (audits['total-byte-weight'].details.items.filter(i => i.url.endsWith('.js')).reduce((acc, i) => acc + i.totalBytes, 0) / 1024).toFixed(2) + ' KB',
    };
}

const before = getMetrics(beforeFile);
const after = getMetrics(afterFile);

console.log(JSON.stringify({ before, after }, null, 2));
