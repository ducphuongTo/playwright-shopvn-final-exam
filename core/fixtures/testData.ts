import fs from 'fs';
import path from 'path';

export function loadJsonData() {
  const filePath = path.resolve(__dirname, '../../resources/test-data.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
