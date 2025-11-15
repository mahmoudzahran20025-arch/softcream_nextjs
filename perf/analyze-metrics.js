const fs = require('fs');

const lh = JSON.parse(fs.readFileSync('perf/lh-before.json', 'utf8'));
const traceRaw = JSON.parse(fs.readFileSync('perf/trace-before.json', 'utf8'));
const traceEvents = Array.isArray(traceRaw) ? traceRaw : (traceRaw.traceEvents || []);

const getAuditValue = id => lh.audits && lh.audits[id];
const lcpAudit = getAuditValue('largest-contentful-paint');
const clsAudit = getAuditValue('cumulative-layout-shift');
const lcpMs = lcpAudit?.numericValue || 0;
const clsValue = clsAudit?.numericValue || 0;

let jsBytes = null;
const resourceSummary = getAuditValue('resource-summary');
if (resourceSummary?.details?.items) {
  const scriptRow = resourceSummary.details.items.find(item => item.resourceType?.toLowerCase() === 'script');
  if (scriptRow) jsBytes = scriptRow.transferSize || scriptRow.resourceSize || null;
}
if (jsBytes == null) {
  const totalBytes = getAuditValue('total-byte-weight');
  if (totalBytes?.details?.items) {
    jsBytes = totalBytes.details.items
      .filter(item => (item.resourceType || '').toLowerCase() === 'script' || /\.js(\?|$)/i.test(item.url || ''))
      .reduce((sum, item) => sum + (item.totalBytes || item.transferSize || 0), 0);
  } else if (typeof totalBytes?.numericValue === 'number') {
    jsBytes = totalBytes.numericValue;
  }
}
if (jsBytes == null) jsBytes = 0;

const minTs = traceEvents.reduce((min, e) => (typeof e.ts === 'number' && e.ts < min ? e.ts : min), Number.POSITIVE_INFINITY);
const startTs = Number.isFinite(minTs) ? minTs : 0;
const threshold = 50 * 1000; // 50ms in microseconds
const markers = [
  { label: 'handleMessage', regex: /handleMessage/i },
  { label: 'animation', regex: /anim/i },
  { label: 'hydration', regex: /hydrat/i },
];

const longTasks = traceEvents
  .filter(e => e.name === 'Task' && e.ph === 'X' && typeof e.dur === 'number' && e.dur >= threshold)
  .map(e => {
    const startMs = (e.ts - startTs) / 1000;
    const durationMs = e.dur / 1000;
    let topFunction = 'Task';
    let fileLine = '';
    const stack = e.args?.data?.stackTrace;
    if (Array.isArray(stack) && stack.length) {
      const frame = stack[0];
      topFunction = frame.functionName || '(anonymous)';
      if (frame.url) {
        const line = frame.lineNumber != null ? frame.lineNumber : '';
        fileLine = `${frame.url}${line !== '' ? ':' + line : ''}`;
      }
    } else if (e.args?.data?.url) {
      fileLine = e.args.data.url;
    }
    const tagHits = markers.filter(m => m.regex.test(topFunction) || m.regex.test(fileLine));
    if (tagHits.length) {
      topFunction += ` [${tagHits.map(t => t.label).join(', ')}]`;
    }
    return { startMs, durationMs, topFunction, fileLine };
  });

const longTaskCount = longTasks.length;
const longestTask = longTasks.reduce((max, task) => task.durationMs > max ? task.durationMs : max, 0);

const fmtSize = bytes => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(2)} ${units[unit]}`;
};

const fmtMs = ms => `${(ms / 1000).toFixed(2)} s`;
const metricsMd = [
  '# Before Performance Metrics',
  '',
  `- **Largest Contentful Paint (LCP):** ${fmtMs(lcpMs)}`,
  `- **Cumulative Layout Shift (CLS):** ${clsValue.toFixed(3)}`,
  `- **Total JS Transfer Size:** ${fmtSize(jsBytes)}`,
  `- **Number of Long Tasks (>50ms):** ${longTaskCount}`,
  `- **Longest Single Task Duration:** ${longestTask.toFixed(1)} ms`,
  '',
  '_Source: perf/lh-before.json & perf/trace-before.json_',
  '',
].join('\n');
fs.writeFileSync('perf/before-metrics.md', metricsMd);

const csvLines = ['start_ms,duration_ms,topFunction,file_line'];
longTasks.forEach(task => {
  const esc = value => {
    if (!value) return '';
    const str = String(value).replace(/"/g, '""');
    return str.includes(',') ? `"${str}"` : str;
  };
  csvLines.push([
    task.startMs.toFixed(1),
    task.durationMs.toFixed(1),
    esc(task.topFunction),
    esc(task.fileLine),
  ].join(','));
});
fs.writeFileSync('perf/long-tasks.csv', csvLines.join('\n'));
