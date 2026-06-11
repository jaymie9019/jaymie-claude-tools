#!/usr/bin/env bun
/**
 * collect-html — deterministic mechanics for the collect-html skill.
 *
 * The agent does the judgement (which file, title, project, keep vs throwaway).
 * This script does the deterministic work and nothing else:
 *   add     create a symlink + manifest entry, regenerate index.html
 *   prune   drop expired scratch entries (unlink only — project file untouched)
 *   remove  drop one entry by id (unlink only)
 *   list    print the manifest
 *
 * Storage (override root with COLLECT_HTML_HOME):
 *   ~/collect-html/manifest.json   the shared contract with the web panel
 *   ~/collect-html/links/<id>.html symlink -> the real project file
 *   ~/collect-html/index.html      generated, openable via file:// or a server
 */
import { mkdir, symlink, unlink, readFile, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename, resolve, extname } from "node:path";

const ROOT = process.env.COLLECT_HTML_HOME ?? join(homedir(), "collect-html");
const LINKS = join(ROOT, "links");
const MANIFEST = join(ROOT, "manifest.json");
const INDEX = join(ROOT, "index.html");
const TTL_DAYS = Number(process.env.COLLECT_HTML_TTL ?? 14);
const PANEL_URL = process.env.COLLECT_HTML_URL ?? `file://${INDEX}`;

type Disposition = "kept" | "scratch" | "archived";
interface Entry {
  id: string;
  title: string;
  project: string;
  target: string; // absolute path to the real project file
  disposition: Disposition;
  addedAt: string; // YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function daysSince(date: string): number {
  const then = new Date(date + "T00:00:00Z").getTime();
  return Math.floor((Date.now() - then) / 86_400_000);
}
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "untitled";
}
function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}

async function loadManifest(): Promise<Entry[]> {
  if (!existsSync(MANIFEST)) return [];
  try {
    return JSON.parse(await readFile(MANIFEST, "utf8")) as Entry[];
  } catch {
    throw new Error(`manifest.json 损坏，无法解析：${MANIFEST}`);
  }
}
async function saveManifest(entries: Entry[]): Promise<void> {
  await mkdir(ROOT, { recursive: true });
  // atomic write: write tmp then rename over the target
  const tmp = MANIFEST + ".tmp";
  await writeFile(tmp, JSON.stringify(entries, null, 2) + "\n");
  await rename(tmp, MANIFEST);
}
function makeId(project: string, title: string, target: string, existing: Set<string>): string {
  const base = `${slug(project)}__${slug(title || basename(target, extname(target)))}`;
  if (!existing.has(base)) return base;
  let n = 2;
  while (existing.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

function parseFlags(args: string[]): { _: string[]; flags: Record<string, string | boolean> } {
  const _: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) { flags[key] = next; i++; }
      else flags[key] = true;
    } else _.push(a);
  }
  return { _, flags };
}

async function cmdAdd(args: string[]) {
  const { _, flags } = parseFlags(args);
  const target = resolve(_[0] ?? "");
  if (!_[0]) die("用法：add <html路径> --project <名> --title <标题> [--keep|--scratch]");
  if (!existsSync(target)) die(`找不到文件：${target}`);
  if (extname(target).toLowerCase() !== ".html") die(`不是 .html 文件：${target}`);

  const project = String(flags.project ?? basename(resolve(target, "..")));
  const title = String(flags.title ?? basename(target, extname(target)));
  const disposition: Disposition = flags.keep ? "kept" : "scratch"; // default throwaway

  const entries = await loadManifest();
  const existing = new Set(entries.map((e) => e.id));
  // de-dupe by target: re-collecting the same file updates the existing entry
  const prior = entries.find((e) => e.target === target);
  const id = prior?.id ?? makeId(project, title, target, existing);

  await mkdir(LINKS, { recursive: true });
  const link = join(LINKS, `${id}.html`);
  await unlink(link).catch(() => {});
  await symlink(target, link);

  const entry: Entry = { id, title, project, target, disposition, addedAt: prior?.addedAt ?? today() };
  const next = prior ? entries.map((e) => (e.id === id ? entry : e)) : [...entries, entry];
  await saveManifest(next);
  await regenIndex(next);

  const ttlNote = disposition === "scratch" ? `（scratch，${TTL_DAYS} 天未 keep 将自动脱管）` : "（已保留）";
  console.log(`✓ 已收藏 [${id}] ${title} ${ttlNote}`);
  console.log(`  面板：${PANEL_URL}`);
}

async function cmdRemove(args: string[]) {
  const id = args[0];
  if (!id) die("用法：remove <id>");
  const entries = await loadManifest();
  if (!entries.some((e) => e.id === id)) die(`没有这条记录：${id}`);
  await unlink(join(LINKS, `${id}.html`)).catch(() => {});
  const next = entries.filter((e) => e.id !== id);
  await saveManifest(next);
  await regenIndex(next);
  console.log(`✓ 已脱管 [${id}]（项目真文件未动）`);
}

async function cmdPrune() {
  const entries = await loadManifest();
  const expired = entries.filter((e) => e.disposition === "scratch" && daysSince(e.addedAt) >= TTL_DAYS);
  for (const e of expired) await unlink(join(LINKS, `${e.id}.html`)).catch(() => {});
  const next = entries.filter((e) => !expired.includes(e));
  await saveManifest(next);
  await regenIndex(next);
  console.log(`✓ prune 完成：脱管 ${expired.length} 条过期 scratch（项目真文件未动）`);
  for (const e of expired) console.log(`  - ${e.id}`);
}

