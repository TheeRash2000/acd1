/**
 * Destiny Board Masteries and Specializations
 * Based on Albion Online Wiki
 *
 * IP Rates:
 * - Mastery: 0.2 IP per level (all)
 * - Spec Unique: 2.0 IP per level (all)
 * - Spec Mutual: 0.2 (simple), 0.1 (artifact/royal), 0.6 (off-hand)
 */

import type { MasteryNode, SpecializationNode, EquipmentCategory, EquipmentType } from '@/types/destiny-board'

// Helper to create mastery node
function createMastery(
  id: string,
  name: string,
  category: EquipmentCategory,
  specializationIds: string[]
): MasteryNode {
  return {
    id,
    name,
    category,
    maxLevel: 100,
    ipPerLevel: 0.2,
    focusPerLevel: 30,
    craftingFocusTotal: 3000,
    specializationIds,
  }
}

// Helper to create specialization node
function createSpec(
  id: string,
  name: string,
  masteryId: string,
  itemId: string,
  type: EquipmentType,
  mutualRate: number = 0.2
): SpecializationNode {
  return {
    id,
    name,
    masteryId,
    itemId,
    type,
    maxLevel: 120,
    uniqueIpPerLevel: 2.0,
    mutualIpPerLevel: mutualRate,
  }
}

// =============================================================================
// WARRIOR WEAPONS
// =============================================================================

// AXE
export const AXE_MASTERY = createMastery(
  'mastery_axe',
  'Axe Fighter',
  'weapon_warrior',
  ['spec_battleaxe', 'spec_greataxe', 'spec_halberd', 'spec_carrioncaller', 'spec_infernal_scythe', 'spec_bear_paws', 'spec_realmbreaker']
)

export const AXE_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_battleaxe', 'Battleaxe Combat Specialist', 'mastery_axe', 'T4_2H_AXE', 'simple'),
  createSpec('spec_greataxe', 'Greataxe Combat Specialist', 'mastery_axe', 'T4_2H_HALBERD_MORGANA', 'simple'),
  createSpec('spec_halberd', 'Halberd Combat Specialist', 'mastery_axe', 'T4_2H_HALBERD', 'simple'),
  createSpec('spec_carrioncaller', 'Carrioncaller Combat Specialist', 'mastery_axe', 'T4_2H_AXE_UNDEAD', 'artifact1', 0.1),
  createSpec('spec_infernal_scythe', 'Infernal Scythe Combat Specialist', 'mastery_axe', 'T4_2H_SCYTHE_HELL', 'artifact2', 0.1),
  createSpec('spec_bear_paws', 'Bear Paws Combat Specialist', 'mastery_axe', 'T4_2H_AXE_KEEPER', 'artifact3', 0.1),
  createSpec('spec_realmbreaker', 'Realmbreaker Combat Specialist', 'mastery_axe', 'T4_2H_AXE_AVALON', 'avalonian', 0.1),
]

// SWORD
export const SWORD_MASTERY = createMastery(
  'mastery_sword',
  'Sword Fighter',
  'weapon_warrior',
  ['spec_broadsword', 'spec_claymore', 'spec_dual_swords', 'spec_clarent_blade', 'spec_carving_sword', 'spec_galatine_pair', 'spec_kingmaker']
)

export const SWORD_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_broadsword', 'Broadsword Combat Specialist', 'mastery_sword', 'T4_MAIN_SWORD', 'simple'),
  createSpec('spec_claymore', 'Claymore Combat Specialist', 'mastery_sword', 'T4_2H_CLAYMORE', 'simple'),
  createSpec('spec_dual_swords', 'Dual Swords Combat Specialist', 'mastery_sword', 'T4_2H_DUALSWORD', 'simple'),
  createSpec('spec_clarent_blade', 'Clarent Blade Combat Specialist', 'mastery_sword', 'T4_2H_CLEAVER_HELL', 'artifact1', 0.1),
  createSpec('spec_carving_sword', 'Carving Sword Combat Specialist', 'mastery_sword', 'T4_MAIN_SCIMITAR_MORGANA', 'artifact2', 0.1),
  createSpec('spec_galatine_pair', 'Galatine Pair Combat Specialist', 'mastery_sword', 'T4_2H_DUALSCIMITAR_UNDEAD', 'artifact3', 0.1),
  createSpec('spec_kingmaker', 'Kingmaker Combat Specialist', 'mastery_sword', 'T4_2H_CLAYMORE_AVALON', 'avalonian', 0.1),
]

// MACE
export const MACE_MASTERY = createMastery(
  'mastery_mace',
  'Mace Fighter',
  'weapon_warrior',
  ['spec_mace', 'spec_heavy_mace', 'spec_morning_star', 'spec_bedrock_mace', 'spec_incubus_mace', 'spec_camlann_mace', 'spec_oathkeepers']
)

export const MACE_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_mace', 'Mace Combat Specialist', 'mastery_mace', 'T4_MAIN_MACE', 'simple'),
  createSpec('spec_heavy_mace', 'Heavy Mace Combat Specialist', 'mastery_mace', 'T4_2H_MACE', 'simple'),
  createSpec('spec_morning_star', 'Morning Star Combat Specialist', 'mastery_mace', 'T4_2H_FLAIL', 'simple'),
  createSpec('spec_bedrock_mace', 'Bedrock Mace Combat Specialist', 'mastery_mace', 'T4_MAIN_ROCKMACE_KEEPER', 'artifact1', 0.1),
  createSpec('spec_incubus_mace', 'Incubus Mace Combat Specialist', 'mastery_mace', 'T4_MAIN_MACE_HELL', 'artifact2', 0.1),
  createSpec('spec_camlann_mace', 'Camlann Mace Combat Specialist', 'mastery_mace', 'T4_2H_MACE_MORGANA', 'artifact3', 0.1),
  createSpec('spec_oathkeepers', 'Oathkeepers Combat Specialist', 'mastery_mace', 'T4_2H_DUALMACE_AVALON', 'avalonian', 0.1),
]

// HAMMER
export const HAMMER_MASTERY = createMastery(
  'mastery_hammer',
  'Hammer Fighter',
  'weapon_warrior',
  ['spec_hammer', 'spec_polehammer', 'spec_great_hammer', 'spec_tombhammer', 'spec_forge_hammers', 'spec_grovekeeper', 'spec_hand_of_justice']
)

export const HAMMER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_hammer', 'Hammer Combat Specialist', 'mastery_hammer', 'T4_MAIN_HAMMER', 'simple'),
  createSpec('spec_polehammer', 'Polehammer Combat Specialist', 'mastery_hammer', 'T4_2H_POLEHAMMER', 'simple'),
  createSpec('spec_great_hammer', 'Great Hammer Combat Specialist', 'mastery_hammer', 'T4_2H_HAMMER', 'simple'),
  createSpec('spec_tombhammer', 'Tombhammer Combat Specialist', 'mastery_hammer', 'T4_2H_HAMMER_UNDEAD', 'artifact1', 0.1),
  createSpec('spec_forge_hammers', 'Forge Hammers Combat Specialist', 'mastery_hammer', 'T4_2H_DUALHAMMER_HELL', 'artifact2', 0.1),
  createSpec('spec_grovekeeper', 'Grovekeeper Combat Specialist', 'mastery_hammer', 'T4_2H_RAM_KEEPER', 'artifact3', 0.1),
  createSpec('spec_hand_of_justice', 'Hand of Justice Combat Specialist', 'mastery_hammer', 'T4_2H_HAMMER_AVALON', 'avalonian', 0.1),
]

// WAR GLOVES
export const WARGLOVES_MASTERY = createMastery(
  'mastery_wargloves',
  'War Gloves Fighter',
  'weapon_warrior',
  ['spec_brawler_gloves', 'spec_battle_bracers', 'spec_spiked_gauntlets', 'spec_ravenstrike_cestus', 'spec_hellfire_hands', 'spec_fists_of_avalon', 'spec_ursine_maulers']
)

export const WARGLOVES_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_brawler_gloves', 'Brawler Gloves Combat Specialist', 'mastery_wargloves', 'T4_2H_COMBATSTAFF_MORGANA', 'simple'),
  createSpec('spec_battle_bracers', 'Battle Bracers Combat Specialist', 'mastery_wargloves', 'T4_2H_INFERNOSTAFF', 'simple'),
  createSpec('spec_spiked_gauntlets', 'Spiked Gauntlets Combat Specialist', 'mastery_wargloves', 'T4_2H_ENIGMATICSTAFF', 'simple'),
  createSpec('spec_ravenstrike_cestus', 'Ravenstrike Cestus Combat Specialist', 'mastery_wargloves', 'T4_2H_KNUCKLES_SET1', 'artifact1', 0.1),
  createSpec('spec_hellfire_hands', 'Hellfire Hands Combat Specialist', 'mastery_wargloves', 'T4_2H_KNUCKLES_SET2', 'artifact2', 0.1),
  createSpec('spec_fists_of_avalon', 'Fists of Avalon Combat Specialist', 'mastery_wargloves', 'T4_2H_KNUCKLES_SET3', 'avalonian', 0.1),
  createSpec('spec_ursine_maulers', 'Ursine Maulers Combat Specialist', 'mastery_wargloves', 'T4_2H_KNUCKLES_KEEPER', 'artifact3', 0.1),
]

// =============================================================================
// HUNTER WEAPONS
// =============================================================================

// BOW
export const BOW_MASTERY = createMastery(
  'mastery_bow',
  'Bow Fighter',
  'weapon_hunter',
  ['spec_bow', 'spec_warbow', 'spec_longbow', 'spec_whispering_bow', 'spec_wailing_bow', 'spec_bow_of_badon', 'spec_mistpiercer']
)

export const BOW_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_bow', 'Bow Combat Specialist', 'mastery_bow', 'T4_2H_BOW', 'simple'),
  createSpec('spec_warbow', 'Warbow Combat Specialist', 'mastery_bow', 'T4_2H_WARBOW', 'simple'),
  createSpec('spec_longbow', 'Longbow Combat Specialist', 'mastery_bow', 'T4_2H_LONGBOW', 'simple'),
  createSpec('spec_whispering_bow', 'Whispering Bow Combat Specialist', 'mastery_bow', 'T4_2H_BOW_HELL', 'artifact1', 0.1),
  createSpec('spec_wailing_bow', 'Wailing Bow Combat Specialist', 'mastery_bow', 'T4_2H_BOW_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_bow_of_badon', 'Bow of Badon Combat Specialist', 'mastery_bow', 'T4_2H_LONGBOW_UNDEAD', 'artifact3', 0.1),
  createSpec('spec_mistpiercer', 'Mistpiercer Combat Specialist', 'mastery_bow', 'T4_2H_BOW_AVALON', 'avalonian', 0.1),
]

// CROSSBOW
export const CROSSBOW_MASTERY = createMastery(
  'mastery_crossbow',
  'Crossbow Fighter',
  'weapon_hunter',
  ['spec_crossbow', 'spec_heavy_crossbow', 'spec_light_crossbow', 'spec_weeping_repeater', 'spec_boltcasters', 'spec_siegebow', 'spec_energy_shaper']
)

export const CROSSBOW_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_crossbow', 'Crossbow Combat Specialist', 'mastery_crossbow', 'T4_2H_CROSSBOW', 'simple'),
  createSpec('spec_heavy_crossbow', 'Heavy Crossbow Combat Specialist', 'mastery_crossbow', 'T4_2H_CROSSBOWLARGE', 'simple'),
  createSpec('spec_light_crossbow', 'Light Crossbow Combat Specialist', 'mastery_crossbow', 'T4_MAIN_1HCROSSBOW', 'simple'),
  createSpec('spec_weeping_repeater', 'Weeping Repeater Combat Specialist', 'mastery_crossbow', 'T4_2H_REPEATINGCROSSBOW_UNDEAD', 'artifact1', 0.1),
  createSpec('spec_boltcasters', 'Boltcasters Combat Specialist', 'mastery_crossbow', 'T4_2H_DUALCROSSBOW_HELL', 'artifact2', 0.1),
  createSpec('spec_siegebow', 'Siegebow Combat Specialist', 'mastery_crossbow', 'T4_2H_CROSSBOWLARGE_MORGANA', 'artifact3', 0.1),
  createSpec('spec_energy_shaper', 'Energy Shaper Combat Specialist', 'mastery_crossbow', 'T4_2H_CROSSBOW_AVALON', 'avalonian', 0.1),
]

// SPEAR
export const SPEAR_MASTERY = createMastery(
  'mastery_spear',
  'Spear Fighter',
  'weapon_hunter',
  ['spec_spear', 'spec_pike', 'spec_glaive', 'spec_heron_spear', 'spec_spirithunter', 'spec_trinity_spear', 'spec_daybreaker']
)

