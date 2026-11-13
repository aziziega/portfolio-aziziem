import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./styles/TerminalModal.css";
import { FiDownload, FiExternalLink, FiTerminal, FiX, FiMinimize2, FiMaximize2 } from "react-icons/fi";

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandHistory {
  command?: string;
  output: React.ReactNode;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTypingInitial, setIsTypingInitial] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setHistory([]);
      setIsTypingInitial(true);
      return;
    }

    // Auto-typing sequence on initial open
    let isCancelled = false;
    const initialLines: CommandHistory[] = [
      {
        command: "whoami",
        output: (
          <div className="terminal-res">
            <span className="text-highlight">Azizi Egatri Mu'thi</span> — Full-Stack Vibe Engineer
          </div>
        ),
      },
      {
        command: "cat profile.json",
        output: (
          <div className="terminal-code">
            {"{\n"}
            {"  "}
            <span className="code-key">"name"</span>: <span className="code-str">"Azizi Egatri Mu'thi"</span>,{"\n"}
            {"  "}
            <span className="code-key">"title"</span>: <span className="code-str">"AI & Full-Stack Developer"</span>,{"\n"}
            {"  "}
            <span className="code-key">"location"</span>: <span className="code-str">"Jakarta, Indonesia (GMT+7)"</span>,{"\n"}
            {"  "}
            <span className="code-key">"stack"</span>: [
            <span className="code-str">"Next.js"</span>, <span className="code-str">"TypeScript"</span>,{" "}
            <span className="code-str">"Three.js"</span>, <span className="code-str">"Supabase"</span>,{" "}
            <span className="code-str">"GSAP"</span>],{"\n"}
            {"  "}
            <span className="code-key">"status"</span>:{" "}
            <span className="code-green">"🟢 Available for high-impact opportunities"</span>
            {"\n}"}
          </div>
        ),
      },
      {
        command: "cv --get",
        output: (
          <div className="terminal-cv-card">
            <div className="terminal-cv-info">
              <span className="cv-icon">📄</span>
              <div>
                <div className="cv-name">CV-Azizi Egatri Mu'thi.pdf</div>
                <div className="cv-desc">Official Resume • Full-Stack & AI Engineer</div>
              </div>
            </div>
            <div className="terminal-cv-actions">
              <a
                href="/CV-Azizi%20Egatri%20Mu'thi.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="terminal-btn-primary"
                download="CV-Azizi-Egatri-Muthi.pdf"
              >
                <FiDownload /> Download CV
              </a>
              <a
                href="/CV-Azizi%20Egatri%20Mu'thi.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="terminal-btn-secondary"
              >
                <FiExternalLink /> Preview
              </a>
            </div>
          </div>
        ),
      },
    ];

    let timer: ReturnType<typeof setTimeout>;
    const runTyping = async () => {
      for (let i = 0; i < initialLines.length; i++) {
        if (isCancelled) break;
        await new Promise((res) => {
          timer = setTimeout(res, i === 0 ? 300 : 600);
        });
        if (isCancelled) break;
        setHistory((prev) => [...prev, initialLines[i]]);
      }
      setIsTypingInitial(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    runTyping();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    let res: React.ReactNode;
    switch (cmd) {
      case "help":
        res = (
          <div className="terminal-help">
            Available commands: <br />
            - <span className="cmd">whoami</span>: Display developer identity <br />
            - <span className="cmd">cv</span>: Download official CV / Resume <br />
            - <span className="cmd">projects</span>: View featured showcase projects <br />
            - <span className="cmd">skills</span>: Core tech stack overview <br />
            - <span className="cmd">contact</span>: Direct communication channels <br />
            - <span className="cmd">clear</span>: Clear terminal window <br />
            - <span className="cmd">exit</span>: Close this terminal
          </div>
        );
        break;
      case "whoami":
        res = (
          <div className="terminal-res">
            <span className="text-highlight">Azizi Egatri Mu'thi</span> — Full-Stack Vibe Engineer building modern digital experiences with Next.js, Three.js, and Agentic AI.
          </div>
        );
        break;
      case "cv":
        res = (
          <div className="terminal-res">
            <a
              href="/CV-Azizi%20Egatri%20Mu'thi.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-highlight inline-flex items-center gap-1"
              download
            >
              📄 Click here to download CV-Azizi Egatri Mu'thi.pdf
            </a>
          </div>
        );
        break;
      case "skills":
        res = (
          <div className="terminal-res">
            Core Technologies: Next.js, React, TypeScript, Node.js, PostgreSQL, Supabase, Three.js, GSAP, TailwindCSS, Docker, Antigravity CLI, Claude Code.
          </div>
        );
        break;
      case "projects":
        res = (
          <div className="terminal-res">
            Featured Projects: <br />
            1. LineUp Gym (Multi-tenant SaaS CRM) <br />
            2. FleetGem (Enterprise Logistics Platform) <br />
            3. E-Medical Record (Healthcare Clinic System) <br />
            4. IPM KUKAR Portal (Community CMS) <br />
            5. Liat Duit (Smart AI Finance Tracker)
          </div>
        );
        break;
      case "contact":
        res = (
          <div className="terminal-res">
            Email: <a href="mailto:aziziegatrim@gmail.com" className="text-highlight">aziziegatrim@gmail.com</a> <br />
            GitHub: <a href="https://github.com/aziziega" target="_blank" rel="noreferrer" className="text-highlight">github.com/aziziega</a> <br />
            LinkedIn: <a href="https://linkedin.com/in/aziziegatrim" target="_blank" rel="noreferrer" className="text-highlight">linkedin.com/in/aziziegatrim</a>
          </div>
        );
        break;
      case "clear":
        setHistory([]);
        setInputVal("");
        return;
      case "exit":
        onClose();
        return;
      default:
        res = (
          <div className="terminal-error">
            command not found: {cmd}. Type <span className="cmd">help</span> for a list of available commands.
          </div>
        );
    }

    setHistory((prev) => [...prev, { command: cmd, output: res }]);
    setInputVal("");
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="terminal-overlay" onClick={onClose}>
      <div className="terminal-window" onClick={(e) => e.stopPropagation()}>
        {/* macOS Title Bar */}
        <div className="terminal-header">
          <div className="terminal-traffic-lights">
            <button className="traffic-btn close" onClick={onClose} title="Close (ESC)">
              <FiX />
            </button>
            <button className="traffic-btn minimize" onClick={() => setHistory([])} title="Clear Screen">
              <FiMinimize2 />
            </button>
            <button className="traffic-btn maximize" title="Terminal Active">
              <FiMaximize2 />
            </button>
          </div>
          <div className="terminal-title">
            <FiTerminal className="inline mr-1 opacity-70" />
            azizi@workstation:~ (zsh) — developer resume & specs
          </div>
          <div className="terminal-header-spacer"></div>
        </div>

        {/* Terminal Body */}
        <div className="terminal-body" onClick={() => inputRef.current?.focus()}>
          <div className="terminal-banner">
            Welcome to Azizi's Developer Terminal & Resume Console [v2.4.0]
            <br />
            Type <span className="cmd">help</span> for available commands or download CV directly.
          </div>

          {history.map((item, idx) => (
            <div key={idx} className="terminal-entry">
              {item.command && (
                <div className="terminal-prompt-line">
                  <span className="prompt-host">azizi@macbook</span>
                  <span className="prompt-sep">:</span>
                  <span className="prompt-dir">~</span>
                  <span className="prompt-symbol">$</span>
                  <span className="prompt-cmd">{item.command}</span>
                </div>
              )}
              <div className="terminal-output">{item.output}</div>
            </div>
          ))}

          {!isTypingInitial && (
            <form onSubmit={handleCommand} className="terminal-input-form">
              <span className="prompt-host">azizi@macbook</span>
              <span className="prompt-sep">:</span>
              <span className="prompt-dir">~</span>
              <span className="prompt-symbol">$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="terminal-input"
                autoFocus
                spellCheck={false}
              />
            </form>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>,
    document.body
  );
};
