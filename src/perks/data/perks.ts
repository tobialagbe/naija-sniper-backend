export interface Perk {
  name: string;
  description: string;
  key: string; // 6 digit alphanumeric unique key
  imagePath: string;
  defaultCount: number; // Default number of this perk to give when purchased
}

export const PERKS: Perk[] = [
  {
    name: 'Extra Life',
    description: 'Gives player an extra life in tournament',
    key: 'EL1F3X',
    imagePath: '/assets/perks/extra-life.png',
    defaultCount: 1,
  },
  {
    name: 'Double Points',
    description: 'Doubles points earned in a tournament match',
    key: 'DBLPTS',
    imagePath: '/assets/perks/double-points.png',
    defaultCount: 2,
  },
  {
    name: 'Score Multiplier',
    description: 'Multiplies score by 1.5 for one game',
    key: 'SCR15X',
    imagePath: '/assets/perks/score-multiplier.png',
    defaultCount: 3,
  },
  {
    name: 'Shield',
    description: 'Protects player from damage for 30 seconds',
    key: 'SHLD30',
    imagePath: '/assets/perks/shield.png',
    defaultCount: 2,
  },
  {
    name: 'Weapon Upgrade',
    description: 'Upgrades weapon to next tier for one match',
    key: 'WPNUPG',
    imagePath: '/assets/perks/weapon-upgrade.png',
    defaultCount: 1,
  },
  {
    name: 'Health Boost',
    description: 'Increases max health by 25% for one match',
    key: 'HLTH25',
    imagePath: '/assets/perks/health-boost.png',
    defaultCount: 3,
  },
  {
    name: 'Free Entry',
    description: 'Free entry to any tournament',
    key: 'FRNTRY',
    imagePath: '/assets/perks/free-entry.png',
    defaultCount: 1,
  },
];

// Utility function to get a perk by key
export function getPerkByKey(key: string): Perk | undefined {
  return PERKS.find(perk => perk.key === key);
} 