export const SPEAR_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_spear', 'Spear Combat Specialist', 'mastery_spear', 'T4_MAIN_SPEAR', 'simple'),
  createSpec('spec_pike', 'Pike Combat Specialist', 'mastery_spear', 'T4_2H_SPEAR', 'simple'),
  createSpec('spec_glaive', 'Glaive Combat Specialist', 'mastery_spear', 'T4_2H_GLAIVE', 'simple'),
  createSpec('spec_heron_spear', 'Heron Spear Combat Specialist', 'mastery_spear', 'T4_MAIN_SPEAR_KEEPER', 'artifact1', 0.1),
  createSpec('spec_spirithunter', 'Spirithunter Combat Specialist', 'mastery_spear', 'T4_2H_SPEAR_MORGANA', 'artifact2', 0.1),
  createSpec('spec_trinity_spear', 'Trinity Spear Combat Specialist', 'mastery_spear', 'T4_2H_TRIDENT_UNDEAD', 'artifact3', 0.1),
  createSpec('spec_daybreaker', 'Daybreaker Combat Specialist', 'mastery_spear', 'T4_2H_SPEAR_AVALON', 'avalonian', 0.1),
]

// DAGGER
export const DAGGER_MASTERY = createMastery(
  'mastery_dagger',
  'Dagger Fighter',
  'weapon_hunter',
  ['spec_dagger', 'spec_dagger_pair', 'spec_claws', 'spec_bloodletter', 'spec_black_hands', 'spec_deathgivers', 'spec_bridled_fury']
)

export const DAGGER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_dagger', 'Dagger Combat Specialist', 'mastery_dagger', 'T4_MAIN_DAGGER', 'simple'),
  createSpec('spec_dagger_pair', 'Dagger Pair Combat Specialist', 'mastery_dagger', 'T4_2H_DAGGERPAIR', 'simple'),
  createSpec('spec_claws', 'Claws Combat Specialist', 'mastery_dagger', 'T4_2H_CLAWPAIR', 'simple'),
  createSpec('spec_bloodletter', 'Bloodletter Combat Specialist', 'mastery_dagger', 'T4_MAIN_RAPIER_MORGANA', 'artifact1', 0.1),
  createSpec('spec_black_hands', 'Black Hands Combat Specialist', 'mastery_dagger', 'T4_2H_IRONGAUNTLETS_HELL', 'artifact2', 0.1),
  createSpec('spec_deathgivers', 'Deathgivers Combat Specialist', 'mastery_dagger', 'T4_2H_DUALSICKLE_UNDEAD', 'artifact3', 0.1),
  createSpec('spec_bridled_fury', 'Bridled Fury Combat Specialist', 'mastery_dagger', 'T4_2H_DAGGER_AVALON', 'avalonian', 0.1),
]

// QUARTERSTAFF
export const QUARTERSTAFF_MASTERY = createMastery(
  'mastery_quarterstaff',
  'Quarterstaff Fighter',
  'weapon_hunter',
  ['spec_quarterstaff', 'spec_iron_clad_staff', 'spec_double_bladed_staff', 'spec_black_monk_stave', 'spec_soulscythe', 'spec_staff_of_balance', 'spec_grailseeker']
)

export const QUARTERSTAFF_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_quarterstaff', 'Quarterstaff Combat Specialist', 'mastery_quarterstaff', 'T4_2H_QUARTERSTAFF', 'simple'),
  createSpec('spec_iron_clad_staff', 'Iron-clad Staff Combat Specialist', 'mastery_quarterstaff', 'T4_2H_IRONCLADEDSTAFF', 'simple'),
  createSpec('spec_double_bladed_staff', 'Double Bladed Staff Combat Specialist', 'mastery_quarterstaff', 'T4_2H_DOUBLEBLADEDSTAFF', 'simple'),
  createSpec('spec_black_monk_stave', 'Black Monk Stave Combat Specialist', 'mastery_quarterstaff', 'T4_2H_TWINSCYTHE_HELL', 'artifact1', 0.1),
  createSpec('spec_soulscythe', 'Soulscythe Combat Specialist', 'mastery_quarterstaff', 'T4_2H_ROCKSTAFF_KEEPER', 'artifact2', 0.1),
  createSpec('spec_staff_of_balance', 'Staff of Balance Combat Specialist', 'mastery_quarterstaff', 'T4_2H_QUARTERSTAFF_MORGANA', 'artifact3', 0.1),
  createSpec('spec_grailseeker', 'Grailseeker Combat Specialist', 'mastery_quarterstaff', 'T4_2H_QUARTERSTAFF_AVALON', 'avalonian', 0.1),
]

// =============================================================================
// MAGE WEAPONS
// =============================================================================

// FIRE STAFF
export const FIRESTAFF_MASTERY = createMastery(
  'mastery_firestaff',
  'Fire Staff Fighter',
  'weapon_mage',
  ['spec_fire_staff', 'spec_great_fire_staff', 'spec_infernal_staff', 'spec_wildfire_staff', 'spec_blazing_staff', 'spec_brimstone_staff', 'spec_dawnsong']
)

export const FIRESTAFF_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_fire_staff', 'Fire Staff Combat Specialist', 'mastery_firestaff', 'T4_MAIN_FIRESTAFF', 'simple'),
  createSpec('spec_great_fire_staff', 'Great Fire Staff Combat Specialist', 'mastery_firestaff', 'T4_2H_FIRESTAFF', 'simple'),
  createSpec('spec_infernal_staff', 'Infernal Staff Combat Specialist', 'mastery_firestaff', 'T4_2H_INFERNOSTAFF', 'simple'),
  createSpec('spec_wildfire_staff', 'Wildfire Staff Combat Specialist', 'mastery_firestaff', 'T4_MAIN_FIRESTAFF_KEEPER', 'artifact1', 0.1),
  createSpec('spec_blazing_staff', 'Blazing Staff Combat Specialist', 'mastery_firestaff', 'T4_2H_FIRESTAFF_HELL', 'artifact2', 0.1),
  createSpec('spec_brimstone_staff', 'Brimstone Staff Combat Specialist', 'mastery_firestaff', 'T4_2H_INFERNOSTAFF_MORGANA', 'artifact3', 0.1),
  createSpec('spec_dawnsong', 'Dawnsong Combat Specialist', 'mastery_firestaff', 'T4_2H_FIRESTAFF_AVALON', 'avalonian', 0.1),
]

// HOLY STAFF
export const HOLYSTAFF_MASTERY = createMastery(
  'mastery_holystaff',
  'Holy Staff Fighter',
  'weapon_mage',
  ['spec_holy_staff', 'spec_great_holy_staff', 'spec_divine_staff', 'spec_lifetouch_staff', 'spec_fallen_staff', 'spec_redemption_staff', 'spec_hallowfall']
)

export const HOLYSTAFF_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_holy_staff', 'Holy Staff Combat Specialist', 'mastery_holystaff', 'T4_MAIN_HOLYSTAFF', 'simple'),
  createSpec('spec_great_holy_staff', 'Great Holy Staff Combat Specialist', 'mastery_holystaff', 'T4_2H_HOLYSTAFF', 'simple'),
  createSpec('spec_divine_staff', 'Divine Staff Combat Specialist', 'mastery_holystaff', 'T4_2H_DIVINESTAFF', 'simple'),
  createSpec('spec_lifetouch_staff', 'Lifetouch Staff Combat Specialist', 'mastery_holystaff', 'T4_MAIN_HOLYSTAFF_MORGANA', 'artifact1', 0.1),
  createSpec('spec_fallen_staff', 'Fallen Staff Combat Specialist', 'mastery_holystaff', 'T4_2H_HOLYSTAFF_HELL', 'artifact2', 0.1),
  createSpec('spec_redemption_staff', 'Redemption Staff Combat Specialist', 'mastery_holystaff', 'T4_2H_HOLYSTAFF_UNDEAD', 'artifact3', 0.1),
  createSpec('spec_hallowfall', 'Hallowfall Combat Specialist', 'mastery_holystaff', 'T4_2H_HOLYSTAFF_AVALON', 'avalonian', 0.1),
]

// ARCANE STAFF
export const ARCANESTAFF_MASTERY = createMastery(
  'mastery_arcanestaff',
  'Arcane Staff Fighter',
  'weapon_mage',
  ['spec_arcane_staff', 'spec_great_arcane_staff', 'spec_enigmatic_staff', 'spec_witchwork_staff', 'spec_occult_staff', 'spec_malevolent_locus', 'spec_evensong']
)

export const ARCANESTAFF_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_arcane_staff', 'Arcane Staff Combat Specialist', 'mastery_arcanestaff', 'T4_MAIN_ARCANESTAFF', 'simple'),
  createSpec('spec_great_arcane_staff', 'Great Arcane Staff Combat Specialist', 'mastery_arcanestaff', 'T4_2H_ARCANESTAFF', 'simple'),
  createSpec('spec_enigmatic_staff', 'Enigmatic Staff Combat Specialist', 'mastery_arcanestaff', 'T4_2H_ENIGMATICSTAFF', 'simple'),
  createSpec('spec_witchwork_staff', 'Witchwork Staff Combat Specialist', 'mastery_arcanestaff', 'T4_MAIN_ARCANESTAFF_UNDEAD', 'artifact1', 0.1),
  createSpec('spec_occult_staff', 'Occult Staff Combat Specialist', 'mastery_arcanestaff', 'T4_2H_ARCANESTAFF_HELL', 'artifact2', 0.1),
  createSpec('spec_malevolent_locus', 'Malevolent Locus Combat Specialist', 'mastery_arcanestaff', 'T4_2H_ENIGMATICORB_MORGANA', 'artifact3', 0.1),
  createSpec('spec_evensong', 'Evensong Combat Specialist', 'mastery_arcanestaff', 'T4_2H_ARCANESTAFF_AVALON', 'avalonian', 0.1),
]

// FROST STAFF
export const FROSTSTAFF_MASTERY = createMastery(
  'mastery_froststaff',
  'Frost Staff Fighter',
  'weapon_mage',
  ['spec_frost_staff', 'spec_great_frost_staff', 'spec_glacial_staff', 'spec_hoarfrost_staff', 'spec_icicle_staff', 'spec_permafrost_prism', 'spec_chillhowl']
)

export const FROSTSTAFF_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_frost_staff', 'Frost Staff Combat Specialist', 'mastery_froststaff', 'T4_MAIN_FROSTSTAFF', 'simple'),
  createSpec('spec_great_frost_staff', 'Great Frost Staff Combat Specialist', 'mastery_froststaff', 'T4_2H_FROSTSTAFF', 'simple'),
  createSpec('spec_glacial_staff', 'Glacial Staff Combat Specialist', 'mastery_froststaff', 'T4_2H_GLACIALSTAFF', 'simple'),
  createSpec('spec_hoarfrost_staff', 'Hoarfrost Staff Combat Specialist', 'mastery_froststaff', 'T4_MAIN_FROSTSTAFF_KEEPER', 'artifact1', 0.1),
  createSpec('spec_icicle_staff', 'Icicle Staff Combat Specialist', 'mastery_froststaff', 'T4_2H_ICEGAUNTLETS_HELL', 'artifact2', 0.1),
  createSpec('spec_permafrost_prism', 'Permafrost Prism Combat Specialist', 'mastery_froststaff', 'T4_2H_FROSTSTAFF_MORGANA', 'artifact3', 0.1),
  createSpec('spec_chillhowl', 'Chillhowl Combat Specialist', 'mastery_froststaff', 'T4_2H_FROSTSTAFF_AVALON', 'avalonian', 0.1),
]

// CURSED STAFF
export const CURSEDSTAFF_MASTERY = createMastery(
  'mastery_cursedstaff',
  'Cursed Staff Fighter',
  'weapon_mage',
  ['spec_cursed_staff', 'spec_great_cursed_staff', 'spec_demonic_staff', 'spec_cursed_skull', 'spec_damnation_staff', 'spec_lifecurse_staff', 'spec_shadowcaller']
)

export const CURSEDSTAFF_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_cursed_staff', 'Cursed Staff Combat Specialist', 'mastery_cursedstaff', 'T4_MAIN_CURSEDSTAFF', 'simple'),
  createSpec('spec_great_cursed_staff', 'Great Cursed Staff Combat Specialist', 'mastery_cursedstaff', 'T4_2H_CURSEDSTAFF', 'simple'),
  createSpec('spec_demonic_staff', 'Demonic Staff Combat Specialist', 'mastery_cursedstaff', 'T4_2H_DEMONICSTAFF', 'simple'),
  createSpec('spec_cursed_skull', 'Cursed Skull Combat Specialist', 'mastery_cursedstaff', 'T4_2H_SKULLORB_HELL', 'artifact1', 0.1),
  createSpec('spec_damnation_staff', 'Damnation Staff Combat Specialist', 'mastery_cursedstaff', 'T4_2H_CURSEDSTAFF_MORGANA', 'artifact2', 0.1),
  createSpec('spec_lifecurse_staff', 'Lifecurse Staff Combat Specialist', 'mastery_cursedstaff', 'T4_2H_CURSEDSTAFF_UNDEAD', 'artifact3', 0.1),
  createSpec('spec_shadowcaller', 'Shadowcaller Combat Specialist', 'mastery_cursedstaff', 'T4_2H_CURSEDSTAFF_AVALON', 'avalonian', 0.1),
]

