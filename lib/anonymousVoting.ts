/**
 * Utility functions for anonymous voting system
 * - Manages anonymous IDs that reset daily
 * - Stores and retrieves user votes from localStorage
 * - Maintains privacy by not storing any user identifiers
 */

/**
 * Gets or creates an anonymous ID for the current day
 * IDs reset daily to maintain privacy
 */
export function getOrCreateAnonymousId(): string {
  // Only run in browser environment
  if (typeof window === 'undefined') return '';
  
  const today = new Date().toISOString().split('T')[0];
  const storedDate = localStorage.getItem('anon_vote_date');
  
  // Reset if date changed
  if (storedDate !== today) {
    localStorage.removeItem('anon_votes');
    const newAnonId = `anon${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem('anon_id', newAnonId);
    localStorage.setItem('anon_vote_date', today);
    return newAnonId;
  }
  
  // Get existing ID or create new one
  let anonId = localStorage.getItem('anon_id');
  if (!anonId) {
    anonId = `anon${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem('anon_id', anonId);
    localStorage.setItem('anon_vote_date', today);
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
