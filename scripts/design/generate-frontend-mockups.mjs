#!/usr/bin/env node

import { mkdir, rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..');
const themePath = path.join(root, 'frontend/src/styles/townhall-theme.css');
const outputRoot = path.join(root, 'docs/frontend-design/pages');

const pages = [
  {
    id: 'home',
    title: 'Public services and information',
    lead: 'A public landing page for notices, services, documents, meetings, and townhall contact paths.',
    kind: 'home',
    cards: ['Latest news', 'Upcoming events', 'Public documents', 'Departments'],
    sideTitle: 'Townhall contact',
  },
  {
    id: 'search',
    title: 'Search public information',
    lead: 'Search published news, documents, events, departments, staff, officials, and committees.',
    kind: 'search',
    cards: ['Meeting agenda result', 'Budget document result', 'Department result', 'Event result'],
  },
  {
    id: 'pages-list',
    title: 'Information pages',
    lead: 'Published static civic pages such as services, policies, city information, and resident guidance.',
    kind: 'list',
    filters: ['Topic', 'Updated', 'Page type'],
    cards: ['About the municipality', 'Services guide', 'Privacy policy', 'Public information access'],
  },
  {
    id: 'page-detail',
    title: 'Municipality information page',
    lead: 'A readable CMS page layout for long-form public information and supporting contact details.',
    kind: 'detail',
    meta: ['Published', 'Updated recently', 'Public information'],
  },
  {
    id: 'news-list',
    title: 'News and announcements',
    lead: 'Official published announcements with category filtering and clear publication dates.',
    kind: 'list',
    filters: ['Category', 'Published date'],
    cards: ['Mayor announcement', 'Road closure notice', 'Community program', 'Council update'],
  },
  {
    id: 'news-detail',
    title: 'Announcement detail',
    lead: 'A published news article with rich text, related files, categories, and safe public assets.',
    kind: 'detail',
    meta: ['Published date', 'News category', 'Attached files'],
  },
  {
    id: 'documents-list',
    title: 'Documents and downloads',
    lead: 'Published public files with category filtering, clear metadata, and safe download actions.',
    kind: 'documents',
    filters: ['Document category', 'File type', 'Published date'],
    cards: ['Budget report PDF', 'Service form PDF', 'Council minutes PDF', 'Public notice PDF'],
  },
  {
    id: 'documents-detail',
    title: 'Document detail',
    lead: 'Public document metadata, categories, and download links without exposing storage internals.',
    kind: 'detail',
    meta: ['Published date', 'Document category', 'Download files'],
  },
  {
    id: 'events-list',
    title: 'Events and public meetings',
    lead: 'Upcoming and current public events, hearings, deadlines, and council meeting dates.',
    kind: 'timeline',
    filters: ['Date range', 'Event type'],
    cards: ['Council meeting', 'Public hearing', 'Cultural calendar', 'Office closure'],
  },
  {
    id: 'events-detail',
    title: 'Event detail',
    lead: 'Event time, location, description, and public context in a focused detail layout.',
    kind: 'detail',
    meta: ['Starts at', 'Ends at', 'Location'],
  },
  {
    id: 'departments-list',
    title: 'Departments',
    lead: 'Published departments and townhall offices with contact routes for residents and businesses.',
    kind: 'directory',
    filters: ['Service area', 'Office status'],
    cards: ['Administration', 'Finance and taxes', 'Public works', 'Education and culture'],
  },
  {
    id: 'department-detail',
    title: 'Department detail',
    lead: 'Department description, phone, email, address, office hours, and active contacts.',
    kind: 'detail',
    meta: ['Phone', 'Email', 'Office hours', 'Active contacts'],
  },
  {
    id: 'staff-list',
    title: 'Staff directory',
    lead: 'Published staff directory with role, department, contact, and photo placement patterns.',
    kind: 'people',
    filters: ['Department', 'Role'],
    cards: ['Administrative officer', 'Tax specialist', 'Public works contact', 'Culture coordinator'],
  },
  {
    id: 'staff-detail',
    title: 'Staff profile',
    lead: 'Public staff profile with photo, role, department, bio, and safe contact information.',
    kind: 'profile',
    meta: ['Department', 'Role', 'Email', 'Phone'],
  },
  {
    id: 'officials-list',
    title: 'Officials',
    lead: 'Mayor, council members, and appointed public officials with role and term information.',
    kind: 'people',
    filters: ['Office', 'Role'],
    cards: ['Mayor', 'Council chair', 'Council member', 'Board representative'],
  },
  {
    id: 'official-detail',
    title: 'Official profile',
    lead: 'Official biography, role, district or office, term dates, and safe contact information.',
    kind: 'profile',
    meta: ['Role', 'Office', 'Term', 'Contact'],
  },
  {
    id: 'committees-list',
    title: 'Committees and boards',
    lead: 'Published committees, boards, commissions, and public governance groups.',
    kind: 'directory',
    filters: ['Committee type', 'Status'],
    cards: ['Budget committee', 'Planning board', 'Culture commission', 'Public safety committee'],
  },
  {
    id: 'committee-detail',
    title: 'Committee detail',
    lead: 'Committee purpose, public description, members summary, and related records area.',
    kind: 'detail',
    meta: ['Committee type', 'Published status', 'Related records'],
  },
];

const viewports = [
  { id: 'desktop', width: 1440, minHeight: 1180, isMobile: false },
  { id: 'mobile', width: 390, minHeight: 1200, isMobile: true },
];

const theme = readThemeTokens();

await rm(outputRoot, { recursive: true, force: true });

for (const page of pages) {
  const pageDir = path.join(outputRoot, page.id);
  await mkdir(pageDir, { recursive: true });

  for (const viewport of viewports) {
    const svg = renderPage(page, viewport);
    const outputFile = path.join(pageDir, `${viewport.id}.png`);
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outputFile);
  }
}

