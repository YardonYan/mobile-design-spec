# 平板、桌面与大屏规范

手机端之外的形态: iPad、Mac、Vision Pro、Watch、Apple TV、Android 平板与折叠内屏、Chromebook、鸿蒙 PC 与智慧屏与穿戴、桌面 Web。

这一份刻意把"官方给了数值"和"官方没给数值"分开列。没有数值的项目不要臆造，按最后一节的清单处理。

## 设备形态与断点对照

| 体系 | 分档 |
| --- | --- |
| HarmonyOS (官方对应关系) | 超小 = 穿戴，小 = 手机 (默认)，中 = 平板，大 = 智慧屏与 PC |
| Android 窗口宽度类 | < 600 / 600 ~ 840 / 840 ~ 1200 / 1200 ~ 1600 / ≥ 1600 dp |
| Android 窗口高度类 | < 480 / 480 ~ 900 / ≥ 900 dp |
| Apple | compact / regular 两个 size class，横竖屏各一组 |
| 桌面 Web | 576 / 768 / 992 / 1200 / 1400px (Bootstrap) 或 640 / 768 / 1024 / 1280 / 1536px (Tailwind) |

## iPad 与 iPadOS

- 触控目标沿用通用规则 ≥ 44 x 44 pt，iPad 没有例外
- 文字默认 17pt，最小 11pt
- iPadOS 26 的形态变成"全屏应用 + 窗口化应用"两种，窗口化行为类似 macOS 可自由缩放，系统提供平铺控件；HIG 已无 Split View / Slide Over 条目
- 官方不再要求"支持全部四个方向"，改成按 size class 决定布局，不要用设备类型或方向做判断；锁定方向的游戏也要能自适应窗口缩放
- 侧栏与分栏宽度官方未给数值，别写死，用系统组件

## macOS

| 层级 | pt / 行高 |
| --- | --- |
| Large Title | 26 |
| Title1 | 22 |
| Title2 | 17 |
| Title3 | 15 |
| Headline | 13 Bold |
| Body | 13 / 16 |

- 默认 13pt，最小 10pt；macOS 不支持 Dynamic Type
- hit region 同样 ≥ 44 x 44 pt；有边框控件周围建议留约 12pt 内边距，无边框控件约 24pt（建议值，非硬要求）
- 最小窗口尺寸和标准控件高度官方未给数值
- 在 Apple Silicon Mac 上跑 iPad idiom 的应用时系统按 77% 缩放（iPadOS 的 17pt 正文在 Mac 上显示为 13pt）；Mac idiom 按 100% 渲染，字号要自己调

## visionOS

- 可点区域至少 60 x 60 pt，是全部平台里最大的；建议按钮中心间距 ≥ 60pt，按钮本身已达 60pt 时再加 4pt 内边距防 hover 遮挡
- 默认窗口 1280 x 720 pt；alert 附件视图最大高 154pt、圆角 16pt
- 文字默认 17pt，最小 12pt

## watchOS

官方只给相对缩放比例，不给表盘逻辑尺寸：

| 表壳 | 相对缩放 |
| --- | --- |
| 38mm | 90% |
| 40mm / 42mm | 100% |
| 41mm | 106% |
| 44mm | 110% |
| 45mm / 49mm | 119% |

- 文字默认 16pt，最小 12pt
- 图片按 40mm / 42mm 的 @2x 出图，或用自适应 PDF
- 社区常引用的表盘逻辑 pt 数值（162 x 198 之类）查不到官方出处，不要写进规范

## tvOS

- 主内容内缩：上下各 60pt、左右各 80pt（现行官方绝对值；旧的 title safe / action safe 百分比规则已从 HIG 移除）
- Tab bar 高 68pt，上沿距屏顶 46pt，系统不可改
- 栅格单项内容宽：2 ~ 9 列对应 860 / 560 / 410 / 320 / 260 / 217 / 184 / 160 pt，水平间距 40pt，垂直最小 100pt
- 文字默认 29pt，最小 23pt（大屏可读性优先）
- Siri Remote 焦点尺寸无官方数值

## Android 大屏与桌面

强制行为（这条是"必须做多设备适配"最硬的合规依据）：

- targetSdk 36（Android 16）起，在 sw ≥ 600dp 的屏幕上系统忽略 `orientation`、`aspect-ratio`、`resizable` 限制并禁用 letterbox；targetSdk 37（Android 17）同样执行
- 豁免用 `PROPERTY_COMPAT_ALLOW_RESTRICTED_RESIZABILITY`，属于临时手段

其余口径：

| 项 | 数值 | 性质 |
| --- | --- | --- |
| 触控目标 | 48 x 48dp 最小；有精确指针（鼠标）时可更小 | 硬要求 / 官方说明 |
| 导航切换 | Compact 用底栏，Medium 用 rail 或 drawer，Expanded 及以上用 full-width 或 fixed drawer | 官方建议 |
| 自适应网格 | `GridCells.Adaptive(minSize = 180.dp)` | 官方示例值 |
| rail 80dp、drawer 360dp | 社区经验值 | 官方当前文档无数值 |
| Chromebook 窗口 | 最小 300dp 宽 x 450dp 高，可自由缩放 | 官方硬要求 |
| 折叠判定 | `FoldingFeature.state` = FLAT / HALF_OPENED，`orientation` = HORIZONTAL / VERTICAL，`occlusionType` = NONE / FULL；折页角度不通过 API 暴露 | 官方 API |
| 建议测试尺寸 | 841 x 701dp 折叠机、1600 x 900dp Chromebook | 官方质量指南建议 |

大屏应用质量分三档：Tier 3（能全屏跑、不 letterbox）、Tier 2（布局优化）、Tier 1（差异化体验）。上架评分按这个走。

