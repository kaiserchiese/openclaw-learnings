const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contentDir = path.join(__dirname, 'src', 'content');

const collections = [
  { src: 'patterns', dest: 'patterns' },
  { src: 'use-cases', dest: 'use-cases' },
  { src: 'gotchas', dest: 'gotchas' },
];

for (const col of collections) {
  const srcDir = path.join(root, col.src);
  const destDir = path.join(contentDir, col.dest);
  fs.mkdirSync(destDir, { recursive: true });

  for (const file of fs.readdirSync(srcDir).filter(f => f.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(srcDir, file), 'utf-8');
    const firstLine = content.split('\n').find(l => l.startsWith('# '));
    const title = firstLine ? firstLine.replace(/^# /, '') : file.replace('.md', '');

    const withFrontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\n---\n\n${content}`;
    fs.writeFileSync(path.join(destDir, file), withFrontmatter);
    console.log(`  ${col.dest}/${file}`);
  }
}

// Also copy QUICK-START.md and TIMELINE.md as pages
for (const file of ['QUICK-START.md', 'TIMELINE.md']) {
  const content = fs.readFileSync(path.join(root, file), 'utf-8');
  const firstLine = content.split('\n').find(l => l.startsWith('# '));
  const title = firstLine ? firstLine.replace(/^# /, '') : file.replace('.md', '');
  const slug = file.toLowerCase().replace('.md', '');

  const destDir = path.join(contentDir, 'pages');
  fs.mkdirSync(destDir, { recursive: true });
  const withFrontmatter = `---\ntitle: "${title.replace(/"/g, '\\"')}"\nslug: "${slug}"\n---\n\n${content}`;
  fs.writeFileSync(path.join(destDir, `${slug}.md`), withFrontmatter);
  console.log(`  pages/${slug}.md`);
}

console.log('Done!');
