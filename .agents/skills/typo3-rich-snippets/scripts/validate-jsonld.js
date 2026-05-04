#!/usr/bin/env node

/**
 * validate-jsonld.js
 *
 * Validates JSON-LD structured data from a URL or file.
 *
 * Usage:
 *   node validate-jsonld.js <URL>                    # Fetch and validate a page
 *   node validate-jsonld.js --file <path.json>       # Validate a local JSON file
 *   node validate-jsonld.js --stdin                   # Read JSON from stdin
 *
 * Checks performed:
 *   1. Valid JSON syntax
 *   2. Presence of @context and @type
 *   3. Required properties per schema type (Google subset)
 *   4. URL properties are absolute
 *   5. Date properties are ISO 8601 with timezone
 *   6. No duplicate @id values
 *
 * Exit codes:
 *   0 = all checks passed
 *   1 = validation errors found
 *   2 = usage / runtime error
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

// Google-required/recommended properties per type
const TYPE_RULES = {
  Article: {
    recommended: ['headline', 'image', 'datePublished', 'author'],
    urlFields: ['image', 'url'],
    dateFields: ['datePublished', 'dateModified'],
  },
  NewsArticle: {
    recommended: ['headline', 'image', 'datePublished', 'author'],
    urlFields: ['image', 'url'],
    dateFields: ['datePublished', 'dateModified'],
  },
  BlogPosting: {
    recommended: ['headline', 'image', 'datePublished', 'author'],
    urlFields: ['image', 'url'],
    dateFields: ['datePublished', 'dateModified'],
  },
  Product: {
    required: ['name'],
    recommended: ['image', 'offers'],
    urlFields: ['image', 'url'],
  },
  LocalBusiness: {
    required: ['name', 'address'],
    recommended: ['geo', 'telephone', 'url'],
    urlFields: ['url', 'image'],
  },
  Store: {
    required: ['name', 'address'],
    recommended: ['geo', 'telephone', 'url'],
    urlFields: ['url', 'image'],
  },
  Event: {
    required: ['name', 'startDate', 'location'],
    recommended: ['endDate', 'description', 'image'],
    urlFields: ['image', 'url'],
    dateFields: ['startDate', 'endDate'],
  },
  FAQPage: {
    required: ['mainEntity'],
  },
  BreadcrumbList: {
    required: ['itemListElement'],
  },
  Review: {
    required: ['author', 'reviewRating'],
    recommended: ['itemReviewed'],
  },
  AggregateRating: {
    required: ['ratingValue'],
    recommended: ['ratingCount', 'reviewCount'],
  },
  Organization: {
    recommended: ['name', 'url', 'logo'],
    urlFields: ['url', 'logo'],
  },
  HowTo: {
    required: ['name', 'step'],
    recommended: ['description', 'totalTime'],
  },
  Offer: {
    recommended: ['price', 'priceCurrency', 'availability'],
    urlFields: ['url', 'availability'],
  },
};

const ISO8601_WITH_TZ = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z))?$/;
const ABSOLUTE_URL = /^https?:\/\//;

class ValidationResult {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  error(msg, path = '') {
    this.errors.push(path ? `[${path}] ${msg}` : msg);
  }

  warn(msg, path = '') {
    this.warnings.push(path ? `[${path}] ${msg}` : msg);
  }

  get isValid() {
    return this.errors.length === 0;
  }

  print() {
    if (this.errors.length > 0) {
      console.error('\n ERRORS:');
      this.errors.forEach(e => console.error(`  - ${e}`));
    }
    if (this.warnings.length > 0) {
      console.warn('\n WARNINGS:');
      this.warnings.forEach(w => console.warn(`  - ${w}`));
    }
    if (this.isValid && this.warnings.length === 0) {
      console.log('\n All checks passed.');
    }
    console.log(`\nSummary: ${this.errors.length} error(s), ${this.warnings.length} warning(s)`);
  }
}

function validateJsonLd(data, result, path = '') {
  if (Array.isArray(data)) {
    data.forEach((item, i) => validateJsonLd(item, result, `${path}[${i}]`));
    return;
  }

  if (typeof data !== 'object' || data === null) {
    result.error('JSON-LD root must be an object or array', path);
    return;
  }

  // @context check
  if (!path && !data['@context']) {
    result.error('Missing "@context" property. Expected "https://schema.org"');
  } else if (!path && data['@context'] !== 'https://schema.org') {
    result.warn(`@context is "${data['@context']}", expected "https://schema.org"`);
  }

  // @type check
  const type = data['@type'];
  if (!type) {
    if (!path) result.error('Missing "@type" property', path);
    return;
  }

  const typeName = Array.isArray(type) ? type[0] : type;
  const rules = TYPE_RULES[typeName];
  const currentPath = path ? `${path}.${typeName}` : typeName;

  if (!rules) {
    result.warn(`No validation rules for type "${typeName}" -- skipping property checks`, currentPath);
    return;
  }

  // Required properties
  if (rules.required) {
    for (const prop of rules.required) {
      if (data[prop] === undefined || data[prop] === null || data[prop] === '') {
        result.error(`Missing required property "${prop}"`, currentPath);
      }
    }
  }

  // Recommended properties
  if (rules.recommended) {
    for (const prop of rules.recommended) {
      if (data[prop] === undefined || data[prop] === null || data[prop] === '') {
        result.warn(`Missing recommended property "${prop}"`, currentPath);
      }
    }
  }

  // URL fields must be absolute
  if (rules.urlFields) {
    for (const prop of rules.urlFields) {
      const val = data[prop];
      if (val) {
        const urls = Array.isArray(val) ? val : [val];
        for (const u of urls) {
          const urlStr = typeof u === 'object' ? (u.url || u['@id'] || '') : u;
          if (typeof urlStr === 'string' && urlStr && !ABSOLUTE_URL.test(urlStr)) {
            result.error(`"${prop}" contains relative URL: "${urlStr}". Use absolute URLs.`, currentPath);
          }
        }
      }
    }
  }

  // Date fields must be ISO 8601 with timezone
  if (rules.dateFields) {
    for (const prop of rules.dateFields) {
      const val = data[prop];
      if (typeof val === 'string' && val && !ISO8601_WITH_TZ.test(val)) {
        result.error(`"${prop}" is not valid ISO 8601 with timezone: "${val}"`, currentPath);
      }
    }
  }

  // Recurse into nested objects
  for (const [key, val] of Object.entries(data)) {
    if (key.startsWith('@')) continue;
    if (typeof val === 'object' && val !== null && val['@type']) {
      validateJsonLd(val, result, currentPath);
    }
    if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (typeof item === 'object' && item !== null && item['@type']) {
          validateJsonLd(item, result, `${currentPath}.${key}[${i}]`);
        }
      });
    }
  }
}

function checkDuplicateIds(data, result) {
  const ids = [];

  function collect(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      obj.forEach(collect);
      return;
    }
    if (obj['@id']) ids.push(obj['@id']);
    for (const val of Object.values(obj)) {
      if (typeof val === 'object') collect(val);
    }
  }

  collect(data);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) {
      result.error(`Duplicate @id: "${id}"`);
    }
    seen.add(id);
  }
}

function fetchUrl(urlString) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlString);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    client.get(urlString, { headers: { 'User-Agent': 'RichSnippetValidator/1.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function extractJsonLdFromHtml(html) {
  const blocks = [];
  const regex = /<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1].trim()));
    } catch (e) {
      blocks.push({ _parseError: e.message, _raw: match[1].trim() });
    }
  }
  return blocks;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node validate-jsonld.js <URL>');
    console.log('  node validate-jsonld.js --file <path.json>');
    console.log('  echo \'{"@type":"Product"}\' | node validate-jsonld.js --stdin');
    process.exit(2);
  }

  let jsonLdBlocks = [];

  if (args[0] === '--file') {
    const filePath = args[1];
    if (!filePath) {
      console.error('Error: --file requires a path argument');
      process.exit(2);
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      jsonLdBlocks = [JSON.parse(content)];
    } catch (e) {
      console.error(`Error reading/parsing file: ${e.message}`);
      process.exit(2);
    }
  } else if (args[0] === '--stdin') {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    try {
      jsonLdBlocks = [JSON.parse(Buffer.concat(chunks).toString())];
    } catch (e) {
      console.error(`Error parsing stdin: ${e.message}`);
      process.exit(2);
    }
  } else {
    // URL mode
    const url = args[0];
    console.log(`Fetching ${url}...`);
    try {
      const html = await fetchUrl(url);
      jsonLdBlocks = extractJsonLdFromHtml(html);

      if (jsonLdBlocks.length === 0) {
        console.error('No <script type="application/ld+json"> blocks found on the page.');
        process.exit(1);
      }

      console.log(`Found ${jsonLdBlocks.length} JSON-LD block(s).`);
    } catch (e) {
      console.error(`Error fetching URL: ${e.message}`);
      process.exit(2);
    }
  }

  const result = new ValidationResult();

  for (let i = 0; i < jsonLdBlocks.length; i++) {
    const block = jsonLdBlocks[i];
    if (block._parseError) {
      result.error(`JSON-LD block ${i + 1}: Invalid JSON -- ${block._parseError}`);
      continue;
    }
    console.log(`\nValidating block ${i + 1}: @type="${block['@type'] || '(missing)'}"`);
    validateJsonLd(block, result);
  }

  // Check for duplicate @id across all blocks
  checkDuplicateIds(jsonLdBlocks, result);

  result.print();
  process.exit(result.isValid ? 0 : 1);
}

main().catch(e => {
  console.error(`Unexpected error: ${e.message}`);
  process.exit(2);
});
