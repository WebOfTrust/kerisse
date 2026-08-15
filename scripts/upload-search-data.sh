#!/bin/sh
# Upload the search index shards AND the raw scraped dataset to keri.foundation
# (Hostinger) over SSH.
#
# Uses the same SSH host alias as CONF26-subtitles/scripts/deploy-subtitles.sh:
#   Host kerifoundation  in ~/.ssh/config
#
# What gets uploaded:
#   output/search-index/    -> $KERISSE_REMOTE_DIR/search-index/   (used by the search UI)
#   search-index-entries/   -> $KERISSE_REMOTE_DIR/dataset/        (full corpus, e.g. for AI training)
#   hosting/htaccess-search-index -> .htaccess in both remote dirs (CORS + headers)
#
# Configuration via .env (or environment):
#   KERISSE_SSH_HOST=kerifoundation
#   KERISSE_REMOTE_DIR=/home/u465541917/domains/keri.foundation/public_html/kerisse
# Optional if you are not using an SSH config alias:
#   KERISSE_SSH_USER=u465541917
#   KERISSE_SSH_PORT=65002
#
# Requires rsync locally and SSH access (the `kerifoundation` alias).

set -eu

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

: "${KERISSE_SSH_HOST:?Set KERISSE_SSH_HOST in .env (SSH config alias, e.g. kerifoundation)}"
: "${KERISSE_REMOTE_DIR:?Set KERISSE_REMOTE_DIR in .env}"

if [ -n "${KERISSE_SSH_USER:-}" ]; then
  REMOTE="${KERISSE_SSH_USER}@${KERISSE_SSH_HOST}"
else
  REMOTE="${KERISSE_SSH_HOST}"
fi

if [ -n "${KERISSE_SSH_PORT:-}" ]; then
  SSH="ssh -p ${KERISSE_SSH_PORT}"
  RSYNC_SSH="ssh -p ${KERISSE_SSH_PORT}"
else
  SSH="ssh"
  RSYNC_SSH="ssh"
fi

if [ ! -f output/search-index/manifest.json ]; then
  echo "output/search-index/manifest.json not found - run 'npm run build:search-index' first" >&2
  exit 1
fi

echo "Creating remote directories on ${REMOTE}..."
$SSH "$REMOTE" "mkdir -p '$KERISSE_REMOTE_DIR/search-index' '$KERISSE_REMOTE_DIR/dataset'"

echo "Uploading index shards (output/search-index/)..."
rsync -avz --delete -e "$RSYNC_SSH" output/search-index/ "$REMOTE:$KERISSE_REMOTE_DIR/search-index/"

echo "Uploading raw dataset (search-index-entries/)..."
rsync -avz --delete --exclude '*.not-split' -e "$RSYNC_SSH" search-index-entries/ "$REMOTE:$KERISSE_REMOTE_DIR/dataset/"

echo "Uploading .htaccess (CORS + headers)..."
rsync -avz -e "$RSYNC_SSH" hosting/htaccess-search-index "$REMOTE:$KERISSE_REMOTE_DIR/search-index/.htaccess"
rsync -avz -e "$RSYNC_SSH" hosting/htaccess-search-index "$REMOTE:$KERISSE_REMOTE_DIR/dataset/.htaccess"

echo "Done."
echo "  Shards:  https://keri.foundation/kerisse/search-index/manifest.json"
echo "  Dataset: https://keri.foundation/kerisse/dataset/"
