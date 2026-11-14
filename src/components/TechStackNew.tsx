import "./styles/TechStackNew.css";
import { soundFx } from "../utils/soundEffects";

interface TechItem {
  name: string;
  icon: string;
  url: string;
}

// Tech stack items - Balanced inverted pyramid: 8 -> 6 -> 5 -> 3 (22 items)
const techStack: TechItem[][] = [
  // Row 1 - 8 items: Core Web & Frontend Ecosystem
  [
    { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg", url: "https://nextjs.org" },
    { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg", url: "https://typescriptlang.org" },
    { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", url: "https://react.dev" },
    { name: "HTML", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { name: "CSS", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { name: "Tailwind", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg", url: "https://tailwindcss.com" },
    { name: "Vite", icon: "/images/vite.svg", url: "https://vite.dev" },
  ],
  // Row 2 - 6 items: Database, Backend Infrastructure & Cloud
  [
    { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", url: "https://nodejs.org" },
    { name: "PostgreSQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg", url: "https://postgresql.org" },
    // { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg", url: "https://mysql.com" },
    { name: "Supabase", icon: "/images/supabase.svg", url: "https://supabase.com" },
    { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg", url: "https://docker.com" },
    { name: "AWS", icon: "/images/aws.svg", url: "https://aws.amazon.com" },
    { name: "Vercel", icon: "/images/vercel.svg", url: "https://vercel.com" },
  ],
  // Row 3 - 5 items: Version Control, OS & Deployment
  [
    { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg", url: "https://git-scm.com" },
    { name: "GitHub", icon: "/images/github.svg", url: "https://github.com" },
    { name: "GitLab", icon: "/images/gitlab.svg", url: "https://gitlab.com" },
    { name: "Linux", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg", url: "https://linux.org" },
  ],
  // Row 4 - 3 items: AI & Next-Gen Workflows (Puncak Piramida)
  [
    { name: "Antigravity", icon: "/images/antigravity.png", url: "https://antigravity.google/" },
    { name: "Claude", icon: "/images/claude.png", url: "https://claude.ai" },
    { name: "ChatGPT", icon: "/images/chatgpt.svg", url: "https://chatgpt.com" },
  ],
];

const TechStackNew = () => {
  return (
    <div className="techstack-new">
      {/* Video Background */}
      <div className="techstack-video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="techstack-video"
        >
          <source src="/video/video.webm" type="video/webm" />
        </video>
        {/* Dark Overlay */}
        <div className="techstack-overlay"></div>
      </div>

      {/* Content */}
      <div className="techstack-content">
        <h2>Tech Stack</h2>

        <div className="techstack-pyramid">
          {techStack.map((row, rowIndex) => (
            <div key={rowIndex} className="techstack-row">
              {row.map((tech, techIndex) => (
                <a
                  key={techIndex}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="techstack-item"
                  title={tech.name}
                  data-cursor="disable"
                  onClick={() => soundFx.playClick(1.05)}
                >
                  <img src={tech.icon} alt={tech.name} loading="lazy" decoding="async" />
                  <span>{tech.name}</span>
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* GitHub Contribution Snake - Hardware Chassis (Option A) */}
        <div className="techstack-snake-container">
          <a
            href="https://github.com/aziziega"
            target="_blank"
            rel="noopener noreferrer"
            className="snake-chassis"
            title="Explore @aziziega on GitHub"
            data-cursor="disable"
          >
            <div className="snake-chassis-header">
              <div className="snake-chassis-label">
                <span className="chassis-dot"></span>
                <span>GITHUB_CONTRIBUTIONS // 2025-2026</span>
              </div>
              <div className="snake-chassis-link">
                <span>github.com/aziziega</span>
                <span className="chassis-arrow">↗</span>
              </div>
            </div>

            <div className="snake-chassis-canvas">
              <picture>
                <source
                  media="(prefers-color-scheme: dark)"
                  srcSet="https://raw.githubusercontent.com/aziziega/aziziega/output/github-contribution-grid-snake-dark.svg"
                />
                <source
                  media="(prefers-color-scheme: light)"
                  srcSet="https://raw.githubusercontent.com/aziziega/aziziega/output/github-contribution-grid-snake.svg"
                />
                <img
                  alt="github contribution grid snake animation"
                  src="https://raw.githubusercontent.com/aziziega/aziziega/output/github-contribution-grid-snake-dark.svg"
                  className="snake-image"
                  loading="lazy"
                />
              </picture>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TechStackNew;
