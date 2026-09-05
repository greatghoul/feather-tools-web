# Feather Tools → Astro 迁移评估

> 状态：评估文档（未动工）
> 日期：2026-09-05
> 目的：评估把当前「手写 Vite 多入口 + 自定义预渲染」架构迁移到 Astro 的可行性、工作量与风险，供决策。文档基于对当前仓库的逐文件核对（2026-09-05）。

---

## 1. 结论先行

- **Astro 是这个站的正确归属**：多页静态输出、按语言路由、React 交互岛、真 dev server/HMR，正是当前手写管线在重复造的东西。
- **但迁移是独立工程，不是小改**：要搬的有 66~67 个工具、双语路由、手动分包、SEO 细节、遗留 301、工具专属静态资源，以及一批重依赖工具（ffmpeg.wasm / konva / html2canvas / CodeMirror）的挂载行为。
- **主要风险不是「Astro 不好」，而是「行为对齐」**：分包与缓存策略、已收录页面的 SEO 结构、66 个工具的加载时序，任何一项没对齐就是线上回归。
- **建议**：迁移值得做，但应作为独立项目立项、分阶段推进，并先做「数据漂移审计」（见 §6 Phase 0）和「页面级 diff 验证」（见 §7）。在迁移落地前，用一个低风险的 dev 修复（完整构建 + 静态预览）解决当前开发体验痛点，两者不冲突。

---

## 2. 现状架构（要搬的东西）

### 2.1 构建管线（两条腿）

| 步骤 | 脚本 | 产出 |
|---|---|---|
| 1. 打包 | `scripts/build-bundles.ts` | 一次 Vite 构建所有工具入口（`src/tools/<slug>/entries/{en,zh}.tsx`，共 **132 个入口**），手动分包 + `dist/.vite/manifest.json`，拷贝 `public/` |
| 2. 预渲染 | `scripts/generate-pages.tsx` | 读 manifest / 全量 i18n / tool-extras / PageSections，`renderToStaticMarkup` 生成全部 HTML 壳 + `sitemap.xml` + `_redirects` + `404.html` |

### 2.2 页面与路由（线上 URL 结构，必须原样保留）

- `/en/`、`/zh/` — 首页
- `/en/<tool>/`、`/zh/<tool>/` — 66 个工具 × 双语
- `/en/{about,privacy,terms}/`、`/zh/…` — 3 个静态页
- `sitemap.xml`、`404.html`（meta refresh → `/en/`）、`_redirects`
- 每个页面：`<link rel="alternate" hreflang>`（含 `x-default`）+ canonical + OG/Twitter meta + favicon 组 + `site.webmanifest`

### 2.3 分包策略（当前缓存调优的核心，迁移后要重新对齐）

手动 chunk：`vendor`（react/react-dom）、`shared`（公共组件/helpers）、`messages-en/zh`（客户端公共翻译）、`tools/<slug>`（工具逻辑 + 该语言翻译）。内容不变的 chunk hash 不变 → 浏览器长期缓存；重库（jszip/konva/ffmpeg）只在用到它的工具页下载。

### 2.4 工具挂载方式

每个工具两个入口文件（en/zh），模式统一（约 10 行）：

```tsx
// src/tools/<slug>/entries/en.tsx
import { initMessages } from '~/helpers/i18n';
import { mountApp } from '~/helpers/mount';
import commonMessages from '~/i18n/client/en.json';
import toolMessages from '../i18n/en.json';
import App from '../App';
(window as any).LOCALE = 'en';
initMessages({ ...commonMessages, ...toolMessages });
mountApp(<App />);
```

- `mountApp` = `createRoot(document.getElementById('app')).render(...)`
- 页面壳 `ToolPage` 里已有 `<div id="app">`（内含 Loading 占位），模块脚本在 DOM 解析后执行
- 重依赖工具：`@ffmpeg/ffmpeg`、`konva`、`html2canvas`、`@codemirror/*`、`jszip`、`qrcode`、`jsqr`、`gifuct-js`、`upng-js`、`figlet`、`axios`、`@faker-js/faker`

### 2.5 i18n 双路径

- **服务端（页面壳）**：`generate-pages` 加载全量 `src/i18n/{en,zh}.json`（各 2040 行），`t()` 取值写进 HTML
- **客户端（工具运行时）**：`src/i18n/client/{en,zh}.json`（49 行，`common/*` + `habitica/*` 切片）+ 工具切片 `src/tools/<slug>/i18n/{en,zh}.json`，运行时合并
- `t(key)` 缺键时返回 key 本身（防呆）
- 切片由一次性脚本 `scripts/convert-i18n.mjs` 从旧 Flask .po 生成（含跨语言补缺）

### 2.6 工具专属静态资源（tool-extras）

`src/data/generated/tool-extras.json`（66 个工具键）注入两类标签：

- `cssLinks`：如 `/static/gif-maker/gif-maker.css`（约 26 个工具有）
- `scripts`：如 `/static/libs/gif.js`、`/static/libs/sudoku.js`、jsdelivr 的 lame.min.js（约 5 个脚本条目）