console.log(`Generated ${pages.length * viewports.length} frontend design mockups in ${path.relative(root, outputRoot)}.`);

function readThemeTokens() {
  const css = readFileSync(themePath, 'utf8');
  const tokens = {};
  for (const match of css.matchAll(/(--(?:color-)?townhall-[\w-]+):\s*([^;]+);/g)) {
    tokens[match[1]] = match[2].trim();
  }

  const required = [
    '--color-townhall-navy',
    '--color-townhall-deep',
    '--color-townhall-gold',
    '--color-townhall-cream',
    '--color-townhall-paper',
    '--color-townhall-panel',
    '--color-townhall-slate',
    '--color-townhall-muted',
    '--color-townhall-subtle',
    '--color-townhall-border',
    '--color-townhall-border-light',
    '--color-townhall-footer-line',
    '--color-townhall-green',
    '--color-townhall-danger',
    '--color-townhall-warning',
  ];

  for (const token of required) {
    if (!tokens[token]) {
      throw new Error(`Missing theme token required for mockups: ${token}`);
    }
  }

  Object.assign(tokens, {
    '--townhall-color-background': tokens['--color-townhall-paper'],
    '--townhall-color-surface': tokens['--color-townhall-panel'],
    '--townhall-color-surface-soft': tokens['--color-townhall-cream'],
    '--townhall-color-surface-strong': tokens['--color-townhall-subtle'],
    '--townhall-color-border': tokens['--color-townhall-border'],
    '--townhall-color-border-strong': tokens['--color-townhall-footer-line'],
    '--townhall-color-primary': tokens['--color-townhall-navy'],
    '--townhall-color-primary-hover': tokens['--color-townhall-deep'],
    '--townhall-color-primary-soft': tokens['--color-townhall-cream'],
    '--townhall-color-text': tokens['--color-townhall-slate'],
    '--townhall-color-muted': tokens['--color-townhall-muted'],
    '--townhall-color-success': tokens['--color-townhall-green'],
    '--townhall-color-warning': tokens['--color-townhall-warning'],
    '--townhall-color-error': tokens['--color-townhall-danger'],
  });

  return tokens;
}

