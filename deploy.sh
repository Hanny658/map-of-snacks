# Author: Hanny

set -Eeuo pipefail
IFS=$'\n\t'

# ===== Config (override via env if needed) =====
BRANCH="${BRANCH:-main}"
REPO_DIR="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)}"
PM2_APP="${PM2_APP:-snack-map}"                           # process name in pm2

echo "[INFO] ==== Starting Deployment process at $(date '+%F %T') ===="

# Concurrency lock (avoid overlapping runs)
LOCK_FILE="/tmp/$(basename "$REPO_DIR")-deploy.lock"
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  echo "[WARN] Another deploy is running. Exit."
  exit 0
fi

cd "$REPO_DIR"
if [[ ! -d .git ]]; then
  echo "[ERROR] $REPO_DIR is not a git repo."
  exit 1
fi

echo "[INFO] Fetching..."
git fetch --all --tags --prune

echo "[INFO] Reset to origin/${BRANCH}..."
git reset --hard "origin/${BRANCH}"

echo "[INFO] Database schema updates migrating..."
npx prisma migrate deploy

# Install deps (prefer ci when lockfile exists)
if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    echo "[INFO] npm ci"
    npm ci
  else
    echo "[INFO] npm install"
    npm install --no-audit --no-fund
  fi
else
  echo "[INFO] No package.json; skip Node steps."
fi

# PM2 reload this process
if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
    echo "[INFO] pm2 reload ${PM2_APP}"
    pm2 reload "$PM2_APP"
  else
    echo "[INFO] pm2 start ${PM2_APP} (not found, starting)"
    pm2 start npm --name "$PM2_APP" -- run start || true
  fi
else
  echo "[WARN] pm2 not found; skip process restart."
fi

echo "[INFO] ==== Deployment finished at $(date '+%F %T') ===="
