#!/usr/bin/env bash
# 一键部署 Worker：登录 → 建 KV → 写密钥 → 发布 → 回填 config.js
# 用法：./scripts/setup-worker.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
dim()  { printf "\033[2m%s\033[0m\n" "$1"; }
die()  { printf "\033[31m✗ %s\033[0m\n" "$1"; exit 1; }

command -v npx >/dev/null || die "没找到 npx，先装 Node.js"

bold ""
bold "初见雷达 · Worker 一键部署"
bold "────────────────────────────"
dim "需要先在 Cloudflare 建一个 API Token（下面会说怎么建）。"
dim ""

# ---------- 1. 鉴权 ----------
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  bold "① 先创建一个 Cloudflare API Token"
  cat <<'TXT'

  1. 打开  https://dash.cloudflare.com/profile/api-tokens
  2. 点右上「Create Token」
  3. 选模板「Edit Cloudflare Workers」→ 点「Use template」
  4. 什么都别改，直接拉到底 →「Continue to summary」→「Create Token」
  5. 复制那串 token，然后这样运行：

      CLOUDFLARE_API_TOKEN=粘贴的token ./scripts/setup-worker.sh

TXT
  exit 1
fi

if ! npx --yes wrangler whoami >/dev/null 2>&1; then
  die "Token 无效或权限不足。确认创建时选的是 Edit Cloudflare Workers 模板"
fi
dim "✓ Token 有效"

# ---------- 2. KV ----------
cd "$ROOT/worker"
bold ""
bold "② 创建兑换码仓库"

if grep -qE '^id = "[a-f0-9]{20,}"' wrangler.toml 2>/dev/null; then
  dim "✓ wrangler.toml 里已经有 KV id，跳过"
else
  OUT="$(npx --yes wrangler kv namespace create CODES 2>&1)" || {
    echo "$OUT"
    die "创建 KV 失败。如果提示已存在，去 Cloudflare 后台删掉旧的再重试"
  }
  KV_ID="$(printf '%s' "$OUT" | grep -oE 'id = "[a-f0-9]+"' | head -1 | sed 's/id = "//; s/"//')"
  [ -n "$KV_ID" ] || { echo "$OUT"; die "没解析出 KV id，手动把它填进 worker/wrangler.toml"; }

  sed -i '' "s/^id = \".*\"/id = \"$KV_ID\"/" wrangler.toml
  dim "✓ KV 已创建：$KV_ID"
fi

# ---------- 3. 百炼 Key ----------
bold ""
bold "③ 写入百炼 API Key"
dim "提示符出现后直接粘贴（不会显示），回车。"
read -rs -p "   粘贴 Key: " DS_KEY
echo ""
[ -n "$DS_KEY" ] || die "Key 不能为空"
printf '%s' "$DS_KEY" | npx --yes wrangler secret put DASHSCOPE_API_KEY >/dev/null
dim "✓ Key 已写入（只存在 Cloudflare，前端拿不到）"

# ---------- 4. 管理员口令 ----------
bold ""
bold "④ 生成管理员口令"
ADMIN_TOKEN="cjr-$(openssl rand -hex 12)"
printf '%s' "$ADMIN_TOKEN" | npx --yes wrangler secret put ADMIN_TOKEN >/dev/null
printf '%s' "$ADMIN_TOKEN" > "$ROOT/.admin-token"
chmod 600 "$ROOT/.admin-token"
dim "✓ 已生成并保存到 .admin-token（发码时要用，别删）"

# ---------- 5. 发布 ----------
bold ""
bold "⑤ 发布"
OUT="$(npx --yes wrangler deploy 2>&1)" || { echo "$OUT"; die "发布失败"; }
WORKER_URL="$(printf '%s' "$OUT" | grep -oE 'https://[a-zA-Z0-9._-]+\.workers\.dev' | head -1)"
[ -n "$WORKER_URL" ] || { echo "$OUT"; die "没解析出 Worker 地址"; }
dim "✓ 已发布：$WORKER_URL"

# ---------- 6. 自检 ----------
bold ""
bold "⑥ 自检"
HEALTH="$(curl -s --max-time 15 "$WORKER_URL/" || true)"
case "$HEALTH" in
  *'"ok":true'*) dim "✓ 服务正常" ;;
  *) dim "⚠ 自检没通过，返回：$HEALTH" ;;
esac

# ---------- 7. 回填 config.js ----------
bold ""
bold "⑦ 把地址写进站点配置"
cat > "$ROOT/public/config.js" <<EOF
// 运行时站点配置 —— 改这里不用重新构建
window.CJR_CONFIG = {
  endpoint: '$WORKER_URL/v1/chat/completions',
  model: 'qwen3-vl-plus',
  requireCode: true,
};
EOF
dim "✓ public/config.js 已更新"

bold ""
bold "────────────────────────────"
bold "Worker 好了"
echo ""
echo "  地址     $WORKER_URL"
echo "  口令     $ADMIN_TOKEN"
echo "  已保存   .admin-token"
echo ""
echo "  发码："
echo "    WORKER_URL=$WORKER_URL ADMIN_TOKEN=$ADMIN_TOKEN node tools/gen-codes.mjs 10 1"
echo ""
echo "  最后一步：把新站点推上去"
echo "    ./scripts/deploy.sh"
echo ""
dim "  推的时候 git 会问账号密码，密码位置粘贴你的 GitHub token。"
bold ""
