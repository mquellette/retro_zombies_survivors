import { TILE } from './constants.js'

export const CONFIG = {
  player: {
    hp: 100,
    speed: 2,
    magnetRange: 40,
  },

  enemies: {
    zombie: { hp: 20, speed: 1, damage: 5, xp: 1, size: 16 },
    fast:   { hp: 12, speed: 1.8, damage: 3, xp: 1, size: 14 },
    big:    { hp: 60, speed: 0.6, damage: 10, xp: 3, size: 24 },
  },

  spawner: {
    startInterval: 2,
    minInterval: 0.5,
    intervalDecay: 0.008,
    rampEvery: 30,
    fastSpawnAfter: 60,
    fastSpawnChance: 0.2,
    bigSpawnAfter: 90,
    bigSpawnChance: 0.1,
    eliteChance: 0.05,
  },

  loot: {
    chestDropChance: 0.08,
    chestHealMin: 10,
    chestHealMax: 30,
  },

  leveling: {
    baseXp: 5,
    xpPerLevel: 5,
  },

  round: {
    duration: 180,
  },

  statUpgrades: {
    moveSpeed: {
      id: 'moveSpeed',
      name: 'Ботинки Скорости',
      icon: '/Assets/UI/Icons/Level-up/ic-levelup_stats-move_speed.png',
      desc: '+10% скорость',
      apply(p) { p.speedMul += 0.1 },
    },
    atkSpeed: {
      id: 'atkSpeed',
      name: 'Энергетик',
      icon: '/Assets/UI/Icons/Level-up/ic-levelup_stats-attack_speed.png',
      desc: '+15% скор. атаки',
      apply(p) { p.atkSpeedMul += 0.15 },
    },
    armor: {
      id: 'armor',
      name: 'Батина куртка',
      icon: '/Assets/UI/Icons/Level-up/ic-levelup_stats-armor.png',
      desc: '+5 брони',
      apply(p) { p.armor += 5 },
    },
    maxHp: {
      id: 'maxHp',
      name: 'Походная аптечка',
      icon: '/Assets/UI/Icons/Level-up/ic-levelup_max_health.png',
      desc: '+20 макс. HP',
      apply(p) { p.maxHp += 20; p.hp = Math.min(p.hp + 20, p.maxHp) },
    },
    damage: {
      id: 'damage',
      name: 'Школьная побрякушка',
      icon: '/Assets/UI/Icons/Level-up/ic-levelup_damage.png',
      desc: '+20% урон',
      apply(p) { p.damageMul += 0.2 },
    },
  },

  weapons: {
    bat: {
      id: 'bat',
      name: 'Бита',
      icon: '/Assets/UI/Icons/Weapons/ic-weapon-bat.png',
      type: 'melee',
      desc: 'Ближний бой',
      maxLevel: 5,
      levels: [
        { damage: 8,  cooldown: 1.0,  range: 40 },
        { damage: 12, cooldown: 0.9,  range: 45 },
        { damage: 16, cooldown: 0.8,  range: 50 },
        { damage: 22, cooldown: 0.7,  range: 55 },
        { damage: 30, cooldown: 0.6,  range: 60 },
      ],
    },
    pistol: {
      id: 'pistol',
      name: 'Пистолет',
      icon: '/Assets/UI/Icons/Weapons/ic-weapon-gun.png',
      type: 'projectile',
      desc: 'Стреляет в ближайшего врага',
      maxLevel: 5,
      levels: [
        { damage: 10, cooldown: 1.0,  range: 150, bulletSpeed: 200, pierce: 0 },
        { damage: 13, cooldown: 0.9,  range: 160, bulletSpeed: 220, pierce: 0 },
        { damage: 16, cooldown: 0.8,  range: 170, bulletSpeed: 240, pierce: 1 },
        { damage: 20, cooldown: 0.7,  range: 180, bulletSpeed: 260, pierce: 1 },
        { damage: 25, cooldown: 0.6,  range: 200, bulletSpeed: 300, pierce: 2 },
      ],
    },
    guitar: {
      id: 'guitar',
      name: 'Гитара',
      icon: '/Assets/UI/Icons/Weapons/ic-weapon-guitar.png',
      type: 'aoe',
      desc: 'Бьёт по области вокруг игрока',
      maxLevel: 5,
      levels: [
        { damage: 8,  cooldown: 3.0, radius: 60 },
        { damage: 12, cooldown: 2.7, radius: 70 },
        { damage: 16, cooldown: 2.4, radius: 80 },
        { damage: 22, cooldown: 2.0, radius: 90 },
        { damage: 30, cooldown: 1.6, radius: 100 },
      ],
    },
    shotgun: {
      id: 'shotgun',
      name: 'Дробовик',
      icon: '/Assets/UI/Icons/Weapons/ic-weapon-shotgun.png',
      type: 'spread',
      desc: 'Стреляет дробью, отбрасывая врагов',
      maxLevel: 5,
      levels: [
        { damage: 6,  cooldown: 1.8, range: 100, pellets: 3, spread: 0.5, knockback: 30, bulletSpeed: 180 },
        { damage: 8,  cooldown: 1.6, range: 110, pellets: 4, spread: 0.6, knockback: 40, bulletSpeed: 190 },
        { damage: 10, cooldown: 1.4, range: 120, pellets: 5, spread: 0.7, knockback: 50, bulletSpeed: 200 },
        { damage: 13, cooldown: 1.2, range: 130, pellets: 5, spread: 0.8, knockback: 60, bulletSpeed: 210 },
        { damage: 16, cooldown: 1.0, range: 140, pellets: 6, spread: 0.9, knockback: 70, bulletSpeed: 220 },
      ],
    },
    boomerang: {
      id: 'boomerang',
      name: 'Бумеранг',
      icon: null,
      type: 'boomerang',
      desc: 'Возвращается к игроку после броска',
      maxLevel: 5,
      levels: [
        { damage: 12, cooldown: 2.0, range: 120, speed: 160 },
        { damage: 16, cooldown: 1.8, range: 140, speed: 180 },
        { damage: 20, cooldown: 1.6, range: 160, speed: 200 },
        { damage: 26, cooldown: 1.4, range: 180, speed: 220 },
        { damage: 34, cooldown: 1.2, range: 200, speed: 240 },
      ],
    },
    chainsaw: {
      id: 'chainsaw',
      name: 'Бензопила',
      icon: null,
      type: 'orbit',
      desc: 'Летает вокруг персонажа',
      maxLevel: 5,
      levels: [
        { damage: 6,  orbitRadius: 40, angularSpeed: 3,   count: 1 },
        { damage: 8,  orbitRadius: 45, angularSpeed: 3.2, count: 1 },
        { damage: 11, orbitRadius: 50, angularSpeed: 3.4, count: 2 },
        { damage: 15, orbitRadius: 55, angularSpeed: 3.6, count: 2 },
        { damage: 20, orbitRadius: 60, angularSpeed: 4.0, count: 3 },
      ],
    },
    skateboard: {
      id: 'skateboard',
      name: 'Скейтборд',
      icon: null,
      type: 'trail',
      desc: 'Разбрасывает врагов по траектории',
      maxLevel: 5,
      levels: [
        { damage: 5,  cooldown: 0.5, duration: 1.5, size: 12 },
        { damage: 7,  cooldown: 0.45, duration: 1.8, size: 14 },
        { damage: 10, cooldown: 0.4, duration: 2.0, size: 16 },
        { damage: 13, cooldown: 0.35, duration: 2.2, size: 18 },
        { damage: 17, cooldown: 0.3, duration: 2.5, size: 20 },
      ],
    },
  },
}
