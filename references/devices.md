# 机型参数速查

数据基准日期: 2026-10-07。每代新机发布后需要复核, 尤其安全区高度和默认渲染密度。

标注约定:
- `实测` = 官方规格页或官方设计文档给出的值
- `推算` = 由物理分辨率除以密度算出, 未直接见诸官方表格
- `未验证` = 单一来源或社区数据, 用前请在真机复核
- 安全区数值随系统版本变化 (iOS 26 抬高了灵动岛机型的顶部 inset), 代码里一律运行时读取

## 为什么是这几台机型

表里不是全部在售设备, 是按公开分布数据挑的代表点。选取依据:

| 依据 | 数据 | 用途 |
| --- | --- | --- |
| StatCounter 全球移动视口 top 6 (2026-09) | 414x896 13.35%、360x800 7.54%、384x832 7.10%、390x844 6.05%、393x873 4.18%、360x780 3.39%, 合计约 42% | 决定手机侧的宽档: 360 / 384 / 390 / 393 / 414 |
| Counterpoint 2026 Q2 中国 | 华为 23% 第一、苹果 18%、vivo 16%、OPPO 15%、小米 12%、荣耀 11%; 同季 HarmonyOS 份额 24% 首超 iOS 18% | 鸿蒙必须进表, 且面向中文开发者时优先级不低于 Android |
| Apple 官方 (App Store 交易设备, 2026-06-07) | iOS 26 占全部设备 79%、近四年设备 86%; iPadOS 26 占 68% / 79% | iPhone 侧只需覆盖近 4 代, 更早机型归入兼容档 |
| 华为官方 (余承东口径, 2026-10-01) | HarmonyOS 终端设备数突破 9000 万; 6.1.1 占存量 86.82%, 7.0.0 占 5.27% (2026-09-06) | 鸿蒙侧按 NEXT 5.x / 6.x 为准, 不再考虑兼容 Android APK 的旧鸿蒙 |
| StatCounter 全球桌面视口 (2026-09) | 1920x1080 28.07%、1536x864 10.00%、1366x768 7.95%、1280x720 4.71%、2560x1440 3.95% | 桌面 Web 的断点与容器上限取值 |

三个必须知道的口径坑:

- StatCounter 的"分辨率"是 CSS 视口像素, 不是面板物理像素。榜首 414x896 是老 iPhone 的逻辑宽度, 不能拿去和 2856x1320 这种面板参数比大小。
- Google 官方 API 分布仪表盘只有交互图表没有数值导出, Android 版本份额只能引用第三方对官方图表的转录, 且要标快照时间。
- 微信从未公开过小程序侧的设备或屏幕分布。小程序不依赖逐机型表, 750rpx 恒等屏宽的规范本身就是适配机制, 大屏另用媒体查询兜底。

## iPhone

逻辑尺寸 pt, 物理尺寸 px。@3x 机型 1pt = 3px。

