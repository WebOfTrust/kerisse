#!/bin/bash


# Author: Kor Dwarshuis
# Created: 2023
# Updated: -
# Description: This script starts sitemap creator scripts. Not every URL that is scraped needs a sitemap via this route: sometimes a sitemap is already available, for example in the root of a website (sitemap.xml). Or via an HTLM sitemap available via a URL.

# Import variables from .env file
source .env


########################################
# General websites
########################################

# ReadTheDocs sites expose sitemap.xml directly; see configScraperGenericSitemaps.mjs.

########################################
# Github repos - createSitemapGithub.mjs
# Source of truth: config/configGithubRepos.json
########################################

# How to use (single repo):
# $ node ${SEARCH_INDEX_DIR}/createSitemapGithub.mjs <repository-owner> <repository-name> <branch-name> <category>

github_repos_config="$(pwd)/${SEARCH_INDEX_CONFIG_DIR}/configGithubRepos.json"

if [ ! -f "$github_repos_config" ]; then
  echo "Missing GitHub repos config: $github_repos_config" >&2
  exit 1
fi

jq -c '.[]' "$github_repos_config" | while read -r repo; do
  owner=$(echo "$repo" | jq -r '.owner')
  name=$(echo "$repo" | jq -r '.repo')
  branch=$(echo "$repo" | jq -r '.branch')
  category=$(echo "$repo" | jq -r '.category')
  node "${SEARCH_INDEX_DIR}/createSitemapGithub.mjs" "$owner" "$name" "$branch" "$category"
done