// NATURE STAFF
export const NATURESTAFF_MASTERY = createMastery(
  'mastery_naturestaff',
  'Nature Staff Fighter',
  'weapon_mage',
  ['spec_nature_staff', 'spec_great_nature_staff', 'spec_wild_staff', 'spec_druidic_staff', 'spec_blight_staff', 'spec_rampant_staff', 'spec_ironroot_staff']
)

export const NATURESTAFF_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_nature_staff', 'Nature Staff Combat Specialist', 'mastery_naturestaff', 'T4_MAIN_NATURESTAFF', 'simple'),
  createSpec('spec_great_nature_staff', 'Great Nature Staff Combat Specialist', 'mastery_naturestaff', 'T4_2H_NATURESTAFF', 'simple'),
  createSpec('spec_wild_staff', 'Wild Staff Combat Specialist', 'mastery_naturestaff', 'T4_2H_WILDSTAFF', 'simple'),
  createSpec('spec_druidic_staff', 'Druidic Staff Combat Specialist', 'mastery_naturestaff', 'T4_MAIN_NATURESTAFF_KEEPER', 'artifact1', 0.1),
  createSpec('spec_blight_staff', 'Blight Staff Combat Specialist', 'mastery_naturestaff', 'T4_2H_NATURESTAFF_HELL', 'artifact2', 0.1),
  createSpec('spec_rampant_staff', 'Rampant Staff Combat Specialist', 'mastery_naturestaff', 'T4_2H_NATURESTAFF_KEEPER', 'artifact3', 0.1),
  createSpec('spec_ironroot_staff', 'Ironroot Staff Combat Specialist', 'mastery_naturestaff', 'T4_2H_NATURESTAFF_AVALON', 'avalonian', 0.1),
]

// =============================================================================
// ARMOR - PLATE
// =============================================================================

export const PLATE_HELMET_MASTERY = createMastery(
  'mastery_plate_helmet',
  'Plate Helmet Fighter',
  'armor_plate',
  ['spec_soldier_helmet', 'spec_knight_helmet', 'spec_guardian_helmet', 'spec_royal_helmet', 'spec_demon_helmet', 'spec_judicator_helmet', 'spec_helmet_of_valor']
)

export const PLATE_HELMET_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_soldier_helmet', 'Soldier Helmet Specialist', 'mastery_plate_helmet', 'T4_HEAD_PLATE_SET1', 'simple'),
  createSpec('spec_knight_helmet', 'Knight Helmet Specialist', 'mastery_plate_helmet', 'T4_HEAD_PLATE_SET2', 'simple'),
  createSpec('spec_guardian_helmet', 'Guardian Helmet Specialist', 'mastery_plate_helmet', 'T4_HEAD_PLATE_SET3', 'simple'),
  createSpec('spec_royal_helmet', 'Royal Helmet Specialist', 'mastery_plate_helmet', 'T4_HEAD_PLATE_ROYAL', 'royal', 0.1),
  createSpec('spec_demon_helmet', 'Demon Helmet Specialist', 'mastery_plate_helmet', 'T4_HEAD_PLATE_HELL', 'artifact1', 0.1),
  createSpec('spec_judicator_helmet', 'Judicator Helmet Specialist', 'mastery_plate_helmet', 'T4_HEAD_PLATE_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_helmet_of_valor', 'Helmet of Valor Specialist', 'mastery_plate_helmet', 'T4_HEAD_PLATE_AVALON', 'avalonian', 0.1),
]

export const PLATE_ARMOR_MASTERY = createMastery(
  'mastery_plate_armor',
  'Plate Armor Fighter',
  'armor_plate',
  ['spec_soldier_armor', 'spec_knight_armor', 'spec_guardian_armor', 'spec_royal_armor', 'spec_demon_armor', 'spec_judicator_armor', 'spec_armor_of_valor']
)

export const PLATE_ARMOR_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_soldier_armor', 'Soldier Armor Specialist', 'mastery_plate_armor', 'T4_ARMOR_PLATE_SET1', 'simple'),
  createSpec('spec_knight_armor', 'Knight Armor Specialist', 'mastery_plate_armor', 'T4_ARMOR_PLATE_SET2', 'simple'),
  createSpec('spec_guardian_armor', 'Guardian Armor Specialist', 'mastery_plate_armor', 'T4_ARMOR_PLATE_SET3', 'simple'),
  createSpec('spec_royal_armor', 'Royal Armor Specialist', 'mastery_plate_armor', 'T4_ARMOR_PLATE_ROYAL', 'royal', 0.1),
  createSpec('spec_demon_armor', 'Demon Armor Specialist', 'mastery_plate_armor', 'T4_ARMOR_PLATE_HELL', 'artifact1', 0.1),
  createSpec('spec_judicator_armor', 'Judicator Armor Specialist', 'mastery_plate_armor', 'T4_ARMOR_PLATE_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_armor_of_valor', 'Armor of Valor Specialist', 'mastery_plate_armor', 'T4_ARMOR_PLATE_AVALON', 'avalonian', 0.1),
]

export const PLATE_BOOTS_MASTERY = createMastery(
  'mastery_plate_boots',
  'Plate Boots Fighter',
  'armor_plate',
  ['spec_soldier_boots', 'spec_knight_boots', 'spec_guardian_boots', 'spec_royal_boots', 'spec_demon_boots', 'spec_judicator_boots', 'spec_boots_of_valor']
)

export const PLATE_BOOTS_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_soldier_boots', 'Soldier Boots Specialist', 'mastery_plate_boots', 'T4_SHOES_PLATE_SET1', 'simple'),
  createSpec('spec_knight_boots', 'Knight Boots Specialist', 'mastery_plate_boots', 'T4_SHOES_PLATE_SET2', 'simple'),
  createSpec('spec_guardian_boots', 'Guardian Boots Specialist', 'mastery_plate_boots', 'T4_SHOES_PLATE_SET3', 'simple'),
  createSpec('spec_royal_boots', 'Royal Boots Specialist', 'mastery_plate_boots', 'T4_SHOES_PLATE_ROYAL', 'royal', 0.1),
  createSpec('spec_demon_boots', 'Demon Boots Specialist', 'mastery_plate_boots', 'T4_SHOES_PLATE_HELL', 'artifact1', 0.1),
  createSpec('spec_judicator_boots', 'Judicator Boots Specialist', 'mastery_plate_boots', 'T4_SHOES_PLATE_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_boots_of_valor', 'Boots of Valor Specialist', 'mastery_plate_boots', 'T4_SHOES_PLATE_AVALON', 'avalonian', 0.1),
]

// =============================================================================
// ARMOR - LEATHER
// =============================================================================

export const LEATHER_HOOD_MASTERY = createMastery(
  'mastery_leather_hood',
  'Leather Hood Fighter',
  'armor_leather',
  ['spec_mercenary_hood', 'spec_hunter_hood', 'spec_assassin_hood', 'spec_hood_of_tenacity', 'spec_hellion_hood', 'spec_stalker_hood', 'spec_specter_hood']
)

export const LEATHER_HOOD_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_mercenary_hood', 'Mercenary Hood Specialist', 'mastery_leather_hood', 'T4_HEAD_LEATHER_SET1', 'simple'),
  createSpec('spec_hunter_hood', 'Hunter Hood Specialist', 'mastery_leather_hood', 'T4_HEAD_LEATHER_SET2', 'simple'),
  createSpec('spec_assassin_hood', 'Assassin Hood Specialist', 'mastery_leather_hood', 'T4_HEAD_LEATHER_SET3', 'simple'),
  createSpec('spec_hood_of_tenacity', 'Hood of Tenacity Specialist', 'mastery_leather_hood', 'T4_HEAD_LEATHER_ROYAL', 'royal', 0.1),
  createSpec('spec_hellion_hood', 'Hellion Hood Specialist', 'mastery_leather_hood', 'T4_HEAD_LEATHER_HELL', 'artifact1', 0.1),
  createSpec('spec_stalker_hood', 'Stalker Hood Specialist', 'mastery_leather_hood', 'T4_HEAD_LEATHER_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_specter_hood', 'Specter Hood Specialist', 'mastery_leather_hood', 'T4_HEAD_LEATHER_AVALON', 'avalonian', 0.1),
]

export const LEATHER_JACKET_MASTERY = createMastery(
  'mastery_leather_jacket',
  'Leather Jacket Fighter',
  'armor_leather',
  ['spec_mercenary_jacket', 'spec_hunter_jacket', 'spec_assassin_jacket', 'spec_jacket_of_tenacity', 'spec_hellion_jacket', 'spec_stalker_jacket', 'spec_specter_jacket']
)

export const LEATHER_JACKET_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_mercenary_jacket', 'Mercenary Jacket Specialist', 'mastery_leather_jacket', 'T4_ARMOR_LEATHER_SET1', 'simple'),
  createSpec('spec_hunter_jacket', 'Hunter Jacket Specialist', 'mastery_leather_jacket', 'T4_ARMOR_LEATHER_SET2', 'simple'),
  createSpec('spec_assassin_jacket', 'Assassin Jacket Specialist', 'mastery_leather_jacket', 'T4_ARMOR_LEATHER_SET3', 'simple'),
  createSpec('spec_jacket_of_tenacity', 'Jacket of Tenacity Specialist', 'mastery_leather_jacket', 'T4_ARMOR_LEATHER_ROYAL', 'royal', 0.1),
  createSpec('spec_hellion_jacket', 'Hellion Jacket Specialist', 'mastery_leather_jacket', 'T4_ARMOR_LEATHER_HELL', 'artifact1', 0.1),
  createSpec('spec_stalker_jacket', 'Stalker Jacket Specialist', 'mastery_leather_jacket', 'T4_ARMOR_LEATHER_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_specter_jacket', 'Specter Jacket Specialist', 'mastery_leather_jacket', 'T4_ARMOR_LEATHER_AVALON', 'avalonian', 0.1),
]

export const LEATHER_SHOES_MASTERY = createMastery(
  'mastery_leather_shoes',
  'Leather Shoes Fighter',
  'armor_leather',
  ['spec_mercenary_shoes', 'spec_hunter_shoes', 'spec_assassin_shoes', 'spec_shoes_of_tenacity', 'spec_hellion_shoes', 'spec_stalker_shoes', 'spec_specter_shoes']
)

export const LEATHER_SHOES_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_mercenary_shoes', 'Mercenary Shoes Specialist', 'mastery_leather_shoes', 'T4_SHOES_LEATHER_SET1', 'simple'),
  createSpec('spec_hunter_shoes', 'Hunter Shoes Specialist', 'mastery_leather_shoes', 'T4_SHOES_LEATHER_SET2', 'simple'),
  createSpec('spec_assassin_shoes', 'Assassin Shoes Specialist', 'mastery_leather_shoes', 'T4_SHOES_LEATHER_SET3', 'simple'),
  createSpec('spec_shoes_of_tenacity', 'Shoes of Tenacity Specialist', 'mastery_leather_shoes', 'T4_SHOES_LEATHER_ROYAL', 'royal', 0.1),
  createSpec('spec_hellion_shoes', 'Hellion Shoes Specialist', 'mastery_leather_shoes', 'T4_SHOES_LEATHER_HELL', 'artifact1', 0.1),
  createSpec('spec_stalker_shoes', 'Stalker Shoes Specialist', 'mastery_leather_shoes', 'T4_SHOES_LEATHER_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_specter_shoes', 'Specter Shoes Specialist', 'mastery_leather_shoes', 'T4_SHOES_LEATHER_AVALON', 'avalonian', 0.1),
]

// =============================================================================
// ARMOR - CLOTH
// =============================================================================

export const CLOTH_COWL_MASTERY = createMastery(
  'mastery_cloth_cowl',
  'Cloth Cowl Fighter',
  'armor_cloth',
  ['spec_scholar_cowl', 'spec_cleric_cowl', 'spec_mage_cowl', 'spec_royal_cowl', 'spec_fiend_cowl', 'spec_cultist_cowl', 'spec_cowl_of_purity']
)