function renderPage(page, viewport) {
  const canvas = [];
  const { width, minHeight, isMobile } = viewport;
  const margin = isMobile ? 22 : 92;
  const contentWidth = width - margin * 2;

  canvas.push(renderHeader({ width, margin, contentWidth, isMobile }));

  let y = isMobile ? 154 : 170;

  y = renderAlert(canvas, { x: margin, y, width: contentWidth, isMobile }) + (isMobile ? 20 : 32);

  if (page.id !== 'home') {
    y = renderBreadcrumb(canvas, { x: margin, y, isMobile, items: ['Home', page.title] }) + (isMobile ? 18 : 28);
  }

  y = renderTitleBlock(canvas, {
    x: margin,
    y,
    width: contentWidth,
    title: page.title,
    lead: page.lead,
    isMobile,
  });

  y += isMobile ? 22 : 36;

  if (isMobile) {
    y = renderMobileBody(canvas, page, { x: margin, y, width: contentWidth });
  } else {
    y = renderDesktopBody(canvas, page, { x: margin, y, width: contentWidth });
  }

  const footerBottom = renderFooter(canvas, {
    x: margin,
    y: y + (isMobile ? 36 : 54),
    width: contentWidth,
    isMobile,
    canvasWidth: width,
  });

  const finalHeight = Math.max(footerBottom + (isMobile ? 22 : 32), minHeight);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${finalHeight}" viewBox="0 0 ${width} ${finalHeight}">`,
    `<rect width="${width}" height="${finalHeight}" fill="${c('--townhall-color-background')}"/>`,
    ...canvas,
    '</svg>',
  ].join('');
}

function renderHeader({ width, margin, contentWidth, isMobile }) {
  const h = isMobile ? 154 : 154;
  const nav = isMobile
    ? pill({ x: width - margin - 82, y: 92, text: 'Menu', tone: 'light', width: 82 })
    : ['Home', 'Residents', 'Business', 'Government', 'Departments']
        .map((item, index) => {
          const x = margin + index * 138;
          return text({ x, y: 135, value: item, size: 15, weight: 850, fill: c('--townhall-color-surface') });
        })
        .join('');

  return [
    rect({ x: 0, y: 0, width, height: 32, fill: c('--color-townhall-deep') }),
    rect({ x: 0, y: 0, width, height: 4, fill: c('--color-townhall-gold') }),
    !isMobile ? text({ x: margin, y: 23, value: 'Pay bill · Report issue · Meetings · Contact', size: 13, weight: 750, fill: c('--color-townhall-border-light') }) : '',
    !isMobile ? text({ x: width - margin - 330, y: 23, value: 'Phone · Address · Office hours', size: 13, weight: 700, fill: c('--color-townhall-border-light') }) : '',
    rect({ x: 0, y: 32, width, height: 74, fill: c('--townhall-color-surface') }),
    line({ x1: 0, y1: 106, x2: width, y2: 106, color: c('--townhall-color-border') }),
    rect({ x: margin, y: 52, width: 42, height: 42, fill: c('--color-townhall-cream'), stroke: c('--color-townhall-gold'), radius: 2 }),
    text({ x: margin + 58, y: 65, value: 'Townhall', size: isMobile ? 13 : 15, weight: 850, fill: c('--townhall-color-muted') }),
    text({ x: margin + 58, y: 91, value: 'Municipality public website', size: isMobile ? 16 : 24, weight: 900, fill: c('--townhall-color-primary') }),
    !isMobile ? rect({ x: width - margin - 340, y: 56, width: 250, height: 36, fill: c('--color-townhall-subtle'), stroke: c('--townhall-color-border'), radius: 0 }) : '',
    !isMobile ? text({ x: width - margin - 326, y: 80, value: 'Search public information', size: 13, weight: 700, fill: c('--townhall-color-muted') }) : '',
    !isMobile ? text({ x: width - margin - 64, y: 80, value: 'EN | BG', size: 14, weight: 850, fill: c('--townhall-color-primary') }) : '',
    !isMobile ? rect({ x: 0, y: 106, width, height: 48, fill: c('--townhall-color-primary') }) : '',
    !isMobile ? rect({ x: 0, y: 106, width, height: 3, fill: c('--color-townhall-gold') }) : '',
    nav,
    line({ x1: 0, y1: h - 1, x2: width, y2: h - 1, color: c('--townhall-color-border') }),
  ].join('');
}

