# iOS 设计规范

核心关键词: 精确、克制。逐机型参数见 references/devices.md, 这里只放规则。

## 设计稿基准

- 主画布 402 x 874 pt (@3x): iPhone 17、17 Pro、18 Pro 同宽, 是当前主力
- 下限校验 390 x 844 pt, 上限校验 440 x 956 pt (Pro Max), iPhone Air 420 x 912 pt 单独看一次
- 393 x 852 pt 是 2023 ~ 2025 年的主流基准, 老项目延用没问题, 新项目建议 402

## 安全区

Apple 不发布逐机型状态栏高度, HIG 只给原则: 内容不能进入安全区外。运行时取 `window.safeAreaInsets.top / .bottom` (SwiftUI 用 `EnvironmentValues.safeAreaInsets`), 设计稿侧的常见值:

| 机型类别 | 顶部 inset | 底部 inset |
| --- | --- | --- |
| 灵动岛, 402 / 440 宽 (16 Pro 起) | 62pt | 34pt |
| iPhone Air | 68pt | 34pt |
| 灵动岛, 393 / 430 宽 (15 系列、16、16 Plus、17e) | 59pt | 34pt |
| 刘海 (12 ~ 14 系列) | 47pt | 34pt |
| mini | 50pt | 34pt |
| 11 / XR | 48pt | 34pt |
| 非全面屏 (SE) | 20pt | 0 |

iOS 26 抬高了灵动岛机型的顶部 inset (59 → 62), 把 59 当常量会在 iOS 26 上顶到状态栏。

## 系统组件

iOS 26 起 HIG 不再给 iOS 端的固定导航栏和 TabBar 高度, Tab Bars 页只剩 tvOS 的 68pt 数值, iOS 侧描述变成"TabBar 悬浮在内容之上"。当前的实际口径:

| 组件 | 数值 | 性质 |
| --- | --- | --- |
| 导航栏 | 44pt (大标题模式更高) | UIKit / SwiftUI 框架默认值, 不是规范要求 |
| TabBar | 49pt + 底部安全区 | 同上; iOS 26 支持最小化 (`TabBarMinimizeBehavior`) |
| 工具栏 | 44pt | 框架默认值 |
| 最小触控 | 44 x 44pt | HIG 硬性建议, 原文 "at least 44x44 pt" |

结论: 别把 44 / 49 写死进布局, 用系统组件或 `safeAreaInset` 让框架自己定高。

## 字体层级 (SF Pro)

HIG Typography 现行数值, 字号 / 行高 (pt):

| 语义样式 | 字号 | 行高 | 字重 |
| --- | --- | --- | --- |
| largeTitle 大标题 | 34 | 41 | Bold |
| title1 标题一 | 28 | 34 | Bold |
| title2 标题二 | 22 | 28 | Bold |
| title3 标题三 | 20 | 25 | Semibold |
| headline | 17 | 22 | Semibold |
| body 正文 | 17 | 22 | Regular |
| callout | 16 | 21 | Regular |
| subheadline 副文本 | 15 | 20 | Regular |
| footnote 脚注 | 13 | 18 | Regular |
| caption1 | 12 | 16 | Regular |
| caption2 最小文字 | 11 | 13 | Regular |

- 最小可读字号 11pt, 正文不建议低于 15pt。
- SF Pro 已改用可变字体的 dynamic optical sizes, 20pt 处 Text / Display 的切换不再是硬性规则, 用系统语义字体即可自动处理。
- 用 `.font(.body)` 这类语义样式而不是 `.font(.system(size: 17))`, 才能吃到 Dynamic Type。

## 实战要点

- 刘海屏内容区一定留 Safe Area, 背景可以 `ignoresSafeArea` 铺满, 内容不行
- 列表项高度 44pt 起步
- 内容区左右边距 16 ~ 20pt
- 浮层覆盖全屏媒体时用 `backgroundExtensionEffect()` / `UIBackgroundExtensionView`, 滚动边缘效果用 scroll edge effect 把控件抬到内容之上
- 折叠屏 iPhone Duo 开售后需要单独验证 400 / 600pt 两档宽度断点 (社区建议, 未验证)
- 永远在真机上检查, 模拟器的字体渲染和 inset 都不可靠

## 勘误

原始参考文章把 iPhone 15 Plus 写成 428 x 926 pt, 实际是 430 x 932 pt; 428 x 926 属于 iPhone 12 / 13 Pro Max。本 skill 的机型表已按 Apple 规格页修正。

## 来源

- [HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography)、[HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)、[HIG Tab Bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)、[HIG Buttons / Design Tips](https://developer.apple.com/design/tips/)
- [Meet Liquid Glass (WWDC)](https://developer.apple.com/videos/play/meet-with-apple/208/) (2025-11-17)、[The iOS 26 Design Guidelines](https://learnui.design/blog/ios-design-guidelines-templates.html) (2026-04-22)
- [iPhone 各机型状态栏与安全区高度](https://www.jianshu.com/p/bd2f684af0e3) (2026-09-17 更新)
