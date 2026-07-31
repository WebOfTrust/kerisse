#!/usr/bin/env node
/**
 * Reads config/ and emits a Mermaid diagram of what the scraper will crawl.
 * Does not run createInput or hit the network — parses config files statically.
 *
 * Usage: node scripts/generate-scrape-mermaid.mjs
 *        node scripts/generate-scrape-mermaid.mjs --stdout
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const configDir = path.join(root, 'config');
const outFile = path.join(configDir, 'scrape-sources.md');

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(configDir, rel), 'utf8'));
}

function listFiles(dir, exts) {
  const abs = path.join(configDir, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => exts.some((e) => f.endsWith(e)))
    .sort();
}

function extractBalancedObject(source, startIdx) {
  const brace = source.indexOf('{', startIdx);
  if (brace < 0) return null;
  let depth = 0;
  for (let i = brace; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return source.slice(brace, i + 1);
    }
  }
  return null;
}

function stripJsComments(src) {
  // Remove block comments, then full-line // comments (keeps URLs in strings intact enough for our fields).
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function field(objSrc, name) {
  const m = objSrc.match(new RegExp(`${name}\\s*:\\s*['\`]([^'\`]+)['\`]`));
  return m ? m[1] : '';
}

/** Active generic sites from generic-sites.mjs (export scrape() calls). */
function parseGenericSites() {
  const src = fs.readFileSync(
    path.join(configDir, 'generic-sites.mjs'),
    'utf8'
  );
  const exportBody = src.match(
    /export default async function\s*\(\)\s*\{([\s\S]*?)\n\};?\s*$/
  );
  if (!exportBody) throw new Error('Could not find export in generic-sites.mjs');

  const active = [];
  for (const line of exportBody[1].split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;
    const m = trimmed.match(/^scrape\((\w+)/);
    if (m) active.push(m[1]);
  }

  return active.map((configName) => {
    const idx = src.indexOf(`const ${configName}`);
    if (idx < 0) throw new Error(`Missing ${configName}`);
    const obj = stripJsComments(extractBalancedObject(src, idx) || '');
    if (!obj) throw new Error(`Could not parse object for ${configName}`);

    const createIdx = obj.indexOf('createInput');
    const createObj = createIdx >= 0 ? extractBalancedObject(obj, createIdx) : '';
    return {
      configName,
      siteName: field(obj, 'siteName') || configName,
      category: field(obj, 'category'),
      destinationFile: field(obj, 'destinationFile'),
      sourceType: field(createObj || '', 'sourceType'),
      sourcePath: field(createObj || '', 'sourcePath'),
      excludeURLs: field(createObj || '', 'excludeURLs'),
      queryString: field(createObj || '', 'queryString'),
    };
  });
}

function mermaidId(prefix, text) {
  return (
    prefix +
    '_' +
    String(text)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 48)
  );
}

