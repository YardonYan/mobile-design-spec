import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const CONVERT = path.join(dir, 'convert.cjs');
const AUDIT = path.join(dir, 'audit.cjs');
const FIX = path.join(dir, '..', 'tests', 'fixtures');

function convert(args) {
  return JSON.parse(execFileSync(process.execPath, [CONVERT, ...args, '--json'], { encoding: 'utf8' }));
}

// audit.cjs 在命中 error 时以 1 退出, 所以这里用 spawnSync 直接读 stdout
function runAudit(files) {
  const r = spawnSync(process.execPath, [AUDIT, ...files, '--json'], { encoding: 'utf8' });
  assert.equal(r.error, undefined, `audit.cjs 启动失败: ${r.error?.message}`);
  return JSON.parse(r.stdout);
}

function audit(...names) {
  return runAudit(names.map((f) => path.join(FIX, f)));
}

const rules = (result) => new Set(result.results.flatMap((r) => r.findings.map((f) => f.rule)));

test('convert: 小程序 750 基准与 H5 375 基准互为两倍', () => {
  assert.equal(convert(['88rpx', '--to', 'px']).logical.px, 44);
  assert.equal(convert(['44px', '--to', 'rpx']).logical.rpx, 88);
});

test('convert: 375 画布下 pt 乘 2 得 rpx (官方速记)', () => {
  assert.equal(convert(['16pt', '--from-width', '375', '--to', 'rpx']).logical.rpx, 32);
});

test('convert: 切图物理像素 = 逻辑值乘倍率', () => {
  assert.equal(convert(['1pt', '--scale', '3']).slicePx['@3x'], 3);
  assert.equal(convert(['16pt', '--scale', '2']).slicePx['@2x'], 32);
});

test('convert: 鸿蒙 vp 与 Android dp 各自按本端基准', () => {
  const r = convert(['48vp', '--to', 'dp,pt']);
  assert.ok(r.logical.dp > 48 && r.logical.dp < 60, `48vp 应略大于 48dp, 实得 ${r.logical.dp}`);
});

test('convert: 未知单位不产出 NaN', () => {
  const r = convert(['10px', '--to', 'rem']);
  assert.ok(Number.isFinite(r.logical.rem));
});

test('audit: wxss 命中字号/触控/边距/单位/安全区五类规则', () => {
  const r = audit('bad.wxss');
  const hit = rules(r);
  for (const k of ['font-min', 'touch-target', 'page-padding', 'wxss-unit', 'safe-area-bottom']) {
    assert.ok(hit.has(k), `缺少规则 ${k}`);
  }
});

test('audit: 合规的 wxss 不产生任何命中', () => {
  const r = audit('good.wxss');
  assert.equal(r.counts.error + r.counts.warn + r.counts.info, 0, JSON.stringify(r.results));
});

test('audit: html 缺 viewport 判 error', () => {
  const r = audit('missing-viewport.html');
  assert.equal(r.counts.error, 1);
  assert.ok(rules(r).has('viewport'));
});

test('audit: css 命中触控与边距与行高', () => {
  const hit = rules(audit('bad.css'));
  for (const k of ['touch-target', 'page-padding', 'line-height']) assert.ok(hit.has(k), `缺少规则 ${k}`);
});

test('audit: swift 命中字号与边距', () => {
  const hit = rules(audit('Bad.swift'));
  assert.ok(hit.has('font-min') && hit.has('page-padding'));
});

test('audit: compose 命中裸 px 与字号单位', () => {
  const hit = rules(audit('Bad.kt'));
  assert.ok(hit.has('android-px') && hit.has('android-font-unit'));
});

test('audit: ArkTS 命中字号单位与布局 px', () => {
  const hit = rules(audit('Bad.ets'));
  assert.ok(hit.has('harmony-font-unit') && hit.has('harmony-px'), [...hit].join(','));
});

test('audit: Android XML 命中 px 布局与字号单位', () => {
  const hit = rules(audit('bad_layout.xml'));
  assert.ok(hit.has('android-px') && hit.has('android-font-unit'));
});

test('audit: 退出码在 error 与 仅 warn 时不同', () => {
  const run = (f) => {
    try { execFileSync(process.execPath, [AUDIT, path.join(FIX, f)], { stdio: 'ignore' }); return 0; }
    catch (e) { return e.status; }
  };
  assert.equal(run('bad.wxss'), 1);
  assert.equal(run('good.wxss'), 0);
});

test('audit: 临时目录不影响结果 (路径解析冒烟)', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'mds-'));
  const file = path.join(tmp, 'x.wxss');
  writeFileSync(file, '.btn { height: 40rpx; }');
  const out = JSON.parse(execFileSync(process.execPath, [AUDIT, file, '--json'], { encoding: 'utf8' }));
  assert.equal(out.counts.warn, 1);
  rmSync(tmp, { recursive: true, force: true });
});
