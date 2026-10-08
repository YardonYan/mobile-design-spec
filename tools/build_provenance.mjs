#!/usr/bin/env node
/**
 * 生成 data/provenance.json —— 每个数据集的来源、核验日期与时效 SLA。
 *
 * 同样遵循「只有一个真相源」：来源信息从 references/*.md 的「## 来源」小节抽取，
 * 不手工抄写。给数据加来源时改 references，然后重跑本脚本。
 *
 * 用法 / Usage:
 *   node tools/build_provenance.mjs           生成 data/provenance.json
 *   node tools/build_provenance.mjs --check   只校验，不写文件
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'provenance.json');
const CHECK = process.argv.includes('--check');

/**
 * 时效策略：多久需要复核一次。
 * 按数据性质和来源权威度分档，避免「官方规格页」和「社区单来源」用同一个期限。
 */
const FRESHNESS_POLICY = {
  officialSpec: { days: 365, label: '官方规格页或官方设计文档' },
  distributionStats: { days: 90, label: '第三方分布统计，季度会变' },
  communitySource: { days: 30, label: '社区或单一来源，随时可能失效' },
};

/** 需要跟踪时效的数据文件，及其 SLA 分档。 */
const DATA_FILES = [
  { file: 'data/devices-iphone.csv', kind: 'device-table', platform: 'ios', sla: 'officialSpec' },
  { file: 'data/devices-ipad.csv', kind: 'device-table', platform: 'ios', sla: 'officialSpec' },
  { file: 'data/devices-android.csv', kind: 'device-table', platform: 'android', sla: 'officialSpec' },
  { file: 'data/devices-harmonyos.csv', kind: 'device-table', platform: 'harmonyos', sla: 'officialSpec' },
  { file: 'data/baselines.csv', kind: 'baseline', platform: 'all', sla: 'officialSpec' },
  { file: 'data/device-selection-basis.csv', kind: 'selection-basis', platform: 'all', sla: 'distributionStats' },
];

/** 平台参考文档，同样要跟踪时效。 */
const REFERENCE_FILES = [
  'references/devices.md',
  'references/ios.md',
  'references/android.md',
  'references/harmonyos.md',
  'references/miniprogram.md',
  'references/h5.md',
  'references/multi-device.md',
  'references/code-patterns.md',
];

function readCsv(file) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) return null;
  const lines = fs.readFileSync(abs, 'utf8').trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const si = header.indexOf('status');
  const tally = {};
  if (si >= 0) {
    for (const line of lines.slice(1)) {
      const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) || [];
      const cell = (cells[si] || '').replace(/[",]/g, '').trim();
      if (cell) tally[cell] = (tally[cell] || 0) + 1;
    }
  }
  return { rowCount: lines.length - 1, statusTally: tally };
}

/**
 * 抽取 markdown 里所有 YYYY-MM-DD，返回不晚于今天的最大者（= 最近一次核验）。
 *
 * 必须排除未来日期：文档里会出现「iPhone Duo 已官宣 (2026-10-16 预售)」这类
 * 未来事件日期，直接取最大值会把它当成核验日期，算出负数年龄。
 */
const TODAY = new Date().toISOString().slice(0, 10);

function latestDate(text) {
  const all = (text.match(/\d{4}-\d{2}-\d{2}/g) || []).filter((d) => d <= TODAY);
  if (!all.length) return null;
  return all.sort().at(-1);
}

/** 解析「## 来源」小节的列表项，每条抽掉链接后保留文字与 URL。 */
function parseSources(md) {
  const idx = md.lastIndexOf('## 来源');
  if (idx === -1) return [];
  const body = md.slice(idx);
  const out = [];
  for (const line of body.split(/\r?\n/)) {
    const t = line.trim();
    if (!t.startsWith('- ')) continue;
    const text = t.slice(2).trim();
    const urls = [...text.matchAll(/\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
    const label = text
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    out.push({ text: label, urls, date: latestDate(text) });
  }
  return out;
}

/** 从 references/devices.md 里读显式声明的数据基准日期。 */
function declaredBaseline() {
  const p = path.join(ROOT, 'references/devices.md');
  if (!fs.existsSync(p)) return null;
  const m = fs.readFileSync(p, 'utf8').match(/数据基准日期[:：]\s*(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}

function build() {
  const baseline = declaredBaseline();
  const records = [];

  for (const d of DATA_FILES) {
    const csv = readCsv(d.file);
    if (!csv) continue;
    const md = fs.readFileSync(path.join(ROOT, 'references/devices.md'), 'utf8');
    records.push({
      entityKind: d.kind,
      entityId: path.basename(d.file, '.csv'),
      sourceFile: d.file,
      generatedFrom: 'references/devices.md',
      platform: d.platform,
      sla: d.sla,
      verifiedAt: baseline,
      rowCount: csv.rowCount,
      statusTally: csv.statusTally,
      sources: parseSources(md).filter((s) => s.date),
    });
  }

  for (const rel of REFERENCE_FILES) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const md = fs.readFileSync(abs, 'utf8');
    const srcs = parseSources(md);
    // 文件自己声明了基准日期就用它，否则从来源小节的日期推断。
    const declared = md.match(/数据基准日期[:：]\s*(\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
    records.push({
      entityKind: 'reference-doc',
      entityId: path.basename(rel, '.md'),
      sourceFile: rel,
      sla: rel === 'references/devices.md' ? 'officialSpec' : 'distributionStats',
      verifiedAt: declared ?? latestDate(md),
      verifiedAtBasis: declared ? '文件内声明的数据基准日期' : '来源小节里最近的一个日期',
      sourceCount: srcs.length,
      sources: srcs.filter((s) => s.date),
    });
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString().slice(0, 10),
    note: '本文件由 tools/build_provenance.mjs 从 references/*.md 生成，不要手工编辑。',
    freshnessPolicy: FRESHNESS_POLICY,
    dataBaseline: { declaredAt: baseline, declaredIn: 'references/devices.md' },
    records,
  };
}

function main() {
  const data = build();
  const json = JSON.stringify(data, null, 2) + '\n';
  const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;

  console.log('');
  const tallyOf = (r) =>
    r.statusTally
      ? Object.entries(r.statusTally).map(([k, v]) => `${k} ${v}`).join(' / ')
      : `${r.sourceCount ?? 0} 条来源`;

  for (const r of data.records) {
    console.log(`  ${r.entityKind.padEnd(15)} ${String(r.entityId).padEnd(26)} 核验 ${r.verifiedAt ?? '未标注'}  ${tallyOf(r)}`);
  }
  console.log('');

  if (CHECK) {
    if (existing !== json) {
      console.log('data/provenance.json 与 references/ 不一致。跑 node tools/build_provenance.mjs 重新生成。\n');
      process.exit(1);
    }
    console.log('data/provenance.json 与 references/ 完全一致。\n');
    return;
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, json, 'utf8');
  console.log(`已写入 ${path.relative(ROOT, OUT)}，共 ${data.records.length} 条记录。\n`);
}

main();