`public/static/` 含：图标组、`styles.css`（`?v=20260807`）、`extensions/`（habitica/minecraft 图标）、`libs/`（gif.js + worker、preact、sudoku.js）、每工具一个 css 子目录。

### 2.7 静态区块（PageSections）

**31 个工具**有 `src/tools/<slug>/PageSections.tsx`，导出 `SectionsBefore` / `SectionsAfter`，在工具上下方插入静态说明区块（构建期渲染进 HTML）。

### 2.8 其它构建期行为

- GA：`GA_MEASUREMENT_ID` 构建环境变量 → head 注入 gtag
- Disqus：`DISQUS_SHORTNAME` + `disqusKey` → `#disqus_thread` + embed 脚本
- 相关工具推荐：构建期按分类随机挑 4 个（`pickSuggested`）
- 内联 vanilla JS：Navbar 折叠/下拉（约 25 行）+ 回到顶部（约 16 行）；**不用 Bootstrap JS**
- 遗留 301：`/ ?lang=zh /zh/ 301`、`/ /en/ 301`、`/<key> ?lang=zh /zh/<key>/ 301`、`/<key> /en/<key>/ 301`

### 2.9 已发现的数据漂移（迁移前必须先审计）

- `src/data/tools.ts` 注册 **67** 个 slug，但磁盘上只有 **66** 个工具目录 / 66 个入口 / 66 个 tool-extras 键（疑似 `emoji-picker` 有目录无注册或反之）。当前生产构建对「有注册无目录」的工具不生成页面，**这个差异要在迁移时一并厘清**。

---

## 3. 目标架构（Astro 版）

```
src/
  layouts/Layout.astro          # HTML 壳 + SEO head（替代 pages/Layout.tsx）
  layouts/Navbar.astro          # 折叠/下拉内联脚本放 <script> 或 Astro 组件
  layouts/Footer.astro
  pages/index.astro             # 首页（或按 i18n 路由 /en/ /zh/）
  pages/en/[slug].astro         # getStaticPaths 生成 66 工具 × 双语
  pages/zh/[slug].astro
  pages/en/{about,privacy,terms}.astro
  components/ToolApp.tsx        # 现有 React 工具 App（原样复用）
  components/HowToUse.astro     # PageSections 的 Astro 版
  data/…                        # tools/site/pages 注册表保留
  i18n/…                        # 全量目录保留（Astro 端直接使用）
public/                         # 原样保留
astro.config.mjs                # @astrojs/react + 自定义 Vite manualChunks
```

关键映射（对照表见 §4）。

---

## 4. 逐项迁移清单

| # | 现状 | Astro 目标 | 工作量 | 风险 |
|---|---|---|---|---|
| 1 | `generate-pages.tsx` 全量预渲染 | `getStaticPaths()` 按工具/语言生成页面；首页/静态页为普通 .astro 路由 | 低 | 低 |
| 2 | `Layout.tsx` head/SEO/脚本注入 | `Layout.astro` 布局 + `<slot/>`；head 由 Astro 管理 | 中 | **中**：hreflang/canonical/OG/内联脚本必须逐字对齐 |
| 3 | `entries/{en,zh}.tsx` + `mountApp` 挂载到 `#app` | `<ToolApp client:only="react">` 岛屿；删掉 entries/mountApp | 低（批量） | **高**：66 工具逐个验证挂载/时序，重库工具重点测 |
| 4 | `i18n` 全量目录 + 客户端切片双路径 | Astro 端统一用全量目录；组件内直接 `t()` | 中 | 中：切片的运行时合并逻辑要保证等价 |
| 5 | 手动分包 vendor/shared/messages/per-tool | `astro.config.mjs` 里配置 `vite.build.rollupOptions.output.manualChunks`（Astro 底层就是 Vite） | 中 | **高**：hash 变化规律、单页体积、缓存命中行为要重新测量 |
| 6 | `tool-extras.json` css/scripts 注入 | 布局/页面组件按 slug 读取同一 JSON 渲染 `<link>`/`<script>` | 低 | 中：27 个 css + 5 个脚本的注入位置（head vs body、顺序）要对齐 |
| 7 | `PageSections.tsx`（31 个） | 保留为 React/组件，`client:only` 或构建期渲染到页面 | 低 | 中 |
| 8 | `sitemap.xml`（自定义 alternates/lastmod/changefreq/priority） | `@astrojs/sitemap` + 自定义 entry（`sitemap()` 钩子重写格式） | 中 | **中**：格式必须与现有逐字节一致 |
| 9 | `_redirects`（遗留 301） | 生成逻辑搬进构建脚本，产出同一个文件 | 低 | 中：301 规则逐条测试 |
| 10 | `404.html`（meta refresh → /en/） | `404.astro` 输出同款 | 低 | 低 |
| 11 | GA（构建期 env） | `astro.config` 里读 `import.meta.env`，head 注入同款 gtag | 低 | 低 |
| 12 | Disqus | 同款组件/内联脚本，条件渲染 | 低 | 低 |
| 13 | 随机推荐工具（构建期） | `getStaticPaths` 或布局里同款逻辑 | 低 | 低 |
| 14 | 内联 vanilla JS（nav/back-to-top） | 布局内 `<script>`，注意 Astro 默认处理 script 的方式 | 低 | 中：内联 vs 打包的行为差异 |
| 15 | `public/static/**` | 原样保留（Astro 直接拷贝 public/） | 零 | 低 |
| 16 | `wrangler.toml`（`pages_build_output_dir = dist`） | `astro build` 输出改 `dist/`，wrangler 配置不变 | 零 | 低 |

