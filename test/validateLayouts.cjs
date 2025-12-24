const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REQUIRED_KEYS = ['internalId', 'displayId', 'orientation', 'gridRow', 'gridCol'];
const VALID_ORIENTATIONS = new Set(['vertical', 'horizontal']);
const EXCLUDE_DIRS = new Set(['.git', 'node_modules']);

function getJsonFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.has(entry.name)) {
        files = files.concat(getJsonFiles(full));
      }
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      if (entry.name !== 'layouts.json') {
        files.push(full);
      }
    }
  }
  return files;
}

function validateFile(filePath) {
  let data;
  try {
    data = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read file ${filePath}: ${err.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filePath}: ${err.message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`File ${filePath} does not contain an array.`);
  }
  const seenIds = new Set();
  parsed.forEach((item, index) => {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`Item ${index} in ${filePath} is not an object.`);
    }
    for (const key of REQUIRED_KEYS) {
      if (!(key in item)) {
        throw new Error(`Item ${index} in ${filePath} is missing '${key}'.`);
      }
    }
    if (!VALID_ORIENTATIONS.has(item.orientation)) {
      throw new Error(`Item ${index} in ${filePath} has invalid orientation '${item.orientation}'.`);
    }
    if (seenIds.has(item.internalId)) {
      throw new Error(`Duplicate internalId ${item.internalId} in ${filePath}.`);
    }
    seenIds.add(item.internalId);
  });
}

function main() {
  const files = getJsonFiles(ROOT);
  let ok = true;
  for (const file of files) {
    try {
      validateFile(file);
      console.log(`✔ ${path.relative(ROOT, file)}`);
    } catch (err) {
      console.error(`✖ ${path.relative(ROOT, file)}: ${err.message}`);
      ok = false;
    }
  }
  if (!ok) {
    process.exit(1);
  } else {
    console.log('All layout files validated successfully.');
  }
}

if (require.main === module) {
  main();
}

