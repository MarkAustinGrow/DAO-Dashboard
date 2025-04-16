Yona Voting System Design

🎵 Purpose

Enable anonymous daily voting on Yona's songs to allow honest feedback, preserve privacy, and reveal crowd favorites through ranking.

💡 Goal Summary

Users rate songs from 0 to 10 anonymously.

Votes reset daily on the user side.

Votes are sent anonymously to backend for analytics.

Songs are ranked by popularity using vote data.

🔹 Voting Rules

Each visitor is assigned a temporary anonymous ID per day (e.g., anon2749).

Users can vote on each song once per day.

Votes are stored locally so users can see what they rated.

Local data (ID and votes) resets every day.

💻 Frontend Behavior

On Page Load:

Check if today's anon ID exists in localStorage.

If not, generate new anon ID with date, if it does exist change the anon ID.

Reset any stored votes if date has changed.

Voting Component:

Slider or button set for rating (0 to 10).

Button to submit (or auto-submit on change).

Displays: "Your vote today: X" if vote exists.

Tooltip: "Private & resets daily."

🛠️ Backend Logic

On Vote Submission:

Receive JSON payload:

{
  "songId": "yona_disco_fever",
  "score": 9,
  "timestamp": "2025-04-08T13:02:45Z"
}

Store vote in songs table (no user info, no IP, no cookies).

Average score = total score / vote count

Optionally show vote count per song

Optionally highlight trending songs (most new votes today)

Example Leaderboard:

Yona Disco Fever — 9.1 / 10 (73 votes)

Ballad Sky — 8.4 / 10 (45 votes)

🛡️ Privacy Commitments

No IP tracking

No login required

No persistent identifiers

All votes are anonymous

UI Message:

"All votes are anonymous and reset daily. Only you can see what you voted. We only track what the crowd loves, not who voted for what."

✨ Result

Honest participation

Data-driven insights

Protected identities

Friendly, judgment-free music discovery