| 机型 | 逻辑 (pt) | 物理 (px) | 倍率 | ppi | 顶部安全区 | 底部安全区 |
| --- | --- | --- | --- | --- | --- | --- |
| iPhone 18 Pro Max | 440 x 956 | 1320 x 2868 | @3x | 460 | 62 | 34 |
| iPhone 18 Pro | 402 x 874 | 1206 x 2622 | @3x | 460 | 62 | 34 |
| iPhone 17 Pro Max | 440 x 956 | 1320 x 2868 | @3x | 460 | 62 | 34 |
| iPhone 17 Pro | 402 x 874 | 1206 x 2622 | @3x | 460 | 62 | 34 |
| iPhone 17 | 402 x 874 | 1206 x 2622 | @3x | 460 | 62 | 34 |
| iPhone Air | 420 x 912 | 1260 x 2736 | @3x | 460 | 68 | 34 |
| iPhone 17e | 390 x 844 | 1170 x 2532 | @3x | 460 | 59 (未验证) | 34 |
| iPhone 16 Pro Max | 440 x 956 | 1320 x 2868 | @3x | 460 | 62 | 34 |
| iPhone 16 Pro | 402 x 874 | 1206 x 2622 | @3x | 460 | 62 | 34 |
| iPhone 16 Plus | 430 x 932 | 1290 x 2796 | @3x | 460 | 59 | 34 |
| iPhone 16 | 393 x 852 | 1179 x 2556 | @3x | 460 | 59 | 34 |
| iPhone 16e | 390 x 844 | 1170 x 2532 | @3x | 460 | 47 (未验证) | 34 |
| iPhone 15 Pro Max / 15 Plus | 430 x 932 | 1290 x 2796 | @3x | 460 | 59 | 34 |
| iPhone 15 Pro / 15 | 393 x 852 | 1179 x 2556 | @3x | 460 | 59 | 34 |
| iPhone 14 / 13 | 390 x 844 | 1170 x 2532 | @3x | 460 | 47 | 34 |
| iPhone 14 Pro / 13 Pro | 393 x 852 | 1179 x 2556 | @3x | 460 | 47 | 34 |
| iPhone 14 Pro Max / 13 Pro Max / 12 Pro Max | 428 x 926 | 1284 x 2778 | @3x | 458 | 47 | 34 |
| iPhone 13 mini / 12 mini | 375 x 812 | 1170 x 2532 | @3x | 460 | 50 | 34 |
| iPhone SE 2 / SE 3 | 375 x 667 | 750 x 1334 | @2x | 326 | 20 | 0 |

要点:
- iPhone 18 系列只发布了 Pro 和 Pro Max (2026-09-09 发布), 标准版 iPhone 18 未在 2026 年发布, SE 产品线已停更, 入门位由 16e、17e 承接。
- 402pt 宽是当前 iPhone 的主力宽度 (17、17 Pro、18 Pro 同宽), 440pt 是最大屏, 420pt 是 iPhone Air。设计稿主画布用 402 x 874。
- 顶部安全区分三档: 402/440 宽灵动岛机型 62pt、393/430 宽灵动岛机型 59pt、iPhone Air 68pt; 刘海机型 44~50pt; SE 20pt。iOS 18 时代灵动岛普遍记 59pt, iOS 26 抬高到 62pt, 别把 59 当成全平台常量。
- 折叠屏 iPhone Duo 已官宣 (2026-10-16 预售、10-23 发货), 参数只有单一来源: 外屏 466 x 678 pt (1398 x 2034 @3x)、内屏 626 x 890 pt (1878 x 2670 @3x), 全部标未验证, 真机到手前不要按它定断点。

## iPad

| 机型 | 逻辑 (pt) | 物理 (px) | 倍率 | ppi |
| --- | --- | --- | --- | --- |
| iPad Pro 13 (M4/M5) | 1032 x 1376 | 2064 x 2752 | @2x | 264 |
| iPad Pro 11 (M4/M5) | 834 x 1210 | 1668 x 2420 | @2x | 264 |
| iPad Air 13 | 1024 x 1366 | 2048 x 2732 | @2x | 264 |
| iPad Air 11 / iPad 10、11 代 | 820 x 1180 | 1640 x 2360 | @2x | 264 |
| iPad mini 7 | 744 x 1133 | 1488 x 2266 | @2x | 326 |

iPad 全部 @2x, 无灵动岛安全区问题, 但横屏时有 Home Indicator 侧边 inset。

## Android

Android 的 1 CSS px = 1 dp, 所以浏览器上报的视口宽就是 dp 宽。同一块面板在不同分辨率模式下会算出不同 dp 尺寸, 下表同时给出推算值和实测冲突。

