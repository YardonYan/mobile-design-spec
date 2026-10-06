#!/usr/bin/env node
'use strict';

// 移动端尺寸换算: pt / dp / sp / vp / fp / lpx / rpx / px / rem / vw 互转 + 切图倍率
// 用法: node convert.cjs 16pt [--to vp,rpx] [--scale 2,3] [--json]
// 基准宽度对应 2026-10 的机型分布, 见 references/devices.md

const UNITS = ['pt', 'dp', 'sp', 'vp', 'fp', 'lpx', 'rpx', 'px', 'rem', 'vw', '%'];

const DEFAULT_WIDTHS = { ios: 402, android: 411, harmony: 384, mp: 750, h5: 375, lpx: 720 };

const SOURCE_WIDTH_KEY = {
  pt: 'ios',
  dp: 'android',
  sp: 'android',
  vp: 'harmony',
  fp: 'harmony',
  lpx: 'lpx',
  rpx: 'mp',
  px: 'h5',
  rem: 'h5',
  vw: 'h5',
  '%': 'h5',
};

function parseArgs(argv) {
  const opts = {
    to: UNITS,
    scale: [2, 3],
    root: 16,
    widths: { ...DEFAULT_WIDTHS },
    json: false,
    value: null,
    unit: null,
    fromWidth: null,
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--to') opts.to = String(argv[++i]).split(/[,\s]+/).filter(Boolean);
    else if (a === '--scale') opts.scale = String(argv[++i]).split(/[,\s]+/).map(Number);
    else if (a === '--root') opts.root = Number(argv[++i]);
    else if (a === '--from-width') opts.fromWidth = Number(argv[++i]);
    else if (a === '--ios-width') opts.widths.ios = Number(argv[++i]);
    else if (a === '--android-width') opts.widths.android = Number(argv[++i]);
    else if (a === '--harmony-width') opts.widths.harmony = Number(argv[++i]);
    else if (a === '--mp-width') opts.widths.mp = Number(argv[++i]);
    else if (a === '--h5-width') opts.widths.h5 = Number(argv[++i]);
    else if (a === '--lpx-width') opts.widths.lpx = Number(argv[++i]);
    else if (a === '--json') opts.json = true;
    else if (a === '--help' || a === '-h') opts.help = true;
    else positional.push(a);
  }
  const raw = positional.join(' ');
  const m = raw.match(/(-?\d+(?:\.\d+)?)\s*(pt|dp|sp|vp|fp|lpx|rpx|rem|px|vw|%)?/i);
  if (m) {
    opts.value = Number(m[1]);
    opts.unit = (m[2] || 'pt').toLowerCase();
  }
  return opts;
}

function r2(n) {
  return Math.round(n * 100) / 100;
}

function convert(opts) {
  const { value, unit } = opts;
  const fromKey = SOURCE_WIDTH_KEY[unit];
  const fromWidth = opts.fromWidth || opts.widths[fromKey];
  const frac = value / fromWidth;

  const logical = {
    pt: frac * opts.widths.ios,
    dp: frac * opts.widths.android,
    sp: frac * opts.widths.android,
    vp: frac * opts.widths.harmony,
    fp: frac * opts.widths.harmony,
    lpx: frac * opts.widths.lpx,
    rpx: frac * opts.widths.mp,
    px: frac * opts.widths.h5,
    rem: (frac * opts.widths.h5) / opts.root,
    vw: frac * 100,
    '%': frac * 100,
  };

  // 切图物理像素按源平台逻辑值乘倍率: 16pt @3x = 48px
  const slices = {};
  for (const s of opts.scale) slices[`@${s}x`] = r2(value * s);

  return { fromWidth, frac, logical, slices };
}

function fmt(n) {
  if (!Number.isFinite(n)) return 'n/a';
  return n >= 100 ? String(Math.round(n)) : String(r2(n));
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || opts.value === null) {
    console.log(`用法: node convert.cjs <值><单位> [选项]

  node convert.cjs 16pt
  node convert.cjs 88rpx --to dp,px
  node convert.cjs 16pt --scale 2,3 --json

单位: ${UNITS.join(' ')} (省略时按 pt)
  pt iOS / dp sp Android / vp fp HarmonyOS / lpx 鸿蒙比例单位 / rpx 微信小程序 / px rem vw H5

选项:
  --to <units>          目标单位, 逗号分隔, 默认全部
  --from-width <n>      覆盖源设计稿宽度
  --ios-width <n>       iOS 基准宽, 默认 402
  --android-width <n>   Android 基准宽, 默认 411
  --harmony-width <n>   HarmonyOS 基准宽, 默认 384
  --mp-width <n>        小程序基准宽, 默认 750
  --h5-width <n>        H5 基准宽, 默认 375
  --lpx-width <n>       lpx 的 designWidth, 默认 720
  --scale <list>        切图倍率, 默认 2,3
  --root <px>           rem 基准字号, 默认 16
  --json                机器可读输出

基准宽度对应 2026-10 的机型分布, 老项目按自己的画布传 --ios-width 393 之类覆盖。`);
    process.exit(opts.help ? 0 : 1);
  }

  const { fromWidth, frac, logical, slices } = convert(opts);
  const targets = opts.to.filter((u) => UNITS.includes(u) && u !== opts.unit);

  if (opts.json) {
    console.log(JSON.stringify({
      input: { value: opts.value, unit: opts.unit, designWidth: fromWidth },
      widthFraction: r2(frac * 100) / 100,
      logical: Object.fromEntries(targets.map((u) => [u, r2(logical[u])])),
      rounded: Object.fromEntries(targets.map((u) => [u, Math.round(logical[u])])),
      slicePx: slices,
    }));
    return;
  }

  const pairs = targets.map((u) => `${u} ${fmt(logical[u])}`);
  const rounded = targets.map((u) => `${u} ${Math.round(logical[u])}`);
  console.log(`输入 ${opts.value}${opts.unit}  (源设计稿宽 ${fromWidth}, 占屏宽 ${r2(frac * 100)}%)`);
  if (pairs.length) {
    console.log(`等比换算   ${pairs.join(' | ')}`);
    console.log(`取整建议   ${rounded.join(' | ')}`);
  }
  console.log(`切图物理   ${Object.entries(slices).map(([k, v]) => `${k} ${v}px`).join(' | ')}`);
  console.log('触控下限  iOS 44pt / Android 48dp / 鸿蒙 48vp 推荐 40vp 硬性 / 小程序 88rpx / H5 44px (WCAG 底线 24px)');
  console.log('正文下限  iOS 15pt / Android 16sp / 鸿蒙 14fp / 小程序 28rpx / H5 14px');
}

main();
