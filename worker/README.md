# 初见雷达 · Worker 部署说明

这个 Worker 做三件事：

1. 把百炼的 API Key 藏在服务端，浏览器永远拿不到
2. 校验兑换码，一个码用一次（或指定次数）
3. 原样转发请求，前端完全不用改调用方式

**你只需要在终端跑 6 条命令。**

---

## 一、注册 Cloudflare（免费）

<https://dash.cloudflare.com/sign-up> —— 邮箱 + 密码，不需要绑卡。

## 二、登录并创建 KV

```bash
cd worker
npx wrangler login
```

浏览器会弹出来让你授权，点 **Allow**。

然后创建存放兑换码的 KV：

```bash
npx wrangler kv namespace create CODES
```

它会打印类似这样一行：

```
[[kv_namespaces]]
binding = "CODES"
id = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
```

把那个 **id** 复制，粘贴到 `worker/wrangler.toml` 里对应的位置。

## 三、写入两个密钥

```bash
npx wrangler secret put DASHSCOPE_API_KEY
```

提示输入时，粘贴你的百炼 Key（`sk-ws-...` 那串），回车。

```bash
npx wrangler secret put ADMIN_TOKEN
```

这个是你自己定的口令，用来生成兑换码。随便设一个长一点的，比如 `cjr-admin-2026-x7k9`。**记住它**，后面发码要用。

## 四、发布

```bash
npx wrangler deploy
```

成功后会打印地址，形如：

```
https://chujian-radar-proxy.你的账号.workers.dev
```

## 五、把它接到网站上（不用重新构建）

打开 GitHub 仓库的 `gh-pages` 分支，编辑根目录的 **`config.js`**：

```js
window.CJR_CONFIG = {
  endpoint: 'https://chujian-radar-proxy.你的账号.workers.dev/v1/chat/completions',
  model: 'qwen3-vl-plus',
  requireCode: true,
};
```

保存（Commit changes）。等一分钟，刷新网站——上传区下面会出现兑换码输入框。

> 注意两点：地址结尾要带 `/v1/chat/completions`；是 `gh-pages` 分支，不是 `main`。

## 六、发码

```bash
cd ..   # 回到项目根目录
WORKER_URL=https://chujian-radar-proxy.你的账号.workers.dev \
ADMIN_TOKEN=你刚才设的口令 \
node tools/gen-codes.mjs 20 1
```

意思是生成 20 个码，每个可用 1 次。结果会打印出来，同时追加写入 `codes.csv`。

卖出一单就发一个码，买家在网站上输入即可。

---

## 自检

```bash
curl https://chujian-radar-proxy.你的账号.workers.dev/
```

返回 `{"ok":true,"service":"chujian-radar-proxy"}` 就说明活着。

想确认 Key 有没有生效，可以用一个测试码跑一次：

```bash
curl -X POST https://chujian-radar-proxy.你的账号.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"code":"CJR-XXXX-XXXX","model":"qwen3-vl-plus","messages":[{"role":"user","content":"hi"}],"max_tokens":10}'
```

返回 `choices` 就是通了；返回「兑换码无效」说明码没对上；返回「兑换码已经用完」说明这个码用过了。

---

## 常见问题

**改了 config.js 没生效？**
浏览器缓存。强制刷新（⌘⇧R），或者等一分钟 CDN 过期。

**部署报错 `KV namespace not found`**
`wrangler.toml` 里的 id 没填，或者填错了。

**网站提示「验证服务暂时不可用」**
Worker 挂了，或者 `ALLOW_ORIGIN` 没设成你的站点地址。去 Cloudflare 后台看 Worker 的日志。

**想加一个「每人每天限 3 次」的限制？**
现在没有。靠的是「一码一次」，够用了。真要加，用 KV 存 IP 计数即可。

**额度**
Cloudflare 免费版每天 10 万次请求、KV 每天 10 万次读 / 1000 次写。按一单一码算，一天卖几十单绰绰有余。写次数（1000/天）意味着一天最多用掉约 1000 次分析——远高于你的实际销量。