export const CLOTH_COWL_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_scholar_cowl', 'Scholar Cowl Specialist', 'mastery_cloth_cowl', 'T4_HEAD_CLOTH_SET1', 'simple'),
  createSpec('spec_cleric_cowl', 'Cleric Cowl Specialist', 'mastery_cloth_cowl', 'T4_HEAD_CLOTH_SET2', 'simple'),
  createSpec('spec_mage_cowl', 'Mage Cowl Specialist', 'mastery_cloth_cowl', 'T4_HEAD_CLOTH_SET3', 'simple'),
  createSpec('spec_royal_cowl', 'Royal Cowl Specialist', 'mastery_cloth_cowl', 'T4_HEAD_CLOTH_ROYAL', 'royal', 0.1),
  createSpec('spec_fiend_cowl', 'Fiend Cowl Specialist', 'mastery_cloth_cowl', 'T4_HEAD_CLOTH_HELL', 'artifact1', 0.1),
  createSpec('spec_cultist_cowl', 'Cultist Cowl Specialist', 'mastery_cloth_cowl', 'T4_HEAD_CLOTH_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_cowl_of_purity', 'Cowl of Purity Specialist', 'mastery_cloth_cowl', 'T4_HEAD_CLOTH_AVALON', 'avalonian', 0.1),
]

export const CLOTH_ROBE_MASTERY = createMastery(
  'mastery_cloth_robe',
  'Cloth Robe Fighter',
  'armor_cloth',
  ['spec_scholar_robe', 'spec_cleric_robe', 'spec_mage_robe', 'spec_royal_robe', 'spec_fiend_robe', 'spec_cultist_robe', 'spec_robe_of_purity']
)

export const CLOTH_ROBE_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_scholar_robe', 'Scholar Robe Specialist', 'mastery_cloth_robe', 'T4_ARMOR_CLOTH_SET1', 'simple'),
  createSpec('spec_cleric_robe', 'Cleric Robe Specialist', 'mastery_cloth_robe', 'T4_ARMOR_CLOTH_SET2', 'simple'),
  createSpec('spec_mage_robe', 'Mage Robe Specialist', 'mastery_cloth_robe', 'T4_ARMOR_CLOTH_SET3', 'simple'),
  createSpec('spec_royal_robe', 'Royal Robe Specialist', 'mastery_cloth_robe', 'T4_ARMOR_CLOTH_ROYAL', 'royal', 0.1),
  createSpec('spec_fiend_robe', 'Fiend Robe Specialist', 'mastery_cloth_robe', 'T4_ARMOR_CLOTH_HELL', 'artifact1', 0.1),
  createSpec('spec_cultist_robe', 'Cultist Robe Specialist', 'mastery_cloth_robe', 'T4_ARMOR_CLOTH_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_robe_of_purity', 'Robe of Purity Specialist', 'mastery_cloth_robe', 'T4_ARMOR_CLOTH_AVALON', 'avalonian', 0.1),
]

export const CLOTH_SANDALS_MASTERY = createMastery(
  'mastery_cloth_sandals',
  'Cloth Sandals Fighter',
  'armor_cloth',
  ['spec_scholar_sandals', 'spec_cleric_sandals', 'spec_mage_sandals', 'spec_royal_sandals', 'spec_fiend_sandals', 'spec_cultist_sandals', 'spec_sandals_of_purity']
)

export const CLOTH_SANDALS_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_scholar_sandals', 'Scholar Sandals Specialist', 'mastery_cloth_sandals', 'T4_SHOES_CLOTH_SET1', 'simple'),
  createSpec('spec_cleric_sandals', 'Cleric Sandals Specialist', 'mastery_cloth_sandals', 'T4_SHOES_CLOTH_SET2', 'simple'),
  createSpec('spec_mage_sandals', 'Mage Sandals Specialist', 'mastery_cloth_sandals', 'T4_SHOES_CLOTH_SET3', 'simple'),
  createSpec('spec_royal_sandals', 'Royal Sandals Specialist', 'mastery_cloth_sandals', 'T4_SHOES_CLOTH_ROYAL', 'royal', 0.1),
  createSpec('spec_fiend_sandals', 'Fiend Sandals Specialist', 'mastery_cloth_sandals', 'T4_SHOES_CLOTH_HELL', 'artifact1', 0.1),
  createSpec('spec_cultist_sandals', 'Cultist Sandals Specialist', 'mastery_cloth_sandals', 'T4_SHOES_CLOTH_UNDEAD', 'artifact2', 0.1),
  createSpec('spec_sandals_of_purity', 'Sandals of Purity Specialist', 'mastery_cloth_sandals', 'T4_SHOES_CLOTH_AVALON', 'avalonian', 0.1),
]

// =============================================================================
// OFF-HAND (0.6 mutual rate)
// =============================================================================

export const SHIELD_MASTERY = createMastery(
  'mastery_shield',
  'Shield Fighter',
  'offhand',
  ['spec_shield', 'spec_sarcophagus', 'spec_caitiff_shield', 'spec_facebreaker', 'spec_astral_aegis']
)

export const SHIELD_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_shield', 'Shield Specialist', 'mastery_shield', 'T4_OFF_SHIELD', 'simple', 0.6),
  createSpec('spec_sarcophagus', 'Sarcophagus Specialist', 'mastery_shield', 'T4_OFF_SHIELD_HELL', 'artifact1', 0.6),
  createSpec('spec_caitiff_shield', 'Caitiff Shield Specialist', 'mastery_shield', 'T4_OFF_SHIELD_MORGANA', 'artifact2', 0.6),
  createSpec('spec_facebreaker', 'Facebreaker Specialist', 'mastery_shield', 'T4_OFF_SHIELD_UNDEAD', 'artifact3', 0.6),
  createSpec('spec_astral_aegis', 'Astral Aegis Specialist', 'mastery_shield', 'T4_OFF_SHIELD_AVALON', 'avalonian', 0.6),
]

export const TORCH_MASTERY = createMastery(
  'mastery_torch',
  'Torch Fighter',
  'offhand',
  ['spec_torch', 'spec_mistcaller', 'spec_leering_cane', 'spec_cryptcandle', 'spec_sacred_scepter']
)

export const TORCH_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_torch', 'Torch Specialist', 'mastery_torch', 'T4_OFF_TORCH', 'simple', 0.6),
  createSpec('spec_mistcaller', 'Mistcaller Specialist', 'mastery_torch', 'T4_OFF_HORN_KEEPER', 'artifact1', 0.6),
  createSpec('spec_leering_cane', 'Leering Cane Specialist', 'mastery_torch', 'T4_OFF_JESTERCANE_HELL', 'artifact2', 0.6),
  createSpec('spec_cryptcandle', 'Cryptcandle Specialist', 'mastery_torch', 'T4_OFF_TORCH_UNDEAD', 'artifact3', 0.6),
  createSpec('spec_sacred_scepter', 'Sacred Scepter Specialist', 'mastery_torch', 'T4_OFF_TORCH_AVALON', 'avalonian', 0.6),
]

export const TOME_MASTERY = createMastery(
  'mastery_tome',
  'Tome Fighter',
  'offhand',
  ['spec_tome_of_spells', 'spec_eye_of_secrets', 'spec_muisak', 'spec_taproot', 'spec_celestial_censer']
)

export const TOME_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_tome_of_spells', 'Tome of Spells Specialist', 'mastery_tome', 'T4_OFF_BOOK', 'simple', 0.6),
  createSpec('spec_eye_of_secrets', 'Eye of Secrets Specialist', 'mastery_tome', 'T4_OFF_ORB_MORGANA', 'artifact1', 0.6),
  createSpec('spec_muisak', 'Muisak Specialist', 'mastery_tome', 'T4_OFF_DEMONSKULL_HELL', 'artifact2', 0.6),
  createSpec('spec_taproot', 'Taproot Specialist', 'mastery_tome', 'T4_OFF_TOTEM_KEEPER', 'artifact3', 0.6),
  createSpec('spec_celestial_censer', 'Celestial Censer Specialist', 'mastery_tome', 'T4_OFF_CENSER_AVALON', 'avalonian', 0.6),
]

// =============================================================================
// GATHERING
// =============================================================================

export const FIBER_HARVESTER_MASTERY = createMastery(
  'mastery_fiber_harvester',
  'Fiber Harvester',
  'gathering',
  ['spec_fiber_t2', 'spec_fiber_t3', 'spec_fiber_t4', 'spec_fiber_t5', 'spec_fiber_t6', 'spec_fiber_t7', 'spec_fiber_t8']
)

export const FIBER_HARVESTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_fiber_t2', 'Novice Fiber Harvester', 'mastery_fiber_harvester', 'T2_FIBER', 'simple'),
  createSpec('spec_fiber_t3', 'Journeyman Fiber Harvester', 'mastery_fiber_harvester', 'T3_FIBER', 'simple'),
  createSpec('spec_fiber_t4', 'Adept Fiber Harvester', 'mastery_fiber_harvester', 'T4_FIBER', 'simple'),
  createSpec('spec_fiber_t5', 'Expert Fiber Harvester', 'mastery_fiber_harvester', 'T5_FIBER', 'simple'),
  createSpec('spec_fiber_t6', 'Master Fiber Harvester', 'mastery_fiber_harvester', 'T6_FIBER', 'simple'),
  createSpec('spec_fiber_t7', 'Grandmaster Fiber Harvester', 'mastery_fiber_harvester', 'T7_FIBER', 'simple'),
  createSpec('spec_fiber_t8', 'Elder Fiber Harvester', 'mastery_fiber_harvester', 'T8_FIBER', 'simple'),
]

export const HIDE_SKINNER_MASTERY = createMastery(
  'mastery_hide_skinner',
  'Hide Skinner',
  'gathering',
  ['spec_hide_t2', 'spec_hide_t3', 'spec_hide_t4', 'spec_hide_t5', 'spec_hide_t6', 'spec_hide_t7', 'spec_hide_t8']
)

export const HIDE_SKINNER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_hide_t2', 'Novice Hide Skinner', 'mastery_hide_skinner', 'T2_HIDE', 'simple'),
  createSpec('spec_hide_t3', 'Journeyman Hide Skinner', 'mastery_hide_skinner', 'T3_HIDE', 'simple'),
  createSpec('spec_hide_t4', 'Adept Hide Skinner', 'mastery_hide_skinner', 'T4_HIDE', 'simple'),
  createSpec('spec_hide_t5', 'Expert Hide Skinner', 'mastery_hide_skinner', 'T5_HIDE', 'simple'),
  createSpec('spec_hide_t6', 'Master Hide Skinner', 'mastery_hide_skinner', 'T6_HIDE', 'simple'),
  createSpec('spec_hide_t7', 'Grandmaster Hide Skinner', 'mastery_hide_skinner', 'T7_HIDE', 'simple'),
  createSpec('spec_hide_t8', 'Elder Hide Skinner', 'mastery_hide_skinner', 'T8_HIDE', 'simple'),
]

export const ORE_MINER_MASTERY = createMastery(
  'mastery_ore_miner',
  'Ore Miner',
  'gathering',
  ['spec_ore_t2', 'spec_ore_t3', 'spec_ore_t4', 'spec_ore_t5', 'spec_ore_t6', 'spec_ore_t7', 'spec_ore_t8']
)

export const ORE_MINER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_ore_t2', 'Novice Ore Miner', 'mastery_ore_miner', 'T2_ORE', 'simple'),
  createSpec('spec_ore_t3', 'Journeyman Ore Miner', 'mastery_ore_miner', 'T3_ORE', 'simple'),
  createSpec('spec_ore_t4', 'Adept Ore Miner', 'mastery_ore_miner', 'T4_ORE', 'simple'),
  createSpec('spec_ore_t5', 'Expert Ore Miner', 'mastery_ore_miner', 'T5_ORE', 'simple'),
  createSpec('spec_ore_t6', 'Master Ore Miner', 'mastery_ore_miner', 'T6_ORE', 'simple'),
  createSpec('spec_ore_t7', 'Grandmaster Ore Miner', 'mastery_ore_miner', 'T7_ORE', 'simple'),
  createSpec('spec_ore_t8', 'Elder Ore Miner', 'mastery_ore_miner', 'T8_ORE', 'simple'),
]

export const ROCK_QUARRIER_MASTERY = createMastery(
  'mastery_rock_quarrier',
  'Rock Quarrier',
  'gathering',
  ['spec_rock_t2', 'spec_rock_t3', 'spec_rock_t4', 'spec_rock_t5', 'spec_rock_t6', 'spec_rock_t7', 'spec_rock_t8']
)

