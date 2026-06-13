export type Scripture = {
  reference: string;
  text: string;
};

/** Curated for outreach, discipleship, and kingdom growth. */
export const SCRIPTURES: Scripture[] = [
  {
    reference: 'Matthew 28:19-20',
    text: 'Go and make disciples of all nations, baptizing them and teaching them to obey everything I have commanded you.',
  },
  {
    reference: 'Matthew 4:19',
    text: 'Come, follow me, Jesus said, and I will send you out to fish for people.',
  },
  {
    reference: 'Mark 16:15',
    text: 'Go into all the world and preach the gospel to all creation.',
  },
  {
    reference: 'Acts 1:8',
    text: 'You will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.',
  },
  {
    reference: '2 Timothy 2:2',
    text: 'The things you have heard me say entrust to reliable people who will also be qualified to teach others.',
  },
  {
    reference: 'Romans 10:14',
    text: 'How can they believe in the one of whom they have not heard? And how can they hear without someone preaching?',
  },
  {
    reference: 'John 15:16',
    text: 'You did not choose me, but I chose you and appointed you so that you might go and bear fruit—fruit that will last.',
  },
  {
    reference: 'Philippians 1:6',
    text: 'He who began a good work in you will carry it on to completion until the day of Christ Jesus.',
  },
  {
    reference: 'Colossians 1:28',
    text: 'He is the one we proclaim, admonishing and teaching everyone with all wisdom, so that we may present everyone fully mature in Christ.',
  },
  {
    reference: '1 Corinthians 3:6',
    text: 'I planted the seed, Apollos watered it, but God has been making it grow.',
  },
];

export const SCRIPTURE_CYCLE_MS = 7000;

/** Height of the pill body (excluding safe-area inset). */
export const SCRIPTURE_ISLAND_BODY_HEIGHT = 40;

export const SCRIPTURE_ISLAND_VERTICAL_GAP = 8;
