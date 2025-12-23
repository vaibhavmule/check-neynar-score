"use client";

import { CastConfig } from "~/lib/constants";
import { CastListItem } from "./CastListItem";

interface CastListProps {
  casts: CastConfig[];
}

/**
 * Component to display a list of cast items (links to detail pages)
 * Casts are sorted by priority (lower number = shown first)
 */
export function CastList({ casts }: CastListProps) {
  // Sort casts by priority (lower number first), then by original order
  const sortedCasts = [...casts].sort((a, b) => {
    const priorityA = a.priority ?? Infinity;
    const priorityB = b.priority ?? Infinity;
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    return 0; // Maintain original order if priorities are equal
  });

  return (
    <div className="space-y-4 w-full max-w-md mx-auto px-4">
      {sortedCasts.map((cast, index) => (
        <CastListItem 
          key={cast.url || index} 
          cast={cast} 
          index={index}
        />
      ))}
    </div>
  );
}




