import fs from 'fs';
import path from 'path';
import https from 'https';
import { parseStringPromise } from 'xml2js';

const BASE_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master';
const FORMATTED_URL = 'https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted';
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const FORMATTED_DIR = path.join(DATA_DIR, 'formatted');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(FORMATTED_DIR)) {
  fs.mkdirSync(FORMATTED_DIR, { recursive: true });
}

interface FetchOptions {
  url: string;
  timeout?: number;
}

function fetchFile(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { timeout: 30000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      })
      .on('error', reject)
      .on('timeout', () => reject(new Error('Timeout')));
  });
}

async function processItems(xmlData: string): Promise<void> {
  try {
    const result = await parseStringPromise(xmlData, { explicitArray: false });
    const root = result?.items ?? result ?? {};

    const collected: any[] = [];
    const seen = new Set<string>();

    const collect = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (Array.isArray(node)) {
        node.forEach(collect);
        return;
      }

      const attrs = node.$ ?? {};
      const id = attrs.uniquename ?? attrs.id ?? node.uniquename ?? node.id;
      if (id && !seen.has(id)) {
        seen.add(id);
        const name =
          attrs.name ??
          node?.LocalizedNames?.['EN-US'] ??
          node?.LocalizedNames?.en ??
          id;

        const tierRaw = String(attrs.tiertype ?? attrs.tier ?? '').replace('T', '');
        let tierParsed = parseInt(tierRaw, 10);
        if (Number.isNaN(tierParsed)) {
          const match = String(id).match(/T(\d+)/);
          tierParsed = match ? parseInt(match[1], 10) : 1;
        }

        const enchantRaw = attrs.enchantmentlevel ?? undefined;
        let enchantParsed =
          enchantRaw !== undefined ? parseInt(String(enchantRaw), 10) : undefined;
        if (enchantParsed === undefined) {
          const ematch = String(id).match(/@(\d+)/);
          enchantParsed = ematch ? parseInt(ematch[1], 10) : undefined;
        }

        collected.push({
          id: String(id),
          name,
          tier: tierParsed,
          enchantmentlevel: enchantParsed ?? 0,
          rarity: attrs.rarity ?? 'common',
        });
      }

      for (const value of Object.values(node)) {
        if (value && typeof value === 'object') collect(value);
      }
    };

    collect(root);

    fs.writeFileSync(
      path.join(DATA_DIR, 'items.json'),
      JSON.stringify(collected, null, 2)
    );
    console.log(`✓ Processed ${collected.length} items`);
  } catch (error) {
    console.error('Error processing items:', error);
  }
}

async function processProgressionTables(xmlData: string): Promise<void> {
  try {
    const result = await parseStringPromise(xmlData, { explicitArray: false });
    const tableList = result.progressiontables?.table || [];
    const tables = Array.isArray(tableList) ? tableList : [tableList];

    const processed = tables.map((table: any) => ({
      uniquename: table.$.uniquename,
      MasteryModifier: parseFloat(table.$.masterymodifier ?? table.$.MasteryModifier ?? 'NaN'),
      SpecializationModifier: parseFloat(table.$.specializationmodifier ?? table.$.SpecializationModifier ?? 'NaN'),
      CrossSpecializationModifier: parseFloat(
        table.$.crossspecializationmodifier ?? table.$.CrossSpecializationModifier ?? 'NaN'
      ),
      progressions: (Array.isArray(table.progression) ? table.progression : [table.progression])
        .filter(Boolean)
        .map((prog: any) => ({
          level: parseInt(prog.$.level),
          points: parseInt(prog.$.points),
          seasonpoints: parseInt(prog.$.seasonpoints),
        })),
    }));

    fs.writeFileSync(
      path.join(DATA_DIR, 'progressiontables.json'),
      JSON.stringify(processed, null, 2)
    );
    console.log(`✓ Processed ${processed.length} progression tables`);
  } catch (error) {
    console.error('Error processing progression tables:', error);
  }
}

