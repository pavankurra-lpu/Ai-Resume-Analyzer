export interface RoleDefinition {
  title: string;
  category: "tech" | "non-tech";
  aliases: string[];
  coreKeywords: string[];
  toolsAndTech: string[];
}

export const TARGET_ROLES: RoleDefinition[] = [
  {
    title: "Full Stack Developer",
    category: "tech",
    aliases: ["Full Stack Engineer", "Fullstack Developer", "MERN Developer", "Full Stack Web Developer"],
    coreKeywords: ["REST API", "Database Design", "Authentication", "Full Stack", "CRUD", "State Management", "Microservices", "Responsive Design"],
    toolsAndTech: ["React", "Node.js", "TypeScript", "JavaScript", "Express", "MongoDB", "PostgreSQL", "Next.js", "Docker", "Git", "Tailwind CSS", "Redux"],
  },
  {
    title: "Frontend Developer",
    category: "tech",
    aliases: ["Front End Developer", "UI Developer", "React Developer", "Web Developer", "Frontend Engineer"],
    coreKeywords: ["Responsive Web Design", "UI/UX", "State Management", "DOM Manipulation", "Cross-browser Compatibility", "Accessibility", "Web Performance"],
    toolsAndTech: ["React", "HTML5", "CSS3", "JavaScript", "TypeScript", "Tailwind CSS", "Next.js", "Redux", "Webpack", "Vite", "Figma", "Git"],
  },
  {
    title: "Backend Developer",
    category: "tech",
    aliases: ["Back End Developer", "Server Engineer", "Node.js Developer", "Java Developer", "Python Developer", "API Developer"],
    coreKeywords: ["RESTful APIs", "Database Optimization", "Microservices", "Data Modeling", "Server Architecture", "Caching", "Security", "Scalability"],
    toolsAndTech: ["Node.js", "Express", "Python", "Django", "Java", "Spring Boot", "PostgreSQL", "MongoDB", "Redis", "Docker", "SQL", "Git", "AWS"],
  },
  {
    title: "Data Analyst",
    category: "tech",
    aliases: ["Business Intelligence Analyst", "BI Analyst", "Junior Data Analyst"],
    coreKeywords: ["Data Visualization", "Exploratory Data Analysis", "Statistical Modeling", "Dashboarding", "ETL", "Reporting", "Insights", "Data Cleansing"],
    toolsAndTech: ["SQL", "Python", "Excel", "Power BI", "Tableau", "Pandas", "NumPy", "Matplotlib", "Seaborn", "R", "Git"],
  },
  {
    title: "Data Scientist / Machine Learning Engineer",
    category: "tech",
    aliases: ["Data Scientist", "ML Engineer", "AI Engineer", "Deep Learning Engineer"],
    coreKeywords: ["Machine Learning", "Model Training", "Deep Learning", "Predictive Analytics", "Feature Engineering", "NLP", "Computer Vision", "Model Deployment"],
    toolsAndTech: ["Python", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "Keras", "SQL", "Docker", "Hugging Face", "OpenCV"],
  },
  {
    title: "DevOps / Cloud Engineer",
    category: "tech",
    aliases: ["Cloud Engineer", "Site Reliability Engineer", "SRE", "DevOps Engineer", "Infrastructure Engineer"],
    coreKeywords: ["CI/CD", "Infrastructure as Code", "Containerization", "Cloud Architecture", "Monitoring", "Automated Deployment", "High Availability"],
    toolsAndTech: ["Docker", "Kubernetes", "AWS", "GitHub Actions", "Terraform", "Linux", "Jenkins", "Ansible", "Prometheus", "Grafana", "Bash", "Git"],
  },
  {
    title: "Mobile App Developer",
    category: "tech",
    aliases: ["Android Developer", "iOS Developer", "React Native Developer", "Flutter Developer", "Mobile Engineer"],
    coreKeywords: ["Mobile UI", "App Lifecycle", "Push Notifications", "Offline Storage", "API Integration", "App Store Deployment", "Performance Optimization"],
    toolsAndTech: ["React Native", "Flutter", "Android Studio", "Kotlin", "Swift", "Java", "Firebase", "Redux", "TypeScript", "Git"],
  },
  {
    title: "QA / Automation Test Engineer",
    category: "tech",
    aliases: ["Software Tester", "Test Automation Engineer", "Quality Assurance Engineer", "SDET"],
    coreKeywords: ["Automated Testing", "Test Cases", "Regression Testing", "Bug Reporting", "API Testing", "End-to-End Testing", "Integration Testing"],
    toolsAndTech: ["Selenium", "Cypress", "Postman", "Jest", "JUnit", "Playwright", "Python", "JavaScript", "Jira", "Git"],
  },
  {
    title: "UI/UX Designer",
    category: "tech",
    aliases: ["Product Designer", "User Experience Designer", "User Interface Designer", "Visual Designer"],
    coreKeywords: ["Wireframing", "Prototyping", "User Research", "Design Systems", "Usability Testing", "Information Architecture", "User Personas"],
    toolsAndTech: ["Figma", "Adobe XD", "Sketch", "InVision", "Miro", "HTML/CSS Basics", "Design Tokens"],
  },
  {
    title: "Product Manager",
    category: "non-tech",
    aliases: ["Associate Product Manager", "Junior PM", "Product Owner"],
    coreKeywords: ["Roadmapping", "Product Strategy", "User Stories", "Agile/Scrum", "Market Research", "Feature Prioritization", "Stakeholder Management", "KPIs"],
    toolsAndTech: ["Jira", "Confluence", "Notion", "Mixpanel", "Google Analytics", "Figma", "Trello", "SQL Basics"],
  },
  {
    title: "Cybersecurity Analyst",
    category: "tech",
    aliases: ["Information Security Analyst", "Security Engineer", "SOC Analyst"],
    coreKeywords: ["Vulnerability Assessment", "Threat Detection", "Network Security", "Incident Response", "Penetration Testing", "Compliance", "Security Auditing"],
    toolsAndTech: ["Wireshark", "Nmap", "Metasploit", "Burp Suite", "Linux", "Python", "SIEM", "Firewalls", "Splunk"],
  },
  {
    title: "Business Analyst",
    category: "non-tech",
    aliases: ["Business Systems Analyst", "Functional Analyst", "Junior Business Analyst"],
    coreKeywords: ["Requirements Gathering", "Process Modeling", "Gap Analysis", "Stakeholder Communication", "Business Process Optimization", "Functional Specifications"],
    toolsAndTech: ["Excel", "SQL", "Power BI", "Tableau", "Jira", "Visio", "Lucidchart", "Word"],
  },
  {
    title: "Digital Marketing Specialist",
    category: "non-tech",
    aliases: ["SEO Specialist", "Content Marketer", "Growth Marketer", "Social Media Marketer"],
    coreKeywords: ["Search Engine Optimization", "Content Marketing", "Campaign Management", "Conversion Rate Optimization", "Social Media Strategy", "Email Marketing", "PPC"],
    toolsAndTech: ["Google Analytics", "Google Ads", "SEMrush", "Meta Ads Manager", "Mailchimp", "Canva", "WordPress", "HubSpot"],
  },
  {
    title: "Embedded Systems Engineer",
    category: "tech",
    aliases: ["Firmware Engineer", "IoT Engineer", "Hardware Engineer"],
    coreKeywords: ["Microcontroller Programming", "RTOS", "Circuit Design", "Firmware Development", "Hardware Debugging", "I2C/SPI Protocols"],
    toolsAndTech: ["C", "C++", "Arduino", "Raspberry Pi", "STM32", "MATLAB", "Keil", "Linux", "Git"],
  },
];

export function findRoleDefinition(targetRole?: string): RoleDefinition | undefined {
  if (!targetRole) return undefined;
  const clean = targetRole.trim().toLowerCase();

  for (const role of TARGET_ROLES) {
    if (role.title.toLowerCase() === clean) return role;
    if (role.aliases.some((a) => a.toLowerCase() === clean)) return role;
  }

  // Partial match fallback
  for (const role of TARGET_ROLES) {
    if (clean.includes(role.title.toLowerCase()) || role.title.toLowerCase().includes(clean)) {
      return role;
    }
    for (const a of role.aliases) {
      if (clean.includes(a.toLowerCase()) || a.toLowerCase().includes(clean)) {
        return role;
      }
    }
  }

  return undefined;
}

export function isTechRole(targetRole?: string): boolean {
  const role = findRoleDefinition(targetRole);
  if (!role) return true; // Default to tech
  return role.category === "tech";
}