| 设备 | 物理 (px) | DPR | dp 宽 x 高 | 密度 |
| --- | --- | --- | --- | --- |
| Pixel 11 | 1080 x 2424 | 2.625 | 411 x 923 (推算) | 420dpi |
| Pixel 11 Pro | 1280 x 2856 | 3.125 | 410 x 914 (推算) | 500dpi |
| Pixel 11 Pro XL | 1344 x 2992 | 3.25 | 414 x 921 (推算) | 520dpi |
| Galaxy S26 Ultra | 3120 x 1440 | 3.5 | 411 x 891 (推算) | 560dpi, 约 498ppi |
| Galaxy S26+ | 3120 x 1440 | 3.5 | 411 x 891 (推算) | 560dpi |
| Galaxy S26 | 1080 x 2340 | 3.0 | 360 x 780 (推算) | 480dpi, 媒体口径待核 |
| vivo X300 Ultra / iQOO 15 Ultra | 3168 x 1440 | 3.5 | 411 x 874 (推算) | 约 510 ~ 514ppi |
| 小米 17 Ultra | 2608 x 1200 | 3.0 | 400 x 869 (推算) | 约 414ppi |
| Pixel 10 | 1080 x 2424 | 2.625 | 411 x 923 (推算) | 420dpi |
| Pixel 10 Pro | 1280 x 2856 | 3.125 | 410 x 914 (推算) | 500dpi |
| Pixel 10 Pro XL | 1344 x 2992 | 3.25 | 414 x 921 (推算); DeviceAtlas 实测 448 x 998 @3.0 | 520dpi |
| Pixel 10 Pro Fold 外屏 | 1080 x 2364 | 2.625 | 411 x 901 (未验证) | 420dpi |
| Pixel 10 Pro Fold 内屏 | 2076 x 2152 | 3.0 | 692 x 717 (推算) | 480dpi |
| Galaxy S25 | 1080 x 2340 | 3.0 | 360 x 780 (推算) | 480dpi |
| Galaxy S25+ / Ultra | 1440 x 3120 | 3.5 | 412 x 891 (推算); DeviceAtlas 实测视口 384 x 832 | 560dpi |
| 小米 15 Pro | 未验证 | 3.5 | 412 x 914 (实测视口) | 560dpi |
| 1080 x 2400 一档 (Redmi Note 13 等) | 1080 x 2400 | 2.75 | 393 x 873 (推算) | 440dpi |
| 1.5K 一档 (小米 14T / Poco X6 Pro) | 1220 x 2712 | 3.0 | 407 x 905 (推算) | 480dpi |
| Galaxy Z Fold6 内 / 外 | 未验证 | 3.0 | 619 x 720 / 323 x 792 (未验证) | 480dpi |
| Galaxy Z Flip6 展开 | 未验证 | 2.75 | 393 x 960 (未验证) | 440dpi |

2026 年的 Android 旗舰明确分两档: 2K / QHD+ (3120x1440、3168x1440, 三星与 vivo 和 iQOO) 与 1.5K (2608x1200、2856x1320 级, 小米与华为 Pura 和 Mate 全线)。两档在默认密度下算出来的 dp 宽度都落在 400 ~ 414 区间, 这就是主稿取 411dp 的原因。

要点:
- 手机布局宽集中在 360 / 384 / 393 / 407~414。360dp 只能当下限校验, 主设计稿用 411 x 891 到 412 x 923 这一档。
- 三星旗舰系统默认按 1080 级渲染, 真实布局宽常见 384dp 而不是面板算出来的 412dp。定最小宽度约束时按 360dp, 定主稿按 411dp, 两件事分开。
- 大量设备落在非标准密度 (420 / 440 / 450 / 500 / 520 / 560dpi), 系统仍按最近的标准桶选资源目录, 所以 mdpi~xxxhdpi 六桶仍是工程口径, 但"每桶等比缩放"的推导在这些机器上不成立。
- 平板和折叠内屏基本都进 expanded (≥ 840dp) 档。

## HarmonyOS

官方《布局基础》给出的设备表已直接提供 px 与 vp 两套值, 换算比即 density。

