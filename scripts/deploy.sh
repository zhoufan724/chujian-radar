#!/usr/bin/env bash
# 把 dist/ 推到 gh-pages 分支。GitHub Pages 从 gh-pages 分支根目录发布。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE="${1:-origin}"
URL="$(git -C "$ROOT" remote get-url "$REMOTE" 2>/dev/null || true)"
if [ -z "$URL" ]; then
  echo "找不到 remote '$REMOTE'，先 git remote add origin <repo-url>"
  exit 1
fi

echo "→ 构建…"
npm run build

echo "→ 推送到 gh-pages…"
cd dist
rm -rf .git
git init -q
git checkout -q -b gh-pages
git add -A
git -c user.name="deploy" -c user.email="deploy@local" commit -q -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')"
git push -f "$URL" gh-pages

echo "✓ 完成。稍等 1 分钟，访问 https://<你的用户名>.github.io/chujian-radar/"
