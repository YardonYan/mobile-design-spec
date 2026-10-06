---
name: mobile-design-spec
description: 把 iOS、Android、HarmonyOS、微信小程序、H5 五套移动端尺寸规范落到代码，并覆盖平板、折叠屏、桌面、车机与大屏等扩展形态。用于编写或修改移动端与响应式页面 (CSS/WXSS/SCSS/HTML/SwiftUI/Jetpack Compose/ArkTS .ets/Android XML)、逐机型查询屏幕参数与安全区高度、适配 iPad 与 macOS 和 Chromebook 和 tvOS 与 visionOS 与 watchOS、处理折叠屏与三折叠的多态布局、适配刘海屏和手势区、在 pt/dp/sp/vp/fp/lpx/rpx/px/rem/vw/dvh 之间换算、定切图倍率、做设计稿标注、检查触控热区和字号下限、按 WCAG 2.2 校验可点区域。数值取自 Apple HIG、Material Design 3、HarmonyOS Design、微信小程序文档、MDN 与 WCAG, 机型与份额数据基准 2026-10。
argument-hint: <文件或目录路径, 或尺寸值如 16pt>
---

# 移动端尺寸规范落地

## Overview

五套平台的尺寸规则集中在一个 skill 里, 用来改掉移动端代码里那些"看着差不多"的数值: 触控热区不够、内容贴屏幕边、底部按钮被手势区挡住、字号低于可读下限、单位用错平台。每个改动都要能说出依据哪条规则、来自哪个官方口径。

## 何时使用

- 新写或修改移动端页面、组件、样式文件
- 查某个机型的逻辑尺寸、密度、状态栏和安全区高度
- 处理刘海屏、灵动岛、底部手势条、微信胶囊按钮的遮挡问题
- 一个设计稿要出 iOS、Android、鸿蒙、小程序、H5 多套标注或切图
- 尺寸单位换算: pt、dp、sp、vp、fp、lpx、rpx、px、rem、vw、dvh
- 适配折叠屏、三折叠、平板、Chromebook、鸿蒙 PC、智慧屏、车机
- 做 UI 走查, 检查字号、行高、间距、可点区域是否达标
- 定响应式断点、容器最大宽度和多栏布局切换阈值

## 工作流程

### 1. 判定平台

按文件特征判断, 判不准就问一句:

| 线索 | 平台 | 读哪个 reference |
| --- | --- | --- |
| `.wxss`、`rpx`、`wx.` API、`<view>` | 微信小程序 | references/miniprogram.md |
| `.swift`、`VStack`、`Color` | iOS / iPadOS | references/ios.md |
| `.kt` + Compose、`.xml` + `android:` 命名空间 | Android | references/android.md |
| `.ets`、`@Component`、`vp` / `fp`、`getWindowAvoidArea` | HarmonyOS | references/harmonyos.md |
| `.css`/`.scss`/`.less`、`@media`、`viewport` | H5 | references/h5.md |
| `.vue` | 看 style 块用 rpx 还是 px, 分别按小程序或 H5 处理 | 对应两个 |
| 具体机型、分辨率、安全区数值 | 任意 | references/devices.md |
| `sizeClass`、`regular`、`NavigationSplitView`、`FoldingFeature`、`WindowSizeClass`、`@container`、`GridRow columns` 分档 | 平板 / 折叠 / 桌面 / TV / 穿戴 | references/multi-device.md |

手机端按前六个文件处理; 一旦目标形态离开直板手机 (iPad、折叠内屏、Chromebook、鸿蒙 PC、智慧屏、Apple TV、Watch、Vision Pro), 必须再读 multi-device.md, 那里的数值和手机端不通用 (例如 visionOS 可点区域是 60pt、tvOS 正文最小 23pt、Chromebook 窗口最小 300 x 450dp)。

跨平台项目同时读多个, 用下面的速查表对齐。

### 2. 取值与换算

不要心算跨平台数值, 用脚本:

```bash
node scripts/convert.cjs 16pt                    # 一个值换算到五套基准
node scripts/convert.cjs 88rpx --to dp,vp,px     # 指定目标单位
node scripts/convert.cjs 16pt --ios-width 393    # 老项目按自己的画布覆盖基准
node scripts/convert.cjs 24px --json             # 机器可读
```