function escapeLabel(s) {
  return String(s).replace(/"/g, "'").replace(/\n/g, ' ');
}

function shortUrl(url) {
  try {
    const u = new URL(url);
    const p = u.pathname.length > 40 ? u.pathname.slice(0, 37) + '…' : u.pathname;
    return u.hostname + (p === '/' ? '' : p);
  } catch {
    return url;
  }
}

function siteLabel(s) {
  // RTD configs reuse one siteName; prefer host from the sitemap URL when present.
  let host = '';
  try {
    if (s.sourcePath.startsWith('http')) host = new URL(s.sourcePath).hostname;
  } catch {
    /* ignore */
  }
  if (host && s.siteName.toLowerCase().includes('python implementation')) {
    return host;
  }
  return s.siteName;
}

function chainVertical(ids) {
  if (ids.length < 2) return [];
  return [`  ${ids.join(' --> ')}`];
}

function buildMermaid({ sites, singles, repos, manualEntries, manualSitemaps }) {
  const lines = [];
  // TB + explicit node chains keep the whole diagram in one vertical column
  // (unlinked siblings / parallel ROOT edges otherwise fan out left-to-right).
  lines.push('flowchart TB');
  lines.push('  ROOT["config/"]');
  lines.push('  OUT["search-index-entries/*.jsonl"]');
  lines.push('');

  const genIds = [];
  lines.push('  subgraph GEN["Generic sites — generic-sites.mjs"]');
  lines.push('    direction TB');
  for (const s of sites) {
    const id = mermaidId('g', s.configName);
    genIds.push(id);
    const typeHint =
      s.sourceType === 'remoteXMLsitemap'
        ? 'remote XML'
        : s.sourceType === 'localXMLsitemap'
          ? 'local XML'
          : s.sourceType === 'querySelector'
            ? 'HTML querySelector'
            : s.sourceType || '?';
    const excl = s.excludeURLs ? '<br/>− excludes' : '';
    lines.push(
      `    ${id}["${escapeLabel(siteLabel(s))}<br/><small>${escapeLabel(typeHint)} · ${escapeLabel(shortUrl(s.sourcePath))}${excl}</small>"]`
    );
  }
  lines.push('  end');
  lines.push('');

  const bySource = new Map();
  for (const u of singles) {
    const key = u.source || 'Other';
    if (!bySource.has(key)) bySource.set(key, []);
    bySource.get(key).push(u);
  }
  const singleIds = [];
  lines.push(
    `  subgraph SINGLE["Single URLs — single-urls/urls.json (${singles.length})"]`
  );
  lines.push('    direction TB');
  for (const [source, items] of bySource) {
    const sid = mermaidId('su', source);
    singleIds.push(sid);
    const titles = items
      .slice(0, 4)
      .map((i) => escapeLabel(i.pageTitle || i.url))
      .join('<br/>• ');
    const more = items.length > 4 ? `<br/>… +${items.length - 4} more` : '';
    lines.push(
      `    ${sid}["${escapeLabel(source)} (${items.length})<br/>• ${titles}${more}"]`
    );
  }
  lines.push('  end');
  lines.push('');

  const byOwner = new Map();
  for (const r of repos) {
    if (!byOwner.has(r.owner)) byOwner.set(r.owner, []);
    byOwner.get(r.owner).push(r);
  }
  const crawl = repos.filter((r) => !r.skipCrawl);
  const frozen = repos.filter((r) => r.skipCrawl);
  const ghIds = [];
  lines.push(
    `  subgraph GH["GitHub — github-repos.json (${crawl.length} crawl${frozen.length ? `, ${frozen.length} skipCrawl` : ''})"]`
  );
  lines.push('    direction TB');
  for (const [owner, items] of byOwner) {
    const oid = mermaidId('gh', owner);
    ghIds.push(oid);
    const repoBits = items
      .map((r) => {
        const flag = r.skipCrawl ? ' ⊘' : '';
        return escapeLabel(`${r.repo}@${r.branch}${flag}`);
      })
      .join('<br/>');
    lines.push(`    ${oid}["${escapeLabel(owner)}<br/>${repoBits}"]`);
  }
  lines.push('  end');
  lines.push('');

  const manIds = [];
  lines.push('  subgraph MAN["Manual (copied, not crawled from live discovery)"]');
  lines.push('    direction TB');
  if (manualEntries.length) {
    manIds.push('MENT');
    lines.push(
      `    MENT["entries: ${manualEntries.map(escapeLabel).join(', ')}"]`
    );
  }
  if (manualSitemaps.length) {
    manIds.push('MSM');
    lines.push(
      `    MSM["sitemaps → scraper/sitemaps/: ${manualSitemaps.map(escapeLabel).join(', ')}"]`
    );
  }
  lines.push('  end');
  lines.push('');

  // One vertical spine: config → channels → output
  const spine = ['ROOT', ...genIds, ...singleIds, ...ghIds, ...manIds, 'OUT'];
  lines.push(...chainVertical(spine));

  return lines.join('\n');
}

function buildMarkdown(data) {
  const { sites, singles, repos, manualEntries, manualSitemaps, mermaid } = data;
  const crawl = repos.filter((r) => !r.skipCrawl);
  const frozen = repos.filter((r) => r.skipCrawl);

  const siteRows = sites
    .map(
      (s) =>
        `| ${s.siteName} | \`${s.sourceType}\` | ${s.sourcePath} | ${s.excludeURLs ? `\`${path.basename(s.excludeURLs)}\`` : '—'} | \`${s.destinationFile}\` |`
    )
    .join('\n');

  const singleRows = singles
    .map(
      (u) =>
        `| ${u.pageTitle || shortUrl(u.url)} | ${u.source || ''} | ${u.category || ''} | ${u.url} |`
    )
    .join('\n');

  const repoRows = repos
    .map(
      (r) =>
        `| ${r.owner}/${r.repo} | ${r.branch} | ${r.category || ''} | ${r.skipCrawl ? 'skipCrawl (frozen)' : 'crawl'} |`
    )
    .join('\n');

  return `# What will be scraped

How to edit sources: [README.md](../README.md#scraping-search-index).

Generated from \`config/\` by \`scripts/generate-scrape-mermaid.mjs\`.
Re-run after editing scrape config:

\`\`\`bash
npm run diagram:scrape
\`\`\`

## Summary

| Channel | Count | Config |
|--------|------:|--------|
| Generic sites | ${sites.length} | \`generic-sites.mjs\` |
| Single URLs | ${singles.length} | \`single-urls/urls.json\` |
| GitHub repos (crawl) | ${crawl.length} | \`github-repos.json\` |
| GitHub repos (skipCrawl) | ${frozen.length} | \`github-repos.json\` |
| Manual index entries | ${manualEntries.length} | \`manual-entries/\` |
| Manual sitemaps | ${manualSitemaps.length} | \`manual-sitemaps/\` |

## Diagram

\`\`\`mermaid
${mermaid}
\`\`\`

## Generic sites

| Site | Discovery | Source path | Excludes | Destination |
|------|-----------|-------------|----------|-------------|
${siteRows}

## Single URLs

| Title | Source | Category | URL |
|-------|--------|----------|-----|
${singleRows}

## GitHub repos

| Repo | Branch | Category | Mode |
|------|--------|----------|------|
${repoRows}

## Manual

- **Index entries:** ${manualEntries.length ? manualEntries.join(', ') : '(none)'}
- **Sitemaps:** ${manualSitemaps.length ? manualSitemaps.join(', ') : '(none)'}
`;
}

function main() {
  const sites = parseGenericSites();
  const singles = readJson('single-urls/urls.json');
  const repos = readJson('github-repos.json');
  const manualEntries = listFiles('manual-entries', ['.json', '.jsonl']);
  const manualSitemaps = listFiles('manual-sitemaps', ['.xml']);

  const mermaid = buildMermaid({
    sites,
    singles,
    repos,
    manualEntries,
    manualSitemaps,
  });

  const md = buildMarkdown({
    sites,
    singles,
    repos,
    manualEntries,
    manualSitemaps,
    mermaid,
  });

  const stdoutOnly = process.argv.includes('--stdout');
  if (stdoutOnly) {
    process.stdout.write(mermaid + '\n');
  } else {
    fs.writeFileSync(outFile, md, 'utf8');
    console.log(`Wrote ${path.relative(root, outFile)}`);
    console.log(
      `  ${sites.length} sites · ${singles.length} single URLs · ${repos.length} GitHub · ${manualEntries.length} manual entries · ${manualSitemaps.length} manual sitemaps`
    );
  }
}

main();
