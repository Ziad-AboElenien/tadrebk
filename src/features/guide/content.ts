export interface GuideStep {
  step: string;
  icon: string;
  title: string;
  desc: string;
  details: string[];
}

export interface GuideTip {
  icon: string;
  title: string;
  text: string;
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideGlance {
  icon: string;
  label: string;
}

export const studentSteps: GuideStep[] = [
  {
    step: '01',
    icon: 'fa-user-plus',
    title: 'Create your account',
    desc: 'Sign up with your email or Google in under 2 minutes. Verify with a one-time OTP and you\'re in.',
    details: [
      'Register as a Student with your university email or Google',
      'Verify your email with a one-time code (OTP)',
      'Set your full name and university — that\'s it',
    ],
  },
  {
    step: '02',
    icon: 'fa-user-graduate',
    title: 'Build your profile',
    desc: 'Tell Tadrebk what you study and where you want to go — so the right opportunities find you.',
    details: [
      'Add your university, field of study and skills',
      'Pick your preferred location (on-site, remote, hybrid)',
      'Choose the tracks that match your career goals',
    ],
  },
  {
    step: '03',
    icon: 'fa-magnifying-glass',
    title: 'Explore internships',
    desc: 'Browse a feed of fresh opportunities posted by verified companies across Egypt.',
    details: [
      'Search by title, skill or company name',
      'Filter by location and working time',
      'Save internships with one tap to apply later',
    ],
  },
  {
    step: '04',
    icon: 'fa-paper-plane',
    title: 'Apply in one click',
    desc: 'Send your application instantly — no cover letters, no long forms.',
    details: [
      'One-click apply on any open internship',
      'The company sees your profile and application instantly',
      'Change your mind? Cancel a pending application anytime',
    ],
  },
  {
    step: '05',
    icon: 'fa-list-check',
    title: 'Track your applications',
    desc: 'Follow every application from your dashboard — you always know where you stand.',
    details: [
      'Pending — your application is under review',
      'Accepted — congratulations, you\'re hired!',
      'Rejected — don\'t worry, more opportunities are coming',
    ],
  },
  {
    step: '06',
    icon: 'fa-bell',
    title: 'Get notified & start',
    desc: 'Never miss a response. Tadrebk notifies you the moment a company makes a decision.',
    details: [
      'Real-time notifications on every status change',
      'Accept the internship and start your journey',
      'Build real experience that counts toward your career',
    ],
  },
];

export const companySteps: GuideStep[] = [
  {
    step: '01',
    icon: 'fa-building-circle-check',
    title: 'Register your company',
    desc: 'Create a company account and verify your identity in minutes.',
    details: [
      'Register with your company work email',
      'Submit a legal attachment for verification',
      'Verify your email with a one-time code (OTP)',
    ],
  },
  {
    step: '02',
    icon: 'fa-shield-halved',
    title: 'Get approved by admin',
    desc: 'Our admin team reviews and approves every company before it can post — so students only see trusted employers.',
    details: [
      'Admin reviews your registration and legal documents',
      'Once approved, posting is fully unlocked',
      'You can prepare your first internship while you wait',
    ],
  },
  {
    step: '03',
    icon: 'fa-plus',
    title: 'Post your internship',
    desc: 'Create a clear, attractive listing that brings you the right talent.',
    details: [
      'Add title, description, industry, location and working time',
      'Pick the tracks and required technical skills',
      'Optional assessment questions (MCQ or written) to screen candidates',
    ],
  },
  {
    step: '04',
    icon: 'fa-users',
    title: 'Receive applications',
    desc: 'Students apply directly and everything lands in one clean dashboard.',
    details: [
      'Live list of applicants for every internship',
      'View each student\'s profile, skills and assessment answers',
      'Filter and compare candidates side by side',
    ],
  },
  {
    step: '05',
    icon: 'fa-user-check',
    title: 'Choose your talent',
    desc: 'Accept or reject applicants with one click — and keep your pipeline healthy.',
    details: [
      'Update status to Accepted or Rejected',
      'Students get notified the moment you decide',
      'Edit or close internships anytime to stop receiving applications',
    ],
  },
];

export const studentTips: GuideTip[] = [
  { icon: 'fa-wand-magic-sparkles', title: 'Complete your profile', text: 'Profiles with skills and a university get far more responses. Spend 2 minutes and finish it.' },
  { icon: 'fa-crosshairs', title: 'Apply to what fits', text: 'Focus on internships matching your tracks and skills — quality beats quantity.' },
  { icon: 'fa-bolt', title: 'Apply early', text: 'Companies review applications as they come in. Early applicants often get noticed first.' },
  { icon: 'fa-clock', title: 'Check your notifications', text: 'A company might respond within hours. Keep an eye on your dashboard to reply quickly.' },
];

export const companyTips: GuideTip[] = [
  { icon: 'fa-file-circle-check', title: 'Describe the role clearly', text: 'Clear titles and descriptions attract better-matched applicants and fewer random clicks.' },
  { icon: 'fa-screwdriver-wrench', title: 'List real skills', text: 'The skills you add power students\' search and filters — accurate skills = better candidates.' },
  { icon: 'fa-question', title: 'Use assessment questions', text: 'A quick MCQ or writing question filters candidates before you even look at profiles.' },
  { icon: 'fa-bolt', title: 'Respond fast', text: 'Fast decisions build a great employer brand — students remember companies that reply.' },
];

export const studentFaq: GuideFaq[] = [
  { q: 'Is Tadrebk free for students?', a: 'Absolutely! Tadrebk is 100% free for students. You can browse, save and apply to internships with no cost at all.' },
  { q: 'Can I apply to multiple internships?', a: 'Yes! Apply to as many as you want. Track all of them from your student dashboard in one place.' },
  { q: 'How do I know if I got accepted?', a: 'The status changes from Pending to Accepted or Rejected, and you get a real-time notification the moment the company decides.' },
  { q: 'What if I need to cancel an application?', a: 'You can cancel any pending application from your My Applications page. Once a company accepts or rejects, it\'s final.' },
  { q: 'What do companies see about me?', a: 'Companies see your profile — your name, university, skills and the tracks you\'re interested in. That\'s why a complete profile matters.' },
];

export const companyFaq: GuideFaq[] = [
  { q: 'Is posting internships free?', a: 'Yes! Posting internships on Tadrebk is completely free for registered and approved companies.' },
  { q: 'Why do companies need admin approval?', a: 'Every company is verified before posting so students can trust that every opportunity on Tadrebk is legitimate.' },
  { q: 'How do I review applicants?', a: 'Open any internship and click Applicants. You\'ll see every applicant with their profile and answers to your assessment questions.' },
  { q: 'Can I edit or close an internship?', a: 'Yes. You can edit any internship anytime, and close it to stop receiving new applications whenever you want.' },
  { q: 'How do students find my internship?', a: 'Students search by title, skills, location and tracks. Listing accurate skills and choosing the right tracks puts you in front of the right students.' },
];

export const glanceStudent: GuideGlance[] = [
  { icon: 'fa-user-plus', label: 'Create account' },
  { icon: 'fa-user-graduate', label: 'Build profile' },
  { icon: 'fa-magnifying-glass', label: 'Find & apply' },
  { icon: 'fa-briefcase', label: 'Get hired' },
];

export const glanceCompany: GuideGlance[] = [
  { icon: 'fa-building-circle-check', label: 'Register' },
  { icon: 'fa-shield-halved', label: 'Get approved' },
  { icon: 'fa-plus', label: 'Post internship' },
  { icon: 'fa-user-check', label: 'Hire talent' },
];
