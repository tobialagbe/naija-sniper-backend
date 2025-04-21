export interface Perk {
  name: string;
  description: string;
  key: string; // 6 digit alphanumeric unique key
  imagePath: string;
  defaultCount: number; // Default number of this perk to give when purchased
}

export const PERKS: Perk[] = [
  {
    name: 'Extra Time',
    description: '20 extra seconds in a game',
    key: 'EXT20S',
    imagePath: '/assets/perks/extra-time.png',
    defaultCount: 30,
  },
  {
    name: 'Bullet Proof',
    description: 'Protects player from damage from 20 shots',
    key: 'BLTPRF',
    imagePath: '/assets/perks/bullet-proof.png',
    defaultCount: 20,
  }
];

// Utility function to get a perk by key
export function getPerkByKey(key: string): Perk | undefined {
  return PERKS.find(perk => perk.key === key);
} 