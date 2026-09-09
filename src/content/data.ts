/**
 * Catalogue content. This is the same shape the Supabase tables return, so
 * pages can be switched from these constants to live queries without touching
 * the components. It also seeds supabase/seed.sql.
 *
 * NOTE ON PEOPLE: every practitioner below is `isPlaceholder: true`. They are
 * layout stand-ins, not real clinicians, and the build check in
 * scripts/check-constraints.mjs blocks a production build while any remain.
 * Replace with real practitioners and real credentials before launch.
 */

import type { IconKey } from "@/components/icons";

export type Modality = "video" | "in_person" | "phone";

export type Service = {
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  iconKey: IconKey;
  durationMin: number;
  bufferMin: number;
  priceCents: number;
  currency: string;
  modalities: Modality[];
  sortOrder: number;
};

export const SERVICES: Service[] = [
  {
    slug: "first-consultation",
    name: "First consultation",
    shortDesc: "A short, no-cost conversation to work out what you need.",
    description:
      "Twenty-five minutes with a practitioner to talk through what is going on and decide together what kind of support fits. No cost, no obligation to book anything afterwards.",
    iconKey: "assessment",
    durationMin: 25,
    bufferMin: 10,
    priceCents: 0,
    currency: "GBP",
    modalities: ["video", "phone"],
    sortOrder: 0,
  },
  {
    slug: "individual-therapy",
    name: "Individual therapy",
    shortDesc: "Weekly one-to-one sessions with the same therapist.",
    description:
      "Fifty minutes, one to one, with a therapist matched to what you are working through. Most people start weekly and move to fortnightly when things settle.",
    iconKey: "sessionVideo",
    durationMin: 50,
    bufferMin: 10,
    priceCents: 8500,
    currency: "GBP",
    modalities: ["video", "in_person", "phone"],
    sortOrder: 1,
  },
  {
    slug: "anxiety-support",
    name: "Anxiety & panic",
    shortDesc: "For the tight chest, the racing head, the avoided things.",
    description:
      "Structured work on anxiety and panic, usually drawing on CBT and acceptance-based approaches. We start with what you are avoiding and work outward from there.",
    iconKey: "anxiety",
    durationMin: 50,
    bufferMin: 10,
    priceCents: 8500,
    currency: "GBP",
    modalities: ["video", "in_person", "phone"],
    sortOrder: 2,
  },
  {
    slug: "low-mood",
    name: "Low mood & depression",
    shortDesc: "When everything has gone flat and heavy.",
    description:
      "For persistent low mood, loss of interest, and the exhaustion that comes with both. Paced so that the work itself does not become another thing you cannot face.",
    iconKey: "lowMood",
    durationMin: 50,
    bufferMin: 10,
    priceCents: 8500,
    currency: "GBP",
    modalities: ["video", "in_person", "phone"],
    sortOrder: 3,
  },
  {
    slug: "burnout-work-stress",
    name: "Burnout & work stress",
    shortDesc: "For when the job has taken more than it gave back.",
    description:
      "Work on exhaustion, resentment and the slow erosion of capacity. Practical as well as reflective, because burnout usually needs changes as well as insight.",
    iconKey: "burnout",
    durationMin: 50,
    bufferMin: 10,
    priceCents: 8500,
    currency: "GBP",
    modalities: ["video", "in_person", "phone"],
    sortOrder: 4,
  },
  {
    slug: "couples-therapy",
    name: "Couples therapy",
    shortDesc: "Eighty minutes, both of you, one room.",
    description:
      "For couples who keep having the same argument in different clothes. Longer sessions because two people need more time than one.",
    iconKey: "couples",
    durationMin: 80,
    bufferMin: 15,
    priceCents: 13500,
    currency: "GBP",
    modalities: ["video", "in_person"],
    sortOrder: 5,
  },
  {
    slug: "grief-loss",
    name: "Grief & loss",
    shortDesc: "For a loss that has not made room for itself yet.",
    description:
      "Grief work at whatever pace it needs, including losses that are years old and losses that are not a death.",
    iconKey: "grief",
    durationMin: 50,
    bufferMin: 10,
    priceCents: 8500,
    currency: "GBP",
    modalities: ["video", "in_person", "phone"],
    sortOrder: 6,
  },
  {
    slug: "young-people",
    name: "Young people (13 to 18)",
    shortDesc: "Therapy for teenagers, on their terms.",
    description:
      "Sessions with practitioners who specialise in adolescents. Parents are involved at the start and then only as much as the young person wants.",
    iconKey: "teens",
    durationMin: 50,
    bufferMin: 10,
    priceCents: 8000,
    currency: "GBP",
    modalities: ["video", "in_person"],
    sortOrder: 7,
  },
];

