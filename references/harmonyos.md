# HarmonyOS 设计规范

HarmonyOS NEXT (纯血鸿蒙, 不再兼容 Android APK)。ArkUI 声明式开发, 文件后缀 `.ets`。

## 尺寸单位

| 单位 | 定义 | 换算 |
| --- | --- | --- |
| px | 屏幕物理像素 | 只在需要像素级精度时用 |
| vp | 屏幕密度相关像素, 无单位数值默认按 vp | `vp = px / (DPI / 160)`; 1440px 宽屏上 1vp ≈ 3px |
| fp | 字体像素, 默认 `1fp = 1vp` | 用户调大字体后 `1fp = 1vp * scale`, scale 来自 `Configuration.fontSizeScale` (API 12+); 字重缩放另有 `fontWeightScale` |
| lpx | 视窗逻辑像素, 按设计稿宽度等比 | 比例 = 实际屏宽 / designWidth; designWidth 默认 720px, 配在 `main_pages.json` 的 `window.designWidth`; `autoDesignWidth: true` 时忽略 designWidth |

要点:
- 布局用 vp, 字体用 fp。字体写成 vp 会导致用户放大系统字号后文字不跟随, 这是鸿蒙侧最常见的单位错误。
- 全局 `vp2px()` / `px2fp()` / `lpx2px()` 自 API 18 起废弃, 改用 `this.getUIContext().vp2px()` 等实例接口。
- lpx 适合"按设计稿宽度铺满"的场景, 但官方明确提醒不要滥用基于屏宽比例的单位, 大屏要配合媒体查询。

## 响应式断点

官方有两套口径, 别混用。

GridRow 组件默认断点:

| 断点 | 宽度 (vp) |
| --- | --- |
| xs | [0, 320) |
| sm | [320, 600) |
| md | [600, 840) |
| lg | [840, +∞) |
| xl / xxl | 需自定义 `breakpoints.value`, 如 `['320vp','600vp','840vp','1440vp']`, 最多 6 档 |

设计规范的栅格列数:

| 宽度 | 列数 | 常用 margin / gutter |
| --- | --- | --- |
| < 600vp | 4 列 | 16 / 8 (通用), 16 / 16 (宽松) |
| 600 ~ 840vp | 8 列 | 24 / 12 |
| ≥ 840vp | 12 列 | 32 / 16 或 32 / 20 |

栅格最大宽度 2220vp, 超出后左右留白。GridRow 的 `columns` 默认值在 API 20 之前是 12, API 20 起改为 `{xs:2, sm:4, md:8, lg:12, xl:12, xxl:12}`, 跨 API 版本迁移时注意。

## 间距与圆角

官方屏幕边距:

| 设备 | 左右 | 顶部 | 底部 |
| --- | --- | --- | --- |
| 手机 | 16vp | 36vp | 28vp |
| 折叠屏 | 24vp | | |
| 平板 | 32vp | | |
| PC | 40vp | | |
| 穿戴 | 26vp | 20vp | 20vp |

元素间距: 卡片之间 12vp; 有明显边界 16vp; 无明显边界 8vp; 主次文本上下 2vp、左右 8vp。整体走 8vp 网格, 小图标对齐 4vp。

间距 token `Padding_levelN = 2N vp` (level2=4、level4=8、level6=12、level8=16、level12=24、level16=32)。圆角 token `corner_radius_levelN = 2N vp`, 常用档位: 4vp 标签角标、8vp 图片图标、16vp 卡片容器、20vp 按钮与菜单、32vp 半模态弹窗。

## 字号层级

官方分级表 (落地按 fp):

| 层级 | fp | 字重 |
| --- | --- | --- |
| Headline1 | 96 | Light |
| Headline2 | 72 | Light |
| Headline3 | 60 | Light |
| Headline4 | 48 | Regular |
| Headline5 | 38 | Regular |
| Headline6 | 30 | Medium |
| Headline7 | 24 | Medium |
| Headline8 | 20 | Medium |
| Subtitle1 | 18 | Medium |
| Subtitle2 | 16 | Medium |
| Subtitle3 | 14 | Medium |
| Body1 | 16 | Regular |
| Body2 | 14 | Regular |
| Body3 | 12 | Regular |
| Button1 | 16 | Medium |
| Button2 | 14 | Medium |
| Caption | 10 | Regular |

