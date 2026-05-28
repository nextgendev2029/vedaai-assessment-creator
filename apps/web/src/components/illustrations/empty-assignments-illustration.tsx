import { cn } from '@/lib/cn';

interface EmptyAssignmentsIllustrationProps {
  className?: string;
}

export function EmptyAssignmentsIllustration({ className }: EmptyAssignmentsIllustrationProps) {
  return (
    <div className={cn('relative w-[220px] h-[200px] lg:w-[280px] lg:h-[260px] mx-auto', className)}>
      <svg viewBox="0 0 280 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background circle */}
        <circle cx="140" cy="130" r="80" fill="#F0F0F0" />

        {/* Document card */}
        <rect x="85" y="55" width="110" height="140" rx="12" fill="white" stroke="#E0E0E0" strokeWidth="1.5" />

        {/* Document lines */}
        <rect x="102" y="78" width="60" height="6" rx="3" fill="#303030" />
        <rect x="102" y="94" width="45" height="4" rx="2" fill="#D0D0D0" />
        <rect x="102" y="106" width="55" height="4" rx="2" fill="#D0D0D0" />

        {/* Small cards top right */}
        <rect x="175" y="65" width="40" height="28" rx="6" fill="white" stroke="#E0E0E0" strokeWidth="1" />
        <circle cx="185" cy="75" r="3" fill="#D0D0D0" />
        <rect x="191" y="73" width="16" height="3" rx="1.5" fill="#D0D0D0" />
        <rect x="175" y="100" width="40" height="28" rx="6" fill="white" stroke="#E0E0E0" strokeWidth="1" />
        <circle cx="185" cy="110" r="3" fill="#D0D0D0" />
        <rect x="191" y="108" width="16" height="3" rx="1.5" fill="#D0D0D0" />

        {/* Magnifying glass */}
        <circle cx="155" cy="150" r="35" fill="none" stroke="#C4B5FD" strokeWidth="6" opacity="0.6" />
        <line x1="180" y1="175" x2="205" y2="200" stroke="#A78BFA" strokeWidth="8" strokeLinecap="round" opacity="0.5" />

        {/* Red X mark */}
        <circle cx="150" cy="145" r="24" fill="#FEE2E2" />
        <path d="M140 135 L160 155 M160 135 L140 155" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />

        {/* Decorative elements */}
        {/* Sparkle top-left */}
        <path d="M60 170 L63 165 L66 170 L63 175Z" fill="#417BA4" opacity="0.6" />
        <path d="M57 167 L63 170 L57 173" fill="none" stroke="#417BA4" strokeWidth="1" opacity="0.4" />

        {/* Dot bottom-right */}
        <circle cx="220" cy="145" r="4" fill="#417BA4" opacity="0.5" />

        {/* Curved doodle top-left */}
        <path d="M70 90 Q60 75 75 70" fill="none" stroke="#303030" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <path d="M72 87 Q68 83 73 80" fill="none" stroke="#303030" strokeWidth="1" strokeLinecap="round" opacity="0.2" />
      </svg>
    </div>
  );
}
