"use client";

import { useEffect, useRef, useState } from "react";
import type { Faq } from "@/types";

function FaqItem({ item, defaultOpen = false }: { item: Faq; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = answerRef.current;
    if (!node) return;
    node.style.maxHeight = isOpen ? `${node.scrollHeight}px` : "0px";
  }, [isOpen]);

  return (
    <div className={isOpen ? "faq-item open" : "faq-item"}>
      <button
        className="faq-item__q"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
      >
        <span>{item.question}</span>
        <span className="ico">+</span>
      </button>
      <div className="faq-item__a" ref={answerRef} style={defaultOpen ? { maxHeight: 200 } : undefined}>
        <p>{item.answer}</p>
      </div>
    </div>
  );
}

export function FaqAccordion({ items, defaultOpenIndex }: { items: Faq[]; defaultOpenIndex?: number }) {
  return (
    <div>
      {items.map((item, i) => (
        <FaqItem key={item.question} item={item} defaultOpen={i === defaultOpenIndex} />
      ))}
    </div>
  );
}
