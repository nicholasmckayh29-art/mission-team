import type { CommunityRestrictions, Gender, UserProfile } from '../types';
import { calculateAgeFromBirthday } from './age';

export type CommunityGenderFilter = 'open' | 'male' | 'female';

export function buildCommunityRestrictions(input: {
  genderFilter: CommunityGenderFilter;
  minimumAgeText: string;
}): CommunityRestrictions {
  const parsedAge = Number.parseInt(input.minimumAgeText.trim(), 10);

  return {
    gender: input.genderFilter === 'open' ? null : input.genderFilter,
    minimumAge: Number.isFinite(parsedAge) && parsedAge > 0 ? parsedAge : null,
  };
}

export function validateProfileForCommunity(
  profile: UserProfile | null,
  restrictions: CommunityRestrictions,
): { allowed: true } | { allowed: false; message: string } {
  if (!profile) {
    return { allowed: false, message: 'Sign in to join this group.' };
  }

  if (restrictions.gender) {
    const required = restrictions.gender;
    if (profile.gender !== required) {
      return {
        allowed: false,
        message:
          required === 'female'
            ? 'This group is for women only.'
            : 'This group is for men only.',
      };
    }
  }

  if (restrictions.minimumAge) {
    const age = calculateAgeFromBirthday(profile.birthday);
    if (age === null) {
      return {
        allowed: false,
        message: 'Add your birthday in Profile before joining an age-restricted group.',
      };
    }

    if (age < restrictions.minimumAge) {
      return {
        allowed: false,
        message: `You must be at least ${restrictions.minimumAge} to join this group.`,
      };
    }
  }

  return { allowed: true };
}

export function formatRestrictionsSummary(restrictions: CommunityRestrictions): string {
  const parts: string[] = [];

  if (restrictions.gender === 'female') {
    parts.push('Women only');
  } else if (restrictions.gender === 'male') {
    parts.push('Men only');
  }

  if (restrictions.minimumAge) {
    parts.push(`Ages ${restrictions.minimumAge}+`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Open to everyone';
}

export function genderFilterFromRestrictions(
  restrictions: CommunityRestrictions | undefined,
): CommunityGenderFilter {
  if (restrictions?.gender === 'female') {
    return 'female';
  }

  if (restrictions?.gender === 'male') {
    return 'male';
  }

  return 'open';
}

export function isValidGenderForFilter(gender: Gender | ''): gender is Gender {
  return gender === 'male' || gender === 'female' || gender === 'prefer_not_to_say';
}