export type Concern = {
  slug: string;
  name: string;
  line: string;
  iconKey: IconKey;
  serviceSlug: string;
};

export const CONCERNS: Concern[] = [
  {
    slug: "anxiety",
    name: "Anxiety & panic",
    line: "Racing thoughts, tight chest, the things you have started avoiding.",
    iconKey: "anxiety",
    serviceSlug: "anxiety-support",
  },
  {
    slug: "low-mood",
    name: "Low mood",
    line: "Flat, heavy, and further from yourself than you would like.",
    iconKey: "lowMood",
    serviceSlug: "low-mood",
  },
  {
    slug: "burnout",
    name: "Burnout & work stress",
    line: "The job took more than it gave back and did not stop.",
    iconKey: "burnout",
    serviceSlug: "burnout-work-stress",
  },
  {
    slug: "relationships",
    name: "Relationships",
    line: "The same argument, in different clothes, again.",
    iconKey: "relationships",
    serviceSlug: "couples-therapy",
  },
  {
    slug: "grief",
    name: "Grief & loss",
    line: "A loss that has not been given room to be one.",
    iconKey: "grief",
    serviceSlug: "grief-loss",
  },
  {
    slug: "sleep",
    name: "Sleep",
    line: "Awake at three, and the day is already lost.",
    iconKey: "sleep",
    serviceSlug: "individual-therapy",
  },
  {
    slug: "trauma",
    name: "Trauma",
    line: "Something that happened and has not finished happening.",
    iconKey: "trauma",
    serviceSlug: "individual-therapy",
  },
  {
    slug: "focus",
    name: "Focus & ADHD",
    line: "Starting is hard, finishing is harder, and it is not laziness.",
    iconKey: "focus",
    serviceSlug: "individual-therapy",
  },
];

export type Therapist = {
  slug: string;
  displayName: string;
  initials: string;
  title: string;
  credentials: string[];
  shortBio: string;
  longBio: string[];
  specialties: string[];
  languages: string[];
  yearsExperience: number;
  modalities: Modality[];
  serviceSlugs: string[];
  acceptsNew: boolean;
  isPlaceholder: boolean;
  sortOrder: number;
};

