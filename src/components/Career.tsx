import "./styles/Career.css";
import { config } from "../config";
import { lenis } from "./Navbar";

const getDisplayYear = (period: string) => {
  if (period.includes("Present")) return "NOW";
  if (period.includes(" - ")) {
    return period.split(" - ")[0]; // Show start year for ranges
  }
  return period; // Single year like "2021"
};

const Career = () => {
  const handleInternalClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    const target = document.querySelector(url) as HTMLElement | null;
    if (target) {
      if (lenis) {
        lenis.scrollTo(target, {
          offset: 0,
          duration: 1.2,
        });
      } else {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {config.experiences.map((exp, index) => {
            const isInternal = Boolean(exp.url && exp.url.startsWith("#"));

            return (
              <div key={index} className="career-info-box">
                <div className="career-info-in">
                  <div className="career-role">
                    <h4>{exp.position}</h4>
                    {exp.url ? (
                      <a
                        href={exp.url}
                        target={isInternal ? undefined : "_blank"}
                        rel={isInternal ? undefined : "noopener noreferrer"}
                        className="career-company-link"
                        data-cursor="disable"
                        onClick={isInternal ? (e) => handleInternalClick(e, exp.url!) : undefined}
                      >
                        <h5>
                          {exp.company}
                          <span className={`career-company-arrow ${isInternal ? "is-down" : ""}`}>
                            {isInternal ? "↓" : "↗"}
                          </span>
                        </h5>
                      </a>
                    ) : (
                      <h5>{exp.company}</h5>
                    )}
                  </div>
                  <h3>{getDisplayYear(exp.period)}</h3>
                </div>
                <div className="career-info-desc">
                  {exp.location && (
                    <span className="career-location">{exp.location}</span>
                  )}
                  <p>{exp.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Career;
