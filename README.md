# 初见雷达 · 你给陌生人的第一印象

上传一张照片，AI 推演陌生人在三秒内形成的印象——你最容易被记住的是什么，又最容易被误读成什么。

不是打分排名，而是**命名**。产品设计思路见 [DESIGN.md](./DESIGN.md)。

---

## 技术栈

- Vite + React + TypeScript，纯静态，可部署到 GitHub Pages
- 视觉：手写 CSS + 手写 SVG 雷达图，无 UI 框架
- 报告分享卡：原生 Canvas 绘制，1080×1440 PNG
- 报告分享链接：报告 JSON 经 LZ-String 压缩后放进 URL hash，无需后端
- 大模型：阿里云百炼 `qwen3-vl-plus`（默认）／智谱 `glm-4.5v`／任意 OpenAI 兼容接口

---

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物在 dist/
npm run preview
```

首次打开点右上角齿轮，填入 API Key 即可使用。也可以直接点「先看一份示例报告」浏览完整效果，不需要 Key。

---

## 大模型的两种接法

### 方式 A：自带 Key（BYOK，默认，零后端）

访客在设置里填自己的 API Key，Key 存在浏览器 `localStorage`，不会上传到任何服务器，也不会被打包进构建产物。

- 阿里云百炼：<https://bailian.console.aliyun.com/?tab=model#/api-key>
- 智谱：<https://open.bigmodel.cn/usercenter/apikeys>

适合内测、小范围使用。

### 方式 B：自建代理（公开上线用这个）

公开站点不能把 Key 写进前端。正确的做法是加一层转发：

1. 用 Cloudflare Worker（免费额度每天 10 万次）转发到百炼，Key 存在 Worker 的环境变量里；
2. 构建时注入代理地址：

```bash
VITE_PUBLIC_ENDPOINT="https://your-worker.workers.dev/v1/chat/completions" \
VITE_PUBLIC_MODEL="qwen3-vl-plus" \
npm run build
```

这样访客打开即用，不需要填任何 Key。站点仍可托管在 GitHub Pages 上——Worker 只做转发。

---

## 部署到 GitHub Pages

### 第一次

1. 在 GitHub 新建一个 **public** 仓库，比如 `chujian-radar`；
2. 本地关联并推送源码：

```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/<你的用户名>/chujian-radar.git
git branch -M main
git push -u origin main
```

3. 构建并发布：

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

4. 仓库 **Settings → Pages**，Source 选 **Deploy from a branch**，Branch 选 **gh-pages** / **/(root)**，保存。

约 1 分钟后访问 `https://<你的用户名>.github.io/chujian-radar/`。

### 之后更新

改完代码执行 `./scripts/deploy.sh` 即可。

> 注意：`vite.config.ts` 里 `base: './'` 用的是相对路径，所以放在 `用户名.github.io/仓库名/` 这种子路径下也能正常工作，不需要改配置。

---

## 目录结构

```
src/
  App.tsx                 页面状态机：上传 → 分析 → 报告
  types.ts                报告数据结构（全站唯一真相）
  config.ts               站点名称 / 地址
  styles.css              全部样式
  components/
    Upload.tsx            上传区 + 场合选择
    Analyzing.tsx         扫描动画与阶段文案
    ReportView.tsx        报告八个模块
    Radar.tsx             SVG 六维雷达
    SettingsModal.tsx     模型 / Key 配置
    ShareModal.tsx        印象卡预览与下载
  lib/
    ai.ts                 提示词、调用、JSON 容错与归一化
    share.ts              Canvas 绘制分享卡
    shareLink.ts          报告编解码进 URL
    image.ts              客户端压缩
    storage.ts            设置持久化
    demo.ts               示例报告
scripts/deploy.sh         构建并推 gh-pages
```

---

## 合规与隐私

- 照片只发送到用户自己配置的模型服务商，本站不存储、不留存任何图片；
- 报告明确声明「只描述这张照片给人的感觉，不定义你这个人」；
- 不推测年龄、职业、健康、民族、宗教、性取向，不做面相命理；
- 不对容貌做美丑排序，不使用"缺陷""硬伤"等词；
- 面向未成年人提示需监护人指导。

上线前建议补充：隐私政策页、用户协议、ICP 备案（若使用国内域名/服务器）。

---

## 两种运行模式

站点启动时会读取同目录下的 `config.js`（不用重新构建就能改）：

```js
window.CJR_CONFIG = {
  endpoint: '',            // Worker 地址；留空 = 自带 Key 模式
  model: 'qwen3-vl-plus',
  requireCode: true,       // true = 访客必须输入兑换码
};
```

| `endpoint` | 模式 | 谁填 Key |
|---|---|---|
| 空 | 自带 Key（BYOK） | 每个访客填自己的 |
| 填了 Worker 地址 | 兑换码售卖 | 只有你在服务端填一次 |

改 `config.js` 不需要重新构建——它是运行时读取的。

## 售卖链路

```
买家下单 → 你发一个兑换码 → 买家在网站输入
        → Worker 校验并扣次 → 转发百炼 → 返回报告
```

- Worker 与部署说明：[worker/README.md](./worker/README.md)
- 发码脚本：`node tools/gen-codes.mjs 数量 每码次数`
- 商品图与上架文案：[shop/](./shop/)

## 目录补充

```
worker/          Cloudflare Worker：藏 Key + 校验兑换码 + 转发
tools/           发码脚本
shop/            小红书商品图与文案
public/config.js 运行时配置（部署后改这个文件即可切换模式）
```
