#!/usr/bin/env node
'use strict';

// 移动端尺寸规范走查: 对 CSS/WXSS/HTML/Swift/Kotlin/ArkTS(.ets)/Android XML 做启发式检查
// 用法: node audit.cjs <文件或目录> [...] [--json] [--max N]
// 定位是第一遍过滤, 不替代人工读代码; 命中后按提示回到对应 reference 核对

const fs = require('fs');
const path = require('path');

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', 'target', 'Pods', '.cache', 'unpackage']);
const EXTS = new Set(['.css', '.scss', '.less', '.wxss', '.html', '.vue', '.swift', '.kt', '.ets', '.xml']);

// 阈值来自规范本身, 见 references/ 各平台文件
const T = {
  web: { fontMin: 12, fontBody: 14, touch: 44, padX: 15, rpx: false },
  mp: { fontMin: 24, fontBody: 28, touch: 88, padX: 30, rpx: true },
  android: { touch: 48, padX: 16, fontMin: 12 },
  harmony: { touch: 48, hardTouch: 40, padX: 16, fontMin: 12, fontBody: 14 },
  ios: { touch: 44, padX: 16, fontMin: 11, fontBody: 15 },
};

const CLICKABLE_RE = /\b(btn|button|tab|icon|close|switch|link|action|cell|item|tap|click|submit|delete|like|share|more|nav)\b/i;
const CONTAINER_RE = /\b(page|screen|container|wrapper|wrap|content|main|body|layout|card|section|view)\b/i;

function parseArgs(argv) {
  const opts = { targets: [], json: false, max: 200 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--max') opts.max = Number(argv[++i]);
    else if (a === '--help' || a === '-h') opts.help = true;
    else opts.targets.push(a);
  }
  return opts;
}

function walk(target, acc) {
  let st;
  try { st = fs.statSync(target); } catch { return acc; }
  if (st.isFile()) { if (EXTS.has(path.extname(target))) acc.push(target); return acc; }
  for (const name of fs.readdirSync(target)) {
    const full = path.join(target, name);
    const s = fs.statSync(full);
    if (s.isDirectory()) { if (!SKIP_DIRS.has(name)) walk(full, acc); }
    else if (EXTS.has(path.extname(name)) && !/\.(min|bundle)\.(css|wxss|scss|less)$/.test(name)) acc.push(full);
  }
  return acc;
}

// ---------- CSS 解析 (只取深度 0 的声明, 保留行号) ----------

function parseRules(text) {
  const rules = [];
  const stack = [];
  let i = 0, line = 1, segStart = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === '/' && text[i + 1] === '*') {
      const e = text.indexOf('*/', i + 2);
      const stop = e < 0 ? text.length : e + 2;
      for (let k = i; k < stop; k++) if (text[k] === '\n') line++;
      i = stop; segStart = i; continue;
    }
    if (c === '/' && text[i + 1] === '/') {
      const e = text.indexOf('\n', i);
      i = e < 0 ? text.length : e; segStart = i; continue;
    }
    if (c === '{') {
      const sel = text.slice(segStart, i).replace(/\s+/g, ' ').trim();
      stack.push({ sel, bodyStart: i + 1, line });
      i++; segStart = i; continue;
    }
    if (c === '}') {
      const top = stack.pop();
      if (top) {
        const chain = stack.map((s) => s.sel).concat(top.sel).filter((s) => s && !s.startsWith('@'));
        rules.push({ selector: chain[chain.length - 1] || top.sel, line: top.line, decls: parseDecls(text.slice(top.bodyStart, i), top.line) });
      }
      i++; segStart = i; continue;
    }
    i++;
  }
  return rules;
}

function parseDecls(body, startLine) {
  const out = [];
  let buf = '', line = startLine, depth = 0, bufLine = startLine;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === '\n') { line++; continue; }
    if (c === '{') { depth++; buf = ''; continue; }
    if (c === '}') { depth = Math.max(0, depth - 1); buf = ''; continue; }
    if (depth === 0 && c === ';') {
      push(out, buf, bufLine); buf = ''; bufLine = line; continue;
    }
    if (!buf.trim()) bufLine = line;
    buf += c;
  }
  if (buf.trim()) push(out, buf, bufLine);
  return out;
}

function push(out, raw, ln) {
  const s = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  if (!s || !s.includes(':')) return;
  const idx = s.indexOf(':');
  const prop = s.slice(0, idx).trim().toLowerCase();
  const value = s.slice(idx + 1).trim();
  if (/^--/.test(prop) || !prop) return;
  out.push({ prop, value, line: ln });
}

// ---------- 数值工具 ----------

