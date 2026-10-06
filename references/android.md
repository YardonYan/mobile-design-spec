# Android 设计规范

Material Design 3 (含 M3 Expressive 叠加层)。逐机型 dp 分布见 references/devices.md。

## 尺寸单位

- dp (density-independent pixel): 布局和控件尺寸, 不同密度等比缩放
- sp (scale-independent pixel): 字体, 跟随系统字号偏好缩放
- px 只用于位图切图和像素级描边, 不出现在布局属性里

Android 的 1 CSS px = 1 dp, 浏览器上报的视口宽就是 dp 宽, 这条等价关系在混合开发里很有用。

## 设计稿基准

360 x 800 dp 对应的是 2013 ~ 2016 年的 1080p 机型, 现在真实高度已到 891 ~ 923dp。改用双基准:

- 下限校验: 360 x 780 dp (Galaxy S25 一档, 也是布局能压到多窄的底线)
- 主画布: 411 x 891 ~ 412 x 923 dp (Pixel 全系、小米 / 三星高配模式)
- 折叠内屏: 619 ~ 747 dp, 按 expanded 处理
- 三星旗舰系统默认按 1080 级渲染, 真实布局宽常见 384dp, 关键页面上单独验一次

## 密度桶

mdpi 1x / hdpi 1.5x / xhdpi 2x / xxhdpi 3x / xxxhdpi 4x 仍是资源目录的工程口径, 系统按最近的标准桶选图。但真实设备大量落在 420 / 440 / 450 / 500 / 520 / 560dpi, "每桶等比缩放"的推导在这些机器上不成立, 切图按 @2x 和 @3x 出两套即可, 关键图标出矢量或 WebP。

| 密度 | 倍率 | 1dp = ?px | 常见分辨率 |
| --- | --- | --- | --- |
| mdpi | 1x | 1px | 320 x 480 |
| hdpi | 1.5x | 1.5px | 480 x 800 |
| xhdpi | 2x | 2px | 720 x 1280 |
| xxhdpi | 3x | 3px | 1080 x 1920 |
| xxxhdpi | 4x | 4px | 1440 x 2560 |

## Material 3 组件尺寸

M3 Expressive 是叠加层, 没有废弃 M3 基线。下表是 androidx material3 tokens 与 m3.material.io 的当前值, 括号里是被淘汰的 Material 2 数值。

| 组件 | M3 数值 (dp) | 备注 |
| --- | --- | --- |
| 顶部应用栏 small / medium / large | 64 / 112 / 152 | M2 的 56 已过时 |
| 底部应用栏 | 80 | |
| 底部导航栏 | 64 (Tall 80) | M2 的 56 已过时; 激活指示器高 40, 图标 24 |
| 导航栏 rail 展开宽 | 220 ~ 360 | 顶部间距 44 |
| FAB small / regular / medium / large | 40 / 56 / 80 / 96 | M2 无 80 档 |
| 扩展 FAB 高 | 56 / 80 / 96 | |
| 按钮 xsmall ~ xlarge | 32 / 40 / 56 / 96 / 136 | M2 单一 36, M3 基线 40, Expressive 改五档 |
| 列表项 1 / 2 / 3 行 | 56 / 72 / 88 | M2 的 48 / 64 已过时 |
| Docked toolbar | 64, 左右内边距 16 | Expressive 新组件 |
| 最小触控目标 | 48 x 48 | 未变, Google 硬性要求 |

## 字体层级 (M3 Type Scale)

字号 / 行高 (sp):

| 角色 | 字号 | 行高 |
| --- | --- | --- |
| displayLarge | 57 | 64 |
| displayMedium | 45 | 52 |
| displaySmall | 36 | 44 |
| headlineLarge | 32 | 40 |
| headlineMedium | 28 | 36 |
| headlineSmall | 24 | 32 |
| titleLarge | 22 | 28 |
| titleMedium | 16 | 24 |
| titleSmall | 14 | 20 |
| bodyLarge | 16 | 24 |
| bodyMedium | 14 | 20 |
| bodySmall | 12 | 16 |
| labelLarge | 14 | 20 |
| labelMedium | 12 | 16 |
| labelSmall | 11 | 16 |