这张表出自官方设计文档 V1 归档, NEXT 现行视觉规范未见同名表格, 6.x 是否沿用未验证。可确定的是正文层级 14~16fp、说明文字 12fp、Caption 10fp 只用于极端紧凑场景。

## 触控目标

官方 Code Linter 规则 `@cross-device-app-dev/touch-target-size`: 主要交互元素热区推荐至少 48vp x 48vp, 不得小于 40vp x 40vp, 检查对象包括 `responseRegion`。这是五套平台里唯一把推荐值和硬性下限分开写的。

## 安全区与沉浸式

获取避让区 (返回 px, 必须 `px2vp()` 转换):

```ts
const win = this.windowStage.getMainWindowSync();
const system = win.getWindowAvoidArea(window.AvoidAreaType.TYPE_SYSTEM);            // 状态栏
const indicator = win.getWindowAvoidArea(window.AvoidAreaType.TYPE_NAVIGATION_INDICATOR); // 底部手势条
const cutout = win.getWindowAvoidArea(window.AvoidAreaType.TYPE_CUTOUT);             // 挖孔
win.on('avoidAreaChange', (data) => { /* 更新 */ });
```

配合 `setWindowLayoutFullScreen(true)` 做全屏布局, 组件侧用 `expandSafeArea` 控制背景扩展范围。

要点:
- 状态栏官方不给固定 vp, 一律运行时获取。设计稿侧用顶部 36vp、底部 28vp 的边距兜底。
- 底部导航条官方口径是"通常固定预留 28vp", 但避让区可能返回 0 (隐藏导航条、切三键导航、横屏), 必须写兜底而不是假设它有值。
- 自定义底部页签的内容高度官方建议 40~70vp。

## 字体

HarmonyOS Sans 是系统默认字体, 无衬线, 完整支持简体与繁体中文, 提供 Thin 到 Black 九档字重, 支持可变字体、Condensed 与 Italic。中文默认字体在 NEXT 上不需要显式指定字族, 这点和 iOS / Android 不同。

## 超级 App 在鸿蒙上

微信小程序有官方《HarmonyOS 适配指南》: 渲染层由 ArkWeb 接管 (不是 Skyline), 平台判断用 `wx.getDeviceInfo().platform === 'ohos'` (PC 形态是 `ohos_pc`), 基础库需 ≥ 3.7.0, 配合 `wx.canIUse` 做能力探测。rpx 仍按 750 基准, 没有鸿蒙专属换算。初始渲染缓存、暗黑模式、部分音频与支付等能力当时不支持。

## 来源

- [像素单位 vp/fp/lpx](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ts-pixel-units-0000001820881013) (2026-03-09)
- [布局基础 (设备 px/vp 表、栅格、fp 定义)](https://developer.huawei.com/consumer/cn/doc/design-guides/design-layout-basics-0000001795579413) (2026-05-07)
- [间隔参数](https://developer.huawei.com/consumer/cn/doc/design-guides/interval-parameter-0000002562577161) (2026-09-09)、[圆角参数](https://developer.huawei.com/consumer/cn/doc/design-guides/corner-radius-parameter-0000002556468705) (2026-08-12)
- [栅格布局 GridRow](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts-layout-development-grid-layout) (2026-08-28)
- [触控尺寸规则 touch-target-size](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/ide_touch-target-size) (2026-01-15)
- [开发应用沉浸式效果](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides/arkts-develop-apply-immersive-effects) (2026-04-20)、[窗口沉浸式最佳实践](https://developer.huawei.com/consumer/cn/doc/best-practices/bpta-multi-device-window-immersive) (2026-09-15)
- [字号规范 V1](https://developer.huawei.com/consumer/cn/doc/design-guides-V1/font-0000001110498550-V1)、[HarmonyOS Sans](https://developer.huawei.com/consumer/cn/doc/doccenter-ux-design/font-0000001828772001) (2026-06-12)
- [px2vp 单位转换常见问题](https://developer.huawei.com/consumer/cn/doc/architecture-guides/tools-v1_2-ts_229-0000002417124253) (2026-04-29)、[Configuration](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-app-ability-configuration) (2026-07-28)
- [微信小程序 HarmonyOS 适配指南](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/ohos.html) (2026-09-12)
