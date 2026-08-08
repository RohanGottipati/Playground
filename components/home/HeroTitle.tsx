"use client";

import { useEffect, useRef, useState } from "react";

const VARIANTS = ["desk", "street", "bus", "campus", "couch"];

function FlipWord({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);
  const [exiting, setExiting] = useState<string | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const prevText = useRef(text);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (text === prevText.current) return;
    setExiting(prevText.current);
    setDisplay(text);
    prevText.current = text;
    const timeout = setTimeout(() => setExiting(null), 500);
    return () => clearTimeout(timeout);
  }, [text]);

  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth);
    }
  }, [display]);

  return (
    <span
      className="relative inline-block overflow-hidden align-bottom transition-[width] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
      style={width !== null ? { width } : undefined}
    >
      <span ref={measureRef} className="invisible whitespace-nowrap">
        {display}
      </span>
      <span key={`in-${display}`} className="absolute inset-0 animate-flip-in">
        {display}
      </span>
      {exiting !== null && (
        <span key={`out-${exiting}`} className="absolute inset-0 animate-flip-out">
          {exiting}
        </span>
      )}
    </span>
  );
}

export function HeroTitle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % VARIANTS.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const word = VARIANTS[index];

  return (
    <h1 className="font-serif text-6xl font-normal leading-[1.1] text-paper sm:text-[5rem]">
      Turn the stuff on your <FlipWord text={word} />.
      <br />
      <em className="italic">Into a real game.</em>
    </h1>
  );
}