export const ROCK_QUARRIER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_rock_t2', 'Novice Rock Quarrier', 'mastery_rock_quarrier', 'T2_ROCK', 'simple'),
  createSpec('spec_rock_t3', 'Journeyman Rock Quarrier', 'mastery_rock_quarrier', 'T3_ROCK', 'simple'),
  createSpec('spec_rock_t4', 'Adept Rock Quarrier', 'mastery_rock_quarrier', 'T4_ROCK', 'simple'),
  createSpec('spec_rock_t5', 'Expert Rock Quarrier', 'mastery_rock_quarrier', 'T5_ROCK', 'simple'),
  createSpec('spec_rock_t6', 'Master Rock Quarrier', 'mastery_rock_quarrier', 'T6_ROCK', 'simple'),
  createSpec('spec_rock_t7', 'Grandmaster Rock Quarrier', 'mastery_rock_quarrier', 'T7_ROCK', 'simple'),
  createSpec('spec_rock_t8', 'Elder Rock Quarrier', 'mastery_rock_quarrier', 'T8_ROCK', 'simple'),
]

export const WOOD_LUMBERJACK_MASTERY = createMastery(
  'mastery_wood_lumberjack',
  'Wood Lumberjack',
  'gathering',
  ['spec_wood_t2', 'spec_wood_t3', 'spec_wood_t4', 'spec_wood_t5', 'spec_wood_t6', 'spec_wood_t7', 'spec_wood_t8']
)

export const WOOD_LUMBERJACK_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_wood_t2', 'Novice Wood Lumberjack', 'mastery_wood_lumberjack', 'T2_WOOD', 'simple'),
  createSpec('spec_wood_t3', 'Journeyman Wood Lumberjack', 'mastery_wood_lumberjack', 'T3_WOOD', 'simple'),
  createSpec('spec_wood_t4', 'Adept Wood Lumberjack', 'mastery_wood_lumberjack', 'T4_WOOD', 'simple'),
  createSpec('spec_wood_t5', 'Expert Wood Lumberjack', 'mastery_wood_lumberjack', 'T5_WOOD', 'simple'),
  createSpec('spec_wood_t6', 'Master Wood Lumberjack', 'mastery_wood_lumberjack', 'T6_WOOD', 'simple'),
  createSpec('spec_wood_t7', 'Grandmaster Wood Lumberjack', 'mastery_wood_lumberjack', 'T7_WOOD', 'simple'),
  createSpec('spec_wood_t8', 'Elder Wood Lumberjack', 'mastery_wood_lumberjack', 'T8_WOOD', 'simple'),
]

export const FISHERMAN_MASTERY = createMastery(
  'mastery_fisherman',
  'Fisherman',
  'gathering',
  ['spec_fish_t1', 'spec_fish_t2', 'spec_fish_t3', 'spec_fish_t4', 'spec_fish_t5', 'spec_fish_t6', 'spec_fish_t7', 'spec_fish_t8']
)

export const FISHERMAN_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_fish_t1', 'Trainee Fisherman', 'mastery_fisherman', 'T1_FISH', 'simple'),
  createSpec('spec_fish_t2', 'Novice Fisherman', 'mastery_fisherman', 'T2_FISH', 'simple'),
  createSpec('spec_fish_t3', 'Journeyman Fisherman', 'mastery_fisherman', 'T3_FISH', 'simple'),
  createSpec('spec_fish_t4', 'Adept Fisherman', 'mastery_fisherman', 'T4_FISH', 'simple'),
  createSpec('spec_fish_t5', 'Expert Fisherman', 'mastery_fisherman', 'T5_FISH', 'simple'),
  createSpec('spec_fish_t6', 'Master Fisherman', 'mastery_fisherman', 'T6_FISH', 'simple'),
  createSpec('spec_fish_t7', 'Grandmaster Fisherman', 'mastery_fisherman', 'T7_FISH', 'simple'),
  createSpec('spec_fish_t8', 'Elder Fisherman', 'mastery_fisherman', 'T8_FISH', 'simple'),
]

// =============================================================================
// REFINING
// =============================================================================

export const WEAVER_MASTERY = createMastery(
  'mastery_weaver',
  'Weaver',
  'refining',
  ['spec_cloth_t2', 'spec_cloth_t3', 'spec_cloth_t4', 'spec_cloth_t5', 'spec_cloth_t6', 'spec_cloth_t7', 'spec_cloth_t8']
)

export const WEAVER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_cloth_t2', 'Novice Weaver', 'mastery_weaver', 'T2_CLOTH', 'simple'),
  createSpec('spec_cloth_t3', 'Journeyman Weaver', 'mastery_weaver', 'T3_CLOTH', 'simple'),
  createSpec('spec_cloth_t4', 'Adept Weaver', 'mastery_weaver', 'T4_CLOTH', 'simple'),
  createSpec('spec_cloth_t5', 'Expert Weaver', 'mastery_weaver', 'T5_CLOTH', 'simple'),
  createSpec('spec_cloth_t6', 'Master Weaver', 'mastery_weaver', 'T6_CLOTH', 'simple'),
  createSpec('spec_cloth_t7', 'Grandmaster Weaver', 'mastery_weaver', 'T7_CLOTH', 'simple'),
  createSpec('spec_cloth_t8', 'Elder Weaver', 'mastery_weaver', 'T8_CLOTH', 'simple'),
]

export const TANNER_MASTERY = createMastery(
  'mastery_tanner',
  'Tanner',
  'refining',
  ['spec_leather_t2', 'spec_leather_t3', 'spec_leather_t4', 'spec_leather_t5', 'spec_leather_t6', 'spec_leather_t7', 'spec_leather_t8']
)

export const TANNER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_leather_t2', 'Novice Tanner', 'mastery_tanner', 'T2_LEATHER', 'simple'),
  createSpec('spec_leather_t3', 'Journeyman Tanner', 'mastery_tanner', 'T3_LEATHER', 'simple'),
  createSpec('spec_leather_t4', 'Adept Tanner', 'mastery_tanner', 'T4_LEATHER', 'simple'),
  createSpec('spec_leather_t5', 'Expert Tanner', 'mastery_tanner', 'T5_LEATHER', 'simple'),
  createSpec('spec_leather_t6', 'Master Tanner', 'mastery_tanner', 'T6_LEATHER', 'simple'),
  createSpec('spec_leather_t7', 'Grandmaster Tanner', 'mastery_tanner', 'T7_LEATHER', 'simple'),
  createSpec('spec_leather_t8', 'Elder Tanner', 'mastery_tanner', 'T8_LEATHER', 'simple'),
]

export const SMELTER_MASTERY = createMastery(
  'mastery_smelter',
  'Smelter',
  'refining',
  ['spec_metalbar_t2', 'spec_metalbar_t3', 'spec_metalbar_t4', 'spec_metalbar_t5', 'spec_metalbar_t6', 'spec_metalbar_t7', 'spec_metalbar_t8']
)

export const SMELTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_metalbar_t2', 'Novice Smelter', 'mastery_smelter', 'T2_METALBAR', 'simple'),
  createSpec('spec_metalbar_t3', 'Journeyman Smelter', 'mastery_smelter', 'T3_METALBAR', 'simple'),
  createSpec('spec_metalbar_t4', 'Adept Smelter', 'mastery_smelter', 'T4_METALBAR', 'simple'),
  createSpec('spec_metalbar_t5', 'Expert Smelter', 'mastery_smelter', 'T5_METALBAR', 'simple'),
  createSpec('spec_metalbar_t6', 'Master Smelter', 'mastery_smelter', 'T6_METALBAR', 'simple'),
  createSpec('spec_metalbar_t7', 'Grandmaster Smelter', 'mastery_smelter', 'T7_METALBAR', 'simple'),
  createSpec('spec_metalbar_t8', 'Elder Smelter', 'mastery_smelter', 'T8_METALBAR', 'simple'),
]

export const STONEMASON_MASTERY = createMastery(
  'mastery_stonemason',
  'Stonemason',
  'refining',
  ['spec_stoneblock_t2', 'spec_stoneblock_t3', 'spec_stoneblock_t4', 'spec_stoneblock_t5', 'spec_stoneblock_t6', 'spec_stoneblock_t7', 'spec_stoneblock_t8']
)

export const STONEMASON_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_stoneblock_t2', 'Novice Stonemason', 'mastery_stonemason', 'T2_STONEBLOCK', 'simple'),
  createSpec('spec_stoneblock_t3', 'Journeyman Stonemason', 'mastery_stonemason', 'T3_STONEBLOCK', 'simple'),
  createSpec('spec_stoneblock_t4', 'Adept Stonemason', 'mastery_stonemason', 'T4_STONEBLOCK', 'simple'),
  createSpec('spec_stoneblock_t5', 'Expert Stonemason', 'mastery_stonemason', 'T5_STONEBLOCK', 'simple'),
  createSpec('spec_stoneblock_t6', 'Master Stonemason', 'mastery_stonemason', 'T6_STONEBLOCK', 'simple'),
  createSpec('spec_stoneblock_t7', 'Grandmaster Stonemason', 'mastery_stonemason', 'T7_STONEBLOCK', 'simple'),
  createSpec('spec_stoneblock_t8', 'Elder Stonemason', 'mastery_stonemason', 'T8_STONEBLOCK', 'simple'),
]

export const WOODWORKER_MASTERY = createMastery(
  'mastery_woodworker',
  'Woodworker',
  'refining',
  ['spec_planks_t2', 'spec_planks_t3', 'spec_planks_t4', 'spec_planks_t5', 'spec_planks_t6', 'spec_planks_t7', 'spec_planks_t8']
)

export const WOODWORKER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_planks_t2', 'Novice Woodworker', 'mastery_woodworker', 'T2_PLANKS', 'simple'),
  createSpec('spec_planks_t3', 'Journeyman Woodworker', 'mastery_woodworker', 'T3_PLANKS', 'simple'),
  createSpec('spec_planks_t4', 'Adept Woodworker', 'mastery_woodworker', 'T4_PLANKS', 'simple'),
  createSpec('spec_planks_t5', 'Expert Woodworker', 'mastery_woodworker', 'T5_PLANKS', 'simple'),
  createSpec('spec_planks_t6', 'Master Woodworker', 'mastery_woodworker', 'T6_PLANKS', 'simple'),
  createSpec('spec_planks_t7', 'Grandmaster Woodworker', 'mastery_woodworker', 'T7_PLANKS', 'simple'),
  createSpec('spec_planks_t8', 'Elder Woodworker', 'mastery_woodworker', 'T8_PLANKS', 'simple'),
]

// =============================================================================
// CRAFTING - WEAPONS
// =============================================================================

export const TOOLMAKER_MASTERY = createMastery(
  'mastery_toolmaker',
  'Toolmaker',
  'crafting',
  ['spec_tool_t2', 'spec_tool_t3', 'spec_tool_t4', 'spec_tool_t5', 'spec_tool_t6', 'spec_tool_t7', 'spec_tool_t8']
)

export const TOOLMAKER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_tool_t2', 'Novice Toolmaker', 'mastery_toolmaker', 'T2_TOOL', 'simple'),
  createSpec('spec_tool_t3', 'Journeyman Toolmaker', 'mastery_toolmaker', 'T3_TOOL', 'simple'),
  createSpec('spec_tool_t4', 'Adept Toolmaker', 'mastery_toolmaker', 'T4_TOOL', 'simple'),
  createSpec('spec_tool_t5', 'Expert Toolmaker', 'mastery_toolmaker', 'T5_TOOL', 'simple'),
  createSpec('spec_tool_t6', 'Master Toolmaker', 'mastery_toolmaker', 'T6_TOOL', 'simple'),
  createSpec('spec_tool_t7', 'Grandmaster Toolmaker', 'mastery_toolmaker', 'T7_TOOL', 'simple'),
  createSpec('spec_tool_t8', 'Elder Toolmaker', 'mastery_toolmaker', 'T8_TOOL', 'simple'),
]

export const AXE_CRAFTER_MASTERY = createMastery(
  'mastery_axe_crafter',
  'Axe Crafter',
  'crafting',
  ['spec_axe_craft_t4', 'spec_axe_craft_t5', 'spec_axe_craft_t6', 'spec_axe_craft_t7', 'spec_axe_craft_t8']
)

export const AXE_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_axe_craft_t4', 'Adept Axe Crafter', 'mastery_axe_crafter', 'T4_2H_AXE', 'simple'),
  createSpec('spec_axe_craft_t5', 'Expert Axe Crafter', 'mastery_axe_crafter', 'T5_2H_AXE', 'simple'),
  createSpec('spec_axe_craft_t6', 'Master Axe Crafter', 'mastery_axe_crafter', 'T6_2H_AXE', 'simple'),
  createSpec('spec_axe_craft_t7', 'Grandmaster Axe Crafter', 'mastery_axe_crafter', 'T7_2H_AXE', 'simple'),
  createSpec('spec_axe_craft_t8', 'Elder Axe Crafter', 'mastery_axe_crafter', 'T8_2H_AXE', 'simple'),
]