function renderAlert(parts, { x, y, width, isMobile }) {
  const h = isMobile ? 94 : 76;
  parts.push(
    rect({ x, y, width, height: h, fill: c('--color-townhall-cream'), stroke: c('--color-townhall-gold'), radius: 0 }),
    rect({ x, y, width: 7, height: h, fill: c('--color-townhall-gold'), radius: 0 }),
    text({ x: x + 24, y: y + 31, value: 'Active public alert', size: isMobile ? 15 : 17, weight: 850, fill: c('--townhall-color-primary-hover') }),
    ...textBlock({
      x: x + 24,
      y: y + (isMobile ? 54 : 55),
      width: width - 44,
      value: 'Important notices appear here when published and inside their active date window.',
      size: isMobile ? 14 : 16,
      lineHeight: isMobile ? 20 : 22,
      fill: c('--townhall-color-text'),
    }).svg,
  );
  return y + h;
}

function renderBreadcrumb(parts, { x, y, isMobile, items }) {
  const value = items.join(' / ');
  parts.push(text({ x, y: y + 18, value, size: isMobile ? 13 : 15, weight: 700, fill: c('--townhall-color-muted') }));
  return y + 28;
}

function renderTitleBlock(parts, { x, y, width, title, lead, isMobile }) {
  const titleSize = isMobile ? 28 : 48;
  const titleLineHeight = isMobile ? 34 : 58;
  const leadSize = isMobile ? 16 : 21;
  const leadLineHeight = isMobile ? 24 : 30;
  const innerX = x + 24;
  const innerWidth = isMobile ? width - 48 : Math.min(860, width - 48);
  const titleLines = isMobile
    ? wrapText(title, Math.max(10, Math.floor(innerWidth / (titleSize * 0.5))))
    : [title];
  const headingY = y + (isMobile ? 36 : 52);
  const leadY = headingY + titleLines.length * titleLineHeight + (isMobile ? 12 : 10);
  const leadLines = wrapText(lead, Math.max(12, Math.floor(innerWidth / (leadSize * 0.54))));
  const blockHeight =
    leadY - y + Math.max(1, leadLines.length) * leadLineHeight + (isMobile ? 26 : 34);

  parts.push(
    rect({ x, y, width, height: blockHeight, fill: c('--townhall-color-surface'), stroke: c('--townhall-color-border'), radius: 0 }),
    rect({ x, y, width: 8, height: blockHeight, fill: c('--color-townhall-gold'), radius: 0 }),
  );

  titleLines.forEach((line, index) => {
    text({
      parts,
      x: innerX,
      y: headingY + index * titleLineHeight,
      value: line,
      size: titleSize,
      weight: 850,
      fill: c('--townhall-color-text'),
    });
  });

  leadLines.forEach((line, index) => {
    text({
      parts,
      x: innerX,
      y: leadY + index * leadLineHeight,
      value: line,
      size: leadSize,
      weight: 700,
      fill: c('--townhall-color-muted'),
    });
  });

  return y + blockHeight;
}

function renderDesktopBody(parts, page, box) {
  if (page.kind === 'home') return renderHomeDesktop(parts, page, box);
  if (page.kind === 'search') return renderSearchDesktop(parts, page, box);
  if (page.kind === 'documents') return renderDocumentsDesktop(parts, page, box);
  if (page.kind === 'timeline') return renderTimelineDesktop(parts, page, box);
  if (page.kind === 'people') return renderPeopleDesktop(parts, page, box);
  if (page.kind === 'profile') return renderProfileDesktop(parts, page, box);
  if (page.kind === 'directory') return renderDirectoryDesktop(parts, page, box);
  if (page.kind === 'detail') return renderDetailDesktop(parts, page, box);
  return renderListDesktop(parts, page, box);
}

function renderMobileBody(parts, page, box) {
  if (page.kind === 'home') return renderHomeMobile(parts, page, box);
  if (page.kind === 'search') return renderSearchMobile(parts, page, box);
  if (page.kind === 'profile') return renderProfileMobile(parts, page, box);
  if (page.kind === 'detail') return renderDetailMobile(parts, page, box);
  return renderListMobile(parts, page, box);
}

