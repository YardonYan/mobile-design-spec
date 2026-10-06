# 代码落地写法

把规范数值写进代码时的常用手法。每条都给出问题写法和修正写法。

## 换算心智模型

所有平台都先换算成"占屏宽的比例", 再乘目标平台的设计稿宽度:

```
比例 = 尺寸 / 源平台设计稿宽度
目标尺寸 = 比例 * 目标平台设计稿宽度
```

主稿宽度: iOS 402pt、Android 411dp、HarmonyOS 384vp、小程序 750rpx、H5 375px。

各平台触控下限不是等比换算出来的, 是各自的规则: iOS 44pt、Android 48dp、HarmonyOS 48vp 推荐 / 40vp 硬性、小程序 88rpx (由 44pt 推得)、H5 按 WCAG 2.2 是 24px 底线、按体验建议是 44px。定热区直接取平台规则值, 别换算后取整。

单位也别混: iOS 的 1pt、Android 的 1dp、鸿蒙的 1vp、H5 的 1px 数值接近但缩放机制不同。做设计标注时一定写明单位和平台, 别让开发猜。用 `scripts/convert.cjs` 算, 别心算。

## H5 / CSS

viewport 是所有尺寸生效的前提:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

`viewport-fit=cover` 是使用 `env(safe-area-inset-*)` 的前提条件。

底部固定按钮避开 Home Indicator:

```css
/* 问题: 全面屏上按钮被手势区挡住 */
.submit { position: fixed; bottom: 0; height: 44px; }

/* 修正: 高度不含安全区, 安全区用 padding 补 */
.submit {
  position: fixed; bottom: 0;
  min-height: 44px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
```

触控热区不够时用 padding 或伪元素撑开, 不要为了视觉缩小可点区域:

```css
.icon-btn { width: 24px; height: 24px; position: relative; }
.icon-btn::after {
  content: ""; position: absolute; inset: -10px; /* 实际热区 44x44 */
}
```

字号与行高:

```css
body {
  font-family: system-ui, -apple-system, "PingFang SC", "Helvetica Neue", sans-serif;
  font-size: 15px;      /* 正文不低于 14px, 推荐 15~16px */
  line-height: 1.7;     /* 正文至少 1.6 */
}
.page { padding: 0 16px; max-width: 750px; margin: 0 auto; }
img { max-width: 100%; height: auto; }

/* 整屏高度: 100vh 在 iOS Safari 上等于 lvh, 地址栏展开时底部会被遮 */
.hero { min-height: 100dvh; }
.hero--fixed { height: 100svh; }   /* 需要绝对不遮挡时用 svh */
```

断点按 xs/sm/md/lg/xl 写, 移动优先:

```css
/* 基础样式即 xs (<576px) */
@media (min-width: 576px) { /* sm 大屏手机 */ }
@media (min-width: 768px) { /* md 平板竖屏 */ }
@media (min-width: 992px) { /* lg 平板横屏 */ }
@media (min-width: 1200px) { /* xl 桌面端 */ }
```

## 微信小程序 / WXSS

新代码优先 vw (官方口径), 已有 rpx 项目保持 rpx 并在 `app.json` 开 `convertRpxToVw` 修精度问题。两者都不要在同一个组件里混用, 固定 px 只留给 1px 细线:

```css
/* 问题: 固定像素在不同机型不缩放 */
.cell { height: 44px; padding: 0 16px; }

/* 修正: 44px 逻辑值在 750 设计稿下等于 88rpx, 等比写法是 11.73vw */
.cell { height: 88rpx; padding: 0 32rpx; }
```

页面左右边距 30 ~ 32rpx, 最小触控 88 x 88rpx。大屏和折叠屏展开态要配媒体查询限制内容宽度, 官方明确提醒不要滥用基于屏宽比例的单位。

自定义导航栏必须动态取高度, 状态栏高度因设备而异:

```js
const { statusBarHeight } = wx.getWindowInfo();      // 或 wx.getSystemInfoSync()
const menu = wx.getMenuButtonBoundingClientRect();
// 导航栏内容高 = (胶囊 top - 状态栏高) * 2 + 胶囊高; 官方无公式, 这是社区通用写法
// 返回字段单位都是 px, 坐标以屏幕左上角为原点
this.setData({ statusBarHeight, navHeight: (menu.top - statusBarHeight) * 2 + menu.height });
```

底部安全区:

```css
.tabbar-holder { height: calc(100rpx + env(safe-area-inset-bottom)); }
```

`env()` 自 2020 年起跨浏览器可用, 不再需要 `constant()` 兜底, 除非要覆盖 2018 ~ 2019 年的 iOS。Skyline 渲染器的 `env()` 只支持 `safe-area-inset-*` 系列。TabBar 本体 100rpx 不含安全区 (社区约定值, 官方未给数值), 原生 tabBar 图标建议尺寸是 81 x 81 px 而不是 rpx。

## SwiftUI / iOS

安全区默认生效, 危险写法是把背景铺满后再手写顶部偏移:

