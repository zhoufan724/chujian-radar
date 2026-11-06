# 商品图 · 说明

11 张图，全部由 `index.html` 渲染生成。改文字就改 HTML，然后重新导出，不用碰设计软件。

## 文件

```
shop/
  index.html          所有图的源文件（1080px 宽，绝对定位排版）
  assets/             手机截图、印象卡等素材
  out/                导出的成品 PNG
  render.js           导出脚本
 商品文案.md          上架标题、卖点、详情文案
```

## 尺寸

- `主图1~5`：1080 × 1080（1:1，小红书商品主图）
- `详情1~6`：1080 × 1440（3:4，详情页）

## 改完重新导出

```bash
cd shop
npm i -D playwright        # 只需一次
npx playwright install chromium
node render.js
```

如果已经装了 Chrome，也可以跳过下载，直接用本机浏览器：

```bash
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" node render.js
```

`render.js` 会按 id 逐张截图，输出到 `out/`，文件名不变。

## 想改什么，改哪里

| 想改 | 位置 |
|---|---|
| 主标题文案 | `index.html` 里每个 `#m1`…`#d6` 的 `.h1` |
| 判词示例 | 搜索「你不是第一眼让人喜欢的人」 |
| 配色 | `<style>` 顶部的 `--gold` / `--coral` / `--ink` |
| 手机截图 | 换 `assets/` 里的 png，重新导出即可 |
| 品牌名 | 搜索「初见雷达」，全局替换 |

## 注意

- 字体用的是 macOS 自带的 **宋体（Songti SC）** 和 **苹方**。换到 Windows 上渲染会掉字重，必须在 Mac 上导出。
- 手机截图来自线上站点的「示例报告」，如果想用自己的真实报告，先在网站上生成一次，截图替换 `assets/` 里的文件。
