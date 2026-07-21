import type { SVGProps } from "react";

export function PipFirefly({ className = "", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} animate-pip`} {...props}>
      <ellipse cx="32" cy="52" rx="14" ry="3" fill="#25231E" opacity="0.08" />
      <circle cx="32" cy="30" r="16" fill="#FFD765" stroke="#25231E" strokeWidth="2" />
      <circle cx="26" cy="27" r="3" fill="#25231E" />
      <circle cx="38" cy="27" r="3" fill="#25231E" />
      <circle cx="27" cy="26" r="1" fill="white" />
      <circle cx="39" cy="26" r="1" fill="white" />
      <path d="M25 36 Q32 40 39 36" stroke="#25231E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M14 22 Q6 16 10 8 Q18 12 20 20 Z" fill="#DCCEFF" stroke="#25231E" strokeWidth="1.5" />
      <path d="M50 22 Q58 16 54 8 Q46 12 44 20 Z" fill="#DCCEFF" stroke="#25231E" strokeWidth="1.5" />
      <circle cx="48" cy="14" r="2" fill="#FF7658" />
      <circle cx="16" cy="14" r="2" fill="#4FA66A" />
    </svg>
  );
}

export function MagnifierDoodle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="8" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <path d="M30 30 L42 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function AtomDoodle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <ellipse cx="24" cy="24" rx="20" ry="8" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-60 24 24)" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="24" r="4" fill="currentColor" />
    </svg>
  );
}

export function StarBurst(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <path d="M20 2 L23 17 L38 20 L23 23 L20 38 L17 23 L2 20 L17 17 Z" fill="currentColor" />
    </svg>
  );
}

export function ArrowScribble(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 60" fill="none" {...props}>
      <path d="M6 32 C 30 8, 70 8, 100 30 M100 30 L92 22 M100 30 L94 40"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function GlassBoxHero(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 480 420" fill="none" {...props}>
      {/* base shadow */}
      <ellipse cx="240" cy="390" rx="180" ry="14" fill="#25231E" opacity="0.08" />
      {/* glass box */}
      <rect x="60" y="60" width="360" height="280" rx="24" fill="white" stroke="#25231E" strokeWidth="2.5" />
      <rect x="60" y="60" width="360" height="280" rx="24" fill="url(#glassShine)" opacity="0.6" />
      <defs>
        <linearGradient id="glassShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#DCCEFF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFD765" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      {/* gears */}
      <g transform="translate(240 200)">
        <g className="animate-machine">
          <circle r="42" fill="#FFF6E5" stroke="#25231E" strokeWidth="2" />
          <circle r="8" fill="#25231E" />
          {[0,45,90,135,180,225,270,315].map((a,i)=>(
            <rect key={i} x="-6" y="-52" width="12" height="12" rx="2"
              fill="#FF7658" stroke="#25231E" strokeWidth="1.5"
              transform={`rotate(${a})`} />
          ))}
        </g>
      </g>
      {/* input card left */}
      <g transform="translate(90 170)">
        <rect width="70" height="90" rx="10" fill="#DCCEFF" stroke="#25231E" strokeWidth="2" />
        <circle cx="35" cy="30" r="14" fill="#FFD765" stroke="#25231E" strokeWidth="1.5" />
        <rect x="14" y="52" width="42" height="4" rx="2" fill="#25231E" opacity="0.4" />
        <rect x="14" y="62" width="30" height="4" rx="2" fill="#25231E" opacity="0.3" />
        <rect x="14" y="72" width="36" height="4" rx="2" fill="#25231E" opacity="0.3" />
      </g>
      <g transform="translate(90 260)">
        <rect width="70" height="60" rx="10" fill="#158F87" stroke="#25231E" strokeWidth="2" />
        <circle cx="35" cy="24" r="10" fill="white" stroke="#25231E" strokeWidth="1.5" />
        <rect x="14" y="40" width="42" height="4" rx="2" fill="white" opacity="0.7" />
      </g>
      {/* output paths */}
      <path d="M300 200 Q360 180 400 150" stroke="#4FA66A" strokeWidth="3" fill="none" strokeDasharray="6 4" />
      <path d="M300 220 Q360 260 400 290" stroke="#F69B38" strokeWidth="3" fill="none" strokeDasharray="6 4" />
      <g transform="translate(380 130)">
        <circle r="22" fill="#4FA66A" stroke="#25231E" strokeWidth="2" />
        <path d="M-9 0 L-2 8 L10 -6" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      <g transform="translate(380 290)">
        <circle r="22" fill="#F69B38" stroke="#25231E" strokeWidth="2" />
        <path d="M0 -10 L0 4 M0 10 L0 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* sticky note */}
      <g transform="translate(30 30) rotate(-6)">
        <rect width="150" height="60" rx="4" fill="#FFD765" stroke="#25231E" strokeWidth="1.5" />
        <rect x="60" y="-8" width="30" height="16" fill="#DCCEFF" opacity="0.7" stroke="#25231E" strokeWidth="1" />
        <text x="12" y="26" fontFamily="Fraunces, serif" fontSize="14" fontWeight="700" fill="#25231E">StudyMatch v0.7</text>
        <text x="12" y="46" fontFamily="Nunito Sans, sans-serif" fontSize="12" fill="#25231E">— opaque by design</text>
      </g>
      {/* question marks */}
      <text x="220" y="120" fontFamily="Fraunces" fontSize="28" fill="#4D76E8" opacity="0.6">?</text>
      <text x="180" y="330" fontFamily="Fraunces" fontSize="20" fill="#FF7658" opacity="0.7">?</text>
    </svg>
  );
}
