# -*- coding: utf-8 -*-
"""为 mobile-design-spec 生成 README 配图（PNG，确保 GitHub 稳定渲染）。

字体约定：中文一律走 msyh / msyhbd，Consolas 只用于纯英文与代码片段，
否则中文字形会渲染成方块。
"""
import os

from PIL import Image, ImageDraw, ImageFont

OUT = r"D:/Study/AI_Yardon/GitCode/mobile-design-spec/assets"

REG = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"
MONO = "C:/Windows/Fonts/consola.ttf"

BG_TOP = (11, 18, 32)
BG_BOT = (22, 36, 61)
CARD = (27, 42, 71)
CARD2 = (33, 50, 82)
LINE = (58, 82, 122)
TXT = (255, 255, 255)
SUB = (148, 163, 184)
DIM = (100, 116, 139)

IOS = (10, 132, 255)
AND = (61, 220, 132)
HAR = (46, 124, 246)
MP = (7, 193, 96)
H5 = (227, 79, 38)
AMBER = (245, 176, 66)


def f(path, size):
    return ImageFont.truetype(path, size)


def vgrad(size, c1, c2):
    w, h = size
    strip = Image.new("RGB", (1, h))
    d = ImageDraw.Draw(strip)
    for y in range(h):
        t = y / max(h - 1, 1)
        d.point((0, y), fill=tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3)))
    return strip.resize((w, h))


def base(w, h):
    img = vgrad((w, h), BG_TOP, BG_BOT)
    return img, ImageDraw.Draw(img)