export const THERAPISTS: Therapist[] = [
  {
    slug: "a-mensah",
    displayName: "A. Mensah",
    initials: "AM",
    title: "Counselling Psychologist",
    credentials: ["PLACEHOLDER — credentials pending"],
    shortBio:
      "Works with anxiety, panic and the avoidance that grows around them.",
    longBio: [
      "This is placeholder biography copy. It exists so that the page layout, reading measure and typographic rhythm can be reviewed at realistic length before real practitioner copy is written.",
      "Replace this entire record, including the name, title and credentials, with a real practitioner before the site goes live. Presenting an invented clinician as real would be misleading and, in most jurisdictions, unlawful.",
    ],
    specialties: ["Anxiety", "Panic", "Burnout"],
    languages: ["English", "Twi"],
    yearsExperience: 12,
    modalities: ["video", "in_person", "phone"],
    serviceSlugs: [
      "first-consultation",
      "individual-therapy",
      "anxiety-support",
      "burnout-work-stress",
    ],
    acceptsNew: true,
    isPlaceholder: true,
    sortOrder: 0,
  },
  {
    slug: "j-halvorsen",
    displayName: "J. Halvorsen",
    initials: "JH",
    title: "Clinical Psychologist",
    credentials: ["PLACEHOLDER — credentials pending"],
    shortBio: "Long-term work with depression, grief and life after loss.",
    longBio: [
      "This is placeholder biography copy. It exists so that the page layout, reading measure and typographic rhythm can be reviewed at realistic length before real practitioner copy is written.",
      "Replace this entire record with a real practitioner before launch.",
    ],
    specialties: ["Low mood", "Grief", "Trauma"],
    languages: ["English", "Norwegian"],
    yearsExperience: 18,
    modalities: ["video", "in_person"],
    serviceSlugs: [
      "first-consultation",
      "individual-therapy",
      "low-mood",
      "grief-loss",
    ],
    acceptsNew: true,
    isPlaceholder: true,
    sortOrder: 1,
  },
  {
    slug: "r-okafor",
    displayName: "R. Okafor",
    initials: "RO",
    title: "Psychotherapist",
    credentials: ["PLACEHOLDER — credentials pending"],
    shortBio: "Couples work, and individuals thinking about a relationship.",
    longBio: [
      "This is placeholder biography copy, written at realistic length so the layout can be judged honestly.",
      "Replace this entire record with a real practitioner before launch.",
    ],
    specialties: ["Relationships", "Couples", "Identity"],
    languages: ["English", "Igbo"],
    yearsExperience: 9,
    modalities: ["video", "in_person"],
    serviceSlugs: [
      "first-consultation",
      "couples-therapy",
      "individual-therapy",
    ],
    acceptsNew: true,
    isPlaceholder: true,
    sortOrder: 2,
  },
  {
    slug: "s-baptiste",
    displayName: "S. Baptiste",
    initials: "SB",
    title: "Adolescent Psychotherapist",
    credentials: ["PLACEHOLDER — credentials pending"],
    shortBio: "Works with teenagers and the adults who worry about them.",
    longBio: [
      "This is placeholder biography copy, written at realistic length so the layout can be judged honestly.",
      "Replace this entire record with a real practitioner before launch.",
    ],
    specialties: ["Young people", "Anxiety", "School refusal"],
    languages: ["English", "French"],
    yearsExperience: 14,
    modalities: ["video", "in_person"],
    serviceSlugs: ["first-consultation", "young-people", "anxiety-support"],
    acceptsNew: true,
    isPlaceholder: true,
    sortOrder: 3,
  },
  {
    slug: "t-lindqvist",
    displayName: "T. Lindqvist",
    initials: "TL",
    title: "CBT Therapist",
    credentials: ["PLACEHOLDER — credentials pending"],
    shortBio: "Structured, time-limited work on sleep, focus and worry.",
    longBio: [
      "This is placeholder biography copy, written at realistic length so the layout can be judged honestly.",
      "Replace this entire record with a real practitioner before launch.",
    ],
    specialties: ["Sleep", "Focus", "Worry"],
    languages: ["English", "Swedish"],
    yearsExperience: 7,
    modalities: ["video", "phone"],
    serviceSlugs: [
      "first-consultation",
      "individual-therapy",
      "anxiety-support",
    ],
    acceptsNew: true,
    isPlaceholder: true,
    sortOrder: 4,
  },
  {
    slug: "m-castellanos",
    displayName: "M. Castellanos",
    initials: "MC",
    title: "Clinical Psychologist",
    credentials: ["PLACEHOLDER — credentials pending"],
    shortBio: "Trauma-focused work, at whatever pace it needs to go.",
    longBio: [
      "This is placeholder biography copy, written at realistic length so the layout can be judged honestly.",
      "Replace this entire record with a real practitioner before launch.",
    ],
    specialties: ["Trauma", "Grief", "Low mood"],
    languages: ["English", "Spanish"],
    yearsExperience: 21,
    modalities: ["video", "in_person", "phone"],
    serviceSlugs: [
      "first-consultation",
      "individual-therapy",
      "grief-loss",
      "low-mood",
    ],
    acceptsNew: false,
    isPlaceholder: true,
    sortOrder: 5,
  },
];

export type FaqItem = { question: string; answer: string };

export const FAQ: FaqItem[] = [
  {
    question: "How quickly can I be seen?",
    answer:
      "Most people book a first consultation within two or three days, and a full session in the same week. If you are flexible on time of day, it is usually faster. Availability is shown live when you book, so nothing you see is a guess.",
  },
  {
    question: "How do I know which therapist is right?",
    answer:
      "You do not, at first, and that is normal. We match on concern, approach and availability, and the first consultation exists partly to test the fit. If it is not right after the first full session, we will re-match you at no cost.",
  },
  {
    question: "What actually happens in a first session?",
    answer:
      "Mostly talking, at your pace. Your therapist will ask what brought you, what you have already tried, and what you want to be different. There is no test and nothing you have to disclose before you are ready.",
  },
  {
    question: "Is this confidential?",
    answer:
      "Yes. What you say stays between you and your therapist. The exceptions are the standard clinical ones: a serious risk to you or to someone else, or a legal obligation. Your therapist will explain these in the first session rather than burying them in a document.",
  },
  {
    question: "What does it cost, and do you offer a sliding scale?",
    answer:
      "A standard fifty-minute session is 85 pounds and the first consultation is free. We hold a number of reduced-rate places for people who cannot meet the standard fee. Ask when you book. You will not be asked to prove anything.",
  },
  {
    question: "What if I need help right now?",
    answer:
      "Openfield is not a crisis service and cannot respond immediately. If you need help now, please use the crisis support page, which lists routes to immediate help.",
  },
];

export type Testimonial = {
  quote: string;
  attribution: string;
  isPublished: boolean;
  isPlaceholder: boolean;
};

/**
 * Deliberately empty. Section 3.8 of the build spec: ship with no testimonials
 * rather than invented ones. The section renders its own honest empty state.
 */
export const TESTIMONIALS: Testimonial[] = [];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  readingMin: number;
  publishedAt: string;
  body: string[];
};

