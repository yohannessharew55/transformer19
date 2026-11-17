import fs from 'fs';
import path from 'path';

function searchFile(full, terms) {
  const content = fs.readFileSync(full, 'utf8');
  for (const term of terms) {
    let idx = 0;
    while ((idx = content.toLowerCase().indexOf(term.toLowerCase(), idx)) !== -1) {
      const line = content.substring(0, idx).split('\n').length;
      const snippet = content.substring(Math.max(0, idx - 40), Math.min(content.length, idx + 60)).replace(/\r?\n/g, ' ');
      console.log(`${full}:${line} [${term}] -> ...${snippet}...`);
      idx += term.length;
    }
  }
}

function walk(dir, terms) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(f)) walk(full, terms);
    } else if (/\.(tsx?|html|json)$/.test(f)) {
      searchFile(full, terms);
    }
  }
}

walk('src', ['49000', '58990', '9990', '7150', '37150']);
searchFile('server.ts', ['49000', '58990', '9990', '7150', '37150']);
