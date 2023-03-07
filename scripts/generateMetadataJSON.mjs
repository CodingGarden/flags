import fs from 'node:fs';
import path from 'node:path';
import jsdom from 'jsdom';

const { JSDOM } = jsdom;

function getMetadata(filePath) {
  const file = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(file);
  const svg = dom.window.document.querySelector('svg');
  const metadataElement = svg.querySelector('metadata#cgf-metadata');
  if (!metadataElement) {
    throw new Error(filePath, 'missing metadata element.');
  } else {
    return {
      name: metadataElement.querySelector('cgf\\:name').textContent,
      route: metadataElement.querySelector('cgf\\:route').textContent,
      aspect_ratio: metadataElement.querySelector('cgf\\:aspect-ratio').textContent,
    };
  }
}

function parseDirectory(directory, metadatas = []) {
  const items = fs.readdirSync(directory, {
    withFileTypes: true,
  });
  items.forEach((item) => {
    const itemPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      parseDirectory(itemPath, metadatas);
    } else {
      if (!itemPath.endsWith('svg')) return;
      try {
        const metadata = getMetadata(itemPath);
        metadatas.push(metadata);
      } catch (error) {
        console.error(error);
      }
    }
  });
  return metadatas;
}

const metadatas = parseDirectory('svg');
fs.writeFileSync('dist/metadata.json', JSON.stringify(metadatas, null, 2));
fs.writeFileSync('dist/metadata.min.json', JSON.stringify(metadatas));