function lengths(value) {
  const re = /(-?\d+(?:\.\d+)?)\s*(px|rpx|dp|sp|pt|rem|em|%)/gi;
  const out = [];
  let m;
  while ((m = re.exec(value))) out.push({ n: Number(m[1]), unit: m[2].toLowerCase(), raw: m[0] });
  return out;
}

function horizontalOf(value) {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[1];
  if (parts.length === 3) return parts[1];
  return parts[1];
}

function firstNum(value) {
  const l = lengths(value);
  return l.length ? l[0] : null;
}

// ---------- 规则 ----------

function auditStyle(file, text, kind) {
  const lim = T[kind];
  const unit = lim.rpx ? 'rpx' : 'px';
  const own = (l) => l && l.unit === unit;
  const out = [];
  const rules = parseRules(text);
  const hasSafeAreaBottom = /env\(\s*safe-area-inset-bottom|constant\(\s*safe-area-inset-bottom/.test(text);
  const isWxss = kind === 'mp';

  for (const r of rules) {
    const decls = r.decls;
    const sel = r.selector;

    for (const d of decls) {
      // 字号下限
      if (d.prop === 'font-size') {
        const l = firstNum(d.value);
        if (own(l)) {
          if (l.n < lim.fontMin) out.push({ line: d.line, level: 'error', rule: 'font-min', msg: `font-size ${l.raw} 低于最小可读字号 ${lim.fontMin}${unit}`, fix: `提到 ${lim.fontMin}${unit} 以上` });
          else if (l.n < lim.fontBody && !/footnote|caption|tip|label|desc|sub|hint|time|note/i.test(sel)) out.push({ line: d.line, level: 'info', rule: 'font-body', msg: `font-size ${l.raw} 只适用于辅助说明文字`, fix: `正文用 ${lim.fontBody}${unit} 以上` });
        }
      }

      // 触控热区
      if ((d.prop === 'height' || d.prop === 'min-height') && CLICKABLE_RE.test(sel)) {
        const l = firstNum(d.value);
        if (own(l) && l.n < lim.touch) {
          out.push({ line: d.line, level: 'warn', rule: 'touch-target', msg: `${sel} 高度 ${l.raw} 小于触控最小值 ${lim.touch}${unit}`, fix: `改成 ${lim.touch}${unit}, 或用 padding / 伪元素撑开热区` });
        }
      }

      // 页面左右边距
      if ((d.prop === 'padding' || d.prop === 'padding-left' || d.prop === 'padding-right' || d.prop === 'padding-inline') && CONTAINER_RE.test(sel)) {
        const raw = d.prop === 'padding' ? horizontalOf(d.value) : d.value;
        const l = firstNum(raw);
        if (own(l) && l.n > 0 && l.n < lim.padX) {
          out.push({ line: d.line, level: 'warn', rule: 'page-padding', msg: `${sel} 左右边距 ${l.raw} 小于 ${lim.padX}${unit}`, fix: `提到 ${lim.padX}${unit} 以上, 内容别贴屏幕边` });
        }
      }

      // 行高压太紧
      if (d.prop === 'line-height') {
        const fsz = decls.find((x) => x.prop === 'font-size');
        const unitVal = firstNum(d.value);
        if (unitVal && (unitVal.unit === 'px' || unitVal.unit === 'rpx') && fsz) {
          const f = firstNum(fsz.value);
          if (f && (f.unit === unitVal.unit) && unitVal.n < f.n * 1.5) out.push({ line: d.line, level: 'warn', rule: 'line-height', msg: `${sel} 行高 ${unitVal.raw} 不足字号 ${f.raw} 的 1.5 倍`, fix: '正文行高至少 1.6 倍' });
        } else if (/^[\d.]+$/.test(d.value.trim()) && Number(d.value) > 0 && Number(d.value) < 1.5) {
          out.push({ line: d.line, level: 'info', rule: 'line-height', msg: `${sel} 行高 ${d.value.trim()} 倍偏紧`, fix: '正文用 1.6 ~ 1.8' });
        }
      }

      // 小程序里用 px 做布局
      if (isWxss && /(^|[^-\w])(width|height|padding|margin|top|left|right|bottom|gap|border-radius|font-size)(-|\b)/.test(d.prop)) {
        for (const l of lengths(d.value)) {
          if (l.unit === 'px' && l.n > 1 && !/border(-top|-right|-bottom|-left)?\b/.test(d.prop) && !/box-shadow|text-shadow/.test(d.value)) {
            out.push({ line: d.line, level: 'warn', rule: 'wxss-unit', msg: `${sel} 的 ${d.prop}: ${l.raw} 用了固定 px`, fix: '小程序布局单位用 rpx 或官方优先推荐的 vw, 1px 细线除外' });
            break;
          }
        }
      }

      // 底部固定元素缺安全区
      if (d.prop === 'position' && /fixed/.test(d.value) && !hasSafeAreaBottom) {
        const bottom = decls.find((x) => x.prop === 'bottom');
        if (bottom) {
          out.push({ line: d.line, level: 'warn', rule: 'safe-area-bottom', msg: `${sel} 是底部 fixed 元素但文件内没有 safe-area-inset-bottom`, fix: '加 env(safe-area-inset-bottom), 否则 iPhone 手势区会挡住按钮' });
        }
      }
    }

    // 顶部 fixed 写死状态栏高度
    if (isWxss && decls.some((d) => d.prop === 'position' && /fixed/.test(d.value)) && decls.some((d) => d.prop === 'top' && /px/.test(d.value))) {
      out.push({ line: r.line, level: 'info', rule: 'statusbar', msg: `${sel} 用固定 top 值贴顶`, fix: '状态栏高度因设备而异, 用 wx.getSystemInfoSync() 动态取' });
    }
  }

  if (/\.html?$/i.test(file) && !/name=["']viewport["']/i.test(text)) {
    out.push({ line: 1, level: 'error', rule: 'viewport', msg: '缺少 viewport meta', fix: '加 <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' });
  }

  return out;
}

function auditSwift(file, text) {
  const out = [];
  text.split(/\r?\n/).forEach((ln, idx) => {
    const line = idx + 1;
    let m;
    if ((m = ln.match(/\.font\(\s*\.system\(\s*size:\s*(\d+(?:\.\d+)?)/))) {
      const n = Number(m[1]);
      if (n < T.ios.fontMin) out.push({ line, level: 'error', rule: 'font-min', msg: `字号 ${n}pt 低于最小可读 11pt`, fix: '提到 11pt 以上, 正文建议 15pt' });
    }
    if ((m = ln.match(/\.padding\(\s*\.horizontal\s*,\s*(\d+(?:\.\d+)?)/))) {
      const n = Number(m[1]);
      if (n < T.ios.padX) out.push({ line, level: 'warn', rule: 'page-padding', msg: `左右边距 ${n}pt 小于 ${T.ios.padX}pt`, fix: '内容区左右取 16 ~ 20pt' });
    }
    if ((m = ln.match(/\.frame\([^)]*(?:min)?Height:\s*(\d+(?:\.\d+)?)/))) {
      const n = Number(m[1]);
      if (n < T.ios.touch) out.push({ line, level: 'info', rule: 'touch-target', msg: `frame 高度 ${n}pt 小于 44pt`, fix: '可点元素至少 44 x 44pt' });
    }
    if (/\.ignoresSafeArea\(/.test(ln)) {
      out.push({ line, level: 'info', rule: 'safe-area', msg: '使用了 ignoresSafeArea', fix: '确认只有背景铺满, 内容仍在安全区内' });
    }
  });
  return out;
}

function auditCompose(file, text) {
  const out = [];
  text.split(/\r?\n/).forEach((ln, idx) => {
    const line = idx + 1;
    let m;
    if ((m = ln.match(/\b(?:height|width|size)\(\s*(\d+(?:\.\d+)?)\s*\)/))) {
      out.push({ line, level: 'error', rule: 'android-px', msg: `尺寸 ${m[1]} 是裸数值 (px)`, fix: '布局用 dp' });
    }
    if ((m = ln.match(/fontSize\s*=\s*(\d+(?:\.\d+)?)\.dp/))) {
      out.push({ line, level: 'error', rule: 'android-font-unit', msg: `字号 ${m[1]}.dp`, fix: '字体用 sp, 否则不跟随系统字号' });
    }
    if ((m = ln.match(/(?:padding|horizontal)\s*=\s*(\d+(?:\.\d+)?)\.dp/))) {
      const n = Number(m[1]);
      if (n < T.android.padX) out.push({ line, level: 'warn', rule: 'page-padding', msg: `左右边距 ${n}dp 小于 ${T.android.padX}dp`, fix: '内容左右至少 16dp' });
    }
    if ((m = ln.match(/heightIn\(\s*min\s*=\s*(\d+(?:\.\d+)?)\.dp/))) {
      const n = Number(m[1]);
      if (n < T.android.touch) out.push({ line, level: 'info', rule: 'touch-target', msg: `最小高度 ${n}dp 小于 48dp`, fix: '可点元素 48 x 48dp 是 Google 硬性要求' });
    }
    if ((m = ln.match(/(\d+(?:\.\d+)?)\.sp\s*\)\s*$/)) && Number(m[1]) < 12) {
      out.push({ line, level: 'warn', rule: 'font-min', msg: `${m[1]}sp 低于说明文字下限 12sp`, fix: 'Caption 最小 12sp, 正文 16sp' });
    }
  });
  return out;
}

function auditArkTs(file, text) {
  const out = [];
  text.split(/\r?\n/).forEach((ln, idx) => {
    const line = idx + 1;
    let m;
    // 字体单位: 数字默认 fp, 写成 vp / px 就不跟随系统字号
    if ((m = ln.match(/fontSize\(\s*['"](\d+(?:\.\d+)?)(vp|px)['"]\s*\)/))) {
      out.push({ line, level: 'error', rule: 'harmony-font-unit', msg: `字号用了 ${m[2]}: ${m[0].trim()}`, fix: 'fontSize 传数字或 fp, 才会跟随 fontSizeScale 缩放' });
    }
    // 布局单位: 数字默认 vp, 写 px 后缀在鸿蒙上是错的
    if ((m = ln.match(/\.(?:width|height|padding|margin|borderRadius|fontSize)\(\s*['"]?(\d+(?:\.\d+)?)px['"]?\s*[,)]/))) {
      out.push({ line, level: 'error', rule: 'harmony-px', msg: `尺寸用了 px: ${m[0].trim()}`, fix: '布局用 vp (数字默认 vp), px 只用于像素级描边' });
    }
    if ((m = ln.match(/\.fontSize\(\s*(\d+(?:\.\d+)?)\s*[,)]/)) && Number(m[1]) < T.harmony.fontMin) {
      out.push({ line, level: 'warn', rule: 'font-min', msg: `${m[1]}fp 低于说明文字下限 12fp`, fix: 'Caption 最小 12fp, 正文 14 ~ 16fp' });
    }
    if ((m = ln.match(/\.padding\(\s*\{[^}]*?(?:left|right)\s*:\s*(\d+(?:\.\d+)?)/))) {
      const n = Number(m[1]);
      if (n > 0 && n < T.harmony.padX) out.push({ line, level: 'warn', rule: 'page-padding', msg: `左右边距 ${n}vp 小于 ${T.harmony.padX}vp`, fix: '手机屏幕左右官方边距 16vp, 折叠屏 24vp, 平板 32vp' });
    }
    if ((m = ln.match(/\.height\(\s*(\d+(?:\.\d+)?)\s*[,)]/))) {
      const n = Number(m[1]);
      if (n < T.harmony.hardTouch && /Button|onClick|responseRegion|Toggle|Checkbox/.test(ln + text.split(/\r?\n/).slice(idx, idx + 3).join(' '))) {
        out.push({ line, level: 'warn', rule: 'touch-target', msg: `可交互元素高度 ${n}vp 小于官方硬性下限 40vp`, fix: '推荐 48 x 48vp, 不得小于 40 x 40vp, 不足时用 responseRegion 撑开' });
      }
    }
    // 全局单位转换函数自 API 18 废弃
    if (/\b(?:vp2px|px2vp|px2fp|fp2px|lpx2px)\s*\(/.test(ln) && !/getUIContext\(\)/.test(ln) && !/function|const|export/.test(ln)) {
      out.push({ line, level: 'warn', rule: 'harmony-deprecated', msg: '使用了全局单位转换函数', fix: 'API 18 起废弃, 改用 this.getUIContext().px2vp() 等实例接口' });
    }
    // 底部安全区兜底
    if (/TYPE_NAVIGATION_INDICATOR/.test(ln) && !/px2vp/.test(text)) {
      out.push({ line, level: 'info', rule: 'harmony-inset', msg: '读取了避让区但没有 px2vp 转换', fix: 'getWindowAvoidArea 返回 px, 需要转 vp 再用' });
    }
  });
  return out;
}

function auditAndroidXml(file, text) {
  if (!/android:/.test(text)) return [];
  const out = [];
  text.split(/\r?\n/).forEach((ln, idx) => {
    const line = idx + 1;
    let m;
    if ((m = ln.match(/android:(?:layout_)?(?:width|height|margin\w*|padding\w*|minHeight|minWidth)="(\d+(?:\.\d+)?)px"/))) {
      out.push({ line, level: 'error', rule: 'android-px', msg: `${m[0].trim()} 用了 px`, fix: '布局尺寸用 dp' });
    }
    if ((m = ln.match(/android:textSize="(\d+(?:\.\d+)?)(px|dp)"/))) {
      out.push({ line, level: 'error', rule: 'android-font-unit', msg: `字号用了 ${m[2]}`, fix: '字体用 sp' });
    }
    if ((m = ln.match(/android:textSize="(\d+(?:\.\d+)?)sp"/)) && Number(m[1]) < 12) {
      out.push({ line, level: 'warn', rule: 'font-min', msg: `${m[1]}sp 低于说明文字下限 12sp`, fix: 'Caption 最小 12sp, 正文 16sp' });
    }
    if ((m = ln.match(/android:min(?:Height|Width)="(\d+(?:\.\d+)?)dp"/)) && Number(m[1]) < T.android.touch && /Button|ImageButton|ImageView/.test(text)) {
      out.push({ line, level: 'info', rule: 'touch-target', msg: `最小触控 ${m[1]}dp 小于 48dp`, fix: '可点元素 48 x 48dp' });
    }
  });
  return out;
}

function auditFile(file) {
  const ext = path.extname(file).toLowerCase();
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return []; }
  if (ext === '.swift') return auditSwift(file, text);
  if (ext === '.kt') return auditCompose(file, text);
  if (ext === '.ets') return auditArkTs(file, text);
  if (ext === '.xml') return auditAndroidXml(file, text);
  if (ext === '.wxss') return auditStyle(file, text, 'mp');
  if (ext === '.vue') {
    const out = [];
    for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
      const offset = text.slice(0, m.index + m[0].indexOf(m[1])).split('\n').length - 1;
      const kind = /\d+(?:\.\d+)?rpx/.test(m[1]) ? 'mp' : 'web';
      for (const f of auditStyle(file, m[1], kind)) out.push({ ...f, line: f.line + offset });
    }
    return out;
  }
  return auditStyle(file, text, 'web');
}

const LEVELS = { error: 0, warn: 1, info: 2 };
const MARK = { error: 'ERROR', warn: 'WARN ', info: 'INFO ' };

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts.targets.length) {
    console.log(`用法: node audit.cjs <文件或目录> [...] [--json] [--max N]

支持文件: .css .scss .less .wxss .html .vue .swift .kt .ets .xml

检查项:
  字号下限      H5 12px / 小程序 24rpx / iOS 11pt / Android 12sp / 鸿蒙 12fp
  触控热区      H5 44px / 小程序 88rpx / iOS 44pt / Android 48dp / 鸿蒙 48vp 推荐 40vp 硬性
  页面左右边距  H5 15px / 小程序 30rpx / iOS 与 Android 与鸿蒙 16
  行高          正文至少 1.5 倍, 推荐 1.6 ~ 1.8
  单位错用      wxss 固定 px, Android px 与 dp 字号, 鸿蒙 px 布局与 vp 字号
  安全区        底部 fixed 缺 safe-area-inset-bottom, 顶部写死状态栏, 鸿蒙避让区未转 vp
  viewport      html 缺 viewport meta
  废弃 API      鸿蒙全局 vp2px / px2vp (API 18 起废弃)

退出码: 有 ERROR 时为 1。启发式检查, 命中后仍需人工核对。`);
    process.exit(opts.targets.length ? 0 : 1);
  }

  const files = [];
  for (const t of opts.targets) walk(path.resolve(t), files);

  const results = [];
  for (const f of files) {
    const findings = auditFile(f);
    if (findings.length) results.push({ file: f.replace(/\\/g, '/'), findings: findings.sort((a, b) => a.line - b.line) });
  }

  const counts = { error: 0, warn: 0, info: 0 };
  for (const r of results) for (const f of r.findings) counts[f.level]++;

  if (opts.json) { console.log(JSON.stringify({ files: files.length, counts, results }, null, 2)); }
  else {
    let shown = 0;
    for (const r of results) {
      console.log(`\n${path.relative(process.cwd(), r.file) || r.file}`);
      for (const f of r.findings) {
        if (shown++ >= opts.max) { console.log(`\n已截断, 共 ${counts.error + counts.warn + counts.info} 条, 用 --max 调整`); break; }
        console.log(`  ${f.line}:1  ${MARK[f.level]}  [${f.rule}] ${f.msg}`);
        console.log(`        修正: ${f.fix}`);
      }
      if (shown >= opts.max) break;
    }
    console.log(`\n扫描 ${files.length} 个文件: ${counts.error} error, ${counts.warn} warn, ${counts.info} info`);
    if (!counts.error && !counts.warn && !counts.info) console.log('未发现尺寸规范问题。触控热区和安全区仍需真机验证。');
  }
  process.exit(counts.error ? 1 : 0);
}

main();
