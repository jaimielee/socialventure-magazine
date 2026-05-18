import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import matter from 'gray-matter';

type Status = 'draft' | 'review' | 'published';

interface ParsedNote {
  id: string;
  title: string;
  originalNote: string;
  myThought: string;
  source: string;
  category: string;
  tags: string[];
  publishPotential: number;
  imageGuide: string;
}

const root = process.cwd();
const rawDir = join(root, 'src/content/raw-notes');
const insightDir = join(root, 'src/content/insights');
const articleDir = join(root, 'src/content/articles');
const collectionDir = join(root, 'src/content/collections');
const referenceDir = join(root, 'src/content/references');

for (const dir of [rawDir, insightDir, articleDir, collectionDir, referenceDir]) {
  mkdirSync(dir, { recursive: true });
}

function slugify(input: string) {
  const base = input
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return base || `note-${hash(input).slice(0, 8)}`;
}

function hash(input: string) {
  let value = 5381;
  for (const char of input) value = (value * 33) ^ char.charCodeAt(0);
  return (value >>> 0).toString(36);
}

function yamlString(value: string) {
  return JSON.stringify(value.replace(/\r/g, '').trim());
}

function yamlArray(values: string[]) {
  return `[${values.map(yamlString).join(', ')}]`;
}

function writeMdx(filePath: string, frontmatter: Record<string, string | number | string[]>, body: string) {
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${yamlArray(value)}`;
      if (typeof value === 'number') return `${key}: ${value}`;
      return `${key}: ${yamlString(value)}`;
    })
    .join('\n');
  writeFileSync(filePath, `---\n${yaml}\n---\n\n${body.trim()}\n`);
}

function extractSection(text: string, names: string[]) {
  const heading = names.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(?:^|\\n)#{2,3}\\s*(?:${heading})\\s*\\n([\\s\\S]*?)(?=\\n#{2,3}\\s|$)`, 'i');
  return text.match(regex)?.[1]?.trim() ?? '';
}

function inferCategory(text: string) {
  const map: Array<[string, string[]]> = [
    ['브랜드', ['브랜드', '마케팅', '고객', '사업', '세일즈', '창업']],
    ['콘텐츠', ['콘텐츠', '유튜브', '숏폼', 'SNS', '스토리', '기획', '카드뉴스']],
    ['디자인', ['디자인', '컬러', 'UX', '공간', '이미지', '시각']],
    ['일', ['생산성', '실행', '조직', '의사결정', '업무', '일정']],
    ['신앙', ['QT', '기도', '성경', '신앙', '복음', '은혜']],
    ['문화', ['책', '인문학', '인터뷰', '철학', '삶', '문장']],
  ];
  const lowered = text.toLowerCase();
  return map.find(([, words]) => words.some((word) => lowered.includes(word.toLowerCase())))?.[0] ?? '미분류';
}

function inferTags(text: string, category: string) {
  const candidates = ['브랜드', '마케팅', '콘텐츠', '기획', '디자인', 'UX', '생산성', '신앙', 'QT', '책', 'AI', '사진', '카드뉴스'];
  const tags = candidates.filter((tag) => text.toLowerCase().includes(tag.toLowerCase()));
  return Array.from(new Set([category, ...tags])).slice(0, 6);
}