- Expressive 在顶部新增了 Display XL 88/96、Hero 96 等超大档, 基线 scale 未变。
- titleLarge 行高在 m3.material.io 写 30、androidx tokens 写 28, 两处不一致, 以你依赖的库版本为准。
- 系统字体 `sans-serif` 仍是静态 Roboto, Roboto Flex 已入系统但未设为默认; 中文默认字体仍是 Noto Sans CJK (思源黑体)。

## 窗口尺寸类别与断点

官方只定义 size class, 不给"设计稿宽度":

| 宽度类 | dp 阈值 | 高度类 | dp 阈值 |
| --- | --- | --- | --- |
| Compact | < 600 | 高 Compact | < 480 |
| Medium | 600 ≤ w < 840 | 高 Medium | 480 ≤ h < 900 |
| Expanded | 840 ≤ w < 1200 | 高 Expanded | ≥ 900 |

宽屏 canonical layout 用 30% / 70% 分栏。判定按窗口宽度而不是设备型号。

## 边到边 (edge-to-edge)

- Android 15 (API 35): targetSdk 35 起强制边到边, `windowOptOutEdgeToEdgeEnforcement` 仍可临时关闭
- Android 16 (API 36): 该开关被废弃并禁用, 官方原文 "your app can't opt-out of going edge-to-edge"; 它在 Android 15 设备上仍生效, 造成行为不一致, 必须移除
- Android 17 (API 37): 未新增 edge-to-edge 或 WindowInsets 类变更

处理方式是运行时读取 inset 而不是写死状态栏和手势区高度:

- View 体系: `WindowCompat.enableEdgeToEdge()` 在 Activity 起始处调用, 再用 `WindowInsetsCompat.getInsets()` 配 `Type.systemBars()` / `Type.systemGestures()` / `Type.displayCutout()`; 滚动容器要加手势区 padding; 消费用 `WindowInsetsCompat.CONSUMED`; 老平台兄弟视图分发用 `ViewGroupCompat.installCompatInsetsDispatch`
- Compose: `Modifier.windowInsetsPadding(WindowInsets.systemBars)`, 底部手势区用 `navigationBarsPadding()`

状态栏和手势区的具体 dp 值官方不给固定数值 (三键导航、手势 pill、侧边手势各不相同), 一律运行时读取。

## 实战要点

- 不要用 px 作单位, dp 和 sp 是安卓世界的通用语言
- 内容左右 padding 至少 16dp, 别贴边
- 触控区域 48dp x 48dp 是硬性要求
- 适配折叠屏时注意屏幕比例切换后的布局自适应, 内屏按 expanded 走双栏
- targetSdk 36 起边到边不可关闭, 所有页面都要正确处理 inset

## 来源

- [M3 Navigation bar](https://m3.material.io/components/navigation-bar) (2026-07-31)、[M3 Type scale tokens](https://m3.material.io/styles/typography/type-scale-tokens)
- [androidx material3 tokens 源码](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt)、[Compose Material 3 releases](https://developer.android.google.cn/jetpack/androidx/releases/compose-material3) (stable 1.4.0, 2026-09-23)
- [Material 3 Expressive overview](https://supercharge.design/blog/material-3-expressive) (2026-06-02)
- [Edge-to-edge in views](https://developer.android.google.cn/develop/ui/views/layout/edge-to-edge)、[Android 16 behavior changes](https://developer.android.google.cn/about/versions/16/behavior-changes-16)、[Android 17 behavior changes](https://developer.android.google.cn/about/versions/17/behavior-changes-17) (2026-09)
- [Use window size classes](https://developer.android.google.cn/develop/ui/compose/layouts/adaptive/use-window-size-classes)、[Canonical layouts](https://developer.android.google.cn/develop/ui/views/layout/canonical-layouts)、[Support different screens](https://developer.android.google.cn/guide/practices/screens_support) (2026-02-26)
- [Touch target size](https://support.google.com/accessibility/android/answer/7101858)、[AOSP fonts.xml](https://raw.githubusercontent.com/aosp-mirror/platform_frameworks_base/master/data/fonts/fonts.xml)
