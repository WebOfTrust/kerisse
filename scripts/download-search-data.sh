#!/bin/sh
# Download the raw scraped dataset from the hosting server into
# search-index-entries/, for machines that don't have the data locally
# (the dataset is not committed to git). After downloading you can run
# 'npm run build:search-index' without re-scraping.
#
# Usage: sh scripts/download-search-data.sh [base-url]
#   base-url defaults to $KERISSE_DATASET_URL from .env, e.g.
#   KERISSE_DATASET_URL=https://keri.foundation/kerisse/dataset

set -eu

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env; set +a
fi

BASE_URL="${1:-${KERISSE_DATASET_URL:-}}"
if [ -z "$BASE_URL" ]; then
  echo "Usage: sh scripts/download-search-data.sh https://keri.foundation/kerisse/dataset" >&2
  echo "(or set KERISSE_DATASET_URL in .env)" >&2
  exit 1
fi

mkdir -p search-index-entries

# Mirror the remote dataset directory (plain directory listing must be enabled,
# otherwise fall back to rsync/scp from the server).
wget --recursive --no-parent --no-directories --directory-prefix=search-index-entries \
  --accept '*.jsonl,*.json' --reject 'index.html*' "$BASE_URL/"

echo "Done. Files in search-index-entries/:"
ls search-index-entries | head
