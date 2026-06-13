import type { Ionicons } from '@expo/vector-icons';

export type ToolkitSectionId =
  | 'study_guides'
  | 'illustrations'
  | 'outreach_playbook'
  | 'ministry_tips';

export type ToolkitItemStatus = 'coming_soon' | 'ready';

export interface ToolkitItem {
  id: string;
  title: string;
  summary: string;
  status: ToolkitItemStatus;
  /** Shown until PDFs, images, or copy are dropped in. */
  placeholderNote: string;
  /** Future: local asset path, Firebase Storage URL, or external link. */
  contentUri?: string;
  imageUri?: string;
}

export interface ToolkitSection {
  id: ToolkitSectionId;
  eyebrow: string;
  title: string;
  summary: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  softColor: string;
  items: ToolkitItem[];
}

/** Edit this file when study guides, images, and playbooks arrive from the team. */
export const TOOLKIT_INTRO =
  'Curated resources for outreach and discipleship. Sections below are ready to fill in when your brothers send Bible study guides, illustrations, and playbooks.';

export const TOOLKIT_SECTIONS: ToolkitSection[] = [
  {
    id: 'study_guides',
    eyebrow: 'First principles',
    title: 'Bible study guides',
    summary: 'Structured studies for new believers and seekers.',
    icon: 'book-outline',
    accent: '#6FCF97',
    softColor: '#E8F8EF',
    items: [
      {
        id: 'fp-introduction',
        title: 'Introduction to First Principles',
        summary: 'Opening study on who God is and why Jesus matters.',
        status: 'coming_soon',
        placeholderNote: 'Drop the PDF or outline here when the team sends it.',
      },
      {
        id: 'fp-faith',
        title: 'Faith & repentance',
        summary: 'Second study in the First Principles track.',
        status: 'coming_soon',
        placeholderNote: 'Waiting on guide copy from the brothers.',
      },
      {
        id: 'fp-baptism',
        title: 'Baptism & new life',
        summary: 'Teaching on baptism and walking with Christ.',
        status: 'coming_soon',
        placeholderNote: 'Guide slot reserved — add content when ready.',
      },
      {
        id: 'fp-church',
        title: 'Life in the church',
        summary: 'Why community and gathering matter.',
        status: 'coming_soon',
        placeholderNote: 'Guide slot reserved — add content when ready.',
      },
    ],
  },
  {
    id: 'illustrations',
    eyebrow: 'Visual aids',
    title: 'Illustrations & images',
    summary: 'Diagrams and visuals for teaching moments.',
    icon: 'images-outline',
    accent: '#56CCF2',
    softColor: '#E4F7FD',
    items: [
      {
        id: 'illus-gospel-bridge',
        title: 'Gospel bridge diagram',
        summary: 'Simple visual for explaining the gap sin creates and how Christ bridges it.',
        status: 'coming_soon',
        placeholderNote: 'Image file can replace this slot (PNG or JPG).',
      },
      {
        id: 'illus-plan-of-salvation',
        title: 'Plan of salvation chart',
        summary: 'Step-by-step illustration for follow-up conversations.',
        status: 'coming_soon',
        placeholderNote: 'Waiting on artwork from the team.',
      },
      {
        id: 'illus-study-series',
        title: 'Study series graphics',
        summary: 'Covers or slides for a multi-week study.',
        status: 'coming_soon',
        placeholderNote: 'Batch upload when brothers share the full set.',
      },
    ],
  },
  {
    id: 'outreach_playbook',
    eyebrow: 'On the ground',
    title: 'Outreach playbook',
    summary: 'Practical steps for starting conversations and follow-up.',
    icon: 'compass-outline',
    accent: '#F2C94C',
    softColor: '#FFF6D6',
    items: [
      {
        id: 'playbook-first-contact',
        title: 'First contact checklist',
        summary: 'What to say, ask, and pray before you reach out.',
        status: 'coming_soon',
        placeholderNote: 'Playbook section — paste or link the doc when ready.',
      },
      {
        id: 'playbook-campus',
        title: 'Campus & neighborhood outreach',
        summary: 'Ideas for meeting people where they already are.',
        status: 'coming_soon',
        placeholderNote: 'Playbook section — team notes go here.',
      },
      {
        id: 'playbook-follow-up',
        title: 'Follow-up rhythm',
        summary: 'How often to check in and what to cover each time.',
        status: 'coming_soon',
        placeholderNote: 'Aligns with contact reminders in the app.',
      },
    ],
  },
  {
    id: 'ministry_tips',
    eyebrow: 'From the brothers',
    title: 'Tips & wisdom',
    summary: 'Short counsel on people, psychology, and ministry habits.',
    icon: 'bulb-outline',
    accent: '#BBDEFB',
    softColor: '#EEF3F8',
    items: [
      {
        id: 'tip-listening',
        title: 'Listen more than you teach',
        summary: 'People open up when they feel heard first.',
        status: 'coming_soon',
        placeholderNote: 'Short tip — replace with approved copy from leadership.',
      },
      {
        id: 'tip-objections',
        title: 'Handling common objections',
        summary: 'Graceful responses when faith comes up in hard moments.',
        status: 'coming_soon',
        placeholderNote: 'Curated tips only — review before publishing.',
      },
      {
        id: 'tip-burnout',
        title: 'Sustainable outreach',
        summary: 'Pacing yourself so ministry stays joyful.',
        status: 'coming_soon',
        placeholderNote: 'Community-submitted tips can land here later.',
      },
    ],
  },
];

export function getToolkitSection(sectionId: ToolkitSectionId): ToolkitSection | undefined {
  return TOOLKIT_SECTIONS.find((section) => section.id === sectionId);
}

export function countToolkitItems(section: ToolkitSection): { total: number; ready: number } {
  const ready = section.items.filter((item) => item.status === 'ready').length;
  return { total: section.items.length, ready };
}