| 机型 | 物理 (px) | vp 宽 x 高 | px/vp 比 |
| --- | --- | --- | --- |
| Mate 60 / Mate 70 | 1216 x 2688 | 374 x 826 | 3.25 |
| Mate 60 Pro | 1260 x 2720 | 388 x 836 | 3.25 |
| Mate 70 Pro | 1316 x 2832 | 376 x 810 | 3.50 |
| Mate 80 / Mate 80 Pro | 1280 x 2832 (6.75") | 366 x 809 | 3.50 |
| Mate 80 Pro Max | 1320 x 2848 (6.9") | 377 x 814 | 3.50 |
| Pura 70 | 1256 x 2760 | 372 x 818 | 3.38 |
| Pura 70 Pro | 1260 x 2844 | 373 x 843 | 3.38 |
| Pura 80 | 1256 x 2760 | 359 x 789 | 3.50 |
| Pura 90 | 1320 x 2856 (6.8", 460ppi) | 377 x 816 | 3.50 |
| Pura 90 Pro | 1256 x 2760 (6.6", 460ppi) | 359 x 789 | 3.50 |
| Pura 90 Pro Max | 1308 x 2880 (6.9", 460ppi) | 374 x 823 | 3.50 |
| Mate X5 外 / 展开 | 1080 x 2504 / 2224 x 2496 | 346 x 802 / 712 x 798 | 3.12 |
| Mate X6 外 / 展开 | 1080 x 2440 / 2240 x 2440 | 360 x 813 / 747 x 813 | 3.00 |
| Mate XT / XTs 单折 / 双折 / 三折 | 2232x1008 (6.4") / 2232x2048 (7.9") / 2232x3184 (10.2") | 350 x 776 / 712 x 776 / 1108 x 776 | 2.88 |
| Mate XT 2 非凡大师 外屏 / 三屏展开 | 2442 x 1140 (6.5", 412ppi) / 2232 x 3184 (10.2", 382ppi) | 官方 vp 表未收录 (未验证) | 未查到 |
| MatePad / MatePad Pro | 2560 x 1600 / 2880 x 1920 | 1280 x 800 / 1440 x 960 | 2.0 |
| MateBook Pro (鸿蒙 PC, 14.2") | 3120 x 2080 | 缩放后逻辑分辨率官方未公布 | 未查到 |
| MateBook Fold 非凡大师 (展开 18" / 折叠 13") | 3296 x 2472 | 逻辑分辨率未查到, 参数来自可信媒体 | 未查到 |

非凡大师 (ULTIMATE DESIGN) 是华为超高端线, 含三折叠 Mate XT / XTs / XT 2 与折叠笔记本 MateBook Fold。三折展开 1108vp 已经越过"大"断点 (≥ 840vp, 对应智慧屏与 PC), 布局必须按多栏处理, 不能把手机版放大。

要点:
- 鸿蒙手机 vp 宽度集中在 359~388, 折叠外屏 346~360, 展开态 440~940, 平板 ≥ 840。断点判定按窗口宽度而不是设备型号。
- 官方设备表不含 ppi。ppi = 对角像素 / 对角英寸, 只在需要评估清晰度时用。
- 官方表数值可能已含用户"显示大小"缩放 (未验证), 真机布局仍以运行时 `display.densityPixels` 为准。

## 设计稿基准汇总

手机端:

| 平台 | 主稿 | 下限校验 | 上限校验 | 单位 |
| --- | --- | --- | --- | --- |
| iOS | 402 x 874 pt | 390 x 844 | 440 x 956 | pt |
| Android | 411 x 891 dp | 360 x 780 | 折叠内屏 692dp | dp / sp |
| HarmonyOS | 384 x 832 vp (建议值, 官方未指定) | 346 vp | 展开态 1108 vp | vp / fp / lpx |
| 微信小程序 | 750rpx 全宽 | 320vp 级窄屏 | 大屏用媒体查询 | rpx 或 vw |
| H5 | 375px 全宽 | 320px | 内容最大宽 750px | px / rem / dvh |

其他形态见 references/multi-device.md, 常用起点:

| 形态 | 起点 |
| --- | --- |
| iPad | 820 x 1180 pt (11" Air 档), 横屏 1180 x 820 |
| Android 平板 | ≥ 840dp 走 expanded, 双栏 30% / 70% |
| Chromebook | 窗口最小 300 x 450 dp, 建议测试 1600 x 900 dp |
| 鸿蒙平板 / PC | ≥ 840vp 12 列, 栅格最大宽 2220vp |
| 桌面 Web | 1280 ~ 1440px 容器上限, 断点 1024 / 1280 / 1536 |
| tvOS | 1920 x 1080 pt 画布, 内容内缩上下 60 左右 80 |
| visionOS | 默认窗口 1280 x 720 pt, 可点区域 60 x 60 pt |

## 来源

- Apple 官方规格页: [iPhone 18 Pro](https://www.apple.com/iphone-18-pro/specs/)、[iPhone 18 Pro Max 技术规格](https://support.apple.com/zh-cn/148591)、[iPhone 17](https://www.apple.com/iphone-17/specs/)、[iPhone Air](https://www.apple.com/iphone-air/specs/)、[iPhone 17e](https://www.apple.com/iphone-17e/specs/)、[iPad Pro 13 M5](https://support.apple.com/en-us/125407)、[iOS 版本占比](https://developer.apple.com/support/app-store/)
- [iOS Resolution](https://www.ios-resolution.com/) (2026-09-18 更新)、[Use Your Loaf: iPhone 17 screen sizes](https://useyourloaf.com/blog/iphone-17-screen-sizes/) (2025-10-13)
- [iPhone 各机型状态栏与安全区高度](https://www.jianshu.com/p/bd2f684af0e3) (2026-09-17 更新)、[iPhone Duo 适配指南](https://lijianfei.com/post/iphone-duo-ios-screen-adaptation-guide/) (2026-09-10)
- [Android 视口尺寸统计](https://screensizechecker.com/devices/android-viewport-sizes) (复核至 2026-09-24)、[DeviceAtlas 真机视口与 DPI](https://deviceatlas.com/blog/viewport-resolution-diagonal-screen-size-and-dpi-most-popular-smartphones) (2026-09-09 更新)、[Pixel 11 系列发布稿](https://m.10jqka.com.cn/20260813/c678908847.shtml) (2026-08-13)、[2026 旗舰屏幕横评](https://3g.sina.com.cn/news/article/comos_nitzerr5756318.html) (2026-10-04)
- 华为官方规格页: [Mate XT 非凡大师](https://consumer.huawei.com/cn/phones/mate-xt-ultimate-design/specs/)、[Mate XTs 非凡大师](https://consumer.huawei.com/cn/phones/mate-xts-ultimate-design/specs/)、[Mate XT 2 非凡大师](https://consumer.huawei.com/cn/phones/mate-xt-2-ultimate-design/specs/)、[Mate 80](https://consumer.huawei.com/cn/phones/mate80/specs/)、[Pura 90 系列](https://consumer.huawei.com/cn/phones/pura90/specs/)、[MateBook Pro](https://consumer.huawei.com/cn/harmonyos-computer/matebook-pro/specs/)
- [HarmonyOS 布局基础 (含设备 px/vp 表)](https://developer.huawei.com/consumer/cn/doc/design-guides/design-layout-basics-0000001795579413) (2026-05-07)、[HarmonyOS 存量设备版本占比](https://www.ithome.com/html/android/1009012.htm) (2026-10-01, 转录华为开发者数据)
- 分布数据: [StatCounter 移动视口](https://gs.statcounter.com/screen-resolution-stats/mobile/worldwide)、[StatCounter 桌面视口](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide) (2026-09, CC BY)、[Counterpoint 2026 Q2 中国份额](https://m.163.com/news/article/L5OORSGU051191D6.html) (2026-09-01)、[HarmonyOS 中国份额首超 iOS](https://antutu.com/doc/137645.htm) (2026-08-28)、[Android API 分布仪表盘](https://developer.android.com/about/dashboards) (仅图表, 数值取自[媒体转录](https://k.sina.cn/article_7857141524_1d452771401903u9uk.html), 快照 2025-12-01)
