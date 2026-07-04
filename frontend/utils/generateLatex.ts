export function generateLatex(data: any): string {
  // Escape latex special characters
  const escapeLatex = (str: string) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "\\&")
      .replace(/%/g, "\\%")
      .replace(/\$/g, "\\$")
      .replace(/#/g, "\\#")
      .replace(/_/g, "\\_")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/~/g, "\\textasciitilde{}")
      .replace(/\^/g, "\\textasciicircum{}")
      .replace(/\\/g, "\\textbackslash{}");
  };

  const name = escapeLatex(data.name || "SHAURYA MISHRA").toUpperCase();
  
  // Format Skills
  const skillsStr = data.skills ? escapeLatex(data.skills.join(", ")) : "";
  const skillsSection = skillsStr ? `\\section*{Skills}\n\\textbf{Technical Skills:} ${skillsStr}\\\\` : "";

  // Format Experience
  let experienceSection = "";
  if (data.experience && data.experience.length > 0) {
    experienceSection = "\\section*{Experience}\n\n";
    data.experience.forEach((exp: any) => {
      experienceSection += `\\textbf{${escapeLatex(exp.role)}} \\hfill ${escapeLatex(exp.company)}\\\\\n`;
      if (exp.duration) {
        experienceSection += `\\textit{${escapeLatex(exp.duration)}}\\\\\n`;
      }
      experienceSection += `\\begin{itemize}\n`;
      experienceSection += `    \\item ${escapeLatex(exp.description)}\n`;
      experienceSection += `\\end{itemize}\n\n\\vspace{0.15cm}\n\n`;
    });
  }

  // Format Projects
  let projectsSection = "";
  if (data.projects && data.projects.length > 0) {
    projectsSection = "\\section*{Projects}\n\n";
    data.projects.forEach((proj: any) => {
      projectsSection += `\\textbf{${escapeLatex(proj.title)}}\\\\\n`;
      if (proj.technologies) {
        const techStr = Array.isArray(proj.technologies) ? proj.technologies.join(", ") : proj.technologies;
        projectsSection += `\\textit{Tech Stack: ${escapeLatex(techStr)}}\\\\\n`;
      }
      projectsSection += `\\begin{itemize}\n`;
      projectsSection += `    \\item ${escapeLatex(proj.description)}\n`;
      projectsSection += `\\end{itemize}\n\n\\vspace{0.15cm}\n\n`;
    });
  }

  // Format Education
  let educationSection = "";
  if (data.education && data.education.length > 0) {
    educationSection = "\\section*{Education}\n\n";
    data.education.forEach((edu: any) => {
      educationSection += `\\textbf{${escapeLatex(edu.degree)}} \\hfill ${escapeLatex(edu.year || "")}\\\\\n`;
      educationSection += `${escapeLatex(edu.institution)}\\\\\n\n\\vspace{0.1cm}\n\n`;
    });
  }

  return `\\documentclass[11pt,a4paper]{article}

%==================== PACKAGES ====================%
\\usepackage[left=1.0cm, right=1.0cm, top=1.0cm, bottom=1.0cm]{geometry}
\\usepackage{enumitem}
\\usepackage[colorlinks=true, linkcolor=blue, urlcolor=blue]{hyperref}
\\usepackage{titlesec}
\\usepackage{fontawesome5}
\\usepackage{mathptmx} % Times New Roman font

%==================== FORMATTING ====================%
\\setlength{\\parindent}{0pt}
\\setlist[itemize]{noitemsep, topsep=1pt, parsep=1.5pt, partopsep=0pt, leftmargin=15pt}

% Section heading format
\\titleformat{\\section}
  {\\fontsize{12}{14}\\selectfont\\bfseries}
  {}
  {0em}
  {}
  [\\titlerule]

\\titlespacing*{\\section}{0pt}{1.2ex}{0.8ex}

\\begin{document}

%==================== HEADER ====================%
\\begin{center}
    {\\fontsize{18}{20}\\selectfont \\textbf{${name}}}\\\\[4pt]
    \\small Prayagraj, Uttar Pradesh, India \\;|\\;
    \\faPhone\\ +91 77558 98628 \\;|\\;
    \\faEnvelope\\ \\href{mailto:mishrashaurya2008@gmail.com}{mishrashaurya2008@gmail.com}\\\\
    \\faLinkedin\\ \\href{https://www.linkedin.com/in/shaurya-mishra-33a564370/}{LinkedIn} \\;|\\;
    \\faGithub\\ \\href{https://github.com/Shaurya001-web}{GitHub} \\;|\\;
    \\faCode\\ \\href{https://leetcode.com/u/MrRabbit_011/}{LeetCode}
\\end{center}

\\vspace{-0.1cm}

%==================== CAREER OBJECTIVE ====================%
\\section*{Career Objective}
\\small Execution-focused Computer Science and Engineering student specializing in AI/ML and Full-Stack development. Possesses hands-on technical expertise building multi-agent AI systems, production-style backend APIs, structured data pipelines, and NLP classifiers. Proficient in Next.js, FastAPI, Supabase, and machine learning frameworks. Seeking an engineering internship to contribute to active repositories and deploy scalable software solutions.

%==================== EDUCATION ====================%
${educationSection || `\\section*{Education}

\\textbf{Bachelor of Engineering in Computer Science \\& Engineering (AI \\& ML)} \\hfill (2025--2029)\\\\
Chandigarh University, Mohali, Punjab \\hfill SGPA: 7.63 / 10.0

\\vspace{0.1cm}

\\textbf{Senior Secondary Education (Class XII) --- CBSE Board} \\hfill (2024--2025)\\\\
Sadhguru Public Hr. Secondary School, Uttar Pradesh \\hfill Percentage: 73\\%

\\vspace{0.1cm}

\\textbf{Secondary Education (Class X) --- CBSE Board} \\hfill (2022--2023)\\\\
Sadhguru Public Hr. Secondary School, Uttar Pradesh \\hfill Percentage: 86\\%`}

%==================== PROJECTS ====================%
${projectsSection}

%==================== SKILLS ====================%
${skillsSection}

%==================== ACHIEVEMENTS ====================%
\\section*{Achievements}
\\begin{itemize}
    \\item Selected for the \\textbf{Data Science / AI Engineer} internship selection track at Unessa Foundation through a competitive profile screening on Internshala (May 2026).
    \\item Contributed to an open-source \\textbf{Google Summer of Code (GSoC)} organization repository by submitting a verified pull request.
\\end{itemize}

%==================== CERTIFICATIONS ====================%
\\section*{Certifications}
\\begin{itemize}
    \\item Microsoft Certified: Azure AI Fundamentals (AI-900) --- Microsoft
    \\item Programming Foundations with JavaScript, HTML and CSS --- Duke University
    \\item Introduction to Artificial Intelligence --- Intel Corporation
    \\item Generative Artificial Intelligence --- LinkedIn
\\end{itemize}

\\end{document}
`;
}
