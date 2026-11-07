// Simple text splitter utility to replace GSAP SplitText
export class TextSplitter {
  chars: Element[] = [];
  words: Element[] = [];
  lines: Element[] = [];
  elements: Element[] = [];
  selector: string | Function;
  private originalHTML: Map<Element, string> = new Map();

  constructor(target: string | Element | NodeListOf<Element> | Element[], vars?: { type?: string; linesClass?: string }) {
    const type = vars?.type || "chars,words,lines";
    const linesClass = vars?.linesClass || "split-line";

    // Get elements
    let elements: Element[] = [];
    if (typeof target === "string") {
      elements = Array.from(document.querySelectorAll(target));
    } else if (target instanceof NodeList) {
      elements = Array.from(target);
    } else if (Array.isArray(target)) {
      elements = target;
    } else {
      elements = [target];
    }

    this.selector = typeof target === "string" ? target : "";
    this.elements = elements;

    elements.forEach((element) => {
      // Store original HTML for revert
      this.originalHTML.set(element, element.innerHTML);

      if (type.includes("chars") && type.includes("words")) {
        // Split into words first, then chars
        this.splitWords(element);
        this.splitCharsFromWords(element);
      } else if (type.includes("chars")) {
        this.splitChars(element);
      } else if (type.includes("words")) {
        this.splitWords(element);
      }

      if (type.includes("lines")) {
        this.splitLines(element, linesClass);
      }
    });
  }

  private splitChars(element: Element) {
    if (element.children.length > 0) {
      const splitTextNode = (node: Node) => {
        if (node.nodeType === 3) {
          const text = node.textContent || "";
          const frag = document.createDocumentFragment();
          for (const char of text) {
            if (char === " ") {
              const span = document.createElement("span");
              span.className = "split-char";
              span.innerHTML = "&nbsp;";
              frag.appendChild(span);
            } else if (char === "\n" || char === "\r" || char === "\t") {
              // skip extra whitespace
            } else {
              const span = document.createElement("span");
              span.className = "split-char";
              span.textContent = char;
              this.chars.push(span);
              frag.appendChild(span);
            }
          }
          node.parentNode?.replaceChild(frag, node);
        } else if (node.nodeType === 1) {
          Array.from(node.childNodes).forEach(splitTextNode);
        }
      };

      Array.from(element.childNodes).forEach(splitTextNode);
    } else {
      const text = element.textContent || "";
      const chars = text.split("");

      element.innerHTML = chars
        .map((char) => {
          if (char === " ") {
            return '<span class="split-char"> </span>';
          }
          if (char === "\n") {
            return "<br>";
          }
          return `<span class="split-char">${char}</span>`;
        })
        .join("");

      this.chars.push(...Array.from(element.querySelectorAll(".split-char")));
    }
  }

  private splitWords(element: Element) {
    const text = element.textContent || "";
    const words = text.split(/(\s+)/);

    element.innerHTML = words
      .map((word) => {
        if (word.trim().length === 0) {
          return word; // Preserve whitespace
        }
        return `<span class="split-word">${word}</span>`;
      })
      .join("");

    this.words.push(...Array.from(element.querySelectorAll(".split-word")));
  }

  private splitCharsFromWords(element: Element) {
    const words = element.querySelectorAll(".split-word");
    words.forEach((word) => {
      const text = word.textContent || "";
      const chars = text.split("");
      word.innerHTML = chars
        .map((char) => `<span class="split-char">${char}</span>`)
        .join("");
      this.chars.push(...Array.from(word.querySelectorAll(".split-char")));
    });
  }

  private splitLines(element: Element, linesClass: string) {
    // Use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      const items = element.querySelectorAll(".split-word, .split-char");
      if (items.length === 0) return;

      let currentLine: Element[] = [];
      let lines: Element[][] = [];
      let currentTop = 0;

      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        if (currentTop === 0) {
          currentTop = rect.top;
        }

        if (Math.abs(rect.top - currentTop) > 5) {
          // New line
          if (currentLine.length > 0) {
            lines.push([...currentLine]);
          }
          currentLine = [item];
          currentTop = rect.top;
        } else {
          currentLine.push(item);
        }
      });

      if (currentLine.length > 0) {
        lines.push(currentLine);
      }

      // Wrap lines
      lines.forEach((line) => {
        if (line.length === 0) return;
        const lineWrapper = document.createElement("span");
        lineWrapper.className = linesClass;
        lineWrapper.style.display = "block";
        const firstItem = line[0];
        firstItem.parentNode?.insertBefore(lineWrapper, firstItem);
        line.forEach((item) => {
          if (item.parentNode === lineWrapper.parentNode) {
            lineWrapper.appendChild(item);
          }
        });
      });

      this.lines.push(...Array.from(element.querySelectorAll(`.${linesClass}`)));
    });
  }

  revert() {
    this.elements.forEach((element) => {
      const original = this.originalHTML.get(element);
      if (original !== undefined) {
        element.innerHTML = original;
      }
    });
    this.chars = [];
    this.words = [];
    this.lines = [];
    this.originalHTML.clear();
  }
}