function renderHomeDesktop(parts, page, { x, y, width }) {
  rect({ parts, x, y, width, height: 92, fill: c('--townhall-color-primary'), radius: 0 });
  text({ parts, x: x + 28, y: y + 38, value: 'Resident service rail', size: 20, weight: 900, fill: c('--color-townhall-gold') });
  text({ parts, x: x + 28, y: y + 66, value: 'Search, documents, events, and departments stay visible from the first screen.', size: 16, weight: 700, fill: c('--townhall-color-surface') });
  y += 126;

  const cardW = (width - 48) / 4;
  page.cards.forEach((label, index) => {
    card(parts, {
      x: x + index * (cardW + 16),
      y,
      width: cardW,
      height: 180,
      title: label,
      body: 'Published public information from the backend.',
    });
  });

  card(parts, {
    x,
    y: y + 230,
    width: width * 0.62,
    height: 300,
    title: 'Latest public updates',
    body: 'News, events, documents, and alerts are grouped into a clear civic homepage that can stay useful even when content is sparse.',
    rows: ['Published announcement', 'Upcoming public event', 'New downloadable document'],
  });

  sidePanel(parts, {
    x: x + width * 0.66,
    y: y + 230,
    width: width * 0.34,
    height: 300,
    title: page.sideTitle,
    rows: ['Address', 'Phone', 'Email', 'Office hours'],
  });

  return y + 560;
}

function renderHomeMobile(parts, page, { x, y, width }) {
  page.cards.forEach((label, index) => {
    card(parts, {
      x,
      y: y + index * 124,
      width,
      height: 106,
      title: label,
      body: 'Published public information.',
    });
  });
  sidePanel(parts, {
    x,
    y: y + 530,
    width,
    height: 230,
    title: page.sideTitle,
    rows: ['Address', 'Phone', 'Email'],
  });
  return y + 790;
}

function renderSearchDesktop(parts, page, { x, y, width }) {
  searchBox(parts, { x, y, width, height: 90, label: 'Search all published public information' });
  return renderResultGrid(parts, page.cards, { x, y: y + 126, width, columns: 2 });
}

function renderSearchMobile(parts, page, { x, y, width }) {
  searchBox(parts, { x, y, width, height: 116, label: 'Search public information' });
  return renderStackedCards(parts, page.cards, { x, y: y + 146, width, cardHeight: 116 });
}

function renderListDesktop(parts, page, { x, y, width }) {
  filters(parts, { x, y, width, items: page.filters ?? ['Category', 'Date'] });
  return renderResultGrid(parts, page.cards, { x, y: y + 110, width, columns: 2 });
}

function renderListMobile(parts, page, { x, y, width }) {
  filters(parts, { x, y, width, items: page.filters ?? ['Category'] });
  return renderStackedCards(parts, page.cards, { x, y: y + 150, width, cardHeight: 118 });
}

function renderDocumentsDesktop(parts, page, box) {
  return renderListDesktop(parts, page, box);
}

function renderTimelineDesktop(parts, page, { x, y, width }) {
  filters(parts, { x, y, width, items: page.filters ?? [] });
  const listY = y + 116;
  page.cards.forEach((label, index) => {
    const rowY = listY + index * 112;
    rect({ parts, x, y: rowY + 10, width: 14, height: 14, fill: c('--townhall-color-primary'), radius: 7 });
    line({ parts, x1: x + 7, y1: rowY + 26, x2: x + 7, y2: rowY + 104, color: c('--townhall-color-border-strong') });
    card(parts, {
      x: x + 36,
      y: rowY,
      width: width - 36,
      height: 92,
      title: label,
      body: 'Published date, time, location, and public meeting context.',
    });
  });
  return listY + page.cards.length * 112 + 24;
}

function renderPeopleDesktop(parts, page, { x, y, width }) {
  filters(parts, { x, y, width, items: page.filters ?? [] });
  const cardW = (width - 48) / 4;
  page.cards.forEach((label, index) => {
    profileCard(parts, {
      x: x + index * (cardW + 16),
      y: y + 120,
      width: cardW,
      title: label,
    });
  });
  return y + 470;
}

function renderDirectoryDesktop(parts, page, { x, y, width }) {
  filters(parts, { x, y, width, items: page.filters ?? [] });
  return renderResultGrid(parts, page.cards, { x, y: y + 110, width, columns: 2 });
}

function renderDetailDesktop(parts, page, { x, y, width }) {
  const articleW = width * 0.64;
  articleBlock(parts, { x, y, width: articleW, title: page.title });
  sidePanel(parts, {
    x: x + articleW + 42,
    y,
    width: width - articleW - 42,
    height: 360,
    title: 'Public details',
    rows: page.meta ?? ['Published', 'Category', 'Related files'],
  });
  return y + 440;
}

