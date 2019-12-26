import * as shell from 'shelljs';
import * as fs from 'fs';
import path from 'path';

const src = './src/public';
const dist = './dist/public';
const dirs = ['css', 'fonts', 'images'];

dirs.map(d => {
  const distEntry = path.join(dist, d);
  const srcEntry = path.join(src, d);
  if (fs.existsSync(distEntry)) {
    fs.rmdirSync(distEntry, { recursive: true });
  }

  if (!fs.existsSync(dist)) {
    shell.mkdir('-p', dist);
  }

  shell.cp('-R', srcEntry, dist);
});
