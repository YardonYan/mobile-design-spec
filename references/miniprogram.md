# 微信小程序规范

一套设计稿走天下。这一节把官方文档口径和社区经验值分开写, 定规则时只把官方口径当硬约束。

## 尺寸单位

| 单位 | 官方口径 |
| --- | --- |
| rpx | "用于表达页面总宽度的 1 / 750"; 375px 屏下 1rpx = 0.5px。因历史原因保留, 官方承认计算过程会对转换后的数值取整 |
| vw | 官方明确"CSS 标准的 vw 单位已经得到广泛支持, 所以还是优先推荐使用 vw" |
| px | 无小程序特殊语义, 就是 CSS px |
| rem / vh | Skyline 类型表支持; em 不支持 |

结论: 新组件优先 vw, 需要"按设计稿宽度铺满"时才用 rpx。官方同时提醒不要滥用基于屏宽比例的单位, 大屏 (iPad、折叠屏、PC 小程序) 要配合媒体查询限制内容宽度。

精度问题有专门开关: `app.json` 的 `convertRpxToVw` (boolean, 默认 false, 基础库 3.3.0), 开启后把 rpx 转成 vw, 官方说明用于修复某些 rpx 下的精度问题。

## 系统组件尺寸

| 组件 | 数值 | 口径 |
| --- | --- | --- |
| 状态栏高度 | 运行时获取 | 官方: 因设备而异, 用 `wx.getSystemInfoSync()` / `wx.getWindowInfo()` |
| 自定义导航栏高度 | 88rpx (iPhone 标准) | 社区经验值, 官方无固定数值 |
| 底部 TabBar 高度 | 100rpx 不含安全区 | 社区经验值; 原生 tabBar 高度和字号无可配置项, 官方文档也未给数值 |
| TabBar 图标 | 81 x 81 px, 上限 40kb, 不支持网络图 | 官方口径, 注意单位是 px 不是 rpx |
| TabBar 项数 | 2 ~ 5 个, `position` 仅 bottom / top, top 时不显示 icon | 官方 |
| 页面内容左右边距 | 30 ~ 32rpx | 社区与微信设计指南推荐值 |
| 最小触控区域 | 88 x 88rpx (即 44pt) | 由 Apple 44pt 换算而来; 小程序框架文档未给出官方数值 |

原生 tabBar 需要自定义高度、角标动画或中间凸起时, 用自定义 tabBar 组件, 别用 line-height 硬撑。

## 胶囊按钮

`wx.getMenuButtonBoundingClientRect()` 返回 `width` `height` `top` `right` `bottom` `left`, 全部 number, 单位 px, 坐标以屏幕左上角为原点。基础库 2.15.0 起支持, Windows / Mac / 鸿蒙版微信可用。

自定义导航栏高度社区通用公式: `胶囊 top * 2 + 胶囊高度` (官方无公式)。胶囊在右上角, 自定义导航栏里的标题和按钮都要避开它。社区流传的"胶囊 87 x 32px、右边距 10px"未在官方文档出现, 不要当常量写死。

## 安全区

顶部安全区 = 状态栏 + 导航栏, 约占 160 ~ 180rpx (经验值)。底部安全区 iPhone X 以上约 68rpx, 安卓一般 0 ~ 24rpx (经验值)。

写法:
- Skyline 渲染器: `env()` 受支持, 但官方类型表注明只支持 `safe-area-inset-*` 系列
- WebView 渲染器: 跟随系统 WebView 内核, 官方说明"不同操作系统自带的 WebView 引擎也不尽相同"
- `constant(safe-area-inset-bottom)` 兜底已不需要, MDN 记录 `env()` 自 2020 年 1 月起跨浏览器可用, 只有要覆盖 2018 ~ 2019 年 iOS 时才保留

底部悬浮按钮和固定输入框必须留底部安全区, 否则 iPhone 手势条会挡住点击。

## 鸿蒙上的小程序

微信有官方《HarmonyOS 适配指南》: 渲染层由 ArkWeb 接管 (不是 Skyline), 平台判断 `wx.getDeviceInfo().platform === 'ohos'` (PC 形态 `ohos_pc`), 工具内模拟还要看 `system === 'HarmonyOS'`, 基础库需 ≥ 3.7.0, 用 `wx.canIUse` 探测能力。rpx 仍按 750 基准, 无鸿蒙专属换算。

## 实战要点

- 设计稿宽度 750px, 标注用 rpx 或 vw, 同一项目里不要混
- 自定义导航栏一定通过 API 取状态栏高度, 别写死
- 图片用 CDN + WebP, 体积更小加载更快
- 底部悬浮操作按钮预留安全区高度, 特别是 iPhone
- 大屏和折叠屏展开态用媒体查询限制内容最大宽度, 别指望比例单位自动好看

## 勘误

原始参考文章把 TabBar 图标写成 81 x 81rpx, 微信官方文档的建议尺寸是 81px x 81px (原生 tabBar 图标不走 rpx)。88rpx 导航栏、100rpx TabBar、30 ~ 32rpx 边距这几项官方无同名数值, 属社区约定, 在本文件中已标注口径来源。

## 来源

- [小程序 WXSS 单位](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html)、[app.json 配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html)、[Skyline WXSS](https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/skyline/wxss.html) (抓取于 2026-10-06)
- [wx.getMenuButtonBoundingClientRect](https://developers.weixin.qq.com/miniprogram/dev/api/ui/menu/wx.getMenuButtonBoundingClientRect.html)、[tabBar 配置](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#tabbar)
- [微信小程序 HarmonyOS 适配指南](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/ohos.html) (2026-09-12)
- [MDN env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)、[Apple Design Tips](https://developer.apple.com/design/tips/)、[WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
