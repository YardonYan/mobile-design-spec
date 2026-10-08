#!/usr/bin/env node
/**
 * 时效检查 —— 对照 data/provenance.json 的 SLA，报告哪些数据该复核了。
 *
 * 数据会过期。官方的尺寸规范每年动一次，第三方分布统计每季度就变，
 * 社区来源随时失效。这个脚本把「该复核了」变成一条可以定时跑的命令，
 * 而不是靠人记得。
 *
 * 用法 / Usage:
 *   node scripts/check_provenance.mjs              人类可读报告
 *   node scripts/check_provenance.mjs --json       机器可读
 *   node scripts/check_provenance.mjs --warn-days 30   提前多少天开始提醒（默认 30）
 *
 * 退出码: 0 没有过期项 / 1 存在过期项（供 CI 或定时任务判断）
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROV = path.join(ROOT, 'data', 'provenance.json');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const warnIdx = args.indexOf('--warn-days');
const WARN_DAYS = warnIdx !== -1 ? Number(args[warnIdx + 1]) : 30;

if (!fs.existsSync(PROV)) {
  console.error('\n找不到 data/provenance.json。先跑 node tools/build_provenance.mjs 生成。\n');
  process.exit(1);
}

const prov = JSON.parse(fs.readFileSync(PROV, 'utf8'));
const today = new Date(new Date().toISOString().slice(0, 10));

function daysBetween(a, b) {
  return Math.round((b - a) / 86400000);
}

const rows = prov.records.map((r) => {
  const policy = prov.freshnessPolicy[r.sla] ?? { days: 365, label: r.sla };
  if (!r.verifiedAt) {
    return { ...r, slaDays: policy.days, slaLabel: policy.label, ageDays: null, remaining: null, level: 'undated' };
  }
  const ageDays = daysBetween(new Date(r.verifiedAt), today);
  const remaining = policy.days - ageDays;
  const level = remaining < 0 ? 'stale' : remaining <= WARN_DAYS ? 'due-soon' : 'ok';
  return { ...r, slaDays: policy.days, slaLabel: policy.label, ageDays, remaining, level };
});

const counts = rows.reduce((m, r) => ((m[r.level] = (m[r.level] || 0) + 1), m), {});

if (asJson) {
  console.log(JSON.stringify({ checkedAt: today.toISOString().slice(0, 10), warnDays: WARN_DAYS, counts, records: rows }, null, 2));
  process.exit((counts.stale || 0) > 0 ? 1 : 0);
}

const C = process.stdout.isTTY
  ? { r: '\x1b[31m', y: '\x1b[33m', g: '\x1b[32m', d: '\x1b[2m', x: '\x1b[0m' }
  : { r: '', y: '', g: '', d: '', x: '' };

const MARK = { stale: `${C.r}已过期${C.x}`, 'due-soon': `${C.y}即将到期${C.x}`, ok: `${C.g}有效${C.x}`, undated: `${C.d}未标注${C.x}` };

console.log('');
console.log(`数据时效检查  ${today.toISOString().slice(0, 10)}`);
console.log(`${C.d}基准日期 ${prov.dataBaseline?.declaredAt ?? '未声明'}（${prov.dataBaseline?.declaredIn ?? '-'}）；提前 ${WARN_DAYS} 天开始提醒${C.x}`);
console.log('');

const order = { stale: 0, 'due-soon': 1, undated: 2, ok: 3 };
for (const r of [...rows].sort((a, b) => order[a.level] - order[b.level] || (b.ageDays ?? -1) - (a.ageDays ?? -1))) {
  const age = r.ageDays === null ? '  -  ' : `${String(r.ageDays).padStart(4)}d`;
  const rem = r.remaining === null ? '' : r.remaining < 0 ? `超期 ${-r.remaining} 天` : `还剩 ${r.remaining} 天`;
  console.log(`  ${MARK[r.level].padEnd(20)} ${String(r.entityId).padEnd(24)} ${age} / ${String(r.slaDays).padStart(3)}d  ${rem}`);
  if (r.level === 'stale' || r.level === 'due-soon') {
    console.log(`  ${C.d}                        ${r.slaLabel}；来源 ${r.sourceFile}${C.x}`);
  }
}

console.log('');
console.log(`  合计 ${rows.length} 条：${counts.stale || 0} 过期 / ${counts['due-soon'] || 0} 即将到期 / ${counts.undated || 0} 未标注 / ${counts.ok || 0} 有效`);
if ((counts.stale || 0) > 0) {
  console.log('');
  console.log('  有数据已过期。复核后更新 references/ 里对应的「## 来源」日期，再重跑：');
  console.log('    node tools/build_data.mjs && node tools/build_provenance.mjs');
}
console.log('');

process.exit((counts.stale || 0) > 0 ? 1 : 0);
