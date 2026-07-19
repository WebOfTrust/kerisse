#!/bin/bash

# Author: Kor Dwarshuis
# Created: 2023
# Updated: 2026
# Description: Create GitHub repo sitemaps via createSitemapGithub.mjs.
#   Not every scraped site needs a sitemap from here — some already publish
#   sitemap.xml (e.g. ReadTheDocs; see configScraperGenericSitemaps.mjs).
#   Repo list: config/configGithubRepos.json

# Import variables from .env file
source .env

github_repos_config="$(pwd)/${SEARCH_INDEX_CONFIG_DIR}/configGithubRepos.json"

if [ ! -f "$github_repos_config" ]; then
  echo "Missing GitHub repos config: $github_repos_config" >&2
  exit 1
fi

# Single repo: node scraper/createSitemapGithub.mjs <owner> <repo> <branch> <category>
# Entries with "skipCrawl": true keep existing JSONL and are not re-sitemap'd.
jq -c '.[]' "$github_repos_config" | while read -r repo; do
  skip=$(echo "$repo" | jq -r '.skipCrawl // false')
  if [ "$skip" = "true" ]; then
    owner=$(echo "$repo" | jq -r '.owner')
    name=$(echo "$repo" | jq -r '.repo')
    echo "Skipping sitemap (skipCrawl): ${owner}/${name}"
    continue
  fi
  owner=$(echo "$repo" | jq -r '.owner')
  name=$(echo "$repo" | jq -r '.repo')
  branch=$(echo "$repo" | jq -r '.branch')
  category=$(echo "$repo" | jq -r '.category')
  node "${SEARCH_INDEX_DIR}/createSitemapGithub.mjs" "$owner" "$name" "$branch" "$category"
done
