// Everything on the site that isn't a case study lives here.
// Edit the text in this file and the pages update; the components rarely need changes.

export const profile = {
  name: "Brady Cai",
  title: "Software Engineer",
  intro:
    "I’m a software engineer studying computer science and business at Northeastern. I build full-stack products: dashboards, client websites, and AI tools that keep a person in the loop.",
  location: "Boston, MA",
  timeZone: "America/New_York",
  now: "Software Engineer Co-op at NExT Consulting",
  lookingFor: "Software engineering internships, May to August 2027",
  emails: [
    { label: "Personal", address: "bradycai26@gmail.com" },
    { label: "School", address: "cai.br@northeastern.edu" },
  ],
  github: "https://github.com/bradycai",
  linkedin: "https://www.linkedin.com/in/bradycai/",
  sourceRepo: "https://github.com/bradycai/Website-Portfolio",
};

export const primaryEmail = profile.emails[0].address;

export type Role = {
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  period: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  stack: string[];
  caseStudy?: string;
};

export const experience: Role[] = [
  {
    role: "Software Engineer Co-op",
    company: "NExT Consulting",
    location: "Boston, MA",
    period: "Sep 2026 – Present",
    current: true,
    summary:
      "I work on RepoPulse, a platform professors and TAs use to follow student GitHub repositories, commit histories, and contributors from one dashboard.",
    highlights: [
      "Build and refine responsive dashboard views in React, TypeScript, and Tailwind CSS, across repository pages, admin tools, and commit analytics.",
      "Integrated AI-assisted analysis that summarizes each student's development activity and labels commits as substantive or logistical, so instructors can judge contribution quality at a glance.",
      "Onboarded to Odyssey, a Next.js and Strapi learning platform that organizes course material into modular “droplets.”",
      "Ship UI improvements and bug fixes from tickets, on feature branches with code review.",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Strapi"],
  },
  {
    role: "Full-Stack Web Development Intern",
    company: "Frogs Videography",
    companyUrl: "https://frogsvideography.com",
    location: "Remote",
    period: "Jul – Sep 2026",
    summary:
      "Designed and built a new website for a Massachusetts and Rhode Island video production company, replacing their Squarespace site.",
    highlights: [
      "Built the site in Astro, JavaScript, HTML, and CSS: service sections, image galleries, mobile layouts, navigation, and an ROI calculator.",
      "Moved hosting to Netlify and configured the custom domain, DNS records, redirects, HTTPS, and production deploys.",
      "Provided ongoing technical support for account access, domain settings, site issues, and integrations.",
    ],
    stack: ["Astro", "JavaScript", "CSS", "Netlify"],
    caseStudy: "frogs-videography",
  },
];

export const education = {
  school: "Northeastern University",
  college: "Khoury College of Computer Sciences",
  degree: "B.S. in Computer Science and Business",
  graduation: "Expected May 2028",
  coursework: [
    "Object-Oriented Design",
    "Algorithms and Data",
    "Computer Systems",
    "Discrete Structures",
    "Foundations of Data Science",
    "Fundamentals of Computer Science",
    "Introduction to Databases",
    "Machine Learning and Data Mining",
  ],
};

export const skills = [
  { group: "Languages", items: ["Java", "Python", "JavaScript", "TypeScript", "Swift", "SQL", "HTML", "CSS", "C", "Assembly", "Racket", "LaTeX"] },
  { group: "Frameworks", items: ["React", "Next.js", "Node.js", "FastAPI", "Flask", "Astro", "Tailwind CSS", "SwiftUI", "REST APIs"] },
  { group: "Data and testing", items: ["NumPy", "Pandas", "Seaborn", "Plotly", "SQLite", "JUnit", "JavaFX"] },
  { group: "Tools", items: ["Git and GitHub", "VS Code", "IntelliJ", "PyCharm", "Eclipse", "Jupyter", "Xcode", "Netlify", "Strapi", "Claude API", "Alpaca API", "Excel"] },
  { group: "Concepts", items: ["Object-oriented design", "API design", "Asynchronous programming", "Full-stack architecture", "LLM integration"] },
];

// Smaller projects, shown as a list below the case studies.
export const moreProjects = [
  {
    name: "RepoPulse",
    description: "Dashboard for reviewing student repos and individual contributions in group projects",
    meta: "Team project, NExT Consulting",
    stack: "React, FastAPI, PostgreSQL",
    url: "https://github.com/bradycai/RepoPulse",
  },
  {
    name: "ChronoCal",
    description: "Calendar app with recurring event series and multiple calendars, built MVC with a Swing GUI",
    meta: "Object-Oriented Design",
    stack: "Java, Swing, JUnit",
    url: "https://github.com/bradycai/ChronoCal",
  },
  {
    name: "CoinTrack",
    description: "iOS budgeting app for tracking spending by category, with charts and history",
    meta: "iOS app",
    stack: "Swift, SwiftUI",
    url: "https://github.com/bradycai/CoinTrack",
  },
];
