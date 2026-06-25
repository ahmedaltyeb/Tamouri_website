"use client";

/**
 * Reusable centered section header used on all homepage sections.
 * RTL/LTR safe — text-center is direction-neutral so it works in both.
 */
interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({ badge, title, subtitle, className = "" }: SectionHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      {badge && (
        <p className="text-gold font-semibold text-sm mb-2">{badge}</p>
      )}
      <h2 className="section-title">{title}</h2>
      {subtitle && (
        <p className="section-subtitle mt-2 max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
}