export const SWORD_CRAFTER_MASTERY = createMastery(
  'mastery_sword_crafter',
  'Sword Crafter',
  'crafting',
  ['spec_sword_craft_t4', 'spec_sword_craft_t5', 'spec_sword_craft_t6', 'spec_sword_craft_t7', 'spec_sword_craft_t8']
)

export const SWORD_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_sword_craft_t4', 'Adept Sword Crafter', 'mastery_sword_crafter', 'T4_MAIN_SWORD', 'simple'),
  createSpec('spec_sword_craft_t5', 'Expert Sword Crafter', 'mastery_sword_crafter', 'T5_MAIN_SWORD', 'simple'),
  createSpec('spec_sword_craft_t6', 'Master Sword Crafter', 'mastery_sword_crafter', 'T6_MAIN_SWORD', 'simple'),
  createSpec('spec_sword_craft_t7', 'Grandmaster Sword Crafter', 'mastery_sword_crafter', 'T7_MAIN_SWORD', 'simple'),
  createSpec('spec_sword_craft_t8', 'Elder Sword Crafter', 'mastery_sword_crafter', 'T8_MAIN_SWORD', 'simple'),
]

export const MACE_CRAFTER_MASTERY = createMastery(
  'mastery_mace_crafter',
  'Mace Crafter',
  'crafting',
  ['spec_mace_craft_t4', 'spec_mace_craft_t5', 'spec_mace_craft_t6', 'spec_mace_craft_t7', 'spec_mace_craft_t8']
)

export const MACE_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_mace_craft_t4', 'Adept Mace Crafter', 'mastery_mace_crafter', 'T4_MAIN_MACE', 'simple'),
  createSpec('spec_mace_craft_t5', 'Expert Mace Crafter', 'mastery_mace_crafter', 'T5_MAIN_MACE', 'simple'),
  createSpec('spec_mace_craft_t6', 'Master Mace Crafter', 'mastery_mace_crafter', 'T6_MAIN_MACE', 'simple'),
  createSpec('spec_mace_craft_t7', 'Grandmaster Mace Crafter', 'mastery_mace_crafter', 'T7_MAIN_MACE', 'simple'),
  createSpec('spec_mace_craft_t8', 'Elder Mace Crafter', 'mastery_mace_crafter', 'T8_MAIN_MACE', 'simple'),
]

export const HAMMER_CRAFTER_MASTERY = createMastery(
  'mastery_hammer_crafter',
  'Hammer Crafter',
  'crafting',
  ['spec_hammer_craft_t4', 'spec_hammer_craft_t5', 'spec_hammer_craft_t6', 'spec_hammer_craft_t7', 'spec_hammer_craft_t8']
)

export const HAMMER_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_hammer_craft_t4', 'Adept Hammer Crafter', 'mastery_hammer_crafter', 'T4_MAIN_HAMMER', 'simple'),
  createSpec('spec_hammer_craft_t5', 'Expert Hammer Crafter', 'mastery_hammer_crafter', 'T5_MAIN_HAMMER', 'simple'),
  createSpec('spec_hammer_craft_t6', 'Master Hammer Crafter', 'mastery_hammer_crafter', 'T6_MAIN_HAMMER', 'simple'),
  createSpec('spec_hammer_craft_t7', 'Grandmaster Hammer Crafter', 'mastery_hammer_crafter', 'T7_MAIN_HAMMER', 'simple'),
  createSpec('spec_hammer_craft_t8', 'Elder Hammer Crafter', 'mastery_hammer_crafter', 'T8_MAIN_HAMMER', 'simple'),
]

export const CROSSBOW_CRAFTER_MASTERY = createMastery(
  'mastery_crossbow_crafter',
  'Crossbow Crafter',
  'crafting',
  ['spec_crossbow_craft_t4', 'spec_crossbow_craft_t5', 'spec_crossbow_craft_t6', 'spec_crossbow_craft_t7', 'spec_crossbow_craft_t8']
)

export const CROSSBOW_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_crossbow_craft_t4', 'Adept Crossbow Crafter', 'mastery_crossbow_crafter', 'T4_2H_CROSSBOW', 'simple'),
  createSpec('spec_crossbow_craft_t5', 'Expert Crossbow Crafter', 'mastery_crossbow_crafter', 'T5_2H_CROSSBOW', 'simple'),
  createSpec('spec_crossbow_craft_t6', 'Master Crossbow Crafter', 'mastery_crossbow_crafter', 'T6_2H_CROSSBOW', 'simple'),
  createSpec('spec_crossbow_craft_t7', 'Grandmaster Crossbow Crafter', 'mastery_crossbow_crafter', 'T7_2H_CROSSBOW', 'simple'),
  createSpec('spec_crossbow_craft_t8', 'Elder Crossbow Crafter', 'mastery_crossbow_crafter', 'T8_2H_CROSSBOW', 'simple'),
]

export const BOW_CRAFTER_MASTERY = createMastery(
  'mastery_bow_crafter',
  'Bow Crafter',
  'crafting',
  ['spec_bow_craft_t4', 'spec_bow_craft_t5', 'spec_bow_craft_t6', 'spec_bow_craft_t7', 'spec_bow_craft_t8']
)

export const BOW_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_bow_craft_t4', 'Adept Bow Crafter', 'mastery_bow_crafter', 'T4_2H_BOW', 'simple'),
  createSpec('spec_bow_craft_t5', 'Expert Bow Crafter', 'mastery_bow_crafter', 'T5_2H_BOW', 'simple'),
  createSpec('spec_bow_craft_t6', 'Master Bow Crafter', 'mastery_bow_crafter', 'T6_2H_BOW', 'simple'),
  createSpec('spec_bow_craft_t7', 'Grandmaster Bow Crafter', 'mastery_bow_crafter', 'T7_2H_BOW', 'simple'),
  createSpec('spec_bow_craft_t8', 'Elder Bow Crafter', 'mastery_bow_crafter', 'T8_2H_BOW', 'simple'),
]

export const SPEAR_CRAFTER_MASTERY = createMastery(
  'mastery_spear_crafter',
  'Spear Crafter',
  'crafting',
  ['spec_spear_craft_t4', 'spec_spear_craft_t5', 'spec_spear_craft_t6', 'spec_spear_craft_t7', 'spec_spear_craft_t8']
)

export const SPEAR_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_spear_craft_t4', 'Adept Spear Crafter', 'mastery_spear_crafter', 'T4_MAIN_SPEAR', 'simple'),
  createSpec('spec_spear_craft_t5', 'Expert Spear Crafter', 'mastery_spear_crafter', 'T5_MAIN_SPEAR', 'simple'),
  createSpec('spec_spear_craft_t6', 'Master Spear Crafter', 'mastery_spear_crafter', 'T6_MAIN_SPEAR', 'simple'),
  createSpec('spec_spear_craft_t7', 'Grandmaster Spear Crafter', 'mastery_spear_crafter', 'T7_MAIN_SPEAR', 'simple'),
  createSpec('spec_spear_craft_t8', 'Elder Spear Crafter', 'mastery_spear_crafter', 'T8_MAIN_SPEAR', 'simple'),
]

export const DAGGER_CRAFTER_MASTERY = createMastery(
  'mastery_dagger_crafter',
  'Dagger Crafter',
  'crafting',
  ['spec_dagger_craft_t4', 'spec_dagger_craft_t5', 'spec_dagger_craft_t6', 'spec_dagger_craft_t7', 'spec_dagger_craft_t8']
)

export const DAGGER_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_dagger_craft_t4', 'Adept Dagger Crafter', 'mastery_dagger_crafter', 'T4_MAIN_DAGGER', 'simple'),
  createSpec('spec_dagger_craft_t5', 'Expert Dagger Crafter', 'mastery_dagger_crafter', 'T5_MAIN_DAGGER', 'simple'),
  createSpec('spec_dagger_craft_t6', 'Master Dagger Crafter', 'mastery_dagger_crafter', 'T6_MAIN_DAGGER', 'simple'),
  createSpec('spec_dagger_craft_t7', 'Grandmaster Dagger Crafter', 'mastery_dagger_crafter', 'T7_MAIN_DAGGER', 'simple'),
  createSpec('spec_dagger_craft_t8', 'Elder Dagger Crafter', 'mastery_dagger_crafter', 'T8_MAIN_DAGGER', 'simple'),
]

export const QUARTERSTAFF_CRAFTER_MASTERY = createMastery(
  'mastery_quarterstaff_crafter',
  'Quarterstaff Crafter',
  'crafting',
  ['spec_quarterstaff_craft_t4', 'spec_quarterstaff_craft_t5', 'spec_quarterstaff_craft_t6', 'spec_quarterstaff_craft_t7', 'spec_quarterstaff_craft_t8']
)

export const QUARTERSTAFF_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_quarterstaff_craft_t4', 'Adept Quarterstaff Crafter', 'mastery_quarterstaff_crafter', 'T4_2H_QUARTERSTAFF', 'simple'),
  createSpec('spec_quarterstaff_craft_t5', 'Expert Quarterstaff Crafter', 'mastery_quarterstaff_crafter', 'T5_2H_QUARTERSTAFF', 'simple'),
  createSpec('spec_quarterstaff_craft_t6', 'Master Quarterstaff Crafter', 'mastery_quarterstaff_crafter', 'T6_2H_QUARTERSTAFF', 'simple'),
  createSpec('spec_quarterstaff_craft_t7', 'Grandmaster Quarterstaff Crafter', 'mastery_quarterstaff_crafter', 'T7_2H_QUARTERSTAFF', 'simple'),
  createSpec('spec_quarterstaff_craft_t8', 'Elder Quarterstaff Crafter', 'mastery_quarterstaff_crafter', 'T8_2H_QUARTERSTAFF', 'simple'),
]

export const FIRESTAFF_CRAFTER_MASTERY = createMastery(
  'mastery_firestaff_crafter',
  'Fire Staff Crafter',
  'crafting',
  ['spec_firestaff_craft_t4', 'spec_firestaff_craft_t5', 'spec_firestaff_craft_t6', 'spec_firestaff_craft_t7', 'spec_firestaff_craft_t8']
)

export const FIRESTAFF_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_firestaff_craft_t4', 'Adept Fire Staff Crafter', 'mastery_firestaff_crafter', 'T4_MAIN_FIRESTAFF', 'simple'),
  createSpec('spec_firestaff_craft_t5', 'Expert Fire Staff Crafter', 'mastery_firestaff_crafter', 'T5_MAIN_FIRESTAFF', 'simple'),
  createSpec('spec_firestaff_craft_t6', 'Master Fire Staff Crafter', 'mastery_firestaff_crafter', 'T6_MAIN_FIRESTAFF', 'simple'),
  createSpec('spec_firestaff_craft_t7', 'Grandmaster Fire Staff Crafter', 'mastery_firestaff_crafter', 'T7_MAIN_FIRESTAFF', 'simple'),
  createSpec('spec_firestaff_craft_t8', 'Elder Fire Staff Crafter', 'mastery_firestaff_crafter', 'T8_MAIN_FIRESTAFF', 'simple'),
]

export const HOLYSTAFF_CRAFTER_MASTERY = createMastery(
  'mastery_holystaff_crafter',
  'Holy Staff Crafter',
  'crafting',
  ['spec_holystaff_craft_t4', 'spec_holystaff_craft_t5', 'spec_holystaff_craft_t6', 'spec_holystaff_craft_t7', 'spec_holystaff_craft_t8']
)

export const HOLYSTAFF_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_holystaff_craft_t4', 'Adept Holy Staff Crafter', 'mastery_holystaff_crafter', 'T4_MAIN_HOLYSTAFF', 'simple'),
  createSpec('spec_holystaff_craft_t5', 'Expert Holy Staff Crafter', 'mastery_holystaff_crafter', 'T5_MAIN_HOLYSTAFF', 'simple'),
  createSpec('spec_holystaff_craft_t6', 'Master Holy Staff Crafter', 'mastery_holystaff_crafter', 'T6_MAIN_HOLYSTAFF', 'simple'),
  createSpec('spec_holystaff_craft_t7', 'Grandmaster Holy Staff Crafter', 'mastery_holystaff_crafter', 'T7_MAIN_HOLYSTAFF', 'simple'),
  createSpec('spec_holystaff_craft_t8', 'Elder Holy Staff Crafter', 'mastery_holystaff_crafter', 'T8_MAIN_HOLYSTAFF', 'simple'),
]

