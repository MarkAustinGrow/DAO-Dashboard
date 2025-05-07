/**
 * Utility functions for anonymous voting system
 * - Manages persistent anonymous IDs
 * - Stores and retrieves user votes from localStorage
 * - Maintains privacy by not storing any user identifiers
 */

/**
 * Gets or creates a persistent anonymous ID
 * This ID is used to track a user's votes across sessions
 */
export function getOrCreateAnonymousId(): string {
  // Only run in browser environment
  if (typeof window === 'undefined') return '';

  // Get existing ID or create new one
  let anonId = localStorage.getItem('anon_id');
  if (!anonId) {
    anonId = `anon${Math.floor(Math.random() * 1000000)}`;
    localStorage.setItem('anon_id', anonId);
  }

  return anonId;
}

/**
 * Gets all votes stored by the current user for the current day
 */
export function getUserVotes(): Record<string, number> {
  // Only run in browser environment
  if (typeof window === 'undefined') return {};
  
  const storedVotes = localStorage.getItem('anon_votes');
  return storedVotes ? JSON.parse(storedVotes) : {};
}

/**
 * Saves a user's vote for a specific song
 */
export function saveUserVote(songId: string, score: number): void {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  const votes = getUserVotes();
  votes[songId] = score;
  localStorage.setItem('anon_votes', JSON.stringify(votes));
}