换算按"占屏宽比例"做等比映射, 默认主稿宽度: iOS 402pt、Android 411dp、HarmonyOS 384vp、小程序 750rpx、H5 375px。切图物理像素按源逻辑值乘倍率。

各平台的触控和字号下限是各自的规则, 不是等比换算出来的 (88rpx 名义上等于 44pt, 按 402pt 基准等比算出来是 47pt)。定热区直接取平台规则值。

### 3. 改代码

按 references/code-patterns.md 里对应技术栈的问题写法与修正写法改。改前先确认原代码是不是有意为之 (1px 细线、需要物理像素精度的描边、写死胶囊位置以对齐设计稿), 是的话保留并在汇报里说明。

### 4. 走查

改完跑一遍脚本, 处理剩余命中项或说明为什么不改:

```bash
node scripts/audit.cjs src/            # 扫目录
node scripts/audit.cjs app.wxss --json # 单文件, 机器可读
```

`audit.cjs` 是启发式第一遍过滤: 它按选择器名猜"可点元素""页面容器", 会有漏报和误报, 不替代读代码。有 ERROR 时退出码为 1。

### 5. 汇报

改动清单按"位置 → 原值 → 新值 → 依据"给出, 依据指到具体规则:

```
submit-btn 高度 72rpx → 88rpx   依据: 小程序最小触控 88 x 88rpx (由 Apple 44pt 推得, 官方无明文)
.page 左右边距 24rpx → 32rpx    依据: 微信推荐页面内容左右边距 30 ~ 32rpx
Text fontSize '16vp' → 16       依据: 鸿蒙 fp 才跟随 Configuration.fontSizeScale 缩放
```

## 跨平台速查表

| 对比项 | iOS | Android | HarmonyOS | 小程序 | H5 |
| --- | --- | --- | --- | --- | --- |
| 主稿宽度 | 402 x 874 pt | 411 x 891 dp | 384 x 832 vp (建议值) | 750rpx 全宽 | 375px 全宽 |
| 下限校验 | 390pt | 360dp | 346vp | 窄屏配媒体查询 | 320px |
| 尺寸单位 | pt | dp / sp | vp / fp / lpx | rpx 或 vw | px / rem / vw / dvh |
| 切图倍率 | @2x / @3x | @2x / @3x | 按 density, 关键图标矢量化 | @2x | @2x / @3x |
| 状态栏 | 44 ~ 62pt 运行时取 | 运行时 inset | 运行时 getWindowAvoidArea | 动态获取 | 无 (全屏) |
| 顶部栏 | 44pt 框架默认 | 64dp (M3 small) | 顶边距 36vp | 88rpx 经验值 | 自定义 |
| 底部栏 | 49pt + 安全区 (框架默认) | 64dp (Tall 80) | 页签 40 ~ 70vp + 手势区 | 100rpx + 安全区 | 自定义 |
| 最小触控 | 44 x 44pt | 48 x 48dp | 48vp 推荐 / 40vp 硬性 | 88 x 88rpx | 44px 建议 / 24px WCAG |
| 正文下限 | 15pt (body 17pt) | 16sp (bodyLarge) | 14 ~ 16fp | 28rpx | 14px |
| 左右边距 | 16 ~ 20pt | ≥ 16dp | 16vp (折叠 24 / 平板 32) | 30 ~ 32rpx | 15 ~ 20px |
| 系统字体 | SF Pro | Roboto / Noto Sans CJK | HarmonyOS Sans | 跟随系统 | 跟随系统 |
| 断点口径 | 尺寸类; 400 / 600pt (折叠屏建议) | <600 / 600~840 / ≥840dp | <320 / 320~600 / 600~840 / ≥840vp | 媒体查询 | 576 / 768 / 992 / 1200px |

## 硬性红线

不分平台, 冲突时以最严格的为准:

