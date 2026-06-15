import type { ElectionStep } from '@/types';

export const JP_BEGINNER: ElectionStep[] = [
  {
    id: 'jp-1',
    order: 1,
    title: 'Eligibility Check',
    description: 'Ensure you meet the basic requirements to vote in Japan.',
    detailedExplanation: 'You must be a Japanese citizen and 18 years of age or older. For local elections, you must also have lived in the relevant municipality for at least three months.',
    simpleExplanation: 'Be a citizen, 18+, and live in your area for 3 months.',
    timeline: 'Ongoing',
    requirements: ['Japanese citizenship', 'Age 18+'],
    tips: ['Check your local municipal office if you recently moved.'],
    status: 'current'
  },
  {
    id: 'jp-2',
    order: 2,
    title: 'Voter Notification',
    description: 'Receive your voting ticket (tōhyō-ken) by mail.',
    detailedExplanation: 'A voting ticket is sent to your registered address before the election. This ticket indicates your designated polling station.',
    simpleExplanation: 'Watch for a voting ticket in your mail.',
    timeline: '1-2 weeks before election',
    requirements: ['Valid residential registration'],
    tips: ['If you lose your ticket, you can still vote by showing ID at the polling station.'],
    status: 'upcoming'
  },
  {
    id: 'jp-3',
    order: 3,
    title: 'Polling Station Procedure',
    description: 'Visit your assigned station on election day.',
    detailedExplanation: 'Present your ticket, receive your ballot, and write the name of the candidate or party in the private booth.',
    simpleExplanation: 'Go to your station, get a ballot, and write your choice.',
    timeline: 'Election Day (7 AM - 8 PM)',
    requirements: ['Voting ticket (optional but recommended)'],
    tips: ['Japan uses a unique "write-in" system; ensure you know the spelling of your choice.'],
    status: 'upcoming'
  }
];

export const ZA_BEGINNER: ElectionStep[] = [
  {
    id: 'za-1',
    order: 1,
    title: 'Voter Registration',
    description: 'Register on the national common voters\' roll.',
    detailedExplanation: 'You must be a South African citizen, at least 16 years old (to register), and have a green barcoded ID book, smart ID card, or temporary identity certificate.',
    simpleExplanation: 'Register with your ID if you are 16+.',
    timeline: 'Ongoing (Registration weekends specifically announced)',
    requirements: ['SA ID document', 'South African citizenship'],
    tips: ['You can check your registration status online or via SMS.'],
    status: 'current'
  },
  {
    id: 'za-2',
    order: 2,
    title: 'Find Your Voting Station',
    description: 'Identify where you need to cast your vote.',
    detailedExplanation: 'You must vote at the station where you are registered, unless you have notified the IEC of a "Section 24A" move.',
    simpleExplanation: 'Vote where you registered.',
    timeline: 'Before Election Day',
    requirements: ['Registration confirmation'],
    tips: ['The IEC "Locate My Station" tool is very helpful.'],
    status: 'upcoming'
  },
  {
    id: 'za-3',
    order: 3,
    title: 'Casting Your Vote',
    description: 'Visit the station and mark your three ballots.',
    detailedExplanation: 'Voters usually receive three ballots: National, Regional, and Provincial. Mark with an "X" in the box next to your choice.',
    simpleExplanation: 'Go to the station and mark "X" on your ballots.',
    timeline: 'Election Day (7 AM - 9 PM)',
    requirements: ['SA ID document'],
    tips: ['Your thumb will be marked with indelible ink after voting.'],
    status: 'upcoming'
  }
];
