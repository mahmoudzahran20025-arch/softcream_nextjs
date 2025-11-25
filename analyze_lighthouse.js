const fs = require('fs');
const path = require('path');

const files = [
    'home-mobile.json',
    'home-desktop.json',
    'product-mobile.json',
    'product-desktop.json'
];

const results = {};

files.forEach(file => {
    const filePath = path.join(__dirname, 'lighthouse_reports', file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const audits = data.audits;
    const categories = data.categories;

    const metrics = {
        score: categories.performance.score * 100,
        fcp: audits['first-contentful-paint'].displayValue,
        lcp: audits['largest-contentful-paint'].displayValue,
        tti: audits['interactive'].displayValue,
        tbt: audits['total-blocking-time'].displayValue,
        cls: audits['cumulative-layout-shift'].displayValue,
        jsSize: (audits['total-byte-weight'].details.items.filter(i => i.url.endsWith('.js')).reduce((acc, i) => acc + i.totalBytes, 0) / 1024).toFixed(2) + ' KB',
        totalRequests: audits['network-requests'].details.items.length,
        opportunities: []
    };

    // Get top 5 opportunities
    const opportunities = Object.values(audits)
        .filter(audit => audit.details && audit.details.type === 'opportunity' && audit.score < 0.9)
        .sort((a, b) => (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0))
        .slice(0, 5)
        .map(op => ({
            title: op.title,
            savings: op.details.overallSavingsMs ? `${op.details.overallSavingsMs.toFixed(0)} ms` : (op.details.overallSavingsBytes ? `${(op.details.overallSavingsBytes / 1024).toFixed(0)} KB` : '')
        }));

    metrics.opportunities = opportunities;
    results[file] = metrics;
});

console.log(JSON.stringify(results, null, 2));