1. 触控热区: 主操作至少 44pt / 48dp / 48vp / 88rpx / 44px; 鸿蒙硬性下限 40vp, WCAG 2.2 底线 24 CSS px, visionOS 要 60 x 60pt。视觉尺寸不足时用 padding 或 `responseRegion` / 伪元素撑开
2. 左右边距 16 起步, 内容不贴屏幕边缘
3. 安全区一定留出来, 特别是底部手势区。inset 数值一律运行时读取, 不写死常量
4. 正文不小于 14px / 15pt / 16sp / 14fp / 28rpx; 12px 一档只用于辅助说明文字
5. 行高正文至少 1.5 倍, 推荐 1.6 ~ 1.8
6. 单位用对平台: Android 布局不用 px, 鸿蒙字体不用 vp, 小程序布局不用固定 px, iOS 标注必须带 pt
7. 标注写清单位、平台、基准宽度、切图倍率、留白算不算在内
8. 结论在真机上看: 至少覆盖最小屏 (360dp / 390pt / 346vp) 和最大屏 (折叠内屏、Pro Max、平板)
9. 大屏不是放大版手机布局: Android targetSdk 36 起在 sw ≥ 600dp 上强制可缩放 (忽略方向与比例限制并禁用 letterbox), 写死 `screenOrientation` 或比例的页面会被判布局缺陷

## 常见坑

- 把 px 和 pt / dp / vp / rpx 混用, 不同平台的"1"不是一回事
- 忘记底部安全区, 悬浮按钮"怎么都按不到"; 或者把某台机型的 inset 当常量
- 字号太小、行间距太紧, 设计师屏幕大不代表用户也是
- 只出一个机型的设计稿, 折叠屏和平板展开态直接崩
- 切图标注不清, 单位、平台、倍率、留白范围缺一项就返工
- 用旧基准: 393pt 和 360x800dp 都是上一代画布, M2 的 56dp 顶栏也已被 M3 的 64dp 取代
- targetSdk 36 起 Android 边到边不可关闭, 还在用 `windowOptOutEdgeToEdgeEnforcement` 的页面必须改
- 拿手机端的字号和触控下限去套 TV 与 Vision Pro, 那两个形态的下限高得多 (tvOS 正文 29pt、visionOS 可点 60pt)

## 数据基准与维护

- 数据基准日期 2026-10-07。机型、系统版本和官方数值会变, 用之前留意 references 里标的抓取日期。
- 各 reference 里的标注约定: `实测` = 官方文档或规格页给出的值; `推算` = 由分辨率和密度算出; `未验证` = 单一来源或社区经验值, 不要当硬约束写进代码。
- 机型表是精选而不是全量, 选取依据 (StatCounter 视口分布、Counterpoint 中国份额、Apple 与华为官方版本占比) 写在 devices.md 开头, 含口径坑: StatCounter 的分辨率是 CSS 视口不是面板像素, 微信从未公开过设备分布数据。
- 官方没给数值的项目集中列在 multi-device.md 末尾的"官方未给数值"一节, 不要臆造填充。
- 每个 reference 末尾有来源清单和日期, 更新数据时同步改这一节和 SKILL.md 的速查表, 然后跑 `npm test`。
- 原始参考文档《移动端设计规范合集》的三处已修正错误记录在 ios.md 和 miniprogram.md 的勘误小节。

## Resources

- references/devices.md: 逐机型参数表 (iPhone / iPad / Android / HarmonyOS 的逻辑尺寸、物理分辨率、倍率、ppi、安全区)、机型选取依据、设计稿基准汇总
- references/multi-device.md: 平板、macOS、visionOS、watchOS、tvOS、Android 大屏与 Chromebook、鸿蒙 PC 与智慧屏与穿戴、桌面 Web 断点与容器查询
- references/ios.md: 安全区分档、iOS 26 变化、SF Pro 完整字号行高表
- references/android.md: M3 组件尺寸、Type Scale、窗口尺寸类别、边到边强制
- references/harmonyos.md: vp / fp / lpx 定义、GridRow 断点、间距与圆角 token、避让区 API
- references/miniprogram.md: rpx 与 vw 口径、胶囊按钮、安全区、鸿蒙上的小程序
- references/h5.md: 视口单位支持矩阵、断点、WCAG 触控要求、框架默认值
- references/code-patterns.md: CSS / WXSS / SwiftUI / Compose / ArkTS 的问题写法与修正写法对照
- scripts/convert.cjs: 跨平台尺寸换算与切图倍率
- scripts/audit.cjs: 按规范走查样式与界面代码, 输出位置、问题、修正建议
- scripts/selftest.mjs + tests/fixtures/: 两个脚本的回归测试, `npm test` 运行
