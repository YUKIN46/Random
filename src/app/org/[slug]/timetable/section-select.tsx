"use client";

import { useRouter, usePathname } from "next/navigation";

export default function SectionSelect({
  sections,
  selectedSectionId,
}: {
  sections: { id: string; label: string }[];
  selectedSectionId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={selectedSectionId}
      onChange={(e) => router.push(`${pathname}?sectionId=${e.target.value}`)}
      className="rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm text-ink"
    >
      {sections.map((s) => (
        <option key={s.id} value={s.id}>{s.label}</option>
      ))}
    </select>
  );
}
