import * as shell from 'shelljs';
import * as fs from 'fs';

if (fs.existsSync('dist/public/')) {
  fs.rmdirSync('dist/public/', { recursive: true });
}

const dirs = ['./src/public/javascript', './src/public/css', './src/public/fonts', './src/public/images'];

shell.mkdir('-p', './dist/public');
shell.cp('-R', dirs, './dist/public');