async function processDynamicTemplates(xmlData: string): Promise<void> {
  try {
    const result = await parseStringPromise(xmlData);
    const mappings = result.dynamictemplates?.templatemappingpool?.[0]?.mapping || [];

    // Just store key metadata for templates
    const processed = {
      mappings: mappings.map((m: any) => ({
        continent: m.$.continent,
        biome: m.$.biome,
        pvpwarninglevel: m.$.pvpwarninglevel,
        clustertier: m.$.clustertier,
        templatepool: m.$.templatepool,
      })),
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(DATA_DIR, 'dynamictemplates.json'),
      JSON.stringify(processed, null, 2)
    );
    console.log(`✓ Processed dynamic templates (${processed.mappings.length} mappings)`);
  } catch (error) {
    console.error('Error processing dynamic templates:', error);
  }
}

async function main() {
  console.log('🔄 Fetching Albion data from ao-bin-dumps...\n');

  try {
    // Fetch items - this is the critical one for the calculator
    console.log('📦 Fetching items.xml...');
    const itemsXml = await fetchFile(`${BASE_URL}/items.xml`);
    const dumpsDir = path.join(process.cwd(), 'data', 'ao-bin-dumps');
    if (!fs.existsSync(dumpsDir)) {
      fs.mkdirSync(dumpsDir, { recursive: true });
    }
    fs.writeFileSync(path.join(dumpsDir, 'items.xml'), itemsXml);
    await processItems(itemsXml);

    console.log('Fetching spells.xml...');
    const spellsXml = await fetchFile(`${BASE_URL}/spells.xml`);
    fs.writeFileSync(path.join(dumpsDir, 'spells.xml'), spellsXml);
    fs.writeFileSync(path.join(process.cwd(), 'data', 'spells.xml'), spellsXml);

    console.log('Fetching localization.xml...');
    const localizationXml = await fetchFile(`${BASE_URL}/localization.xml`);
    fs.writeFileSync(path.join(dumpsDir, 'localization.xml'), localizationXml);
    fs.writeFileSync(path.join(process.cwd(), 'data', 'localization.xml'), localizationXml);

    console.log('Fetching factionwarfare.xml...');
    const factionWarfareXml = await fetchFile(`${BASE_URL}/factionwarfare.xml`);
    fs.writeFileSync(path.join(dumpsDir, 'factionwarfare.xml'), factionWarfareXml);
    fs.writeFileSync(path.join(DATA_DIR, 'factionwarfare.xml'), factionWarfareXml);

    console.log('Fetching formatted/items.json...');
    const formattedItemsJson = await fetchFile(`${FORMATTED_URL}/items.json`);
    fs.writeFileSync(path.join(FORMATTED_DIR, 'items.json'), formattedItemsJson);

    console.log('Fetching formatted/world.json...');
    const formattedWorldJson = await fetchFile(`${FORMATTED_URL}/world.json`);
    fs.writeFileSync(path.join(FORMATTED_DIR, 'world.json'), formattedWorldJson);

    console.log('📊 Fetching progressiontables.xml...');
    const progressionXml = await fetchFile(`${BASE_URL}/progressiontables.xml`);
    fs.writeFileSync(path.join(dumpsDir, 'progressiontables.xml'), progressionXml);
    await processProgressionTables(progressionXml);

    // Fetch and process dynamic templates
    console.log('🗺️  Fetching dynamictemplates.xml...');
    const templatesXml = await fetchFile(`${BASE_URL}/dynamictemplates.xml`);
    await processDynamicTemplates(templatesXml);

    console.log('\n✅ All data fetched and processed successfully!');
    console.log(`📂 Files saved to: ${DATA_DIR}`);
  } catch (error) {
    console.error('\n❌ Error fetching data:', error);
    process.exit(1);
  }
}

main();
