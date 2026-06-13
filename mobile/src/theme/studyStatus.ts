import type { StudyStatus } from '../types';

export const STUDY_STATUS_COLORS: Record<
  StudyStatus,
  { text: string; soft: string; solid: string }
> = {
  none: {
    text: '#737373',
    soft: '#f0f0f0',
    solid: '#9e9e9e',
  },
  progressing: {
    text: '#2E7D32',
    soft: '#E8F5E9',
    solid: '#43A047',
  },
  paused: {
    text: '#6D4C41',
    soft: '#EFEBE9',
    solid: '#8D6E63',
  },
  stopped: {
    text: '#C62828',
    soft: '#FFEBEE',
    solid: '#E53935',
  },
  finished: {
    text: '#1565C0',
    soft: '#E3F2FD',
    solid: '#1E88E5',
  },
};

/** Statuses a user can assign to a faithful friend. */
export const ACTIONABLE_STUDY_STATUSES: StudyStatus[] = [
  'progressing',
  'paused',
  'stopped',
  'finished',
];

export function getStudyStatusColors(status: StudyStatus) {
  return STUDY_STATUS_COLORS[status];
}
