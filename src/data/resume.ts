// The printable résumé at /resume/. Wording follows Brady's PDF résumé.
// The phone number is deliberately left off: this page is public.
import { education } from "./profile";

export const resume = {
  availability: "May – August 2027",
  education: {
    school: "Northeastern University, Khoury College of Computer Sciences",
    location: "Boston, MA",
    degree: "Bachelor of Science in Computer Science and Business",
    date: "Expected May 2028",
    coursework: education.coursework,
  },
  experience: [
    {
      role: "Software Engineer Co-op",
      company: "NExT Consulting",
      location: "Boston, MA",
      period: "Sep 2026 – Present",
      bullets: [
        "Contributed to RepoPulse, a full-stack platform that helps professors and teaching assistants monitor and manage student GitHub repositories, commit histories, contributors, and project activity from a centralized dashboard.",
        "Developed and refined responsive dashboard interfaces using React, TypeScript, and Tailwind CSS, improving navigation and usability across student repository views, administrative tools, and commit analytics.",
        "Integrated AI-assisted repository analysis that summarizes student development activity and categorizes Git commits as substantive or logistical, helping instructors quickly evaluate contribution quality and project progress.",
        "Collaborated with a software engineering team using Git/GitHub, feature branches, code reviews, and ticket-based development to implement UI enhancements, resolve bugs, and iterate on client requirements.",
        "Onboarded to Odyssey, a full-stack learning platform built with Next.js and Strapi that organizes course content into modular “droplets” and provides students with structured access to academic resources and assignments.",
      ],
    },
    {
      role: "Full-Stack Web Development Intern",
      company: "Frogs Videography",
      location: "Remote",
      period: "Jul 2026 – Sep 2026",
      bullets: [
        "Designed and developed a responsive company website using Astro, JavaScript, HTML, and CSS to replace the business’s previous Squarespace website.",
        "Built interactive service sections, image galleries, mobile-friendly layouts, navigation components, and an ROI calculator to improve usability and customer engagement.",
        "Migrated the company’s website to Netlify and configured the custom domain, DNS records, redirects, HTTPS certificate, and production deployment settings.",
        "Provided ongoing technical support by troubleshooting account access, domain settings, website issues, integrations, and other technology-related problems affecting daily operations.",
      ],
    },
  ],
  projects: [
    {
      name: "OrderSync",
      note: "1st Place – AINU Hackathon",
      period: "Sep 2026",
      bullets: [
        "Won a Misneach-sponsored AINU hackathon challenge, earning $700 in team prizes for developing an AI-assisted e-commerce operations platform.",
        "Built a centralized dashboard for monitoring orders across Shopify, TikTok Shop, Amazon, and eBay, including fulfillment status, shipping deadlines, and operational issues.",
        "Developed a “Needs Attention” system that detects delayed or problematic orders and prioritizes critical issues.",
        "Integrated AI-assisted issue resolution to handle lower-priority cases and escalate more complex problems for human review and approval.",
      ],
    },
    {
      name: "AI Trading Automation System",
      note: "Python, React, Alpaca API, Claude API, Market Data",
      period: "Jan 2026 – Jun 2026",
      bullets: [
        "Built an automated trading platform that monitors a live stock watchlist, evaluates market triggers, and uses AI-assisted analysis to generate structured BUY, HOLD, SELL, WATCH, or AVOID recommendations.",
        "Designed a risk engine that checks maximum open positions, stop-loss rules, and confidence before trades execute.",
        "Connected the system to Alpaca Paper Trading for automated order execution, broker-side protective stop-losses, portfolio updates, open-position tracking, and real-time trade monitoring.",
        "Implemented dynamic position management with partial profit-taking logic, confidence tracking, automated sell conditions, and dashboard logs for every recommendation, rejection, or order.",
      ],
    },
  ],
  skills: [
    { label: "Languages", items: "Java, Python, JavaScript, TypeScript, Swift, SQL, HTML, CSS, C, Assembly, Racket, LaTeX" },
    { label: "Frameworks/Technologies", items: "React, Node.js, SwiftUI, Flask, REST APIs, Next.js, FastAPI, Astro, Tailwind CSS" },
    { label: "Libraries/Databases", items: "JUnit, JavaFX, NumPy, Pandas, Seaborn, Plotly, SQLite" },
    { label: "Tools", items: "Git/GitHub, VS Code, IntelliJ, Eclipse, PyCharm, Jupyter, Xcode, Netlify, Excel, Strapi, Alpaca API, Claude API" },
    { label: "Concepts", items: "Object-Oriented Design, API Design, Asynchronous Programming, Full-Stack Web Architecture, LLM Integration" },
  ],
};