def tw(draw, text, font):
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def pill(draw, x, y, text, color, font, padx=26, pady=13):
    w, h = tw(draw, text, font)
    bw, bh = w + padx * 2, h + pady * 2
    draw.rounded_rectangle([x, y, x + bw, y + bh], radius=bh // 2, fill=CARD2, outline=LINE, width=1)
    cx, cy = x + padx // 2, y + bh // 2
    draw.ellipse([cx, cy - 7, cx + 14, cy + 7], fill=color)
    draw.text((x + padx, y + pady), text, font=font, fill=TXT)
    return bw


def card(draw, box, radius=18, fill=CARD, outline=LINE, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def arrow(draw, x1, y, x2, color=LINE, head=11):
    draw.line([x1, y, x2 - head, y], fill=color, width=3)
    draw.polygon([(x2, y), (x2 - head, y - 7), (x2 - head, y + 7)], fill=color)


# ---------------------------------------------------------------- 1. hero
def hero():
    W, H = 1600, 640
    img, d = base(W, H)

    for i in range(26):
        d.ellipse([W - 300 - i * 22, -120 - i * 22, W + 120 - i * 22, 260 - i * 22],
                  outline=(56, 82, 122), width=1)

    d.text((90, 96), "AGENT SKILL  ·  ZERO DEPENDENCIES", font=f(MONO, 24), fill=(71, 105, 150))
    d.text((90, 148), "mobile-design-spec", font=f(BOLD, 78), fill=TXT)
    d.text((90, 254), "一套 Skill，搞定五套移动端尺寸规范", font=f(BOLD, 42), fill=(186, 214, 255))
    d.text((90, 316), "One skill for five mobile sizing systems — every fix comes with its source.",
           font=f(REG, 27), fill=SUB)
    d.text((90, 362), "iOS · Android · HarmonyOS · 微信小程序 · H5，以及平板、折叠屏、桌面、TV、穿戴。",
           font=f(REG, 25), fill=DIM)

    x, y = 90, 440
    for name, color in [("iOS", IOS), ("Android", AND), ("HarmonyOS", HAR), ("微信小程序", MP), ("H5", H5)]:
        x += pill(d, x, y, name, color, f(REG, 27)) + 18

    d.text((90, 548), "数据基准 2026-10  ·  16 类走查规则  ·  15 项回归测试",
           font=f(REG, 23), fill=(86, 120, 168))

    d.line([90, 600, W - 90, 600], fill=LINE, width=1)
    img.save(os.path.join(OUT, "hero.png"))
    print("hero.png")


# --------------------------------------------------------- 2. architecture
def architecture():
    W, H = 1560, 800
    img, d = base(W, H)
    d.text((70, 54), "SKILL 是怎样工作的 / How the skill loads", font=f(BOLD, 40), fill=TXT)
    d.text((70, 112), "SKILL.md 常驻上下文，reference 按需加载——这是 Skill 相比长文档的核心优势",
           font=f(REG, 24), fill=SUB)

    ins = [("你的代码", ".css  .wxss  .swift  .kt  .ets  .xml"),
           ("一句话需求", "「底部按钮在 iPhone 上按不到」"),
           ("一个尺寸值", "16pt  /  88rpx  /  48dp")]
    y = 190
    for title, sub in ins:
        card(d, [70, y, 400, y + 80])
        d.text((96, y + 15), title, font=f(BOLD, 26), fill=TXT)
        d.text((96, y + 48), sub, font=f(REG, 19), fill=SUB)
        y += 94

    arrow(d, 412, 320, 458)

    card(d, [470, 210, 800, 430], fill=CARD2, outline=(86, 130, 190), width=2)
    d.text((500, 238), "SKILL.md", font=f(BOLD, 34), fill=(186, 214, 255))
    d.text((500, 296), "① 判定目标平台", font=f(REG, 23), fill=TXT)
    d.text((500, 334), "② 查跨平台速查表", font=f(REG, 23), fill=TXT)
    d.text((500, 372), "③ 套用硬性红线", font=f(REG, 23), fill=TXT)

    arrow(d, 812, 320, 858)

    card(d, [870, 210, 1500, 430], fill=(23, 52, 48), outline=(45, 212, 168), width=2)
    d.text((900, 238), "带依据的修改", font=f(BOLD, 32), fill=(110, 231, 183))
    for i, line in enumerate(["位置：文件与行号", "原值 → 新值", "依据哪条规范、哪个官方口径"]):
        d.text((900, 298 + i * 38), "· " + line, font=f(REG, 23), fill=TXT)

    d.text((70, 492), "按需加载的 reference", font=f(BOLD, 27), fill=TXT)
    refs = [("ios.md", IOS), ("android.md", AND), ("harmonyos.md", HAR),
            ("miniprogram.md", MP), ("h5.md", H5), ("devices.md", AMBER),
            ("multi-device.md", AMBER), ("code-patterns.md", (148, 130, 255))]
    for i, (name, color) in enumerate(refs):
        col, row = i % 4, i // 4
        x = 70 + col * 360
        y = 540 + row * 94
        card(d, [x, y, x + 345, y + 80])
        d.rectangle([x, y, x + 5, y + 80], fill=color)
        d.text((x + 24, y + 28), name, font=f(MONO, 21), fill=TXT)

    d.text((70, 750), "脚本不经 LLM 直接执行：convert.cjs 换算 · audit.cjs 走查 · selftest.mjs 回归测试",
           font=f(REG, 21), fill=DIM)
    img.save(os.path.join(OUT, "architecture.png"))
    print("architecture.png")


# ----------------------------------------------------------- 3. unit map
def unit_map():
    W, H = 1560, 760
    img, d = base(W, H)
    d.text((70, 56), "五套单位怎么对到一起 / Unit mapping across five systems",
           font=f(BOLD, 40), fill=TXT)
    d.text((70, 114), "以 iPhone 18 Pro 的 402pt 屏宽为基准，同一份设计稿换算到各平台",
           font=f(REG, 25), fill=SUB)

    plats = [("iOS", "pt", "@3x", "402 pt", IOS),
             ("Android", "dp", "xxhdpi", "411 dp", AND),
             ("HarmonyOS", "vp", "3x", "384 vp", HAR),
             ("微信小程序", "rpx", "750 基准", "750 rpx", MP),
             ("H5", "px", "DPR 3", "375 px", H5)]

    x0, y0, cw, gap = 70, 190, 272, 20
    for i, (name, unit, density, basew, color) in enumerate(plats):
        x = x0 + i * (cw + gap)
        card(d, [x, y0, x + cw, y0 + 300], fill=CARD2, outline=LINE, width=1)
        d.rectangle([x, y0, x + cw, y0 + 6], fill=color)
        d.text((x + 26, y0 + 40), name, font=f(BOLD, 30), fill=TXT)
        d.text((x + 26, y0 + 92), unit, font=f(MONO, 58), fill=color)
        d.text((x + 26, y0 + 176), "基准宽", font=f(REG, 21), fill=SUB)
        d.text((x + 26, y0 + 208), basew, font=f(BOLD, 30), fill=TXT)
        d.text((x + 26, y0 + 254), density, font=f(REG, 20), fill=DIM)

    card(d, [70, 520, 1490, 700], fill=CARD, outline=LINE, width=1)
    d.text((104, 552), "最小触控热区 Minimum touch target", font=f(BOLD, 27), fill=TXT)

    items = [("44 pt", IOS), ("48 dp", AND), ("48 vp", HAR), ("88 rpx", MP), ("44 px", H5)]
    x = 104
    for i, (val, color) in enumerate(items):
        w, h = tw(d, val, f(BOLD, 40))
        d.text((x, 610), val, font=f(BOLD, 40), fill=color)
        if i < len(items) - 1:
            d.text((x + w + 14, 618), "≈", font=f(REG, 30), fill=DIM)
            x = x + w + 46
        else:
            x = x + w
    d.text((104, 664), "WCAG 2.5.8 底线 24px；82rpx 图标 + 88rpx 容器是小程序常见写法",
           font=f(REG, 21), fill=SUB)
    img.save(os.path.join(OUT, "unit-map.png"))
    print("unit-map.png")


# --------------------------------------------------------- 4. audit preview
def audit_preview():
    W, H = 1400, 700
    img = Image.new("RGB", (W, H), (13, 17, 23))
    d = ImageDraw.Draw(img)

    d.rounded_rectangle([20, 20, W - 20, H - 20], radius=14, fill=(24, 28, 36),
                        outline=(56, 66, 82), width=1)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([48 + i * 30, 46, 62 + i * 30, 60], fill=c)
    d.text((152, 42), "mobile-design-spec — 规范走查", font=f(REG, 21), fill=(110, 122, 142))

    y = 104
    d.text((60, y), "$", font=f(BOLD, 22), fill=(110, 231, 183))
    d.text((86, y), "node scripts/audit.cjs detail.wxss index.html", font=f(REG, 22), fill=(203, 213, 225))

    y += 56
    rows = [
        ("detail.wxss", "file"),
        ("  2:1    WARN     [page-padding] .page 左右边距 24rpx 小于 30rpx", "warn"),
        ("            修正：提到 30rpx 以上，内容别贴屏幕边", "fix"),
        ("  3:1    WARN     [touch-target] .buy-btn 高度 72rpx 小于触控最小值 88rpx", "warn"),
        ("            修正：改成 88rpx，或用 padding / 伪元素撑开热区", "fix"),
        ("", "gap"),
        ("index.html", "file"),
        ("  1:1    ERROR    [viewport] 缺少 viewport meta", "error"),
        ("            修正：加 <meta name=\"viewport\" content=\"...viewport-fit=cover\">", "fix"),
        ("", "gap"),
        ("扫描 2 个文件：1 error，2 warn，1 info", "summary"),
    ]
    colors = {"file": (120, 170, 255), "warn": (245, 176, 66), "error": (248, 113, 113),
              "fix": (130, 145, 168), "summary": (110, 231, 183)}
    for text, kind in rows:
        if kind == "gap":
            y += 16
            continue
        d.text((60, y), text, font=f(REG, 21), fill=colors[kind])
        y += 42

    d.text((60, H - 66), "有 ERROR 时退出码为 1，可直接接进 GitHub Actions 卡住 PR",
           font=f(REG, 21), fill=(100, 116, 139))
    img.save(os.path.join(OUT, "audit-preview.png"))
    print("audit-preview.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    hero()
    architecture()
    unit_map()
    audit_preview()
