/** Home screen palette aligned with the product mockup. */
export const homeColors = {
  canvas: '#EEF3F8',
  gold: '#F2C94C',
  goldDeep: '#E2B93B',
  tileBlack: '#111111',
  tileYellow: '#F2C94C',
  tileGreen: '#6FCF97',
  tileBlue: '#56CCF2',
  tileWhite: '#FFFFFF',
  feedInvite: '#BBDEFB',
  feedChallenge: '#C8E6C9',
  feedFaith: '#B3E5FC',
  feedContact: '#FFE082',
  ink: '#111111',
  muted: '#5C6670',
};

/** Matches the home nav tile color for each main tab. */
export const tabAccents = {
  contacts: homeColors.tileYellow,
  studies: homeColors.tileGreen,
  communities: homeColors.tileBlue,
  profile: homeColors.gold,
} as const;

export const tabAccentSoft = {
  contacts: '#FFF6D6',
  studies: '#E8F8EF',
  communities: '#E4F7FD',
  profile: '#FFF6D6',
} as const;

export const homeLayout = {
  tileSize: 148,
  tileGap: 12,
  feedRowHeight: 52,
};
