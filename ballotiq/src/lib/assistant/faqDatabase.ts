/**
 * Static FAQ database for election topics.
 * Provides depth-stratified answers and official sources.
 *
 * FAQ_DATA and MINIMUM_REQUIRED_INTENTS are exported so that the coverage-map
 * utility and CI gate tests can introspect the database without any I/O.
 */

import type { KnowledgeLevel } from '@/types';
import type { AssistantIntent } from './intentEngine';

export interface FAQResponse {
  answer: string;
  sourceName: string;
  sourceUrl: string;
  followUps: string[];
}

/**
 * The intents every supported country MUST have FAQ entries for.
 * The coverage-gate Jest test will fail if any country listed in COUNTRIES
 * is missing one of these.
 */
export const MINIMUM_REQUIRED_INTENTS: AssistantIntent[] = [
  'voter_registration',
  'voting_process',
  'eligibility',
];

/**
 * Core FAQ data store.
 * Structure: countryCode -> intent -> knowledgeLevel -> FAQResponse
 *
 * Exported so coverageMap.ts can introspect it without circular imports.
 */
export const FAQ_DATA: Record<
  string,
  Partial<Record<AssistantIntent, Record<KnowledgeLevel, FAQResponse>>>
> = {
  IN: {
    voter_registration: {
      beginner: {
        answer:
          "To register as a new voter in India, you need to fill out Form 6. You can do this easily online through the National Voters' Service Portal (NVSP) or using the Voter Helpline App. You'll need a photo, proof of age (like Aadhaar), and proof of address.",
        sourceName: 'Election Commission of India',
        sourceUrl: 'https://voters.eci.gov.in',
        followUps: [
          'What documents do I need?',
          'How long does it take?',
          'Can I register offline?',
        ],
      },
      intermediate: {
        answer:
          "Voter registration is handled via Form 6 for new electors. Once submitted online via NVSP, a Booth Level Officer (BLO) may visit your residence for physical verification. You can track your 'Form 6' status using the reference ID provided after submission.",
        sourceName: 'ECI Voter Portal',
        sourceUrl: 'https://voters.eci.gov.in',
        followUps: [
          'Who is my BLO?',
          'Form 6 status track',
          'Correction of details',
        ],
      },
      advanced: {
        answer:
          'Under the Representation of the People Act, registration is mandatory for eligibility. Form 6 is used for new registrations, while Form 8 handles shifts or corrections. The Electoral Registration Officer (ERO) oversees the inclusion in the roll after statutory verification procedures.',
        sourceName: 'ECI Legal Framework',
        sourceUrl: 'https://eci.gov.in',
        followUps: [
          'Section 62 of RPA 1951',
          'Form 7 for deletions',
          'Electoral roll revision schedule',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          "When you go to vote, you'll use an Electronic Voting Machine (EVM). Just press the blue button next to your candidate's symbol. You'll hear a beep and see a slip in the VVPAT window for 7 seconds to confirm your vote.",
        sourceName: 'ECI EVM Guide',
        sourceUrl: 'https://eci.gov.in/evm/',
        followUps: [
          'What is VVPAT?',
          'Is my vote secret?',
          'What if the machine fails?',
        ],
      },
      intermediate: {
        answer:
          "India's EVM system consists of a Control Unit and a Balloting Unit. The VVPAT (Voter Verifiable Paper Audit Trail) prints a slip showing your choice. These machines are battery-operated and standalone, meaning they have no internet or network connectivity.",
        sourceName: 'ECI Technical FAQ',
        sourceUrl: 'https://eci.gov.in/evm/',
        followUps: [
          'EVM security features',
          'VVPAT counting rules',
          'Mock poll process',
        ],
      },
      advanced: {
        answer:
          'The integrity of the voting process is maintained via M3 generation EVMs and VVPATs. Under ECI guidelines, a mandatory verification of VVPAT slips from 5 randomly selected polling stations per assembly constituency is conducted to ensure 100% tally accuracy.',
        sourceName: "ECI Systematic Voters' Education",
        sourceUrl: 'https://eci.gov.in',
        followUps: [
          'VVPAT audit trail laws',
          'Machine randomization process',
          'Candidate agent verification',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in India, you must be at least 18 years old on the qualifying date (1st January of the year the electoral roll is prepared), a citizen of India, and ordinarily resident in the constituency where you want to vote.',
        sourceName: 'Election Commission of India',
        sourceUrl: 'https://voters.eci.gov.in',
        followUps: [
          'What is the qualifying date?',
          'Can NRIs vote?',
          'Can I vote if I moved recently?',
        ],
      },
      intermediate: {
        answer:
          "Eligibility under Section 62 of the Representation of the People Act 1951 requires: citizenship, age ≥ 18 on the qualifying date, and ordinary residence. Persons of unsound mind (as declared by a competent court) or serving a prison sentence for a crime are disqualified.",
        sourceName: 'ECI Eligibility Guidelines',
        sourceUrl: 'https://eci.gov.in',
        followUps: [
          'NRI voter registration',
          'Overseas voter provisions',
          'Service voter definition',
        ],
      },
      advanced: {
        answer:
          "Under Articles 325–326 of the Constitution and the RP Act 1951, all citizens aged ≥ 18 are entitled to be registered. Disqualifications include non-citizenship, court-declared unsoundness of mind, corrupt election practices under Section 8A, and imprisonment under Section 11A.",
        sourceName: 'ECI Legal Framework',
        sourceUrl: 'https://eci.gov.in',
        followUps: [
          'Section 8A disqualifications',
          'Article 326 historical context',
          'Election petition grounds',
        ],
      },
    },
  },
  US: {
    voter_registration: {
      beginner: {
        answer:
          "In the US, most states require you to register to vote before election day. You can usually do this online, by mail, or at the DMV. Check vote.gov to see the specific rules and deadlines for your state.",
        sourceName: 'Official US Government Portal',
        sourceUrl: 'https://vote.gov',
        followUps: [
          'Registration deadlines',
          'Am I already registered?',
          'Same-day registration',
        ],
      },
      intermediate: {
        answer:
          "Registration requirements vary by state. While most states have deadlines 15–30 days before an election, some offer 'Same Day Registration'. You typically need a state-issued ID or the last 4 digits of your Social Security Number.",
        sourceName: 'Vote.gov State Search',
        sourceUrl: 'https://vote.gov',
        followUps: [
          'National Mail Registration Form',
          'Automatic registration states',
          'ID requirements',
        ],
      },
      advanced: {
        answer:
          "Voter registration is governed by the National Voter Registration Act (NVRA) of 1993, also known as the 'Motor Voter' law. It requires states to offer registration at DMVs and via mail, though states like North Dakota remain exempt from registration requirements entirely.",
        sourceName: 'FEC Registration Laws',
        sourceUrl: 'https://www.fec.gov',
        followUps: [
          'NVRA Section 5',
          'Help America Vote Act (HAVA)',
          'Voter list maintenance rules',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          'On election day, go to your assigned polling place with valid ID. You will be given a ballot — either paper or electronic — to mark your choices. Follow the poll worker instructions and submit your ballot when done.',
        sourceName: 'USA.gov Voting Guide',
        sourceUrl: 'https://www.usa.gov/absentee-voting',
        followUps: [
          'Where is my polling place?',
          'Can I vote by mail?',
          'What ID do I need?',
        ],
      },
      intermediate: {
        answer:
          'The US uses a decentralised voting system — each state administers its own elections. Voting methods include in-person on election day, early in-person voting, and absentee/mail-in ballots. Federal elections use the Electoral College for the presidency.',
        sourceName: 'FEC Voter Information',
        sourceUrl: 'https://www.fec.gov',
        followUps: [
          'How does the Electoral College work?',
          'Early voting in my state',
          'Provisional ballot rules',
        ],
      },
      advanced: {
        answer:
          'US federal elections are conducted under the Help America Vote Act (HAVA) 2002, which mandates provisional ballots, accessible voting systems, and centralised statewide voter registration databases. States retain primary authority over election administration within these federal floors.',
        sourceName: 'FEC HAVA Overview',
        sourceUrl: 'https://www.fec.gov',
        followUps: [
          'HAVA Section 302 provisional ballots',
          'Accessible voting standards',
          'State vs federal authority',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in the US, you must be a US citizen, at least 18 years old on or before election day, and meet your state\'s residency requirements. Some states also restore voting rights to people with felony convictions — check your state\'s rules.',
        sourceName: 'USA.gov Voter Eligibility',
        sourceUrl: 'https://www.usa.gov/voter-registration-card',
        followUps: [
          'Felony disenfranchisement by state',
          'Citizenship proof requirements',
          'Residency rules',
        ],
      },
      intermediate: {
        answer:
          "Eligibility is set by the 26th Amendment (age ≥ 18), 15th Amendment (race-neutral), and 19th Amendment (gender-neutral). States may impose residency requirements but cannot set a minimum residency longer than 30 days before an election per Supreme Court precedent.",
        sourceName: 'FEC Constitutional Requirements',
        sourceUrl: 'https://www.fec.gov',
        followUps: [
          'Dunn v. Blumstein ruling',
          'Voting rights for territories',
          'DC voting rights',
        ],
      },
      advanced: {
        answer:
          'Federal eligibility floors derive from Amendments 15, 19, 24, and 26. The Voting Rights Act 1965 (as amended) prohibits discriminatory practices. Section 2 allows legal challenges to dilutive practices; Section 5 preclearance was effectively suspended after Shelby County v. Holder (2013).',
        sourceName: 'FEC Voting Rights Act',
        sourceUrl: 'https://www.fec.gov',
        followUps: [
          'Brnovich v. DNC (2021)',
          'Section 2 litigation',
          'Preclearance states',
        ],
      },
    },
  },
  GB: {
    voter_registration: {
      beginner: {
        answer:
          'You can register to vote in the UK online at gov.uk/register-to-vote. You will need your National Insurance number and address. Registration takes about 5 minutes.',
        sourceName: 'Electoral Commission UK',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'What is the registration deadline?',
          'Can I register without a National Insurance number?',
          'Can I vote if I am 16?',
        ],
      },
      intermediate: {
        answer:
          'Individual Electoral Registration (IER), introduced in 2014, requires each person to register individually. You need your National Insurance number for identity verification. Overseas British citizens can register as overseas voters for up to 15 years after leaving the UK.',
        sourceName: 'Electoral Commission IER',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'Overseas voter registration',
          'Anonymous registration',
          'Attainers (16/17 year olds)',
        ],
      },
      advanced: {
        answer:
          'Registration is governed by the Representation of the People Act 1983 (as amended). The Elections Act 2022 introduced Voter ID requirements and extended overseas voting rights indefinitely. Registration deadlines are set at 12 working days before polling day.',
        sourceName: 'Electoral Commission Legal Framework',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'Elections Act 2022 changes',
          'Registration appeals process',
          'Northern Ireland separate register',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          'Take your photo ID to your polling station on election day. Tell the staff your name and address, receive your ballot paper, mark an X next to one candidate in private, and place your folded ballot in the ballot box.',
        sourceName: 'Electoral Commission UK',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'What ID is accepted?',
          'Can I vote by post?',
          'Where is my polling station?',
        ],
      },
      intermediate: {
        answer:
          'UK general elections use the First Past the Post (FPTP) system. Each voter marks one candidate; the candidate with the most votes wins regardless of whether they have a majority. Postal and proxy voting are available as alternatives to in-person voting.',
        sourceName: 'Electoral Commission How to Vote',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'Proxy voting process',
          'How FPTP works',
          'Spoilt ballots',
        ],
      },
      advanced: {
        answer:
          'UK parliamentary elections are administered by Returning Officers under the RPA 1983. The Elections Act 2022 introduced mandatory photo ID at polling stations in Great Britain. Scottish Parliament, Senedd, and local elections use proportional representation variants.',
        sourceName: 'Electoral Commission Legal',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'Returning Officer duties',
          'Elections Act 2022',
          'Devolved election systems',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in a UK general election you must be 18 or over on polling day, a British citizen (or qualifying Commonwealth/Irish citizen), and registered to vote at a UK address.',
        sourceName: 'Electoral Commission UK',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'Can EU citizens vote?',
          'Which elections can I vote in?',
          'Voting age in Scotland',
        ],
      },
      intermediate: {
        answer:
          "Eligibility varies by election type. General elections: British, qualifying Commonwealth, and Irish citizens aged ≥ 18. Scottish Parliament and local elections in Scotland/Wales: eligible from age 16. EU citizens can vote in local elections but not Westminster general elections post-Brexit.",
        sourceName: 'Electoral Commission Eligibility',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'Votes at 16 in Scotland',
          'Commonwealth citizen definition',
          'Prisoners voting rights',
        ],
      },
      advanced: {
        answer:
          'Franchise rules are set by the RPA 1983 as amended by the Elections Act 2022 and the Scottish Elections (Franchise and Representation) Act 2020. The Senedd and Police and Crime Commissioner elections also allow 16/17 year olds to vote. EU citizens retain local voting rights under the Local Elections (Principal Areas) (England and Wales) Rules.',
        sourceName: 'Electoral Commission Legal Framework',
        sourceUrl: 'https://www.electoralcommission.org.uk',
        followUps: [
          'Franchise legislation history',
          'ECHR Article 3 Protocol 1',
          'Hirst v UK ruling',
        ],
      },
    },
  },
  DE: {
    voter_registration: {
      beginner: {
        answer:
          'In Germany, voter registration is largely automatic. If you are registered at a German address (Anmeldung), you will automatically be included in the electoral register and receive your polling card by post before the election.',
        sourceName: 'Federal Returning Officer Germany',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'What if I have not received my card?',
          'Can I request a postal vote?',
          'Do I need to do anything to register?',
        ],
      },
      intermediate: {
        answer:
          "German residents are automatically registered in the Wählerverzeichnis (electoral register) based on their Melderegister (residents' registration). You can apply for a Briefwahlschein (postal ballot certificate) online or in person at your local Wahlbüro.",
        sourceName: 'Bundeswahlleiter',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'Postal ballot application process',
          'Deadline for postal ballot',
          'What if I am abroad?',
        ],
      },
      advanced: {
        answer:
          'Registration is governed by the Bundeswahlgesetz (BWG) and the Bundeswahlordnung (BWO). Eligible German citizens abroad must actively apply for inclusion in the electoral register of their last German municipality. The deadline is typically 21 days before polling day.',
        sourceName: 'Bundeswahlleiter Legal',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'BWG §§ 16–18',
          'Auslandsdeutsche registration',
          'Electoral register correction procedure',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          'Take your polling card and ID to your polling station. You will receive a ballot with two votes: one for a direct candidate in your constituency and one for a party. Mark your choices with a cross and place the folded ballot in the box.',
        sourceName: 'Federal Returning Officer Germany',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'What are the two votes for?',
          'Can I vote by post?',
          'What ID is accepted?',
        ],
      },
      intermediate: {
        answer:
          "Germany uses a Mixed Member Proportional (MMP) system — the Erststimme (first vote) elects a direct constituency candidate via FPTP; the Zweitstimme (second vote) determines each party's overall share of Bundestag seats via proportional representation.",
        sourceName: 'Bundeswahlleiter How to Vote',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'Overhang mandates explained',
          'Electoral threshold (5%)',
          'Postal voting steps',
        ],
      },
      advanced: {
        answer:
          'The Bundestag election system under the BWG uses a personalised proportional representation model. The 2023 electoral reform capped the Bundestag at 630 seats by eliminating overhang mandates and levelling seats. The Grundmandatsklausel (basic mandate clause) was also amended.',
        sourceName: 'Bundeswahlleiter Electoral Law',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          '2023 electoral reform details',
          'Grundmandatsklausel',
          'Wahlprüfungsbeschwerde (election challenge)',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in a German federal election you must be a German citizen, at least 18 years old on election day, and have lived in Germany or abroad for at least 3 months in the last 25 years.',
        sourceName: 'Federal Returning Officer Germany',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'Can EU citizens vote?',
          'Can I vote if I live abroad?',
          'What if I was recently naturalised?',
        ],
      },
      intermediate: {
        answer:
          'Federal election eligibility (BWG § 12) requires German citizenship and age ≥ 18. EU citizens can vote in European Parliament and local elections but not Bundestag elections. Citizens deprived of voting rights by court order (e.g., certain criminal convictions) are excluded.',
        sourceName: 'Bundeswahlleiter Eligibility',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'EU citizens local voting rights',
          'Court-ordered disenfranchisement',
          'Mental incapacity rules',
        ],
      },
      advanced: {
        answer:
          'Under BWG § 12 and § 13, the right to vote is forfeited following certain criminal convictions where the court expressly revokes it, or in cases of Betreuung (court-ordered guardianship) for all affairs — a category significantly narrowed by the 2019 BGH ruling extending suffrage to more persons with disabilities.',
        sourceName: 'Bundeswahlleiter Legal Commentary',
        sourceUrl: 'https://www.bundeswahlleiter.de',
        followUps: [
          'BGH 2019 disability voting ruling',
          'BGG accessibility mandates',
          'Wahlrechtliche Disqualifikation',
        ],
      },
    },
  },
  FR: {
    voter_registration: {
      beginner: {
        answer:
          'In France, citizens are automatically registered on the electoral list when they turn 18 if they completed their civic journey (recensement citoyen). You can also register online at service-public.fr or at your local town hall (mairie).',
        sourceName: 'Service-Public.fr',
        sourceUrl: 'https://www.service-public.fr/particuliers/vosdroits/F1961',
        followUps: [
          'What is the registration deadline?',
          'How to register online?',
          'Can I vote if I live abroad?',
        ],
      },
      intermediate: {
        answer:
          "Since 2019, French citizens are automatically registered via the REU (Répertoire Électoral Unique). You still need to actively register if you move or turn 18 after the automatic sweep. The deadline to register for an upcoming election is the 6th Friday before polling day.",
        sourceName: 'Ministère de l\'Intérieur',
        sourceUrl: 'https://www.interieur.gouv.fr',
        followUps: [
          'REU — what it is',
          'Registration after moving',
          'Proxy vote (procuration)',
        ],
      },
      advanced: {
        answer:
          'The REU (décret n° 2018-350) replaced the per-commune electoral lists and is managed by INSEE. Changes of address must be declared by the 6th Friday before the election (loi n° 2016-1048). Overseas French citizens register via consular lists maintained by the MAEE.',
        sourceName: 'Conseil Constitutionnel',
        sourceUrl: 'https://www.conseil-constitutionnel.fr',
        followUps: [
          'Loi n° 2016-1048',
          'Consular list registration',
          'REU correction procedures',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          'Bring your voter card and ID to your polling station. Take an envelope and ballot papers for each candidate, enter the voting booth, put one ballot in the envelope, seal it, and place it in the ballot box. The president of the bureau will stamp it.',
        sourceName: 'Service-Public.fr',
        sourceUrl: 'https://www.service-public.fr',
        followUps: [
          'What ID is accepted?',
          'Can I vote by proxy?',
          'What happens if I spoil my ballot?',
        ],
      },
      intermediate: {
        answer:
          "Presidential elections use a two-round system — if no candidate gets over 50% in round 1, the top two face off in round 2 two weeks later. Legislative elections also use two rounds, with candidates needing ≥ 12.5% of registered voters to progress.",
        sourceName: 'Conseil Constitutionnel',
        sourceUrl: 'https://www.conseil-constitutionnel.fr',
        followUps: [
          'Two-round system explained',
          'Proxy voting (procuration)',
          'Overseas voting bureaus',
        ],
      },
      advanced: {
        answer:
          "The vote is governed by the Code électoral. The two-round majoritarian system for presidential elections is set by Article 7 of the Constitution (as revised in 1962 by referendum). The Conseil Constitutionnel validates results and adjudicates disputes within the délai de recours.",
        sourceName: 'Conseil Constitutionnel',
        sourceUrl: 'https://www.conseil-constitutionnel.fr',
        followUps: [
          'Article 7 Constitution',
          'Conseil Constitutionnel jurisdiction',
          'Code électoral Art. L62',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in France you must be a French citizen, at least 18 years old on election day, registered on the electoral list, and not subject to any legal incapacity.',
        sourceName: 'Service-Public.fr',
        sourceUrl: 'https://www.service-public.fr/particuliers/vosdroits/F1391',
        followUps: [
          'Can EU citizens vote in France?',
          'Can I vote if I live abroad?',
          'Voting age for local elections?',
        ],
      },
      intermediate: {
        answer:
          'EU citizens residing in France may vote in European Parliament and municipal elections but not national or presidential elections. French citizens under guardianship (tutelle) retain voting rights since the 2019 reform to the electoral code.',
        sourceName: 'Ministère de l\'Intérieur',
        sourceUrl: 'https://www.interieur.gouv.fr',
        followUps: [
          '2019 tutelle reform',
          'EU citizens municipal vote',
          'Overseas French voting rights',
        ],
      },
      advanced: {
        answer:
          'Eligibility derives from Article 3 of the Constitution and the Code électoral Art. L2–L5. The Conseil d\'État and Conseil Constitutionnel have consistently held that deprivation of civic rights (interdiction des droits civiques) as a penal sanction is constitutional under Art. 131-26 of the Penal Code.',
        sourceName: 'Conseil Constitutionnel',
        sourceUrl: 'https://www.conseil-constitutionnel.fr',
        followUps: [
          'Art. 131-26 Code pénal',
          'Interdiction des droits civiques',
          'Contrôle constitutionnel du droit de vote',
        ],
      },
    },
  },
  BR: {
    voter_registration: {
      beginner: {
        answer:
          'In Brazil, voter registration (alistamento eleitoral) is compulsory for citizens aged 18–70 and optional for those aged 16–17 or over 70. You can register online at título.tse.jus.br or at your regional Electoral Court (TRE).',
        sourceName: 'Tribunal Superior Eleitoral',
        sourceUrl: 'https://www.tse.jus.br',
        followUps: [
          'What documents do I need?',
          'What is the registration deadline?',
          'How do I get my voter title (título)?',
        ],
      },
      intermediate: {
        answer:
          'Registration produces the Título de Eleitor (voter title) and assigns you to an electoral zone and section. Since 2020 you can also use the e-Título app as your official voter ID at the polls. Transfers between municipalities must be done well before election year.',
        sourceName: 'TSE e-Título',
        sourceUrl: 'https://www.tse.jus.br/eleitor/titulo-de-eleitor/e-titulo',
        followUps: [
          'e-Título app setup',
          'Transfer of electoral domicile',
          'Regularisation of suspended registration',
        ],
      },
      advanced: {
        answer:
          'Compulsory registration is enshrined in Art. 14 of the Federal Constitution. The TSE oversees the Cadastro Eleitoral; failure to vote without justification leads to a multa (fine) and suspension of the título, which restricts access to government services and travel documents.',
        sourceName: 'TSE Legal Framework',
        sourceUrl: 'https://www.tse.jus.br',
        followUps: [
          'Art. 14 CF/88',
          'Código Eleitoral Lei 4.737/65',
          'Consequências do não alistamento',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          'In Brazil, voting is done on an electronic voting machine (urna eletrônica). Enter the number of your candidate and press confirm. Voting is mandatory for citizens aged 18–70.',
        sourceName: 'Tribunal Superior Eleitoral',
        sourceUrl: 'https://www.tse.jus.br',
        followUps: [
          'Where do I find my candidate\'s number?',
          'What if I make a mistake?',
          'What happens if I do not vote?',
        ],
      },
      intermediate: {
        answer:
          "Brazil's electronic voting system (urna eletrônica) has been used since 1996 and is among the most secure in the world. Voters enter a numeric code for each office being contested. The system provides an audio feedback loop and accessibility features for voters with disabilities.",
        sourceName: 'TSE Urna Eletrônica',
        sourceUrl: 'https://www.tse.jus.br/eleicoes/urna-eletronica',
        followUps: [
          'Urna security audits',
          'Printing of BWEB (audit log)',
          'Accessibility resources',
        ],
      },
      advanced: {
        answer:
          'The urna eletrônica operates offline and uses digital signatures and hash checks on all software loaded on it. The TSE conducts public integrity tests (testes públicos de segurança) before each election. Art. 59 of the Electoral Code governs the counting and proclamation of results.',
        sourceName: 'TSE Security Audit',
        sourceUrl: 'https://www.tse.jus.br/eleicoes/eleicoes-2022/seguranca-das-urnas',
        followUps: [
          'Teste público de segurança',
          'Boletim de Urna (BU)',
          'Art. 59 Código Eleitoral',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in Brazil you must be at least 16 years old, a Brazilian citizen, and registered as a voter (título eleitoral). Voting is compulsory for those aged 18–70 and optional for 16–17 year-olds and citizens over 70.',
        sourceName: 'Tribunal Superior Eleitoral',
        sourceUrl: 'https://www.tse.jus.br',
        followUps: [
          'Can I vote at 16?',
          'What if I live abroad?',
          'Do illiterate citizens vote?',
        ],
      },
      intermediate: {
        answer:
          "Brazilians aged 16–17, citizens over 70, and those who are illiterate have optional (facultativo) voting rights under Art. 14 §§ 1–2 of the Constitution. Conscript military service members are ineligible to vote while serving. Naturalised citizens have the same voting rights as native-born citizens.",
        sourceName: 'TSE Eligibility Guide',
        sourceUrl: 'https://www.tse.jus.br',
        followUps: [
          'Military conscripts voting rules',
          'Naturalised citizen rights',
          'Voting with suspended título',
        ],
      },
      advanced: {
        answer:
          'Art. 14 §§ 1–3 CF/88 sets the franchise. The Código Eleitoral (Lei 4.737/65) details disqualifications including active military conscripts, those deprived of political rights by judicial decision, and those whose electoral registration has been cancelled. The TSE has expanded voter access through remote regularisation.',
        sourceName: 'TSE Legal Database',
        sourceUrl: 'https://www.tse.jus.br/legislacao',
        followUps: [
          'Art. 14 §2 inalistáveis e analfabetos',
          'Cancelamento de alistamento',
          'TSE regularisation jurisprudence',
        ],
      },
    },
  },
  AU: {
    voter_registration: {
      beginner: {
        answer:
          'Australian citizens aged 18 or over must enrol to vote. You can enrol or update your details online at aec.gov.au. You need your name, address, and date of birth.',
        sourceName: 'Australian Electoral Commission',
        sourceUrl: 'https://www.aec.gov.au/Enrolling_to_vote/',
        followUps: [
          'What is the enrolment deadline?',
          'How do I update my address?',
          'Can 17-year-olds pre-enrol?',
        ],
      },
      intermediate: {
        answer:
          "Enrolment is compulsory for Australian citizens aged ≥ 18. The rolls close 7 days after the issue of the writ for an election. Eligible 16 and 17-year-olds can pre-enrol so they are automatically enrolled when they turn 18.",
        sourceName: 'AEC Enrolment',
        sourceUrl: 'https://www.aec.gov.au/Enrolling_to_vote/',
        followUps: [
          'Pre-enrolment for 16–17 year olds',
          'Overseas Australian enrolment',
          'What happens if I do not enrol?',
        ],
      },
      advanced: {
        answer:
          'Enrolment is governed by the Commonwealth Electoral Act 1918 (CEA). Section 101 imposes a duty to enrol; failure to do so may attract a penalty. The AEC uses direct enrolment and update provisions (2012 amendments) to maintain roll accuracy using data from government agencies.',
        sourceName: 'AEC Electoral Act',
        sourceUrl: 'https://www.aec.gov.au/About_AEC/Publications/electoral-backgrounders/',
        followUps: [
          'CEA section 101',
          'Direct enrolment provisions',
          'AEC data-matching process',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          'At the polling place, you will receive two ballot papers — green for the House of Representatives and white for the Senate. Number ALL boxes on the green ballot and at least 6 boxes above the line (or 12 below) on the white ballot. Place them in the correct boxes.',
        sourceName: 'AEC How to Vote',
        sourceUrl: 'https://www.aec.gov.au/Voting/',
        followUps: [
          'What is preferential voting?',
          'Can I vote early?',
          'What is a donkey vote?',
        ],
      },
      intermediate: {
        answer:
          "Australia uses preferential (instant-runoff) voting for the House of Representatives, meaning candidates must rank ALL candidates. The Senate uses a proportional system with the single transferable vote (STV). This ensures votes are not 'wasted' and preferences flow until a winner emerges.",
        sourceName: 'AEC Voting Systems',
        sourceUrl: 'https://www.aec.gov.au/Learn/',
        followUps: [
          'How preferences are distributed',
          'Senate quota calculation',
          'Above-the-line vs below-the-line Senate vote',
        ],
      },
      advanced: {
        answer:
          'The House uses full preferential voting under the CEA; the Senate uses proportional representation with STV and group voting tickets were abolished in 2016 (JSCEM reform). Votes are counted by DROs using the Gregory method for Senate surplus distributions. Disputed elections go to the Court of Disputed Returns.',
        sourceName: 'AEC Electoral Law',
        sourceUrl: 'https://www.aec.gov.au/About_AEC/Publications/electoral-backgrounders/',
        followUps: [
          'Gregory method of surplus transfer',
          'Court of Disputed Returns',
          '2016 Senate voting reform',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in Australia you must be an Australian citizen, 18 years or older, and enrolled to vote. Voting is compulsory — you must vote at every federal election or you may receive a fine.',
        sourceName: 'Australian Electoral Commission',
        sourceUrl: 'https://www.aec.gov.au/Enrolling_to_vote/Enrolling_to_vote/',
        followUps: [
          'What if I am overseas on election day?',
          'Can permanent residents vote?',
          'What is the penalty for not voting?',
        ],
      },
      intermediate: {
        answer:
          "Only Australian citizens are eligible to vote in federal elections — permanent residents cannot. Since 1984 British subjects who were on the electoral roll before that year retain voting rights as a transitional measure. Compulsory voting has been in place federally since 1924.",
        sourceName: 'AEC Eligibility',
        sourceUrl: 'https://www.aec.gov.au/Enrolling_to_vote/',
        followUps: [
          'British subjects transitional right',
          'How compulsory voting works',
          'Informal vs formal vote',
        ],
      },
      advanced: {
        answer:
          'Franchise is set by CEA sections 93–100. Disqualifications include non-citizenship, persons of unsound mind, and persons serving sentences of 3 years or more. The High Court in Roach v Electoral Commissioner (2007) struck down the blanket prisoner disenfranchisement as inconsistent with Chapter I of the Constitution.',
        sourceName: 'AEC Legal Framework',
        sourceUrl: 'https://www.aec.gov.au/About_AEC/Publications/electoral-backgrounders/',
        followUps: [
          'Roach v Electoral Commissioner',
          'CEA section 93 disqualifications',
          'Rowe v Electoral Commissioner (2010)',
        ],
      },
    },
  },
  SA: {
    voter_registration: {
      beginner: {
        answer:
          'Saudi Arabia holds municipal elections. To register as a voter, you must be a Saudi citizen aged 18 or over. Registration is handled through the Ministry of Municipal and Rural Affairs. Eligible women have been able to vote and stand as candidates since 2015.',
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          'When are the next municipal elections?',
          'Can women vote in all elections?',
          'Where do I register?',
        ],
      },
      intermediate: {
        answer:
          "Saudi Arabia's electoral scope is limited to municipal councils. Voters register at designated centres during the registration window opened by the Ministry. The 2015 municipal elections were the first in which women could both vote and stand as candidates, following a royal decree.",
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          '2015 election historic context',
          'Municipal council powers',
          'Registration documents required',
        ],
      },
      advanced: {
        answer:
          "Municipal elections in Saudi Arabia are governed by the Municipal Council Law issued by Royal Decree M/21 (2005) and amended subsequently. Two-thirds of council members are elected; one-third are appointed. The Shura Council (Majlis al-Shura), the national consultative body, remains fully appointed.",
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          'Royal Decree M/21 provisions',
          'Shura Council appointment process',
          'Vision 2030 municipal reform',
        ],
      },
    },
    voting_process: {
      beginner: {
        answer:
          'In Saudi municipal elections, you bring your national ID to your assigned polling centre, receive a ballot, mark your choice, and deposit it in the ballot box. Poll centres are segregated by gender.',
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          'Are there separate polling centres for women?',
          'How many candidates can I vote for?',
          'When are results announced?',
        ],
      },
      intermediate: {
        answer:
          "Saudi municipal elections use a block voting system — voters can vote for as many candidates as there are seats in their district. Polling is administered by the General Supervisory Committee, and results are verified by a central body before official announcement.",
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          'Block voting explained',
          'General Supervisory Committee role',
          'How disputes are resolved',
        ],
      },
      advanced: {
        answer:
          'The election framework operates under the Municipal Council Law and the Ministry\'s executive regulations. Candidacy requires approval by the Ministry; campaigns are conducted within strict guidelines prohibiting religious, tribal, or sectarian appeals. Results are subject to review by the General Supervisory Committee before certification.',
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          'Campaign regulations',
          'Candidacy approval process',
          'Election dispute mechanism',
        ],
      },
    },
    eligibility: {
      beginner: {
        answer:
          'To vote in Saudi municipal elections you must be a Saudi citizen, at least 18 years old, and hold a valid national identity card. Both men and women are eligible to vote and stand for election.',
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          'Can expatriates vote?',
          'Do I need to register in advance?',
          'What elections can I vote in?',
        ],
      },
      intermediate: {
        answer:
          "Only Saudi nationals are eligible to participate in municipal elections. Women's suffrage was granted by Royal Decree in 2015. Military personnel and government officials in certain positions may be restricted from standing as candidates but can generally vote.",
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          "Women's 2015 suffrage decree",
          'Military voter rules',
          'Expatriate participation limits',
        ],
      },
      advanced: {
        answer:
          "Eligibility is defined by the Municipal Council Law's executive regulations. The 2015 royal decree granting women the right to vote and stand as candidates (Municipal Council elections) was a landmark reform within the context of Saudi Arabia's absolute monarchy where national-level elected bodies do not currently exist.",
        sourceName: 'Ministry of Municipal and Rural Affairs',
        sourceUrl: 'https://www.momra.gov.sa',
        followUps: [
          'Royal Decree expanding women\'s political rights',
          'Shura Council vs Municipal Council',
          'Vision 2030 political reform trajectory',
        ],
      },
    },
  },
};

/**
 * Retrieves a static FAQ response based on country, intent, and knowledge level.
 * Falls back to the US entry when no country-specific data exists.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param intent - Detected assistant intent
 * @param knowledgeLevel - User's assessed knowledge level
 * @returns FAQResponse or null if no entry exists
 */
export function getFAQResponse(
  countryCode: string,
  intent: AssistantIntent,
  knowledgeLevel: KnowledgeLevel,
): FAQResponse | null {
  const countryData = FAQ_DATA[countryCode] ?? FAQ_DATA['US'];
  const intentData = countryData?.[intent];
  if (!intentData) return null;
  return intentData[knowledgeLevel] ?? null;
}