async function cmdList() {
  const entries = await loadManifest();
  if (!entries.length) return console.log("（空）");
  for (const e of entries) {
    const age = daysSince(e.addedAt);
    console.log(`${e.disposition.padEnd(8)} ${e.id}  ·  ${e.title}  ·  ${e.project}  ·  ${age}d`);
  }
}

async function regenIndex(entries: Entry[]) {
  const groups: [Disposition, string][] = [["kept", "⭐ 保留"], ["scratch", "🗓 Scratch"], ["archived", "📦 归档"]];
  const section = (d: Disposition, label: string) => {
    const items = entries.filter((e) => e.disposition === d);
    const rows = items.length
      ? items.map((e) => `
        <li data-id="${esc(e.id)}">
          <a href="links/${encodeURIComponent(e.id)}.html">${esc(e.title)}</a>
          <span class="meta">${esc(e.project)} · ${esc(e.addedAt)}${d === "scratch" ? ` · ${TTL_DAYS}d 内` : ""}</span>
          <span class="act">
            <button data-act="archive">归档</button>
            <button data-act="delete" class="danger">删除</button>
          </span>
        </li>`).join("")
      : `<li class="empty">（空）</li>`;
    return `<section><h2>${label} <span class="n">${items.length}</span></h2><ul>${rows}</ul></section>`;
  };
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>collect-html 面板</title><style>
:root{--bg:#fbfaf7;--fg:#1c1a17;--muted:#6b6459;--line:#e6e1d8;--card:#fff;--accent:#b4541a;--danger:#b4281f}
@media(prefers-color-scheme:dark){:root{--bg:#15140f;--fg:#ece7dd;--muted:#9a9183;--line:#2d2a23;--card:#1d1b15;--accent:#e0823f;--danger:#f08b82}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font-family:-apple-system,"PingFang SC",sans-serif;line-height:1.6}
.wrap{max-width:780px;margin:0 auto;padding:40px 20px 80px}h1{font-size:26px;margin:0 0 4px}.sub{color:var(--muted);font-size:14px;margin:0 0 28px}
h2{font-size:17px;margin:30px 0 10px}.n{color:var(--muted);font-weight:400;font-size:14px}
ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}
li{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:11px 14px;display:flex;align-items:center;gap:12px}
li.empty{color:var(--muted);justify-content:center;font-size:14px}
a{color:var(--accent);text-decoration:none;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.meta{color:var(--muted);font-size:12.5px;flex:0 0 auto}
.act{display:flex;gap:6px;flex:0 0 auto}
button{font:inherit;font-size:12.5px;border:1px solid var(--line);background:var(--bg);color:var(--fg);border-radius:7px;padding:4px 10px;cursor:pointer}
button:hover{border-color:var(--accent)}button.danger:hover{border-color:var(--danger);color:var(--danger)}
.hint{color:var(--muted);font-size:13px;margin-top:24px;padding:12px 14px;border:1px dashed var(--line);border-radius:10px}
</style></head><body><div class="wrap">
<h1>collect-html</h1><p class="sub">生成于 ${today()} · 共 ${entries.length} 条</p>
${groups.map(([d, l]) => section(d, l)).join("")}
<p class="hint" id="hint"></p>
</div><script>
const isFile = location.protocol === 'file:';
document.getElementById('hint').textContent = isFile
  ? '当前以 file:// 打开：可浏览，但「归档/删除」需要启动面板后端（见 SETUP.md）。'
  : '点「归档/删除」即调用后端（删除=仅脱管，项目真文件不动）。';
if (isFile) document.querySelectorAll('.act').forEach(n => n.style.display = 'none');
document.querySelectorAll('button[data-act]').forEach(b => b.onclick = async () => {
  const id = b.closest('li').dataset.id, act = b.dataset.act;
  if (act === 'delete' && !confirm('从面板删除（脱管）「' + id + '」？项目真文件不会被删。')) return;
  const r = await fetch('/api/' + act + '?id=' + encodeURIComponent(id), { method: 'POST' });
  if (r.ok) location.reload(); else alert('操作失败：' + r.status);
});
</script></body></html>`;
  await mkdir(ROOT, { recursive: true });
  await writeFile(INDEX, html);
}

function die(msg: string): never {
  console.error("✗ " + msg);
  process.exit(1);
}

// Reusable API for the panel backend (server.ts imports these).
export { loadManifest, saveManifest, regenIndex, ROOT, LINKS, MANIFEST, INDEX };
export type { Entry, Disposition };

// CLI entry point — only runs when invoked directly, not when imported.
if (import.meta.main) {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case "add": await cmdAdd(rest); break;
    case "remove": await cmdRemove(rest); break;
    case "prune": await cmdPrune(); break;
    case "list": await cmdList(); break;
    default:
      console.log("collect-html — 命令：add | prune | remove | list");
      console.log("  add <html路径> --project <名> --title <标题> [--keep|--scratch]");
      console.log("  prune");
      console.log("  remove <id>");
      console.log("  list");
  }
}
