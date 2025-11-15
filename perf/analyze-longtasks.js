const fs = require('fs');
const traceRaw = JSON.parse(fs.readFileSync('perf/trace-before.json','utf8'));
const traceEvents = Array.isArray(traceRaw) ? traceRaw : (traceRaw.traceEvents || []);
const minTs = traceEvents.reduce((min, e) => (typeof e.ts === 'number' && e.ts < min ? e.ts : min), Number.POSITIVE_INFINITY);
const startTs = Number.isFinite(minTs) ? minTs : 0;
const threshold = 50 * 1000; // microseconds
const markers = [
  { label: 'handleMessage', regex: /handleMessage/i },
  { label: 'animation', regex: /anim/i },
  { label: 'hydration', regex: /hydrat/i },
];
const tasks = [];
for (const e of traceEvents) {
  if (e.name !== 'Task' || e.ph !== 'X') continue;
  if (typeof e.dur !== 'number' || e.dur < threshold) continue;
  const startMs = (e.ts - startTs) / 1000;
  const durationMs = e.dur / 1000;
  let topFunction = 'Task';
  let fileLine = '';
  const stack = e.args && e.args.data && Array.isArray(e.args.data.stackTrace) ? e.args.data.stackTrace : null;
  if (stack && stack.length) {
    const frame = stack.find(f => f.url && !f.url.startsWith('node:internal')) || stack[0];
    topFunction = frame.functionName || '(anonymous)';
    if (frame.url) {
      const parts = [frame.url];
      if (frame.lineNumber != null) parts.push(frame.lineNumber);
      if (frame.columnNumber != null) parts.push(frame.columnNumber);
      fileLine = parts.join(':');
    }
  } else if (e.args && e.args.data && e.args.data.url) {
    fileLine = e.args.data.url;
  }
  const tags = markers.filter(m => m.regex.test(topFunction) || m.regex.test(fileLine)).map(m => m.label);
  if (tags.length) {
    topFunction += ` [${tags.join(', ')}]`;
  }
  tasks.push({ startMs, durationMs, topFunction, fileLine });
}
tasks.sort((a,b)=>a.startMs-b.startMs);
const csvLines = ['start_ms,duration_ms,topFunction,file_line'];
const esc = value => {
  if (!value) return '';
  const str = String(value).replace(/"/g,'""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
};
for (const task of tasks) {
  csvLines.push([
    task.startMs.toFixed(1),
    task.durationMs.toFixed(1),
    esc(task.topFunction),
    esc(task.fileLine),
  ].join(','));
}
fs.writeFileSync('perf/long-tasks.csv', csvLines.join('\n'));
console.log('Long tasks count', tasks.length);
if (tasks.length) {
  console.log('Longest task ms', Math.max(...tasks.map(t=>t.durationMs)).toFixed(1));
}