## HarmonyOS 多设备

屏幕边距（官方间隔参数）：手机 16vp、折叠屏 24vp、平板 32vp、PC 40vp、座舱 48vp、智慧屏 48vp、穿戴 26vp。

响应式布局准则（官方）：空白内容占比 > 50% 或每行超过 30 字时用缩进；宽高比变化 > 200% 时用挪移；图片放大 > 150% 时用重复布局。

鸿蒙 PC / 2in1 的窗口上下限、智慧屏与穿戴的具体数值，本轮未取到华为官方原文（HarmonyOS Design 站为前端渲染，正文抓不到）。社区流传的 `minWidth 320 / maxWidth 1200 / minHeight 480 / maxHeight 1600` 与 `supportWindowMode` 组合标为待核实，不要当官方口径写进规则。

## 桌面 Web

StatCounter 2026-09 全球桌面视口占比：1920x1080 28.07%、1536x864 10.00%、1366x768 7.95%、1280x720 4.71%、2560x1440 3.95%、1280x1200 3.64%。注意 1536x864 就是 1920x1080 在 125% 缩放下的 CSS 视口，Windows 笔记本默认如此，别当成另一种屏幕。

| 体系 | 断点 | 容器宽度 |
| --- | --- | --- |
| Tailwind 4 | sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536 | `max-w-7xl` = 1280px 常作上限 |
| Bootstrap 5.3 | sm 576 / md 768 / lg 992 / xl 1200 / xxl 1400 | container 540 / 720 / 960 / 1140 / 1320px |
| Material Web (MDC) | phone < 600 / tablet 600 ~ 839 / desktop ≥ 840 | 列 4 / 8 / 12，margin 16 / 16 / 24，gutter 16 / 16 / 24，列宽 72px |

- 行长：WCAG 2.2 SC 1.4.8 要求文本块不超过 80 个字符（中日韩不超过 40 字），行距至少 1.5 倍，段距至少 1.5 倍行高。65 ~ 75ch 是排版经验值，不是官方要求
- 容器查询已是 Baseline widely available（Chrome 与 Edge 105、Firefox 110、Safari 16.4，2023 年 5 月起全线可用）。卡片这类会被放进不同宽度容器的组件，用 `@container` 比 `@media` 更合理

## 实战要点

- 大屏不是"把手机布局放大"，先定列数和导航形态再摆内容
- Android targetSdk 36 起 ≥600dp 强制可缩放，写死方向或比例的页面会直接被判布局缺陷
- 触控下限随输入方式变：手指 44/48，指针可以更小，visionOS 反而要 60
- 桌面文字下限不等于移动下限，macOS 10pt、tvOS 23pt 各自成一套
- 折叠内屏和平板按窗口宽度分档，不按设备型号分档

## 官方未给数值（不要臆造）

iPad 侧栏与分栏宽度、macOS 最小窗口尺寸与控件高度、Apple Watch 表盘逻辑 pt、tvOS 旧版安全区百分比、Siri Remote 焦点尺寸、Material rail 与 drawer 宽度、鸿蒙 PC 窗口上下限、鸿蒙智慧屏与穿戴数值。

## 来源

- Apple HIG（2026-10-07 抓取）：[layout](https://developer.apple.com/design/human-interface-guidelines/layout)、[typography](https://developer.apple.com/design/human-interface-guidelines/typography)、[buttons](https://developer.apple.com/design/human-interface-guidelines/buttons)、[windows](https://developer.apple.com/design/human-interface-guidelines/windows)、[tab-bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)、[sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars)、[multitasking](https://developer.apple.com/design/human-interface-guidelines/multitasking)、[mac-catalyst](https://developer.apple.com/design/human-interface-guidelines/mac-catalyst)、[pointing-devices](https://developer.apple.com/design/human-interface-guidelines/pointing-devices)、[images](https://developer.apple.com/design/human-interface-guidelines/images)、[designing-for-iphone-duo](https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo)
- Android：[Android 16 行为变更](https://developer.android.com/about/versions/16/behavior-changes-16)、[Android 17 行为变更](https://developer.android.com/about/versions/17/behavior-changes-17)、[窗口大小类](https://developer.android.com/develop/ui/compose/layouts/adaptive/window-size-classes)、[规范布局](https://developer.android.com/develop/adaptive-apps/guides/canonical-layouts)、[大屏应用质量](https://developer.android.com/docs/quality-guidelines/large-screen-app-quality)、[ChromeOS 窗口管理](https://developer.android.com/develop/devices/chromeos/learn/window-management)、[折叠屏适配](https://developer.android.com/develop/ui/compose/layouts/adaptive/foldables/make-your-app-fold-aware)
- HarmonyOS / OpenHarmony：[栅格布局](https://gitee.com/openharmony/docs/raw/master/zh-cn/application-ui/layout/arkts-layout-development-grid-layout.md)、[响应式布局设计](https://gitee.com/openharmony/docs/master/zh-cn/design/ux-design/responsive-layout.md)、[间隔参数](https://developer.huawei.com/consumer/cn/doc/design-guides/interval-parameter-0000002562577161)
- Web：[Tailwind theme](https://tailwindcss.com/docs/theme)、[Bootstrap breakpoints](https://getbootstrap.com/docs/5.3/layout/breakpoints/)、[mdc-layout-grid 变量](https://github.com/material-components/material-components-web/blob/master/packages/mdc-layout-grid/_variables.scss)、[WCAG SC 1.4.8](https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html)、[MDN 容器查询](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)、[StatCounter 桌面分辨率](https://gs.statcounter.com/screen-resolution-stats/desktop/worldwide)
