export interface Course {
  id: string;
  name: string;
  shortDescription: string;
  tags: string[];
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
}

export const LEARNERS_TRACK_COURSES: Course[] = [
  {
    id: "full-stack-web-dev",
    name: "Full Stack Web Development",
    shortDescription: "Master MERN stack, Next.js, System Design, and build 6+ industry projects with guaranteed placement assistance.",
    tags: ["React", "Node.js", "MongoDB", "TypeScript", "Next.js", "Web Development"],
    duration: "16 Weeks",
    level: "All Levels"
  },
  {
    id: "data-analytics",
    name: "Data Analytics & Business Intelligence",
    shortDescription: "Learn SQL, Power BI, Advanced Excel, Python & Tableau to uncover business insights and get job-ready.",
    tags: ["SQL", "Power BI", "Excel", "Python", "Tableau", "Analytics"],
    duration: "12 Weeks",
    level: "Beginner"
  },
  {
    id: "python-programming",
    name: "Python Programming Mastery",
    shortDescription: "From core fundamentals to OOP, automation, data structures, and backend APIs with FastAPI & Django.",
    tags: ["Python", "Backend", "Data Structures", "APIs", "Automation"],
    duration: "8 Weeks",
    level: "Beginner"
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing & Growth",
    shortDescription: "Performance marketing, SEO, Google & Meta Ads, Content Strategy, and Analytics for high-growth startups.",
    tags: ["SEO", "Google Ads", "Meta Ads", "Content Marketing", "Growth"],
    duration: "10 Weeks",
    level: "All Levels"
  },
  {
    id: "software-testing",
    name: "Software Testing & QA Automation",
    shortDescription: "Master manual testing fundamentals, Selenium, Cypress, API testing with Postman, and CI/CD pipelines.",
    tags: ["Manual Testing", "Selenium", "Cypress", "Postman", "Automation QA"],
    duration: "10 Weeks",
    level: "Beginner"
  },
  {
    id: "resume-interview-skills",
    name: "Resume & Interview Skills Bootcamp",
    shortDescription: "1-on-1 mock interviews, ATS resume optimization, salary negotiation, and LinkedIn personal branding.",
    tags: ["Soft Skills", "Interviews", "Resume", "LinkedIn", "Career Prep"],
    duration: "3 Weeks",
    level: "All Levels"
  },
  {
    id: "human-resource-management",
    name: "Human Resource Management",
    shortDescription: "Practical talent acquisition, HR tech, payroll compliance, POSH, and employee relations for modern HR careers.",
    tags: ["HR", "Recruitment", "Talent Acquisition", "Payroll", "Compliance"],
    duration: "8 Weeks",
    level: "Beginner"
  }
];