function renderDetailMobile(parts, page, { x, y, width }) {
  articleBlock(parts, { x, y, width, title: page.title, compact: true });
  sidePanel(parts, {
    x,
    y: y + 360,
    width,
    height: 250,
    title: 'Public details',
    rows: page.meta ?? ['Published', 'Category', 'Related files'],
  });
  return y + 640;
}

function renderProfileDesktop(parts, page, { x, y, width }) {
  rect({ parts, x, y, width: 280, height: 280, fill: c('--townhall-color-surface-strong'), stroke: c('--townhall-color-border'), radius: 8 });
  circle(parts, { cx: x + 140, cy: y + 124, r: 54, fill: c('--townhall-color-primary-soft') });
  text({ parts, x: x + 82, y: y + 224, value: 'Public photo', size: 22, weight: 800, fill: c('--townhall-color-primary-hover') });
  articleBlock(parts, { x: x + 330, y, width: width - 650, title: page.title });
  sidePanel(parts, {
    x: x + width - 280,
    y,
    width: 280,
    height: 320,
    title: 'Profile details',
    rows: page.meta ?? [],
  });
  return y + 420;
}

function renderProfileMobile(parts, page, { x, y, width }) {
  rect({ parts, x, y, width, height: 210, fill: c('--townhall-color-surface-strong'), stroke: c('--townhall-color-border'), radius: 8 });
  circle(parts, { cx: x + width / 2, cy: y + 90, r: 46, fill: c('--townhall-color-primary-soft') });
  text({ parts, x: x + 116, y: y + 168, value: 'Public photo', size: 18, weight: 800, fill: c('--townhall-color-primary-hover') });
  articleBlock(parts, { x, y: y + 240, width, title: page.title, compact: true });
  sidePanel(parts, {
    x,
    y: y + 600,
    width,
    height: 238,
    title: 'Profile details',
    rows: page.meta ?? [],
  });
  return y + 866;
}

function renderResultGrid(parts, labels, { x, y, width, columns }) {
  const gap = 18;
  const cardW = (width - gap * (columns - 1)) / columns;
  labels.forEach((label, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    card(parts, {
      x: x + col * (cardW + gap),
      y: y + row * 150,
      width: cardW,
      height: 128,
      title: label,
      body: 'Published public content with safe summary metadata and a clear action.',
    });
  });
  pagination(parts, { x, y: y + Math.ceil(labels.length / columns) * 150 + 20, width });
  return y + Math.ceil(labels.length / columns) * 150 + 90;
}

function renderStackedCards(parts, labels, { x, y, width, cardHeight }) {
  labels.forEach((label, index) => {
    card(parts, {
      x,
      y: y + index * (cardHeight + 16),
      width,
      height: cardHeight,
      title: label,
      body: 'Published public content with safe metadata.',
    });
  });
  pagination(parts, { x, y: y + labels.length * (cardHeight + 16) + 12, width });
  return y + labels.length * (cardHeight + 16) + 78;
}

function articleBlock(parts, { x, y, width, title, compact = false }) {
  card(parts, {
    x,
    y,
    width,
    height: compact ? 330 : 360,
    title,
    body: 'This detail layout supports rich public text, safe links, publication metadata, and clear reading rhythm for long municipality content.',
    rows: ['Section heading', 'Readable paragraph content', 'Related public information'],
  });
}

function filters(parts, { x, y, width, items }) {
  rect({ parts, x, y, width, height: 82, fill: c('--townhall-color-surface'), stroke: c('--townhall-color-border'), radius: 8 });
  text({ parts, x: x + 22, y: y + 32, value: 'Filters', size: 18, weight: 850, fill: c('--townhall-color-text') });
  items.forEach((item, index) => {
    pill({ parts, x: x + 22 + index * 158, y: y + 44, text: item, tone: 'light', width: 140 });
  });
}

function searchBox(parts, { x, y, width, height, label }) {
  rect({ parts, x, y, width, height, fill: c('--townhall-color-surface'), stroke: c('--townhall-color-border'), radius: 8 });
  text({ parts, x: x + 22, y: y + 30, value: label, size: 18, weight: 800, fill: c('--townhall-color-text') });
  rect({ parts, x: x + 22, y: y + 48, width: width - 170, height: 34, fill: c('--townhall-color-background'), stroke: c('--townhall-color-border'), radius: 4 });
  rect({ parts, x: x + width - 128, y: y + 48, width: 106, height: 34, fill: c('--townhall-color-primary'), radius: 4 });
  text({ parts, x: x + width - 100, y: y + 71, value: 'Search', size: 15, weight: 850, fill: c('--townhall-color-surface') });
}