```swift
// 问题: 背景铺满后内容被刘海截断
.background(Color.white.ignoresSafeArea())
VStack { Text("标题").padding(.top, 20) }

// 修正: 背景可以铺满, 内容仍走安全区
.background(Color.white.ignoresSafeArea(edges: .all))
VStack { Text("标题") }
    .padding(.horizontal, 16)          // 内容区左右取 16~20pt
```

触控与列表项高度:

```swift
Button("提交") { ... }
    .frame(maxWidth: .infinity)
    .frame(minHeight: 44)            // 44pt 是铁律

// 底部操作栏: 让系统安全区决定额外高度, 别把 49pt + 34pt 写死
.safeAreaInset(edge: .bottom) { ActionBar() }
```

字号用系统语义字体, 天然对齐 SF Pro 阶梯并支持动态字体:

```swift
Text("大标题").font(.largeTitle)                          // 34pt Bold, 行高 41
Text("正文").font(.body)                                  // 17pt Regular
Text("脚注").font(.footnote).foregroundStyle(.secondary)   // 13pt

// 只有要精确锁字号时才写 .font(.system(size:weight:)), 代价是丢掉 Dynamic Type
```

标注交付时单位写 pt 并标倍率, 切图给 @2x 和 @3x。

## Jetpack Compose / Android

布局用 dp, 字体用 sp, 出现裸 px 就是问题:

```kotlin
// 问题: 高度写裸数值 (px), 字号用 dp, 不跟随系统字号偏好
Modifier.height(48)
Text("正文", fontSize = 14.dp)

// 修正
Modifier.height(48.dp)
Text("正文", fontSize = 16.sp, lineHeight = 24.sp)
```

触控目标 48dp 是 Google 硬性要求, 视觉尺寸不足时用 `minimumInteractiveSize` 语义的容器撑开:

```kotlin
Box(
    modifier = Modifier
        .heightIn(min = 48.dp)
        .fillMaxWidth()
        .clickable { },
    contentAlignment = Alignment.Center
) { Icon(...) }
```

间距与安全区:

```kotlin
// 内容左右至少 16dp
Modifier.padding(horizontal = 16.dp)

// 底部栏避开手势区
Spacer(Modifier.height(56.dp))
Box(Modifier.height(56.dp).navigationBarsPadding())   // 或 windowInsetsPadding(WindowInsets.safeDrawing)
```

状态栏和手势区的 dp 高度官方不给固定值, 一律运行时读取。targetSdk 36 起边到边不可关闭, `windowOptOutEdgeToEdgeEnforcement` 必须移除, 顶部内容用 `statusBarsPadding()` 而不是写死数值。

## ArkTS / ArkUI (HarmonyOS)

布局用 vp, 字体用 fp。ArkUI 里 `fontSize()` 传数字默认就是 fp, 尺寸属性传数字默认是 vp; 出问题的是显式写了错单位:

```ts
// 问题: 字体标成 vp, 放大系统字号时不跟随; 布局标成 px, 不同密度机器上大小不一
Text("正文").fontSize('16vp').width('812px').height('100px')

// 修正: 数字默认单位就是各自正确的单位
Text("正文").fontSize(16)                    // 等价于 '16fp'
  .width(402)                                // 等价于 402vp
  .padding({ left: 16, right: 16 })
```

`Configuration.fontSizeScale` (API 12+) 决定 fp 的实际缩放, 需要精细控制时用 `this.getUIContext().fp2px()`。全局 `vp2px()` / `px2fp()` / `lpx2px()` 自 API 18 起废弃, 一律走 `this.getUIContext()` 的实例方法。

触控热区推荐 48vp, 硬性下限 40vp (官方 Code Linter 规则 `@cross-device-app-dev/touch-target-size`, 会检查 `responseRegion`):

```ts
Button({ text: '提交' })
  .height(48)                                  // 视觉不足 48vp 时撑开 responseRegion
  .responseRegion({ width: 48, height: 48 })
```

安全区用避让区 API 动态取, 返回值是 px 必须转 vp, 而且要兜底为 0 的情况:

```ts
const win = this.windowStage.getMainWindowSync();
const indicator = win.getWindowAvoidArea(window.AvoidAreaType.TYPE_NAVIGATION_INDICATOR);
const bottom = this.getUIContext().px2vp(indicator.bottomRect.height);   // 隐藏导航条 / 横屏时可能是 0
Column().padding({ bottom: 28 + bottom })                                 // 28vp 是官方设计稿底部边距
win.on('avoidAreaChange', (data) => { /* 重新计算 */ });
```

全屏布局配 `setWindowLayoutFullScreen(true)`, 背景扩展用 `expandSafeArea`。断点按 GridRow 默认口径 xs <320 / sm 320~600 / md 600~840 / lg ≥840, 列数 4 / 8 / 12。

## 标注交付约定

给开发的标注必须包含五件事, 缺一项就会被追问:

1. 单位 (pt / dp / sp / vp / fp / rpx / px / vw)
2. 平台
3. 设计稿基准宽度 (iOS 402pt / Android 411dp / 鸿蒙 384vp / 小程序 750rpx / H5 375px)
4. 切图倍率 (@2x / @3x)
5. 留白区域算不算在内 (安全区、阴影、点击热区)
