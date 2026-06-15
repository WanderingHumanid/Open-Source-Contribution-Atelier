import { useAuth } from "../../features/auth/AuthContext";
import { BadgeToastContainer } from "./BadgeToast";
import { useBadgeToast } from "../../hooks/useBadgeToast";
import { useEarnedBadges } from "../../hooks/useEarnedBadges";
import { BADGES } from "../../constants/badges";

export function BadgeToastNotifier() {
  const { user } = useAuth();
  const { earnedBadges } = useEarnedBadges();
  const { toasts, dismissToast } = useBadgeToast(earnedBadges, BADGES);

  if (!user || user.is_staff) return null;

  return <BadgeToastContainer toasts={toasts} onDismiss={dismissToast} />;
}
