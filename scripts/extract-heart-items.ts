/**
 * Extract Heart Run Items from Albion Data
 * Parses items.xml to identify faction tokens, hearts, and fragments
 */

import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

interface FactionItems {
  tokenIds: string[];
  heartIds: string[];
  fragmentIds: string[];
}

interface ExtractedData {
  factions: Record<string, FactionItems>;
  allMatches: {
    tokenIds: string[];
    heartLikeIds: string[];
    fragmentLikeIds: string[];
  };
}

const FACTIONS = ['FOREST', 'HIGHLAND', 'STEPPE', 'MOUNTAIN', 'SWAMP', 'CAERLEON'];
const TOKEN_PATTERN = /T1_FACTION_(\w+)_TOKEN_\d+/;
const HEART_PATTERN = /HEART|ESSENCE/i;
const FRAGMENT_PATTERN = /FRAGMENT/i;

async function loadItemsXml(): Promise<string> {
  const xmlPath = path.join(process.cwd(), 'data', 'ao-bin-dumps', 'items.xml');
  
  if (!fs.existsSync(xmlPath)) {
    throw new Error(`items.xml not found at ${xmlPath}`);
  }

  return fs.readFileSync(xmlPath, 'utf-8');
}

async function main() {
  console.log('⚠ Extracting heart run items...\n');

  try {
    // Load XML
    const xmlData = await loadItemsXml();

    // Parse XML
    console.log('📊 Parsing items.xml...');
    const result = await parseStringPromise(xmlData, { attrNameFn: (name: string) => name.toLowerCase() } as any);
    
    // Collect all items from different categories
    const items: any[] = [];
    const itemsRoot = result.items || {};

    // Flatten all item entries
    if (itemsRoot.item) {
      items.push(...itemsRoot.item);
    }

    console.log(`✓ Processed ${items.length} items`);

    // Initialize result structure
    const extracted: ExtractedData = {
      factions: {},
      allMatches: {
        tokenIds: [],
        heartLikeIds: [],
        fragmentLikeIds: [],
      },
    };

    // Initialize faction objects
    FACTIONS.forEach((faction) => {
      extracted.factions[faction] = {
        tokenIds: [],
        heartIds: [],
        fragmentIds: [],
      };
    });

    // Process items
    items.forEach((item) => {
      const itemId = item.uniquename?.[0] || '';
      if (!itemId) return;

      // Check for tokens
      const tokenMatch = itemId.match(TOKEN_PATTERN);
      if (tokenMatch) {
        const faction = tokenMatch[1];
        if (extracted.factions[faction]) {
          extracted.factions[faction].tokenIds.push(itemId);
        } else {
          extracted.allMatches.tokenIds.push(itemId);
        }
        return;
      }

      // Check for hearts
      if (HEART_PATTERN.test(itemId)) {
        extracted.allMatches.heartLikeIds.push(itemId);
        return;
      }

      // Check for fragments
      if (FRAGMENT_PATTERN.test(itemId)) {
        extracted.allMatches.fragmentLikeIds.push(itemId);
        return;
      }
    });

    // Generate summary
    console.log('\n📊 Extraction complete!\n');
    console.log('📋 Summary:');
    FACTIONS.forEach((faction) => {
      const data = extracted.factions[faction];
      console.log(
        `  ${faction}: ${data.tokenIds.length} tokens, ${data.heartIds.length} hearts, ${data.fragmentIds.length} fragments`
      );
    });

    console.log(`\n  Unassigned hearts: ${extracted.allMatches.heartLikeIds.length}`);
    console.log(`  Unassigned fragments: ${extracted.allMatches.fragmentLikeIds.length}`);

    // Save output
    const outputDir = path.join(process.cwd(), 'data', 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'heart-items.json');
    fs.writeFileSync(outputPath, JSON.stringify(extracted, null, 2));

    console.log(`\n✓ Output saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error during extraction:', error);
    process.exit(1);
  }
}

main();