function card(parts, { x, y, width, height, title, body, rows = [] }) {
  rect({ parts, x, y, width, height, fill: c('--townhall-color-surface'), stroke: c('--townhall-color-border'), radius: 8 });
  rect({ parts, x, y, width: 6, height, fill: c('--townhall-color-primary'), radius: 8 });
  text({ parts, x: x + 24, y: y + 34, value: title, size: 20, weight: 850, fill: c('--townhall-color-primary') });
  const bodyBlock = textBlock({
    x: x + 24,
    y: y + 60,
    width: width - 48,
    value: body,
    size: 15,
    lineHeight: 21,
    fill: c('--townhall-color-muted'),
  });
  parts.push(...bodyBlock.svg);
  rows.slice(0, 3).forEach((row, index) => {
    const rowY = y + height - 72 + index * 22;
    circle(parts, { cx: x + 30, cy: rowY - 4, r: 4, fill: c('--townhall-color-primary') });
    text({ parts, x: x + 44, y: rowY, value: row, size: 14, weight: 700, fill: c('--townhall-color-text') });
  });
}

function profileCard(parts, { x, y, width, title }) {
  rect({ parts, x, y, width, height: 320, fill: c('--townhall-color-surface'), stroke: c('--townhall-color-border'), radius: 8 });
  rect({ parts, x: x + 18, y: y + 18, width: width - 36, height: 146, fill: c('--townhall-color-surface-strong'), radius: 8 });
  circle(parts, { cx: x + width / 2, cy: y + 91, r: 42, fill: c('--townhall-color-primary-soft') });
  text({ parts, x: x + 22, y: y + 206, value: title, size: 19, weight: 850, fill: c('--townhall-color-primary') });
  text({ parts, x: x + 22, y: y + 236, value: 'Role and department', size: 15, weight: 700, fill: c('--townhall-color-muted') });
  pill({ parts, x: x + 22, y: y + 262, text: 'Published profile', tone: 'light', width: 150 });
}

function sidePanel(parts, { x, y, width, height, title, rows }) {
  rect({ parts, x, y, width, height, fill: c('--townhall-color-surface'), stroke: c('--townhall-color-border'), radius: 8 });
  text({ parts, x: x + 22, y: y + 36, value: title, size: 20, weight: 850, fill: c('--townhall-color-text') });
  rows.forEach((row, index) => {
    const rowY = y + 78 + index * 48;
    text({ parts, x: x + 22, y: rowY, value: row, size: 14, weight: 850, fill: c('--townhall-color-muted') });
    text({ parts, x: x + 22, y: rowY + 22, value: 'Public value from backend', size: 15, weight: 700, fill: c('--townhall-color-text') });
  });
}

function pagination(parts, { x, y, width }) {
  const startX = x + Math.max(0, width - 210);
  ['1', '2', '3', 'Next'].forEach((item, index) => {
    pill({ parts, x: startX + index * 52, y, text: item, tone: index === 0 ? 'dark' : 'light', width: item === 'Next' ? 64 : 42 });
  });
}

