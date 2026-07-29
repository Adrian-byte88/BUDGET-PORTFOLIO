export function formatTimeAgo(isoOrTimestamp?: string, lastTriggeredDate?: string): string {
  const targetStr = lastTriggeredDate || isoOrTimestamp;
  if (!targetStr) return 'Just now';

  if (targetStr.toLowerCase() === 'just now') return 'Just now';

  let dateMs: number | null = null;

  // Try parsing as ISO string or valid date format
  const parsed = new Date(targetStr).getTime();
  if (!isNaN(parsed) && parsed > 0) {
    dateMs = parsed;
  } else {
    // Parse legacy offset formats like "10m ago", "1h ago", "3d ago"
    const match = targetStr.match(/^(\d+)\s*([smhd0-9w]+)\s*ago$/i);
    if (match) {
      const val = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();
      const now = Date.now();
      if (unit.startsWith('s')) dateMs = now - val * 1000;
      else if (unit.startsWith('m')) dateMs = now - val * 60 * 1000;
      else if (unit.startsWith('h')) dateMs = now - val * 3600 * 1000;
      else if (unit.startsWith('d')) dateMs = now - val * 86400 * 1000;
      else if (unit.startsWith('w')) dateMs = now - val * 604800 * 1000;
    }
  }

  if (!dateMs) {
    return targetStr; // fallback if unparseable plain string
  }

  const diffMs = Date.now() - dateMs;
  if (diffMs < 0) return 'Just now';

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 15) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;

  const d = new Date(dateMs);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