export const POSTS: Post[] = [
  {
    slug: "what-to-say-in-a-first-session",
    title: "What to say in a first session when you do not know what to say",
    excerpt:
      "The most common worry before a first appointment is not having anything coherent to bring. Here is why that is fine.",
    tags: ["Starting out"],
    readingMin: 4,
    publishedAt: "2026-08-14",
    body: [
      "Almost everyone arrives at a first session with a version of the same worry: that they will sit down, be asked what is wrong, and have nothing organised to say. That the problem will sound small out loud. That fifty minutes is a long time to fill.",
      "It is worth knowing that therapists do not expect a summary. The first session is not a pitch, and there is no threshold of severity you have to clear before the work is allowed to start.",
      "If it helps to have something to open with, three things are usually enough: what made you book now rather than six months ago, what a normal week looks like at the moment, and what you would want to be different. None of these require you to have worked anything out in advance.",
    ],
  },
  {
    slug: "the-difference-between-stress-and-burnout",
    title: "The difference between stress and burnout",
    excerpt:
      "They are treated as the same word in most workplaces. They are not the same condition, and they do not respond to the same things.",
    tags: ["Work"],
    readingMin: 6,
    publishedAt: "2026-07-30",
    body: [
      "Stress is a state of too much. Burnout is a state of not enough left. The distinction matters because the usual advice for one actively makes the other worse.",
      "A stressed person under load can often recover with rest, because the capacity is still there and is simply oversubscribed. A burnt-out person given a week off will frequently return and collapse again within a fortnight, because the depletion is structural rather than acute.",
      "This is why burnout work is usually as practical as it is reflective. Insight alone does not restore capacity. Something in the arrangement has to change as well.",
    ],
  },
  {
    slug: "why-the-same-argument-keeps-happening",
    title: "Why the same argument keeps happening",
    excerpt:
      "Most couples do not have many arguments. They have one argument, in a rotating set of costumes.",
    tags: ["Relationships"],
    readingMin: 5,
    publishedAt: "2026-07-09",
    body: [
      "Couples who come to therapy often describe a long list of disagreements: money, family, the washing up, whose career takes priority this year. Listened to closely, the list usually collapses into one recurring structure.",
      "The content changes. The choreography does not. One person moves toward, the other moves away, and both experience the other person as the one causing it.",
      "Naming the pattern is not the same as solving it, but it changes what the argument is about. It stops being a disagreement about the washing up and becomes a shared problem the two of you are looking at together.",
    ],
  },
  {
    slug: "sleep-is-not-a-discipline-problem",
    title: "Sleep is not a discipline problem",
    excerpt:
      "Sleep advice is mostly delivered as a moral instruction. That framing is part of why it does not work.",
    tags: ["Sleep"],
    readingMin: 4,
    publishedAt: "2026-06-22",
    body: [
      "The standard list is familiar: no screens, no caffeine after noon, a consistent bedtime, a cool dark room. It is not wrong, exactly. It is just addressed to a person who is not having the problem.",
      "For most people who cannot sleep, the obstacle is not ignorance of the rules. It is that lying still in the dark is the first moment all day without distraction, and the mind takes its opportunity.",
      "Treating that as a hygiene failure adds a second problem on top of the first: now you are awake, and you are also failing at something.",
    ],
  },
  {
    slug: "on-telling-people-you-are-in-therapy",
    title: "On telling people you are in therapy",
    excerpt:
      "You do not owe anyone this information. But the question of who to tell comes up early, so it is worth thinking about deliberately.",
    tags: ["Starting out"],
    readingMin: 3,
    publishedAt: "2026-06-03",
    body: [
      "There is no obligation here. Therapy is a private arrangement and disclosing it is entirely your decision, including the decision to tell nobody at all.",
      "That said, most people find they want to tell someone, and the choice of who tends to matter more than the choice of whether. A person who responds to the news by asking what is wrong is a different experience from one who simply says that sounds sensible.",
      "It is reasonable to decide this in advance rather than in the moment.",
    ],
  },
  {
    slug: "what-grief-does-to-time",
    title: "What grief does to time",
    excerpt:
      "The expectation of a tidy sequence of stages is one of the least helpful ideas in circulation.",
    tags: ["Grief"],
    readingMin: 5,
    publishedAt: "2026-05-18",
    body: [
      "The stages model has been public property for fifty years, and it has given a great many grieving people the impression that they are doing it in the wrong order.",
      "In practice grief is not sequential and does not conclude. It reorganises. The acute period passes, and what remains is something that recurs, often without warning and often in response to something trivially small.",
      "The useful question is usually not how far through it you are, but whether it currently has room to exist.",
    ],
  },
];