export const ARCANESTAFF_CRAFTER_MASTERY = createMastery(
  'mastery_arcanestaff_crafter',
  'Arcane Staff Crafter',
  'crafting',
  ['spec_arcanestaff_craft_t4', 'spec_arcanestaff_craft_t5', 'spec_arcanestaff_craft_t6', 'spec_arcanestaff_craft_t7', 'spec_arcanestaff_craft_t8']
)

export const ARCANESTAFF_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_arcanestaff_craft_t4', 'Adept Arcane Staff Crafter', 'mastery_arcanestaff_crafter', 'T4_MAIN_ARCANESTAFF', 'simple'),
  createSpec('spec_arcanestaff_craft_t5', 'Expert Arcane Staff Crafter', 'mastery_arcanestaff_crafter', 'T5_MAIN_ARCANESTAFF', 'simple'),
  createSpec('spec_arcanestaff_craft_t6', 'Master Arcane Staff Crafter', 'mastery_arcanestaff_crafter', 'T6_MAIN_ARCANESTAFF', 'simple'),
  createSpec('spec_arcanestaff_craft_t7', 'Grandmaster Arcane Staff Crafter', 'mastery_arcanestaff_crafter', 'T7_MAIN_ARCANESTAFF', 'simple'),
  createSpec('spec_arcanestaff_craft_t8', 'Elder Arcane Staff Crafter', 'mastery_arcanestaff_crafter', 'T8_MAIN_ARCANESTAFF', 'simple'),
]

export const FROSTSTAFF_CRAFTER_MASTERY = createMastery(
  'mastery_froststaff_crafter',
  'Frost Staff Crafter',
  'crafting',
  ['spec_froststaff_craft_t4', 'spec_froststaff_craft_t5', 'spec_froststaff_craft_t6', 'spec_froststaff_craft_t7', 'spec_froststaff_craft_t8']
)

export const FROSTSTAFF_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_froststaff_craft_t4', 'Adept Frost Staff Crafter', 'mastery_froststaff_crafter', 'T4_MAIN_FROSTSTAFF', 'simple'),
  createSpec('spec_froststaff_craft_t5', 'Expert Frost Staff Crafter', 'mastery_froststaff_crafter', 'T5_MAIN_FROSTSTAFF', 'simple'),
  createSpec('spec_froststaff_craft_t6', 'Master Frost Staff Crafter', 'mastery_froststaff_crafter', 'T6_MAIN_FROSTSTAFF', 'simple'),
  createSpec('spec_froststaff_craft_t7', 'Grandmaster Frost Staff Crafter', 'mastery_froststaff_crafter', 'T7_MAIN_FROSTSTAFF', 'simple'),
  createSpec('spec_froststaff_craft_t8', 'Elder Frost Staff Crafter', 'mastery_froststaff_crafter', 'T8_MAIN_FROSTSTAFF', 'simple'),
]

export const CURSEDSTAFF_CRAFTER_MASTERY = createMastery(
  'mastery_cursedstaff_crafter',
  'Cursed Staff Crafter',
  'crafting',
  ['spec_cursedstaff_craft_t4', 'spec_cursedstaff_craft_t5', 'spec_cursedstaff_craft_t6', 'spec_cursedstaff_craft_t7', 'spec_cursedstaff_craft_t8']
)

export const CURSEDSTAFF_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_cursedstaff_craft_t4', 'Adept Cursed Staff Crafter', 'mastery_cursedstaff_crafter', 'T4_MAIN_CURSEDSTAFF', 'simple'),
  createSpec('spec_cursedstaff_craft_t5', 'Expert Cursed Staff Crafter', 'mastery_cursedstaff_crafter', 'T5_MAIN_CURSEDSTAFF', 'simple'),
  createSpec('spec_cursedstaff_craft_t6', 'Master Cursed Staff Crafter', 'mastery_cursedstaff_crafter', 'T6_MAIN_CURSEDSTAFF', 'simple'),
  createSpec('spec_cursedstaff_craft_t7', 'Grandmaster Cursed Staff Crafter', 'mastery_cursedstaff_crafter', 'T7_MAIN_CURSEDSTAFF', 'simple'),
  createSpec('spec_cursedstaff_craft_t8', 'Elder Cursed Staff Crafter', 'mastery_cursedstaff_crafter', 'T8_MAIN_CURSEDSTAFF', 'simple'),
]

export const NATURESTAFF_CRAFTER_MASTERY = createMastery(
  'mastery_naturestaff_crafter',
  'Nature Staff Crafter',
  'crafting',
  ['spec_naturestaff_craft_t4', 'spec_naturestaff_craft_t5', 'spec_naturestaff_craft_t6', 'spec_naturestaff_craft_t7', 'spec_naturestaff_craft_t8']
)

export const NATURESTAFF_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_naturestaff_craft_t4', 'Adept Nature Staff Crafter', 'mastery_naturestaff_crafter', 'T4_MAIN_NATURESTAFF', 'simple'),
  createSpec('spec_naturestaff_craft_t5', 'Expert Nature Staff Crafter', 'mastery_naturestaff_crafter', 'T5_MAIN_NATURESTAFF', 'simple'),
  createSpec('spec_naturestaff_craft_t6', 'Master Nature Staff Crafter', 'mastery_naturestaff_crafter', 'T6_MAIN_NATURESTAFF', 'simple'),
  createSpec('spec_naturestaff_craft_t7', 'Grandmaster Nature Staff Crafter', 'mastery_naturestaff_crafter', 'T7_MAIN_NATURESTAFF', 'simple'),
  createSpec('spec_naturestaff_craft_t8', 'Elder Nature Staff Crafter', 'mastery_naturestaff_crafter', 'T8_MAIN_NATURESTAFF', 'simple'),
]

// =============================================================================
// CRAFTING - ARMOR
// =============================================================================

export const PLATE_ARMOR_CRAFTER_MASTERY = createMastery(
  'mastery_plate_armor_crafter',
  'Plate Armor Crafter',
  'crafting',
  ['spec_plate_craft_t4', 'spec_plate_craft_t5', 'spec_plate_craft_t6', 'spec_plate_craft_t7', 'spec_plate_craft_t8']
)

export const PLATE_ARMOR_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_plate_craft_t4', 'Adept Plate Armor Crafter', 'mastery_plate_armor_crafter', 'T4_ARMOR_PLATE_SET1', 'simple'),
  createSpec('spec_plate_craft_t5', 'Expert Plate Armor Crafter', 'mastery_plate_armor_crafter', 'T5_ARMOR_PLATE_SET1', 'simple'),
  createSpec('spec_plate_craft_t6', 'Master Plate Armor Crafter', 'mastery_plate_armor_crafter', 'T6_ARMOR_PLATE_SET1', 'simple'),
  createSpec('spec_plate_craft_t7', 'Grandmaster Plate Armor Crafter', 'mastery_plate_armor_crafter', 'T7_ARMOR_PLATE_SET1', 'simple'),
  createSpec('spec_plate_craft_t8', 'Elder Plate Armor Crafter', 'mastery_plate_armor_crafter', 'T8_ARMOR_PLATE_SET1', 'simple'),
]

export const LEATHER_ARMOR_CRAFTER_MASTERY = createMastery(
  'mastery_leather_armor_crafter',
  'Leather Armor Crafter',
  'crafting',
  ['spec_leather_craft_t4', 'spec_leather_craft_t5', 'spec_leather_craft_t6', 'spec_leather_craft_t7', 'spec_leather_craft_t8']
)

export const LEATHER_ARMOR_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_leather_craft_t4', 'Adept Leather Armor Crafter', 'mastery_leather_armor_crafter', 'T4_ARMOR_LEATHER_SET1', 'simple'),
  createSpec('spec_leather_craft_t5', 'Expert Leather Armor Crafter', 'mastery_leather_armor_crafter', 'T5_ARMOR_LEATHER_SET1', 'simple'),
  createSpec('spec_leather_craft_t6', 'Master Leather Armor Crafter', 'mastery_leather_armor_crafter', 'T6_ARMOR_LEATHER_SET1', 'simple'),
  createSpec('spec_leather_craft_t7', 'Grandmaster Leather Armor Crafter', 'mastery_leather_armor_crafter', 'T7_ARMOR_LEATHER_SET1', 'simple'),
  createSpec('spec_leather_craft_t8', 'Elder Leather Armor Crafter', 'mastery_leather_armor_crafter', 'T8_ARMOR_LEATHER_SET1', 'simple'),
]

export const CLOTH_ARMOR_CRAFTER_MASTERY = createMastery(
  'mastery_cloth_armor_crafter',
  'Cloth Armor Crafter',
  'crafting',
  ['spec_cloth_armor_craft_t4', 'spec_cloth_armor_craft_t5', 'spec_cloth_armor_craft_t6', 'spec_cloth_armor_craft_t7', 'spec_cloth_armor_craft_t8']
)

export const CLOTH_ARMOR_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_cloth_armor_craft_t4', 'Adept Cloth Armor Crafter', 'mastery_cloth_armor_crafter', 'T4_ARMOR_CLOTH_SET1', 'simple'),
  createSpec('spec_cloth_armor_craft_t5', 'Expert Cloth Armor Crafter', 'mastery_cloth_armor_crafter', 'T5_ARMOR_CLOTH_SET1', 'simple'),
  createSpec('spec_cloth_armor_craft_t6', 'Master Cloth Armor Crafter', 'mastery_cloth_armor_crafter', 'T6_ARMOR_CLOTH_SET1', 'simple'),
  createSpec('spec_cloth_armor_craft_t7', 'Grandmaster Cloth Armor Crafter', 'mastery_cloth_armor_crafter', 'T7_ARMOR_CLOTH_SET1', 'simple'),
  createSpec('spec_cloth_armor_craft_t8', 'Elder Cloth Armor Crafter', 'mastery_cloth_armor_crafter', 'T8_ARMOR_CLOTH_SET1', 'simple'),
]

// =============================================================================
// CRAFTING - ACCESSORIES
// =============================================================================

export const OFFHAND_CRAFTER_MASTERY = createMastery(
  'mastery_offhand_crafter',
  'Off-hand Crafter',
  'crafting',
  ['spec_offhand_craft_t4', 'spec_offhand_craft_t5', 'spec_offhand_craft_t6', 'spec_offhand_craft_t7', 'spec_offhand_craft_t8']
)

export const OFFHAND_CRAFTER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_offhand_craft_t4', 'Adept Off-hand Crafter', 'mastery_offhand_crafter', 'T4_OFF_SHIELD', 'simple'),
  createSpec('spec_offhand_craft_t5', 'Expert Off-hand Crafter', 'mastery_offhand_crafter', 'T5_OFF_SHIELD', 'simple'),
  createSpec('spec_offhand_craft_t6', 'Master Off-hand Crafter', 'mastery_offhand_crafter', 'T6_OFF_SHIELD', 'simple'),
  createSpec('spec_offhand_craft_t7', 'Grandmaster Off-hand Crafter', 'mastery_offhand_crafter', 'T7_OFF_SHIELD', 'simple'),
  createSpec('spec_offhand_craft_t8', 'Elder Off-hand Crafter', 'mastery_offhand_crafter', 'T8_OFF_SHIELD', 'simple'),
]

// =============================================================================
// CRAFTING - CONSUMABLES
// =============================================================================

export const COOK_MASTERY = createMastery(
  'mastery_cook',
  'Cook',
  'crafting',
  ['spec_food_t1', 'spec_food_t2', 'spec_food_t3', 'spec_food_t4', 'spec_food_t5', 'spec_food_t6', 'spec_food_t7', 'spec_food_t8']
)

export const COOK_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_food_t1', 'Trainee Cook', 'mastery_cook', 'T1_MEAL', 'simple'),
  createSpec('spec_food_t2', 'Novice Cook', 'mastery_cook', 'T2_MEAL', 'simple'),
  createSpec('spec_food_t3', 'Journeyman Cook', 'mastery_cook', 'T3_MEAL', 'simple'),
  createSpec('spec_food_t4', 'Adept Cook', 'mastery_cook', 'T4_MEAL', 'simple'),
  createSpec('spec_food_t5', 'Expert Cook', 'mastery_cook', 'T5_MEAL', 'simple'),
  createSpec('spec_food_t6', 'Master Cook', 'mastery_cook', 'T6_MEAL', 'simple'),
  createSpec('spec_food_t7', 'Grandmaster Cook', 'mastery_cook', 'T7_MEAL', 'simple'),
  createSpec('spec_food_t8', 'Elder Cook', 'mastery_cook', 'T8_MEAL', 'simple'),
]

export const ALCHEMIST_MASTERY = createMastery(
  'mastery_alchemist',
  'Alchemist',
  'crafting',
  ['spec_potion_t1', 'spec_potion_t2', 'spec_potion_t3', 'spec_potion_t4', 'spec_potion_t5', 'spec_potion_t6', 'spec_potion_t7', 'spec_potion_t8']
)