function renderFooter(parts, { x, y, width, isMobile, canvasWidth }) {
  const h = isMobile ? 292 : 236;
  rect({ parts, x: 0, y, width: canvasWidth, height: h, fill: c('--townhall-color-primary') });
  rect({ parts, x: 0, y, width: canvasWidth, height: 6, fill: c('--color-townhall-gold') });
  rect({ parts, x: 0, y: y + 6, width: canvasWidth, height: 54, fill: c('--townhall-color-primary-hover') });
  text({ parts, x, y: y + 39, value: 'Official municipal information and public services', size: isMobile ? 12 : 15, weight: 850, fill: c('--color-townhall-cream') });
  if (!isMobile) {
    text({ parts, x: x + width - 360, y: y + 39, value: 'Contact hall · Report concern · View notices', size: 15, weight: 850, fill: c('--townhall-color-surface') });
  }
  rect({ parts, x, y: y + 92, width: isMobile ? width : 360, height: 46, fill: c('--townhall-color-primary-hover'), stroke: c('--color-townhall-footer-line'), radius: 0 });
  text({ parts, x: x + 18, y: y + 122, value: 'Townhall Municipality', size: isMobile ? 18 : 22, weight: 900, fill: c('--townhall-color-surface') });
  const footerCopy = textBlock({
    x,
    y: y + 164,
    width: isMobile ? width : Math.min(600, width),
    value: 'Footer navigation, contact details, and public links from backend APIs.',
    size: isMobile ? 13 : 16,
    lineHeight: isMobile ? 19 : 22,
    fill: c('--color-townhall-border-light'),
  });
  parts.push(...footerCopy.svg);
  if (!isMobile) {
    const colX = [x + width - 600, x + width - 390, x + width - 190];
    ['Services', 'Government', 'Access'].forEach((label, index) => {
      text({ parts, x: colX[index], y: y + 108, value: label, size: 14, weight: 850, fill: c('--color-townhall-cream') });
      line({ parts, x1: colX[index], y1: y + 122, x2: colX[index] + 150, y2: y + 122, color: c('--color-townhall-gold') });
    });
    text({ parts, x: colX[0], y: y + 154, value: 'Permits · Parks', size: 14, weight: 750, fill: c('--townhall-color-surface') });
    text({ parts, x: colX[1], y: y + 154, value: 'Council · Notices', size: 14, weight: 750, fill: c('--townhall-color-surface') });
    text({ parts, x: colX[2], y: y + 154, value: 'Calendar · Alerts', size: 14, weight: 750, fill: c('--townhall-color-surface') });
    line({ parts, x1: x + width - 600, y1: y + 184, x2: x + width - 30, y2: y + 184, color: c('--color-townhall-footer-line') });
    text({ parts, x: x + width - 600, y: y + 214, value: 'Accessibility · Privacy · Public records', size: 13, weight: 750, fill: c('--color-townhall-border-light') });
  }
  return y + h;
}

function pill({ parts, x, y, text: value, tone, width }) {
  const dark = tone === 'dark';
  const markup = [
    rectSvg({ x, y, width, height: 32, fill: dark ? c('--townhall-color-primary') : c('--color-townhall-cream'), stroke: dark ? c('--townhall-color-primary') : c('--color-townhall-gold'), radius: 0 }),
    text({ x: x + 16, y: y + 21, value, size: 13, weight: 850, fill: dark ? c('--townhall-color-surface') : c('--townhall-color-primary-hover') }),
  ].join('');
  if (parts) parts.push(markup);
  return markup;
}

function rect({ parts, x, y, width, height, fill, stroke, radius = 0 }) {
  const markup = rectSvg({ x, y, width, height, fill, stroke, radius });
  if (parts) parts.push(markup);
  return markup;
}

function rectSvg({ x, y, width, height, fill, stroke, radius = 0 }) {
  return `<rect x="${n(x)}" y="${n(y)}" width="${n(width)}" height="${n(height)}" rx="${radius}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''}/>`;
}

function line({ parts, x1, y1, x2, y2, color }) {
  const markup = `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${color}" stroke-width="1"/>`;
  if (parts) parts.push(markup);
  return markup;
}

function circle(parts, { cx, cy, r, fill }) {
  parts.push(`<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="${fill}"/>`);
}

function text({ parts, x, y, value, size, weight, fill }) {
  const markup = `<text x="${n(x)}" y="${n(y)}" fill="${fill}" font-family="Inter, Arial, sans-serif" font-size="${size}" font-weight="${weight}">${escapeXml(value)}</text>`;
  if (parts) parts.push(markup);
  return markup;
}

function textBlock({ x, y, width, value, size, lineHeight, fill }) {
  const lines = wrapText(value, Math.max(12, Math.floor(width / (size * 0.54))));
  const svg = lines.map((line, index) =>
    text({ x, y: y + index * lineHeight, value: line, size, weight: 600, fill }),
  );
  return {
    svg,
    bottom: y + Math.max(1, lines.length) * lineHeight,
  };
}

function wrapText(value, maxChars) {
  const words = value.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function c(token) {
  return theme[token];
}

function n(value) {
  return Number(value).toFixed(2).replace(/\.00$/, '');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
