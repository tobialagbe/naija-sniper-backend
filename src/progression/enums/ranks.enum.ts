export enum MilitaryRank {
  SECOND_LIEUTENANT = 0,
  LIEUTENANT = 1,
  CAPTAIN = 2,
  MAJOR = 3,
  LIEUTENANT_COLONEL = 4,
  COLONEL = 5,
  BRIGADIER_GENERAL = 6,
  MAJOR_GENERAL = 7,
  LIEUTENANT_GENERAL = 8,
  GENERAL = 9,
  FIELD_MARSHAL = 10
}

export const MilitaryRankLabels: Record<MilitaryRank, string> = {
  [MilitaryRank.SECOND_LIEUTENANT]: 'Second Lieutenant',
  [MilitaryRank.LIEUTENANT]: 'Lieutenant',
  [MilitaryRank.CAPTAIN]: 'Captain',
  [MilitaryRank.MAJOR]: 'Major',
  [MilitaryRank.LIEUTENANT_COLONEL]: 'Lieutenant Colonel',
  [MilitaryRank.COLONEL]: 'Colonel',
  [MilitaryRank.BRIGADIER_GENERAL]: 'Brigadier General',
  [MilitaryRank.MAJOR_GENERAL]: 'Major General',
  [MilitaryRank.LIEUTENANT_GENERAL]: 'Lieutenant General',
  [MilitaryRank.GENERAL]: 'General',
  [MilitaryRank.FIELD_MARSHAL]: 'Field Marshal'
} 