const fs = require('fs');
const html = fs.readFileSync('perf/bundle-report.html', 'utf8');
const match = html.match(/window\.chartData\s*=\s*(\[.*?\]);/s);
if (!match) {
  throw new Error('chartData not found');
}
const data = JSON.parse(match[1]);
const modules = [];
const walk = (node, chunk) => {
  const parsed = node.parsedSize || 0;
  const label = node.path || node.label;
  modules.push({ chunk, label, parsed });
  if (Array.isArray(node.groups)) {
    node.groups.forEach((g) => walk(g, node.label || chunk));
  }
};
data.forEach((chunk) => walk(chunk, chunk.label));
modules.sort((a, b) => b.parsed - a.parsed);
const top20 = modules.slice(0, 20);
const libs = {
  'framer-motion': /framer-motion/i,
  swiper: /swiper/i,
  'motion-dom': /motion-dom/i,
  'next runtime chunks': /(next\/dist|next\/shared|react-dom)/i,
};
const dupLines = [];
for (const [name, regex] of Object.entries(libs)) {
  const hits = modules.filter((m) => regex.test(m.label || ''));
  if (hits.length) {
    const chunks = [...new Set(hits.map((h) => h.chunk))];
    const size = hits.reduce((s, h) => s + h.parsed, 0);
    dupLines.push({ name, size, chunks, count: hits.length });
  }
}
const fmtSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(1)} ${units[i]}`;
};
let out = '# Bundle Duplication Findings\n\n## Top 20 Parsed Modules\n';
top20.forEach((m, idx) => {
  out += `${idx + 1}. **${m.label}** (chunk: ${m.chunk}) — ${fmtSize(m.parsed)}\n`;
});
out += '\n## Duplicate Libraries\n';
if (!dupLines.length) {
  out += 'No targeted libraries detected in bundles.\n';
} else {
  dupLines.forEach((d) => {
    out += `- **${d.name}** appears in ${d.chunks.length} chunks (${d.count} modules), total size ${fmtSize(d.size)}. Chunks: ${d.chunks.join(', ')}\n`;
  });
}
fs.writeFileSync('perf/duplicate-findings.md', out);