export const ALCHEMIST_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_potion_t1', 'Trainee Alchemist', 'mastery_alchemist', 'T1_POTION', 'simple'),
  createSpec('spec_potion_t2', 'Novice Alchemist', 'mastery_alchemist', 'T2_POTION', 'simple'),
  createSpec('spec_potion_t3', 'Journeyman Alchemist', 'mastery_alchemist', 'T3_POTION', 'simple'),
  createSpec('spec_potion_t4', 'Adept Alchemist', 'mastery_alchemist', 'T4_POTION', 'simple'),
  createSpec('spec_potion_t5', 'Expert Alchemist', 'mastery_alchemist', 'T5_POTION', 'simple'),
  createSpec('spec_potion_t6', 'Master Alchemist', 'mastery_alchemist', 'T6_POTION', 'simple'),
  createSpec('spec_potion_t7', 'Grandmaster Alchemist', 'mastery_alchemist', 'T7_POTION', 'simple'),
  createSpec('spec_potion_t8', 'Elder Alchemist', 'mastery_alchemist', 'T8_POTION', 'simple'),
]

// =============================================================================
// FARMING
// =============================================================================

export const CROP_FARMER_MASTERY = createMastery(
  'mastery_crop_farmer',
  'Crop Farmer',
  'farming',
  ['spec_crop_t2', 'spec_crop_t3', 'spec_crop_t4', 'spec_crop_t5', 'spec_crop_t6', 'spec_crop_t7', 'spec_crop_t8']
)

export const CROP_FARMER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_crop_t2', 'Novice Crop Farmer', 'mastery_crop_farmer', 'T2_FARM_CARROT', 'simple'),
  createSpec('spec_crop_t3', 'Journeyman Crop Farmer', 'mastery_crop_farmer', 'T3_FARM_BEAN', 'simple'),
  createSpec('spec_crop_t4', 'Adept Crop Farmer', 'mastery_crop_farmer', 'T4_FARM_WHEAT', 'simple'),
  createSpec('spec_crop_t5', 'Expert Crop Farmer', 'mastery_crop_farmer', 'T5_FARM_TURNIP', 'simple'),
  createSpec('spec_crop_t6', 'Master Crop Farmer', 'mastery_crop_farmer', 'T6_FARM_CABBAGE', 'simple'),
  createSpec('spec_crop_t7', 'Grandmaster Crop Farmer', 'mastery_crop_farmer', 'T7_FARM_POTATO', 'simple'),
  createSpec('spec_crop_t8', 'Elder Crop Farmer', 'mastery_crop_farmer', 'T8_FARM_CORN', 'simple'),
]

export const ANIMAL_BREEDER_MASTERY = createMastery(
  'mastery_animal_breeder',
  'Animal Breeder',
  'farming',
  ['spec_animal_t3', 'spec_animal_t4', 'spec_animal_t5', 'spec_animal_t6', 'spec_animal_t7', 'spec_animal_t8']
)

export const ANIMAL_BREEDER_SPECIALIZATIONS: SpecializationNode[] = [
  createSpec('spec_animal_t3', 'Journeyman Animal Breeder', 'mastery_animal_breeder', 'T3_FARM_CHICKEN', 'simple'),
  createSpec('spec_animal_t4', 'Adept Animal Breeder', 'mastery_animal_breeder', 'T4_FARM_GOAT', 'simple'),
  createSpec('spec_animal_t5', 'Expert Animal Breeder', 'mastery_animal_breeder', 'T5_FARM_GOOSE', 'simple'),
  createSpec('spec_animal_t6', 'Master Animal Breeder', 'mastery_animal_breeder', 'T6_FARM_SHEEP', 'simple'),
  createSpec('spec_animal_t7', 'Grandmaster Animal Breeder', 'mastery_animal_breeder', 'T7_FARM_PIG', 'simple'),
  createSpec('spec_animal_t8', 'Elder Animal Breeder', 'mastery_animal_breeder', 'T8_FARM_COW', 'simple'),
]

// =============================================================================
// MASTER ARRAYS
// =============================================================================

export const ALL_MASTERIES: MasteryNode[] = [
  // Warrior Weapons
  AXE_MASTERY,
  SWORD_MASTERY,
  MACE_MASTERY,
  HAMMER_MASTERY,
  WARGLOVES_MASTERY,
  // Hunter Weapons
  BOW_MASTERY,
  CROSSBOW_MASTERY,
  SPEAR_MASTERY,
  DAGGER_MASTERY,
  QUARTERSTAFF_MASTERY,
  // Mage Weapons
  FIRESTAFF_MASTERY,
  HOLYSTAFF_MASTERY,
  ARCANESTAFF_MASTERY,
  FROSTSTAFF_MASTERY,
  CURSEDSTAFF_MASTERY,
  NATURESTAFF_MASTERY,
  // Plate Armor
  PLATE_HELMET_MASTERY,
  PLATE_ARMOR_MASTERY,
  PLATE_BOOTS_MASTERY,
  // Leather Armor
  LEATHER_HOOD_MASTERY,
  LEATHER_JACKET_MASTERY,
  LEATHER_SHOES_MASTERY,
  // Cloth Armor
  CLOTH_COWL_MASTERY,
  CLOTH_ROBE_MASTERY,
  CLOTH_SANDALS_MASTERY,
  // Off-hand
  SHIELD_MASTERY,
  TORCH_MASTERY,
  TOME_MASTERY,
  // Gathering
  FIBER_HARVESTER_MASTERY,
  HIDE_SKINNER_MASTERY,
  ORE_MINER_MASTERY,
  ROCK_QUARRIER_MASTERY,
  WOOD_LUMBERJACK_MASTERY,
  FISHERMAN_MASTERY,
  // Refining
  WEAVER_MASTERY,
  TANNER_MASTERY,
  SMELTER_MASTERY,
  STONEMASON_MASTERY,
  WOODWORKER_MASTERY,
  // Crafting - Weapons
  TOOLMAKER_MASTERY,
  AXE_CRAFTER_MASTERY,
  SWORD_CRAFTER_MASTERY,
  MACE_CRAFTER_MASTERY,
  HAMMER_CRAFTER_MASTERY,
  CROSSBOW_CRAFTER_MASTERY,
  BOW_CRAFTER_MASTERY,
  SPEAR_CRAFTER_MASTERY,
  DAGGER_CRAFTER_MASTERY,
  QUARTERSTAFF_CRAFTER_MASTERY,
  FIRESTAFF_CRAFTER_MASTERY,
  HOLYSTAFF_CRAFTER_MASTERY,
  ARCANESTAFF_CRAFTER_MASTERY,
  FROSTSTAFF_CRAFTER_MASTERY,
  CURSEDSTAFF_CRAFTER_MASTERY,
  NATURESTAFF_CRAFTER_MASTERY,
  // Crafting - Armor
  PLATE_ARMOR_CRAFTER_MASTERY,
  LEATHER_ARMOR_CRAFTER_MASTERY,
  CLOTH_ARMOR_CRAFTER_MASTERY,
  // Crafting - Accessories
  OFFHAND_CRAFTER_MASTERY,
  // Crafting - Consumables
  COOK_MASTERY,
  ALCHEMIST_MASTERY,
  // Farming
  CROP_FARMER_MASTERY,
  ANIMAL_BREEDER_MASTERY,
]

export const ALL_SPECIALIZATIONS: SpecializationNode[] = [
  // Warrior Weapons
  ...AXE_SPECIALIZATIONS,
  ...SWORD_SPECIALIZATIONS,
  ...MACE_SPECIALIZATIONS,
  ...HAMMER_SPECIALIZATIONS,
  ...WARGLOVES_SPECIALIZATIONS,
  // Hunter Weapons
  ...BOW_SPECIALIZATIONS,
  ...CROSSBOW_SPECIALIZATIONS,
  ...SPEAR_SPECIALIZATIONS,
  ...DAGGER_SPECIALIZATIONS,
  ...QUARTERSTAFF_SPECIALIZATIONS,
  // Mage Weapons
  ...FIRESTAFF_SPECIALIZATIONS,
  ...HOLYSTAFF_SPECIALIZATIONS,
  ...ARCANESTAFF_SPECIALIZATIONS,
  ...FROSTSTAFF_SPECIALIZATIONS,
  ...CURSEDSTAFF_SPECIALIZATIONS,
  ...NATURESTAFF_SPECIALIZATIONS,
  // Plate Armor
  ...PLATE_HELMET_SPECIALIZATIONS,
  ...PLATE_ARMOR_SPECIALIZATIONS,
  ...PLATE_BOOTS_SPECIALIZATIONS,
  // Leather Armor
  ...LEATHER_HOOD_SPECIALIZATIONS,
  ...LEATHER_JACKET_SPECIALIZATIONS,
  ...LEATHER_SHOES_SPECIALIZATIONS,
  // Cloth Armor
  ...CLOTH_COWL_SPECIALIZATIONS,
  ...CLOTH_ROBE_SPECIALIZATIONS,
  ...CLOTH_SANDALS_SPECIALIZATIONS,
  // Off-hand
  ...SHIELD_SPECIALIZATIONS,
  ...TORCH_SPECIALIZATIONS,
  ...TOME_SPECIALIZATIONS,
  // Gathering
  ...FIBER_HARVESTER_SPECIALIZATIONS,
  ...HIDE_SKINNER_SPECIALIZATIONS,
  ...ORE_MINER_SPECIALIZATIONS,
  ...ROCK_QUARRIER_SPECIALIZATIONS,
  ...WOOD_LUMBERJACK_SPECIALIZATIONS,
  ...FISHERMAN_SPECIALIZATIONS,
  // Refining
  ...WEAVER_SPECIALIZATIONS,
  ...TANNER_SPECIALIZATIONS,
  ...SMELTER_SPECIALIZATIONS,
  ...STONEMASON_SPECIALIZATIONS,
  ...WOODWORKER_SPECIALIZATIONS,
  // Crafting - Weapons
  ...TOOLMAKER_SPECIALIZATIONS,
  ...AXE_CRAFTER_SPECIALIZATIONS,
  ...SWORD_CRAFTER_SPECIALIZATIONS,
  ...MACE_CRAFTER_SPECIALIZATIONS,
  ...HAMMER_CRAFTER_SPECIALIZATIONS,
  ...CROSSBOW_CRAFTER_SPECIALIZATIONS,
  ...BOW_CRAFTER_SPECIALIZATIONS,
  ...SPEAR_CRAFTER_SPECIALIZATIONS,
  ...DAGGER_CRAFTER_SPECIALIZATIONS,
  ...QUARTERSTAFF_CRAFTER_SPECIALIZATIONS,
  ...FIRESTAFF_CRAFTER_SPECIALIZATIONS,
  ...HOLYSTAFF_CRAFTER_SPECIALIZATIONS,
  ...ARCANESTAFF_CRAFTER_SPECIALIZATIONS,
  ...FROSTSTAFF_CRAFTER_SPECIALIZATIONS,
  ...CURSEDSTAFF_CRAFTER_SPECIALIZATIONS,
  ...NATURESTAFF_CRAFTER_SPECIALIZATIONS,
  // Crafting - Armor
  ...PLATE_ARMOR_CRAFTER_SPECIALIZATIONS,
  ...LEATHER_ARMOR_CRAFTER_SPECIALIZATIONS,
  ...CLOTH_ARMOR_CRAFTER_SPECIALIZATIONS,
  // Crafting - Accessories
  ...OFFHAND_CRAFTER_SPECIALIZATIONS,
  // Crafting - Consumables
  ...COOK_SPECIALIZATIONS,
  ...ALCHEMIST_SPECIALIZATIONS,
  // Farming
  ...CROP_FARMER_SPECIALIZATIONS,
  ...ANIMAL_BREEDER_SPECIALIZATIONS,
]

// =============================================================================
// LOOKUP HELPERS
// =============================================================================

const masteryMap = new Map(ALL_MASTERIES.map((m) => [m.id, m]))
const specMap = new Map(ALL_SPECIALIZATIONS.map((s) => [s.id, s]))

export function getMastery(masteryId: string): MasteryNode | undefined {
  return masteryMap.get(masteryId)
}

export function getSpecialization(specId: string): SpecializationNode | undefined {
  return specMap.get(specId)
}

export function getSpecializationsForMastery(masteryId: string): SpecializationNode[] {
  const mastery = getMastery(masteryId)
  if (!mastery) return []
  return mastery.specializationIds
    .map((id) => getSpecialization(id))
    .filter((s): s is SpecializationNode => s !== undefined)
}

export function getMasteriesByCategory(category: EquipmentCategory): MasteryNode[] {
  return ALL_MASTERIES.filter((m) => m.category === category)
}