---

## 5. 风险点与规避

### 5.1 分包/缓存策略变化（风险：高）

Astro 默认有自己的分包逻辑，当前 `manualChunks` 需在 Astro 的 `vite` 配置里重配并**逐页重新测量**（单页下载体积、公共 chunk 缓存命中）。规避：迁移后用同一批样本页对比「首次加载字节数」「公共 chunk 是否复用」，达不到现状基线就算失败项。

### 5.2 66 个工具挂载一致性（风险：高）

从「模块脚本 + createRoot 挂载」换成 Astro 岛屿水合，行为差异集中在：

- `(window as any).LOCALE`、`initMessages` 的调用时机
- 重依赖工具（ffmpeg.wasm 的 worker、konva 画布、html2canvas、CodeMirror）在 `client:only` 下的初始化顺序
- 依赖 `document`/`window` 在模块顶层的写法（SSR 阶段可能执行不到或报错，要确认 islands 不预渲染）

规避：迁移期给 66 个工具建一张核对表，逐个人工冒烟；重库工具放第一批验证。

### 5.3 已收录页面的 SEO 结构（风险：中高）

canonical/hreflang/OG/标题顺序、`sitemap.xml` 格式、`404.html`、301 规则，任何一处和线上不一致都可能引发重新收录或索引抖动。规避：见 §7 的页面级 diff 验证。

### 5.4 数据漂移（风险：中）

67 注册 vs 66 目录的差异必须先审计。规避：Phase 0 完成，写进迁移验收条件。

### 5.5 内联脚本与头部资源顺序（风险：中）

现状 head 里 Bootstrap/css/简单通知/favicon/webmanifest 的顺序是固定的；Astro 的 head 合并机制（`is:inline`、`define:vars`）行为不同。规避：用 §7 的 HTML diff 锁死顺序。

---

## 6. 工作量估算与分阶段方案

> 单位：人日（8h/天）。估算是区间，实际受工具复杂度影响。

| 阶段 | 内容 | 估算 | 验收 |
|---|---|---|---|
| **Phase 0** | ① 数据漂移审计（67 vs 66）；② 建立 HTML diff 基线（当前 dist 全量快照）；③ 修 dev 体验（完整构建 + 静态预览，独立于迁移） | 0.5–1 | 审计报告 + 基线可用 |
| **Phase 1** | Astro 骨架：首页、3 静态页、布局壳、SEO head、i18n 接入、GA/Disqus、内联脚本、public 静态资源 | 2–3 | 首页/静态页与现状 HTML diff 通过 |
| **Phase 2** | 工具批量迁移：`client:only` 岛屿、PageSections、tool-extras 注入、i18n 切片等价 | 3–5 | 66 工具冒烟核对表全过 |
| **Phase 3** | 分包策略对齐、sitemap/redirects/404 生成、重库工具专项验证 | 2–3 | 性能基线 + 301 逐条测试 + sitemap 逐字节比对 |
| **Phase 4** | 整体 diff、灰度（子路径或独立环境并行跑），择机切换 | 1–2 | 全站 HTML diff 通过，切换无回滚 |

**合计约 8–14 人日**。其中 Phase 1–3 是净增工作量，Phase 0 的 ③（修 dev）无论是否迁移都建议先做。

---

## 7. 验证策略（怎么保证线上输出不被破坏）

1. **HTML diff 基线**：迁移前对当前 `dist/` 全量页面做快照（含 head 完整字节）。每完成一个阶段，用同一批页面与基线做结构化 diff（标题、head 顺序、hreflang、脚本注入、内联 JS）。
2. **样本页抽测**：`qrcode-decode`（纯 UI）、`gif-maker`（重库 + PageSections + extras）、`rich-qrcode`（serverSide 隐私徽章）、`sudoku-generator`（外部 lib）、`video-to-mp3`（jsdelivr 脚本）作为高覆盖样本。
3. **301 逐条测试**：`_redirects` 规则全部 curl 验证。
4. **性能基线**：样本页「总传输字节 / 公共 chunk 复用」对比迁移前后。
5. **灰度**：新站先部署到独立环境/子路径，与线上并行运行，确认无误再切换 DNS/Pages 项目。

---

## 8. 决策建议

- **现在就做**：Phase 0 的 ③（修 dev 体验：完整构建 + 静态预览）。低风险、独立于迁移、今天就能解除开发痛点。
- **随后立项**：按 Phase 1→4 推进 Astro 迁移；每个阶段独立可验收、可回退。
- **不做**：维持现管线 + 手写增量 watch（本会话已验证不可靠：增量重建产物出现 chunk 引用缺失，已放弃）。
