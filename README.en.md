<div align="center">

<img src="assets/hero.png" alt="mobile-design-spec — one skill for five mobile sizing systems" width="100%">

**One skill for five mobile sizing systems**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen.svg)](#quick-start)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-339933.svg)](package.json)
[![Platforms](https://img.shields.io/badge/platforms-iOS%20·%20Android%20·%20HarmonyOS%20·%20Mini%20Program%20·%20H5-blue.svg)](#coverage)
[![Baseline](https://img.shields.io/badge/data%20baseline-2026--10-informational.svg)](#data-baseline-and-currency)
[![Tests](https://img.shields.io/badge/tests-15%20passing-brightgreen.svg)](#tests-and-ci)

[中文](README.md) · **English**

</div>

---

> Teaches your AI coding agent to fix mobile and responsive sizing on the spot, using the publicly documented numbers from Apple HIG, Material Design 3, HarmonyOS Design, the WeChat Mini Program docs and WCAG — and to state the source behind every single change.

A Qoder / Claude Code Skill that applies real mobile sizing specs (iOS, Android, HarmonyOS, WeChat Mini Program, H5, plus tablet / desktop / TV / wearable) to your code, with a zero-dependency unit converter and spec linter.

## Contents

- [What it solves](#what-it-solves)
- [How it works](#how-it-works)
- [Coverage](#coverage)
- [Unit mapping](#unit-mapping)
- [Quick start](#quick-start)
- [Installation](#installation)
- [Usage](#usage)
- [Lint rule reference](#lint-rule-reference)
- [Data baseline and currency](#data-baseline-and-currency)
- [Why these devices](#why-these-devices)
- [Where the data comes from](#where-the-data-comes-from)
- [Data files and provenance](#data-files-and-provenance)
- [Project structure](#project-structure)
- [Tests and CI](#tests-and-ci)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## What it solves

The same handful of sizing problems keep showing up in mobile UI work:

- A floating bottom button sits under the iPhone home indicator and users simply cannot tap it
- A 24px hit area looks fine on the mockup but the finger misses
- The design is drawn at 402pt, but the code copies Android dp values
- A Mini Program mixes in hard-coded px and the layout falls apart on another device
- HarmonyOS text is written in vp, so it ignores the user's system font scale
- A folded screen or tablet just scales the phone layout up, leaving wide empty margins
- Annotations say "spacing 16" with no unit, platform or density, so the developer guesses

This is not a document you read once and forget. It makes the agent fix the code and report back as *location → old value → new value → basis*:

```
submit-btn height 72rpx -> 88rpx   basis: Mini Program minimum touch target 88x88rpx
                                   (derived from Apple 44pt; no official figure exists)
.page horizontal padding 24rpx -> 32rpx
                                   basis: WeChat recommends 30-32rpx page padding
Text fontSize '16vp' -> 16         basis: only fp follows Configuration.fontSizeScale on HarmonyOS
```

## How it works

<img src="assets/architecture.png" alt="SKILL.md stays in context, references load on demand" width="100%">

SKILL.md is the decision entry point that stays in context (about 150 lines): it identifies the platform, consults the cross-platform table and applies the hard rules. The eight references are only read when actually needed — that is the core advantage of a Skill over a long document. Both scripts run without the LLM, straight from the command line.

## Coverage

| Form factor | Platforms | Key numbers |
| --- | --- | --- |
| Phone | iOS / Android / HarmonyOS / WeChat Mini Program / H5 | Primary canvas 402pt, 411dp, 384vp, 750rpx, 375px |
| Tablet | iPadOS, Android tablets, HarmonyOS tablets | Two-column at ≥ 600dp, 12-column at ≥ 840dp, iPad 820 x 1180pt |
| Foldable and tri-fold | Galaxy Z Fold, Pixel Fold, Mate X / XT Ultimate Design, iPhone Duo | Outer 323 ~ 360, unfolded 440 ~ 1108 |
| Desktop and laptop | macOS, Chromebook, HarmonyOS PC | macOS body text 13pt, Chromebook minimum window 300 x 450dp |
| TV and spatial computing | tvOS, visionOS | tvOS insets 60 vertical / 80 horizontal pt, visionOS 60pt targets |
| Wearable | watchOS, HarmonyOS wearables | Relative scaling 90% ~ 119%, wearable margin 26vp |
| Web | Mobile-first plus desktop breakpoints | Actual thresholds from Tailwind / Bootstrap / MDC |

## Unit mapping

<img src="assets/unit-map.png" alt="iOS pt / Android dp / HarmonyOS vp / Mini Program rpx / H5 px conversion" width="100%">

The same design draft lands on different reference widths and units per platform. `convert.cjs` performs the proportional mapping and also returns rounding advice and physical export sizes. The most useful relationship to memorise:

```
44 pt  ≈  48 dp  ≈  48 vp  ≈  88 rpx  ≈  44 px
```

## Quick start

```bash
git clone https://github.com/YardonYan/mobile-design-spec.git
cd mobile-design-spec
npm test                       # 15 regression tests, no install step needed
node scripts/convert.cjs 88rpx --to pt,dp,vp
node scripts/audit.cjs your-style-directory
```

To use it inside an agent, drop the whole directory into that agent's skills folder — see the next section.

## Installation

### Using the installer (recommended)

The repo ships a zero-dependency installer that copies the skill into the skills directory of each AI app on your machine — no manual copying:

```bash
node tools/install.mjs --list                 # list available targets
node tools/install.mjs --ai workbuddy         # install into WorkBuddy
node tools/install.mjs --ai workbuddy --ai trae-cn --ai codebuddy   # several at once
node tools/install.mjs --ai all               # every target
node tools/install.mjs --ai all --dry-run     # preview only, writes nothing
node tools/install.mjs --ai all --force       # overwrite an existing install
node tools/install.mjs --ai workbuddy --uninstall   # remove
```

Targets verified to exist on a real machine: WorkBuddy, TRAE China edition, CodeBuddy, Claude Code, Codex CLI, OpenClaw, Qwen Code, cc-switch. `cursor` and the generic `.agents` target use the conventional path and have not been verified.

Add `--project` to install into relative directories inside the current project (for example `.workbuddy/skills`), which suits a per-project setup.

The installer uses only the Node standard library, skips `.git`, `node_modules` and caches, and checks that `SKILL.md` sits at the repository root before copying — it aborts with an error if it does not.

### Manual installation

| Environment | How |
| --- | --- |
| Qoder (user level) | Create `~/.qoder-cn/skills`, then link as shown below |
| Qoder (project level) | Copy to `<project>/.qoder/skills/mobile-design-spec` |
| Claude Code | Copy to `~/.claude/skills/mobile-design-spec` (same `SKILL.md` + frontmatter format) |
| Other agents | Inline the `SKILL.md` body into your system prompt or rules file. Neither script depends on any agent environment and can be called stand-alone |

```bash
# Windows: directory junction, no admin rights, edits take effect immediately
mkdir "%USERPROFILE%\.qoder-cn\skills" 2>nul
mklink /J "%USERPROFILE%\.qoder-cn\skills\mobile-design-spec" "<path-you-cloned-to>\mobile-design-spec"

# macOS / Linux
mkdir -p ~/.qoder-cn/skills
ln -s "$PWD/mobile-design-spec" ~/.qoder-cn/skills/mobile-design-spec
```

Run `/skills reload` or restart the session; `mobile-design-spec` should appear in `/skills list`.

## Usage

### 1. Slash command

```
/mobile-design-spec src/pages/order
/mobile-design-spec 16pt
```

### 2. Natural language (matches automatically)

Any of these will trigger the skill. They double as copy for issue reports:

- "The bottom button on this page can't be tapped on iPhone — fix it to spec"
- "Convert the annotations on this mockup into both Android and HarmonyOS sets"
- "Check this Mini Program page for undersized fonts and touch targets"
- "The layout looks empty when the foldable is unfolded — make it two columns per the large-screen spec"
- "What are the resolutions and safe-area heights for the 11-inch and 13-inch iPad?"
- "The bottom of this H5 page is hidden behind Safari's address bar — how should I handle it?"

### 3. Command line

Unit conversion across all five baselines, with physical export sizes:

```console
$ node scripts/convert.cjs 88rpx --to pt,dp,vp
input 88rpx  (source canvas 750, 11.73% of screen width)
converted  pt 47.17 | dp 48.22 | vp 45.06
rounded    pt 47 | dp 48 | vp 45
export     @2x 176px | @3x 264px
touch min  iOS 44pt / Android 48dp / HarmonyOS 48vp (40vp hard floor) / Mini Program 88rpx / H5 44px (WCAG floor 24px)
body min   iOS 15pt / Android 16sp / HarmonyOS 14fp / Mini Program 28rpx / H5 14px
```

Override the baseline for legacy projects: `--ios-width 393 --android-width 360`. Add `--json` for machine-readable output.

Spec lint, supporting `.css .scss .less .wxss .html .vue .swift .kt .ets .xml`:

<img src="assets/audit-preview.png" alt="Example audit.cjs output" width="100%">

```console
$ node scripts/audit.cjs detail.wxss index.html

detail.wxss
  2:1  WARN   [page-padding] .page horizontal padding 24rpx is below 30rpx
        fix: raise to 30rpx or more so content does not touch the screen edge
  3:1  WARN   [touch-target] .buy-btn height 72rpx is below the 88rpx minimum
        fix: use 88rpx, or expand the hit area with padding / a pseudo-element

index.html
  1:1  ERROR  [viewport] missing viewport meta
        fix: add <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

scanned 2 files: 1 error, 2 warn, 1 info
```

Exit code is 1 when any ERROR is found, so it drops straight into CI.

## Lint rule reference

| Rule ID | What it checks | Basis |
| --- | --- | --- |
| `font-min` | Font below the readable floor for the platform | iOS 11pt, Android 12sp, H5 12px, Mini Program 24rpx, HarmonyOS 12fp |
| `font-body` | A 12 ~ 14px size used for body text | Body floors: 14px / 15pt / 16sp / 14fp / 28rpx |
| `touch-target` | Tap target below the minimum | 44pt / 48dp / 48vp (40vp hard floor) / 88rpx / 44px; WCAG 2.5.8 floor 24px |
| `page-padding` | Page container padding touches the edge | 16pt / 16dp / 16vp / 30rpx / 15px |
| `line-height` | Line height below 1.5x the font size | 1.6 ~ 1.8 recommended; WCAG 1.4.8 requires at least 1.5 |
| `wxss-unit` | Fixed px used for layout in a Mini Program | Official guidance now prefers vw; rpx kept for compatibility |
| `android-px` | Raw px in an Android layout | dp is the layout unit |
| `android-font-unit` | Font size given in px or dp | Font size must be sp, otherwise it ignores system scaling |
| `harmony-px` / `harmony-font-unit` | px for layout, vp for fonts on HarmonyOS | vp for layout, fp for fonts |
| `harmony-deprecated` | Global `vp2px()` and friends | Deprecated since API 18; use the `getUIContext()` instance methods |
| `safe-area-bottom` | Fixed bottom element without a safe-area inset | iPhone home indicator 34pt / 68rpx |
| `safe-area` | `ignoresSafeArea()` used in SwiftUI | Backgrounds may bleed; content must stay inside the safe area |
| `harmony-inset` | HarmonyOS avoid-area read without `px2vp()` | `getWindowAvoidArea` returns px |
| `statusbar` | Hard-coded status bar height | It varies by device and must be read at runtime |
| `viewport` | HTML without a viewport meta tag | The MDN standard form, including `viewport-fit=cover` |

The lint is a heuristic first pass: it infers "tappable element" and "page container" from selector names, so it produces both false negatives and false positives. It does not replace reading the code.

## Data baseline and currency

Baseline **2026-10-07**, covering the latest generation from each vendor:

| Device | Form | Numbers |
| --- | --- | --- |
| iPhone 18 Pro Max | Flat 6.9" | 440 x 956 pt, 1320 x 2868 px, @3x, 460ppi (Apple spec page) |
| iPhone 18 Pro | Flat 6.3" | 402 x 874 pt, 1206 x 2622 px, @3x, 460ppi |
| iPhone Air | Flat 6.5" | 420 x 912 pt, 1260 x 2736 px, top safe area 68pt (largest of any iPhone) |
| iPhone Duo | Foldable dual screen | Announced, not on sale; single source only, marked unverified |
| Huawei Mate XT 2 Ultimate Design | Tri-fold | Outer 6.5" 2442 x 1140 / 412ppi; unfolded 10.2" 2232 x 3184 / 382ppi |
| Huawei Mate XTs Ultimate Design | Tri-fold | Single 6.4" / double 7.9" / triple 10.2"; unfolded 1108 x 776 vp |
| Huawei MateBook Fold Ultimate Design | Foldable laptop | Unfolded 18" 3296 x 2472; logical resolution not published |
| Huawei Mate 80 Pro Max / Pura 90 Pro Max | Flat | 1320 x 2848 / 1308 x 2880 px, 377 x 814 / 374 x 823 vp |
| Pixel 11 / 11 Pro / 11 Pro XL | Flat | 1080 x 2424 / 1280 x 2856 / 1344 x 2992 px |
| Galaxy S26 Ultra | Flat | 3120 x 1440 px, about 498ppi, 411dp layout width at default density |
| iPad Pro 13 (M5) | Tablet | 1032 x 1376 pt, 2064 x 2752 px, @2x |

It also reflects several spec changes: iOS 26 raised the top safe area on Dynamic Island devices (59 → 62pt), Apple HIG no longer specifies a fixed iOS navigation bar height, the Material 3 top app bar went from 56dp to 64dp, WeChat now officially prefers vw for Mini Programs, edge-to-edge became non-optional in Android 16, and Android targetSdk 36 forces resizability at ≥600dp.

Update policy: after a new device ships, numbers are re-checked against the official spec page; every reference records its retrieval date. The most common request in issues has been "device X is out of date" — please open one.

The baseline date appears in the README, in SKILL.md and at the end of every reference; update all of them together.

## Why these devices

The table is a curated set, not an exhaustive one. Public distribution data drives the choices:

| Basis | Data | What it decides |
| --- | --- | --- |
| StatCounter global mobile viewport top 6 (2026-09) | 414x896 13.35%, 360x800 7.54%, 384x832 7.10%, 390x844 6.05%, 393x873 4.18%, 360x780 3.39% — about 42% combined | Phone widths: 360 / 384 / 390 / 393 / 414 |
| Counterpoint 2026 Q2 China | Huawei 23% first, Apple 18%; HarmonyOS at 24% overtook iOS at 18% in the same quarter | HarmonyOS is included at no lower priority than Android |
| Apple official (App Store transacting devices, 2026-06) | iOS 26 on 79% of all devices, 86% of devices from the last four years | Covering the last four iPhone generations is enough |
| Huawei official (2026-10-01) | 90 million HarmonyOS devices; 6.1.1 on 86.82% of the installed base | Treat NEXT 5.x / 6.x as the target |
| StatCounter global desktop viewport (2026-09) | 1920x1080 28.07%, 1536x864 10.00%, 1366x768 7.95% | Desktop breakpoints and container caps |

Two measurement traps worth stating plainly:

- StatCounter's "resolution" is the CSS viewport in pixels, not the physical panel. The top entry, 414x896, is the logical width of an older iPhone and cannot be compared against 2856x1320.
- Google's official API distribution dashboard is an interactive chart with no numeric export, so Android version share has to cite third-party transcriptions of that chart with a snapshot date. WeChat has never published device distribution for Mini Programs, which is why that platform does not rely on a per-device table — 750rpx always equalling the screen width *is* the adaptation mechanism.

## Where the data comes from

Four tiers, in decreasing order of trust:

| Tier | Content | How it is used |
| --- | --- | --- |
| Official primary | Apple HIG and spec pages, m3.material.io, androidx token sources, developer.huawei.com, developers.weixin.qq.com, MDN, WCAG, Huawei consumer spec pages | Usable as hard constraints |
| Official transcription | Android version distribution, HarmonyOS version share (media transcribing Huawei developer data monthly) | Cited with a "transcribed" note and a snapshot date |
| Third-party statistics | StatCounter, DeviceAtlas, Screen Size Checker, ios-resolution, Use Your Loaf | For picking typical values and cross-checking; conflicts are listed both ways |
| Community experience | 88rpx navigation bar, 100rpx TabBar, rail 80dp, drawer 360dp, iPhone Duo figures | Clearly labelled, never used as a hard rule |

Every value also carries a confidence marker: measured (stated officially), derived (resolution divided by density), or unverified (single source). Items where no official figure exists are collected in the "no official figure" section at the end of `references/multi-device.md` — left blank rather than invented.

Upstream errors that have been corrected are recorded in the errata sections of `ios.md` and `miniprogram.md`, including the iPhone 15 Plus logical size (428 x 926 → 430 x 932), the WeChat TabBar icon unit (rpx → px) and the Material 2 56dp top bar.

## Data files and provenance

Beyond the human-readable `references/`, the repo carries a machine-readable layer: the CSVs under `data/`, plus a `provenance.json` recording sources and currency.

### How data/ is produced

**The CSVs are generated from `references/`, not maintained by hand.** Every number should have exactly one source; keeping two copies in sync by hand drifts sooner or later.

```bash
npm run data          # regenerate data/*.csv from the tables in references/*.md
npm run data:check    # verify only; exit code 1 if they differ
```

| File | Content | Rows |
| --- | --- | --- |
| `devices-iphone.csv` | Per-model iPhone parameters | 19 |
| `devices-ipad.csv` | Per-model iPad parameters | 5 |
| `devices-android.csv` | Per-device Android parameters | 20 |
| `devices-harmonyos.csv` | Per-model HarmonyOS parameters | 18 |
| `baselines.csv` | Design baselines for the five platforms | 5 |
| `device-selection-basis.csv` | Why these devices were chosen | 5 |

Each row carries a stable business key `id` (derived from the model name) and a `status` column:

| status | Meaning | Marker in the source text |
| --- | --- | --- |
| `official` | Stated directly in an official table | none |
| `measured` | Measured on a real device | 实测 |
| `derived` | Resolution divided by density | 推算 |
| `unverified` | Single source or community data — verify on a real device before use | 未验证 |
| `not-found` | No official figure currently exists | 未查到 / 未收录 / 未公布 |

### Freshness SLA

Data expires and memory is not a reliable reminder. `data/provenance.json` records a source, a verification date and a review window for every dataset:

| Class | Window | Applies to |
| --- | --- | --- |
| `officialSpec` | 365 days | Official spec pages and official design docs |
| `distributionStats` | 90 days | Third-party distribution statistics — they shift quarterly |
| `communitySource` | 30 days | Community or single-source data |

Check it with:

```bash
npm run provenance:check            # per-record age and days remaining
npm run provenance:check -- --json  # machine-readable, for scheduled jobs
npm run data:verify                 # all three checks in one go — usable in CI
```

Exit code is 1 when any dataset is overdue. After re-verifying, update the date in the relevant `references/` section and rerun `npm run data && npm run provenance`.

`provenance.json` is generated too (`npm run provenance`) and should not be edited by hand.

## Project structure

```
mobile-design-spec/
├── SKILL.md                    Decision entry: platform detection, cross-platform table, hard rules
├── README.md  README.en.md  LICENSE  package.json
├── assets/                     Images used by the READMEs
├── data/                       Machine-readable data, generated from references/, do not edit by hand
│   ├── devices-*.csv           Per-device parameters for four platforms
│   ├── baselines.csv           Design baselines for the five platforms
│   ├── device-selection-basis.csv  Rationale for device selection
│   └── provenance.json         Sources, verification dates and freshness SLA
├── tools/
│   ├── install.mjs             Install into each AI app's skills directory
│   ├── build_data.mjs          references → data/*.csv
│   ├── build_provenance.mjs    references → provenance.json
│   └── gen_readme_images.py    Generates the README images
├── references/                 Loaded on demand, each with sources and retrieval dates
│   ├── devices.md              Per-device tables + rationale for device selection
│   ├── multi-device.md         Tablet / macOS / visionOS / watchOS / tvOS / Chromebook / HarmonyOS PC
│   ├── ios.md  android.md  harmonyos.md  miniprogram.md  h5.md
│   └── code-patterns.md        Problem and corrected patterns across five stacks
├── scripts/
│   ├── convert.cjs             Cross-platform conversion + export scale
│   ├── audit.cjs               Spec lint, 16 rule families
│   ├── check_provenance.mjs    Freshness check
│   └── selftest.mjs            Regression tests
└── tests/fixtures/             Positive and negative lint fixtures
```

SKILL.md stays in context (about 150 lines), references load on demand, and the scripts run without entering the context at all — that is the core advantage of a Skill over a long document.

`tests/fixtures/` contains **deliberately incorrect examples** used by the regression tests. Running `node scripts/audit.cjs .` from the repository root will scan them and report findings; that is expected, not a bug. To check your own code, point it at a directory such as `node scripts/audit.cjs src/`.

## Tests and CI

```console
$ npm test
# tests 15
# pass 15
# fail 0
```

The 15 tests cover the official shorthand relationships for conversion (pt × 2 = rpx on a 375 canvas, 88rpx = 44px, 1pt @3x = 3px) and a positive and negative case for every lint rule family.

Wiring it into GitHub Actions:

```yaml
name: design-spec
on: [pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node scripts/audit.cjs src/   # exit code 1 on ERROR, blocking the PR
      - run: npm run data:verify           # fails when data/ has drifted from references/, or data is overdue
```

`data:verify` runs three checks in one pass: whether the CSVs still match `references/`, whether `provenance.json` still matches `references/`, and whether any dataset has passed its review window. Failing any of the three sets exit code 1.

## Known limitations

- The lint is heuristic. It infers semantics from selector names and will miss poorly named code. It also makes no visual judgement, so it cannot tell you whether spacing *looks* right.
- Safe-area and status-bar heights change with OS versions. The values in the tables are references for design work; code must read them at runtime.
- For HarmonyOS smart screens and wearables, HarmonyOS PC window limits, iPad sidebar width and the macOS minimum window size, no official figures could be found. The repository documents that absence rather than guessing.
- WeChat Mini Programs render through ArkWeb on HarmonyOS, whose CSS support differs from Skyline. Only the known cross-renderer differences are listed.
- The device tables are a 2026-10 snapshot and need re-checking over time.

The freshness check (`npm run provenance:check`) reports the following, listed here plainly rather than hidden:

- The most recent date in the sources section of `references/h5.md` is 2025-09-15, past its 90-day review window. The H5 breakpoint and type-scale figures come from MDN and WCAG, whose guidance changes slowly — but the citation itself is overdue.
- `references/code-patterns.md` has no sources section, so its freshness cannot be determined automatically. It lists pattern comparisons per stack — experiential content rather than official figures, which is why it was never given sources; but without sources it cannot enter the provenance chain.

Neither has been "fixed": updating a date requires an actual review, and moving a number to make the check go green would defeat the purpose.

## Troubleshooting

### Installed, but the skill never fires

Check three things, in order:

1. **Is `SKILL.md` at the top level of the skill directory?** The correct shape is `<app-skills-dir>/mobile-design-spec/SKILL.md`. If cloning or unzipping added an extra layer (`mobile-design-spec/mobile-design-spec/SKILL.md`), the app will not find it.
2. **Restart the app.** Most apps scan the skills directory only at startup.
3. **Is that directory the one the app actually scans?** Run `node tools/install.mjs --list`; targets marked as verified were confirmed to exist.

### Cloning or unzipping left an extra directory layer

That happens when you run `git clone` inside a directory that already has the same name. The installer avoids the whole issue:

```bash
node tools/install.mjs --ai workbuddy
```

It resolves the nesting and the destination directory name for you.

### The installer says it cannot find `SKILL.md` at the repository root

It checks this before copying, because most AI apps only recognise the `skill-directory/SKILL.md` shape. If you see this error you ran the installer from the wrong place — it must run from the repository root and locates `SKILL.md` itself.

### `npm test` fails with `spawnSync ... EBUSY`

```
error: 'spawnSync C:\...\node.exe EBUSY'
code: 'EBUSY'
```

The self-test spawns child processes to run `convert.cjs` and `audit.cjs`, which restricted execution environments (sandboxed command channels, for example) refuse. This is not a code problem. To confirm the repo itself is healthy, call the two commands directly:

```bash
node scripts/convert.cjs 16pt                     # should print multi-platform conversions
node scripts/audit.cjs tests/fixtures/bad.css     # should report 3 WARNs
```

If those produce output, the repo is fine — the environment simply will not let it fork.

### `audit.cjs` exited with code 1 — did it crash?

No. Exit code 1 means it found ERROR-level issues; that is a CI convention, deliberately failing the job. Only ERRORs set exit code 1 — `warn` and `info` do not.

### Conversions do not match the design file

Conversions are relative to the source design width, which defaults to the iOS baseline of 402. If your design file uses a different width, every result shifts. Override it:

```bash
node scripts/convert.cjs 16pt --from-width 375
```

You can also override a single platform's baseline with `--ios-width`, `--android-width`, `--mp-width` or `--h5-width`.

### The lint reports nothing, but it looks wrong to the eye

The lint is heuristic — it infers intent from selector names, so unconventional naming slips through, and it makes no visual judgement at all (it cannot tell whether spacing "feels" right). In those cases treat its output as a starting point and rely on manual review.

## Contributing

Good reasons to open an issue or PR:

1. New device specifications (please include the official spec page link)
2. An official document has changed its guidance (include link and retrieval date)
3. A lint rule false positive or false negative (include a minimal reproduction file)
4. You found an official source for something this repository marks as unverified or not found
5. A new platform or stack (Flutter, uni-app, Kotlin Multiplatform, and so on)

Data change workflow: update the relevant reference and its source date → sync the cross-platform table in `SKILL.md` → run `npm test`.

## License

**Apache-2.0** — see [LICENSE](LICENSE). Copyright in the specification values belongs to the original sources: Apple, Google, Huawei, Tencent, W3C and MDN. This repository only organises them and implements the conversion.

> **Licence change**: this repository was previously MIT. It moved to Apache-2.0 on 2026-10-08 to match the author's other skill repositories. Compared with MIT, Apache-2.0 adds an explicit patent grant and requires modified files to carry notices of change.
>
> The change applies to new versions only — copies distributed before it remain under MIT.
