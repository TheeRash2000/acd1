import itemsIndex from '@/lib/data/generated/itemsIndex.json'
import spellsIndex from '@/lib/data/generated/spellsIndex.json'

type DamageType = 'physical' | 'magic' | 'true'

export type DamagePacket = {
  label: string
  base: number
  damageType: DamageType
  count: number
  interval?: number
  aoeBonusPerTarget?: number
}

export const RESISTANCE_PROFILES = {
  dummy_150_150: { armor: 150, mr: 150 },
  cloth_preset: { armor: 50, mr: 80 },
  leather_preset: { armor: 100, mr: 100 },
  plate_preset: { armor: 150, mr: 150 },
  custom: { armor: 0, mr: 0 },
} as const

const PF_BY_HANDS: Record<'1h' | '2h', number> = {
  '1h': 1.0825,
  '2h': 1.0918,
}

function getItem(weaponId: string) {
  const item = (itemsIndex as Record<string, any>)[weaponId]
  if (!item) {
    throw new Error(`Weapon not found in itemsIndex: ${weaponId}`)
  }
  return item
}

function getSpell(spellId: string) {
  const spell = (spellsIndex as Record<string, any>)[spellId]
  if (!spell) {
    return null
  }
  return spell as { components: DamagePacket[] }
}

export function calculateSpellDamage(input: {
  weaponId: string
  weaponIP: number
  spellId: string
  abilityBonus?: number
  targetsHit?: number
  armor: number
  mr: number
  disarrayAttacker?: number
  disarrayTarget?: number
}) {
  const item = getItem(input.weaponId)
  const spell = getSpell(input.spellId)

  const abilityBonus = input.abilityBonus ?? 1
  const targetsHit = input.targetsHit ?? 1
  const disarrayMultiplier = (input.disarrayAttacker ?? 1) * (input.disarrayTarget ?? 1)

  const ap = typeof item.abilityPower === 'number' ? item.abilityPower : 120
  const hands: '1h' | '2h' = item.hands === '2h' ? '2h' : '1h'
  const pf = PF_BY_HANDS[hands]
  const ipMultiplier = Math.pow(pf, input.weaponIP / 100)

  if (!spell) {
    return {
      packets: [],
      total: 0,
      debug: {
        ipMultiplier,
        ap,
        pf,
        mitigationUsed: {
          physical: 100 / (100 + Math.max(0, input.armor)),
          magic: 100 / (100 + Math.max(0, input.mr)),
        },
        abilityBonus,
        disarrayMultiplier,
        missingSpell: input.spellId,
      },
    }
  }

  const packets = spell.components.map((packet) => {
    const raw = packet.base * (ap / 100) * ipMultiplier
    const resistValue =
      packet.damageType === 'magic' ? input.mr : packet.damageType === 'true' ? 0 : input.armor
    const mitigation =
      packet.damageType === 'true' ? 1 : 100 / (100 + Math.max(0, resistValue))
    const aoe = packet.aoeBonusPerTarget
      ? Math.min(1.56, 1 + (targetsHit - 1) * packet.aoeBonusPerTarget)
      : 1
    const perPacket = Math.round(raw * mitigation * abilityBonus * aoe * disarrayMultiplier)

    return {
      ...packet,
      perPacket,
      total: perPacket * packet.count,
    }
  })

  const total = packets.reduce((sum, packet) => sum + packet.total, 0)

  return {
    packets,
    total,
    debug: {
      ipMultiplier,
      ap,
      pf,
      mitigationUsed: {
        physical: 100 / (100 + Math.max(0, input.armor)),
        magic: 100 / (100 + Math.max(0, input.mr)),
      },
      abilityBonus,
      disarrayMultiplier,
    },
  }
}

export function calculateAutoAttack(input: {
  weaponId: string
  weaponIP: number
  abilityBonus?: number
  armor: number
  mr: number
  disarrayAttacker?: number
  disarrayTarget?: number
}) {
  const item = getItem(input.weaponId)
  const base = typeof item.attackDamage === 'number' ? item.attackDamage : 0
  const ap = typeof item.abilityPower === 'number' ? item.abilityPower : 120
  const hands: '1h' | '2h' = item.hands === '2h' ? '2h' : '1h'
  const pf = PF_BY_HANDS[hands]
  const ipMultiplier = Math.pow(pf, input.weaponIP / 100)
  const abilityBonus = input.abilityBonus ?? 1
  const disarrayMultiplier = (input.disarrayAttacker ?? 1) * (input.disarrayTarget ?? 1)
  const mitigationPhysical = 100 / (100 + Math.max(0, input.armor))
  const raw = base * (ap / 100) * ipMultiplier
  const perPacket = Math.round(raw * mitigationPhysical * abilityBonus * disarrayMultiplier)

  return {
    packets: [
      {
        label: 'Auto Attack',
        base,
        damageType: 'physical' as const,
        count: 1,
        perPacket,
        total: perPacket,
      },
    ],
    total: perPacket,
    debug: {
      ipMultiplier,
      ap,
      pf,
      mitigationUsed: {
        physical: mitigationPhysical,
        magic: 100 / (100 + Math.max(0, input.mr)),
      },
      abilityBonus,
      disarrayMultiplier,
    },
  }
}
