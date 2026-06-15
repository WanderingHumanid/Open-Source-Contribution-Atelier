import { useCallback, useEffect, useState } from "react";
import type { BadgeToastData } from "../components/ui/BadgeToast";
import type { BadgeDefinition } from "../constants/badges";


const STORAGE_KEY = "atelier_seen_badges";

function getSeenBadges(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set<string>(parsed);
  } catch {
    // corrupted storage - treat as empty
  }
  return new Set();
}

function markBadgesSeen(ids: string[]): void {
  try {
    const merged = new Set([...getSeenBadges(), ...ids]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...merged]));
  } catch {
    // silently skip if storage is unavailable
  }
}

interface UseBadgeToastReturn {
  toasts: BadgeToastData[];
  dismissToast: (id: string) => void;
}

export function useBadgeToast(
  earnedBadgeIds: string[],
  allBadges: BadgeDefinition[]
): UseBadgeToastReturn {
  const [toasts, setToasts] = useState<BadgeToastData[]>([]);

  useEffect(() => {
    if (earnedBadgeIds.length === 0) return;

    const seen = getSeenBadges();
    const isFirstVisit = localStorage.getItem(STORAGE_KEY) === null;

    if (isFirstVisit) {
      // Seed storage silently
      markBadgesSeen(earnedBadgeIds);
      return;
    }

    const newlyEarned = earnedBadgeIds.filter((id) => !seen.has(id));
    if (newlyEarned.length === 0) return;

    const badgeMap = new Map(allBadges.map((b) => [b.id, b]));
    const newToasts: BadgeToastData[] = newlyEarned
      .map((id) => badgeMap.get(id))
      .filter((b): b is BadgeDefinition => b !== undefined);

    if (newToasts.length === 0) return;

    markBadgesSeen(newlyEarned);

    // Append only badges not already queued
    setToasts((prev) => {
      const queuedIds = new Set(prev.map((t) => t.id));
      const deduped = newToasts.filter((t) => !queuedIds.has(t.id));
      return deduped.length > 0 ? [...prev, ...deduped] : prev;
    });
  }, [earnedBadgeIds, allBadges]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismissToast };
}