function coreSentence(text: string) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.replace(/^[-*>#\s]+/, '').trim())
    .filter((line) => line.length > 18);
  return (lines[0] ?? text.slice(0, 120)).slice(0, 180);
}

function imageGuideFor(note: ParsedNote) {
  const guideByCategory: Record<string, string> = {
    브랜드: '브랜드가 실제로 만나는 장면, 제품보다 사용 맥락이 보이는 사진. 로고 클로즈업보다 고객 경험 중심.',
    콘텐츠: '기획 구조가 보이는 스토리보드, 촬영 현장, 화면 캡처, 카드뉴스 슬라이드 예시.',
    디자인: '컬러칩, UI 상태, 공간의 디테일, 전후 비교처럼 시각 차이가 분명한 이미지.',
    일: '작업 테이블, 캘린더, 체크리스트, 팀 회의처럼 실행의 밀도가 보이는 사진.',
    신앙: '성경, 노트, 조용한 책상, 빛이 들어오는 공간처럼 과장 없는 일기 톤 이미지.',
    문화: '책 표지, 밑줄, 인터뷰 인물의 작업 공간, 도시/장소 레퍼런스.',
  };
  return note.imageGuide || guideByCategory[note.category] || '핵심 문장이 놓인 실제 맥락을 보여주는 관찰형 사진.';
}

function parseRawNote(fileName: string): ParsedNote {
  const fullPath = join(rawDir, fileName);
  const parsed = matter(readFileSync(fullPath, 'utf8'));
  const body = parsed.content.trim();
  const title = String(parsed.data.title || basename(fileName, extname(fileName)));
  const originalNote = extractSection(body, ['원문 메모', 'Original Note', '메모']) || body;
  const myThought = extractSection(body, ['내 생각', 'My Thought', '생각']) || '이 메모가 지금 내 작업과 어떤 연결을 갖는지 더 적어볼 것.';
  const source = String(parsed.data.source || extractSection(body, ['출처', 'Source']) || '출처 미정');
  const category = String(parsed.data.category || inferCategory(`${title}\n${body}`));
  const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags.map(String) : inferTags(`${title}\n${body}`, category);
  const publishPotential = Math.min(5, Math.max(1, Math.round((body.length > 1200 ? 4 : 3) + (myThought.length > 80 ? 1 : 0))));
  const id = slugify(`${title}-${hash(fileName)}`);
  const note: ParsedNote = {
    id,
    title,
    originalNote,
    myThought,
    source,
    category,
    tags,
    publishPotential,
    imageGuide: String(parsed.data.imageGuide || ''),
  };
  note.imageGuide = imageGuideFor(note);
  return note;
}

function insightBody(note: ParsedNote) {
  return `
## 원문 메모

${note.originalNote}

## 내 생각

${note.myThought}

## 사진 가이드

${note.imageGuide}
`;
}

function articleBody(category: string, notes: ParsedNote[]) {
  return `
이 글은 ${category} 카테고리의 원본 메모 ${notes.length}개를 묶어 만든 긴 글 후보입니다. 아직 최종 원고가 아니라, 발행 전에 논지와 사례를 더 다듬는 단계입니다.

${notes.map((note, index) => `## ${index + 1}. ${note.title}

> ${coreSentence(note.originalNote)}

${note.myThought}

출처: ${note.source}
`).join('\n')}
`;
}

function checklistFor(type: 'insight' | 'article') {
  return type === 'insight'
    ? ['핵심 문장이 한 문장으로 서 있는가', '출처가 확인되는가', '내 생각이 원문 요약을 넘어서는가', '이미지 없이도 카드로 읽히는가']
    : ['리드가 왜 지금 읽어야 하는지 말하는가', '소제목마다 하나의 주장만 있는가', '출처와 내 생각이 분리되어 있는가', '사진 가이드가 촬영 가능한 수준인가'];
}

const rawFiles = readdirSync(rawDir).filter((file: string) => /\.(md|mdx)$/.test(file));

if (!rawFiles.length) {
  console.log('No raw notes found. Add .md or .mdx files to src/content/raw-notes and run npm run generate.');
  process.exit(0);
}

const notes = rawFiles.map(parseRawNote);

for (const note of notes) {
  writeMdx(join(insightDir, `${note.id}.mdx`), {
    title: note.title,
    description: coreSentence(note.originalNote),
    category: note.category,
    tags: note.tags,
    status: 'review' satisfies Status,
    sourceIds: [slugify(note.source)],
    relatedNoteIds: [note.id],
    imageGuide: note.imageGuide,
    publishPotential: note.publishPotential,
    updatedAt: new Date().toISOString(),
    coreSentence: coreSentence(note.originalNote),
    originalNote: note.originalNote,
    myThought: note.myThought,
    source: note.source,
    checklist: checklistFor('insight'),
  }, insightBody(note));

  const referenceId = slugify(note.source);
  const referencePath = join(referenceDir, `${referenceId}.mdx`);
  if (!existsSync(referencePath)) {
    writeMdx(referencePath, {
      title: note.source,
      sourceType: 'unknown',
      creator: '',
      category: note.category,
      tags: note.tags,
      noteIds: [note.id],
      reliability: 'unknown',
      updatedAt: new Date().toISOString(),
    }, `## 연결된 메모\n\n- ${note.title}`);
  }
}

const byCategory = new Map<string, ParsedNote[]>();
for (const note of notes) {
  byCategory.set(note.category, [...(byCategory.get(note.category) ?? []), note]);
}
const articleIds: string[] = [];

for (const [category, group] of byCategory) {
  if (group.length < 2) continue;
  const id = slugify(`${category}-article-candidate`);
  articleIds.push(id);
  writeMdx(join(articleDir, `${id}.mdx`), {
    title: `${category} 메모에서 뽑은 긴 글 후보`,
    description: `${category} 관련 메모 ${group.length}개를 하나의 긴 글로 묶기 위한 초안.`,
    category,
    tags: Array.from(new Set(group.flatMap((note) => note.tags))).slice(0, 8),
    status: 'draft' satisfies Status,
    sourceIds: Array.from(new Set(group.map((note) => slugify(note.source)))),
    relatedNoteIds: group.map((note) => note.id),
    imageGuide: `${category} 카테고리의 실제 장면과 원문 출처가 보이는 보조 이미지를 함께 준비.`,
    publishPotential: Math.min(5, Math.ceil(group.reduce((sum, note) => sum + note.publishPotential, 0) / group.length)),
    updatedAt: new Date().toISOString(),
    coreSentence: coreSentence(group.map((note) => note.originalNote).join('\n')),
    source: Array.from(new Set(group.map((note) => note.source))).join(', '),
    myThought: `${category} 메모가 반복해서 말하는 관점을 하나의 주장으로 압축해야 한다.`,
    checklist: checklistFor('article'),
    heroStyle: 'text',
    readingMinutes: Math.max(4, Math.ceil(group.map((note) => note.originalNote).join(' ').length / 700)),
  }, articleBody(category, group));
}

if (articleIds.length || notes.length) {
  const topCategories = Array.from(byCategory.keys()).slice(0, 4);
  writeMdx(join(collectionDir, 'raw-notes-editorial-map.mdx'), {
    title: '원본 메모 발행 지도',
    description: 'raw-notes에서 생성된 인사이트와 긴 글 후보를 묶은 첫 컬렉션.',
    category: '편집',
    tags: ['편집', '발행', '메모', ...topCategories],
    status: 'draft' satisfies Status,
    insightIds: notes.map((note) => note.id),
    articleIds,
    sourceIds: Array.from(new Set(notes.map((note) => slugify(note.source)))),
    imageGuide: '컬렉션 표지는 메모 더미, 작업 책상, 편집 보드처럼 여러 아이디어가 묶이는 장면.',
    publishPotential: 4,
    updatedAt: new Date().toISOString(),
  }, `## 컬렉션 의도

이 컬렉션은 원본 메모를 바로 공개하지 않고, 인사이트 카드와 긴 글 후보로 나누어 발행 가능성을 점검하기 위한 편집 지도입니다.

## 포함 카테고리

${topCategories.map((category) => `- ${category}`).join('\n')}
`);
}

console.log(`Generated ${notes.length} insights, ${articleIds.length} articles, and 1 collection candidate.`);
