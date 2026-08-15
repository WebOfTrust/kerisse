#!/bin/sh
# Upload the search index shards AND the raw scraped dataset to the hosting
# server (e.g. Hostinger / keri.foundation) over SSH.
#
# What gets uploaded:
#   output/search-index/    -> $KERISSE_REMOTE_DIR/search-index/   (used by the search UI)
#   search-index-entries/   -> $KERISSE_REMOTE_DIR/dataset/        (full corpus, e.g. for AI training)
#   hosting/htaccess-search-index -> .htaccess in both remote dirs (CORS + headers)
#
# Configuration via .env (or environment):
#   KERISSE_SSH_HOST=123.456.789.10        # Hostinger SSH host or IP
#   KERISSE_SSH_PORT=65002                 # Hostinger SSH port (see hPanel -> Advanced -> SSH access)
#   KERISSE_SSH_USER=u123456789            # Hostinger SSH user
#   KERISSE_REMOTE_DIR=domains/keri.foundation/public_html/kerisse
#
# Requires rsync locally and SSH access enabled on the Hostinger plan.

set -eu

cd "$(dirname "$0")/.."

# Load .env if present (only the KERISSE_ variables are needed).
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

: "${KERISSE_SSH_HOST:?Set KERISSE_SSH_HOST in .env}"
: "${KERISSE_SSH_PORT:=22}"
: "${KERISSE_SSH_USER:?Set KERISSE_SSH_USER in .env}"
: "${KERISSE_REMOTE_DIR:?Set KERISSE_REMOTE_DIR in .env}"

REMOTE="$KERISSE_SSH_USER@$KERISSE_SSH_HOST"
SSH="ssh -p $KERISSE_SSH_PORT"

if [ ! -f output/search-index/manifest.json ]; then
  echo "output/search-index/manifest.json not found - run 'npm run build:search-index' first" >&2
  exit 1
fi

echo "Creating remote directories..."
$SSH "$REMOTE" "mkdir -p '$KERISSE_REMOTE_DIR/search-index' '$KERISSE_REMOTE_DIR/dataset'"

echo "Uploading index shards (output/search-index/)..."
rsync -avz --delete -e "$SSH" output/search-index/ "$REMOTE:$KERISSE_REMOTE_DIR/search-index/"

echo "Uploading raw dataset (search-index-entries/)..."
rsync -avz --delete --exclude '*.not-split' -e "$SSH" search-index-entries/ "$REMOTE:$KERISSE_REMOTE_DIR/dataset/"

echo "Uploading .htaccess (CORS + headers)..."
rsync -avz -e "$SSH" hosting/htaccess-search-index "$REMOTE:$KERISSE_REMOTE_DIR/search-index/.htaccess"
rsync -avz -e "$SSH" hosting/htaccess-search-index "$REMOTE:$KERISSE_REMOTE_DIR/dataset/.htaccess"

echo "Done. Point paths.searchIndexBaseUrl at the public URL of $KERISSE_REMOTE_DIR/search-index/"
