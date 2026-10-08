#!/usr/bin/env node
/**
 * 从 references/*.md 的 markdown 表格抽取机器可读数据，输出到 data/*.csv。
 *
 * 为什么不手工维护 CSV：数字只应该有一个来源。references/ 是唯一真相源，
 * CSV 由它生成，避免出现「文档改了、表没改」的两份数据。
 * 改完 references 后重跑本脚本即可。
 *
 * 用法 / Usage:
 *   node tools/build_data.mjs           生成 data/*.csv
 *   node tools/build_data.mjs --check   只校验，不写文件（CI 用，有差异则退出码 1）
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
const CHECK = process.argv.includes('--check');

/** 要抽取的表：源文件 + 该表上方的一级/二级标题（用于定位，也用于生成溯源锚点）。 */
const TABLES = [
  { out: 'devices-iphone.csv', src: 'references/devices.md', heading: '## iPhone', kind: 'device-table', platform: 'ios', sla: 'officialSpec' },
  { out: 'devices-ipad.csv', src: 'references/devices.md', heading: '## iPad', kind: 'device-table', platform: 'ios', sla: 'officialSpec' },
  { out: 'devices-android.csv', src: 'references/devices.md', heading: '## Android', kind: 'device-table', platform: 'android', sla: 'officialSpec' },
  { out: 'devices-harmonyos.csv', src: 'references/devices.md', heading: '## HarmonyOS', kind: 'device-table', platform: 'harmonyos', sla: 'officialSpec' },
  { out: 'baselines.csv', src: 'references/devices.md', heading: '| 平台 | 主稿 |', kind: 'baseline', platform: 'all', sla: 'officialSpec' },
  { out: 'device-selection-basis.csv', src: 'references/devices.md', heading: '| 依据 | 数据 | 用途 |', kind: 'selection-basis', platform: 'all', sla: 'distributionStats' },
];

/** 把一个单元格里的原始标记映射成统一的状态枚举。 */
function statusOf(cells) {
  const joined = cells.join(' ');
  if (/未验证/.test(joined)) return 'unverified';
  if (/推算/.test(joined)) return 'derived';
  if (/实测/.test(joined)) return 'measured';
  if (/未查到|未收录|未公布/.test(joined)) return 'not-found';
  return 'official';
}

/** 生成稳定业务键：小写、去空格与标点、中文保留，用连字符连接。 */
function slugOf(text) {
  return text
    .toLowerCase()
    .replace(/[()（）【】[\]]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

function csvCell(v) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** 在文件里定位目标表：找到 heading 之后的第一段连续表格行。 */
function findTable(lines, heading) {
  let start = 0;
  if (heading.startsWith('|')) {
    start = lines.findIndex((l) => l.trim().startsWith(heading));
    if (start === -1) throw new Error(`找不到表头 ${heading}`);
  } else {
    const h = lines.findIndex((l) => l.trim() === heading);
    if (h === -1) throw new Error(`找不到标题 ${heading}`);
    start = h;
  }
  let i = start;
  while (i < lines.length && !lines[i].trim().startsWith('|')) i++;
  if (i >= lines.length) throw new Error(`${heading} 之后没有表格`);
  const table = [];
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    table.push(lines[i]);
    i++;
  }
  if (table.length < 3) throw new Error(`${heading} 的表格行数不足（${table.length}）`);
  return table;
}

function build() {
  const results = [];
  for (const spec of TABLES) {
    const abs = path.join(ROOT, spec.src);
    const lines = fs.readFileSync(abs, 'utf8').split(/\r?\n/);
    const table = findTable(lines, spec.heading);

    const header = splitRow(table[0]);
    const rows = table.slice(2).map(splitRow);

    const outHeader = ['id', ...header, 'status', 'platform', 'source'];
    const outRows = rows.map((cells) => {
      const status = statusOf(cells);
      const id = slugOf(cells[0]);
      return [id, ...cells.map(csvCell), status, spec.platform, spec.src];
    });

    const csv = [outHeader.join(','), ...outRows.map((r) => r.join(','))].join('\n') + '\n';
    results.push({ ...spec, csv, rowCount: rows.length, header, statuses: outRows.map((r) => r[outHeader.indexOf('status')]) });
  }
  return results;
}

function main() {
  let results;
  try {
    results = build();
  } catch (e) {
    console.error(`\n抽取失败：${e.message}`);
    console.error('references/ 的结构可能改了，检查上面的表头是否还在。\n');
    process.exit(1);
  }

  if (!CHECK) fs.mkdirSync(DATA_DIR, { recursive: true });

  let drift = 0;
  console.log('');
  for (const r of results) {
    const dest = path.join(DATA_DIR, r.out);
    const existing = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
    const tally = r.statuses.reduce((m, s) => ((m[s] = (m[s] || 0) + 1), m), {});
    const tallyText = Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(' / ');

    if (CHECK) {
      if (existing !== r.csv) {
        console.log(`  差异  ${r.out}  （磁盘上的内容和 references/ 对不上）`);
        drift++;
      } else {
        console.log(`  一致  ${r.out}  ${r.rowCount} 行  ${tallyText}`);
      }
    } else {
      fs.writeFileSync(dest, r.csv, 'utf8');
      console.log(`  写入  ${r.out}  ${r.rowCount} 行  ${tallyText}`);
    }
  }
  console.log('');

  if (CHECK && drift > 0) {
    console.log(`有 ${drift} 个文件与 references/ 不一致。跑 node tools/build_data.mjs 重新生成。`);
    console.log('');
    process.exit(1);
  }
  if (CHECK) console.log('data/ 与 references/ 完全一致。\n');
}

main();
