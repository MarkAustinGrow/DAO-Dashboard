# Marvin Dashboard Documentation

## Project Overview
The Marvin Dashboard is a comprehensive web application built for The Push Collective, designed to manage and monitor AI agents, music content, analytics, and governance. The dashboard provides real-time insights, task management, and detailed analytics across multiple platforms.

## Tech Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript
- **UI Library**: React 19.0.0
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **UI Components**: Shadcn/ui (Radix UI)
- **Date Handling**: date-fns
- **Icons**: lucide-react
- **Drag and Drop**: @dnd-kit
- **AI Integration**: OpenAI API

## Project Structure

```
marvin-dashboard/
├── app/                    # Next.js app directory (App Router)
│   ├── agents/            # Agent management interface
│   ├── analytics/         # Analytics and metrics dashboard
│   ├── api/               # API routes
│   │   ├── generate-character/ # Character generation API
│   ├── characters/        # Character management and upload
│   │   ├── new/           # Character upload information
│   ├── governance/        # Governance and voting interface
│   ├── live-code/         # AI agent internal processes view
│   ├── logs/              # System logs and activity tracking
│   ├── music/             # Music content management
│   ├── layout.tsx         # Root layout component
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── character/         # Character-related components
│   ├── ui/                # Base UI components
│   │   ├── sidebar/       # Sidebar components
├── lib/                   # Utility functions and shared logic
├── public/                # Static assets
```

## Core Features

### 1. Dashboard Overview
- Real-time activity feed
- Agent status monitoring
- Quick access to key metrics
- Navigation to all major sections

### 2. Agent Management
- Agent status tracking
- Task assignment and monitoring
- Performance metrics
- Real-time status updates

### 3. Analytics Dashboard
- **Engagement Metrics**
  - Platform-specific engagement tracking
  - Likes, shares, and comments analytics
  - Time-based trend analysis
  
- **Sentiment Analysis**
  - Real-time sentiment scoring
  - Trend visualization
  - Content performance tracking
  
- **Platform Distribution**
  - Listener distribution across platforms
  - Regional breakdown
  - Platform-specific metrics
  
- **Feedback Analysis**
  - User feedback tracking
  - Rating analytics
  - Sentiment evaluation

### 4. Governance System
- **Proposal Management**
  - Creation and tracking of proposals
  - Voting mechanism
  - Status monitoring
- **Community Engagement**
  - Voting activity tracking
  - Participation metrics
  - Decision transparency

### 5. Logs System
- Detailed activity logging
- Categorized events
- Timestamp tracking
- Filterable log entries
- Real-time updates

### 6. Music Content Management
- Song catalog management
- Version control
- Distribution tracking
- Performance analytics
- Anonymous voting system for song ratings
- Song rankings based on user votes

### 7. Live Code
- Real-time view of AI agent internal processes
- Minimalist terminal-like interface
- Time and message display for each log entry
- Tab-based navigation between different agents (Yona and Angus)
- Real-time updates via Supabase subscriptions

### 8. Character Management
- AI character profile management
- Character JSON file upload and download
- Integration with [Eliza-Character-Gen](https://github.com/HowieDuhzit/Eliza-Character-Gen) for character creation
- Character version control
- Active/inactive status tracking
- Assignment of characters to agents
- Viewing detailed character profiles

## Database Schema

## Anonymous Voting System

The Marvin Dashboard includes a privacy-focused anonymous voting system for song ratings that preserves user privacy while providing valuable feedback on music content.

### Key Features

- **Anonymous Voting**: Users can rate songs from 0 to 10 without creating an account
- **Daily Reset**: Votes are stored locally and reset daily to maintain privacy
- **Transparent Rankings**: Songs are ranked by average score with vote counts displayed
- **Privacy-First Design**: No tracking of IP addresses, cookies, or persistent identifiers

### Implementation Details

#### Frontend Components

1. **SongVote Component** (`components/song-vote.tsx`)
   - Slider for rating songs from 0 to 10
   - Submit/Update button for vote submission
   - Display of user's current vote
   - Privacy message indicating votes are anonymous and reset daily

2. **Anonymous Voting Utilities** (`lib/anonymousVoting.ts`)
   - `getOrCreateAnonymousId()`: Generates a temporary anonymous ID that resets daily
   - `getUserVotes()`: Retrieves user's votes from localStorage
   - `saveUserVote()`: Saves a user's vote to localStorage

3. **Music Page** (`app/music/page.tsx`)
   - Vote tab for rating individual songs
   - Charts tab for viewing song rankings
   - Display of average scores and vote counts

#### Backend Implementation

1. **Song Vote API** (`app/api/song-vote/route.ts`)
   - Receives vote submissions with songId, score, and timestamp
   - Stores votes anonymously (no user identifiers)
   - Updates song's average score and vote count
   - Returns updated statistics

2. **Song Rankings API** (`app/api/song-rankings/route.ts`)
   - Retrieves songs ordered by average score
   - Returns song data including title, average score, vote count, and media URLs

### User Flow

1. User visits the Music page
2. System generates a temporary anonymous ID or uses existing ID for the day
3. User rates a song using the slider and submits vote
4. Vote is stored locally and sent to the server anonymously
5. Song's average score and ranking are updated
6. User can view all song rankings in the Charts tab
7. User's votes reset the next day, allowing for fresh feedback

### Privacy Measures

- No user accounts required for voting
- No IP address tracking
- No persistent cookies or identifiers
- Daily reset of anonymous IDs
- Transparent messaging about privacy practices

### Main Tables

1. **activity_logs**
   - id: uuid
   - agent_name: string
   - agent_avatar: string
   - action: string
   - details: string
   - timestamp: timestamp
   - category: string

2. **tasks** (for agent management)
   - id: string
   - title: string
   - description: string
   - assigned_to: string
   - assigned_to_uid: string
   - priority: string
   - status: string
   - created_at: string
   - updated_at: string
   - metadata: jsonb (contains progress information)

3. **engagement_metrics**
   - id: uuid
   - platform: string
   - metric_type: string
   - value: number
   - timestamp: timestamp

4. **feedback**
   - id: uuid
   - type: string
   - content: string
   - rating: number
   - timestamp: timestamp

5. **platform_distribution**
   - id: uuid
   - platform: string
   - listener_count: number
   - region: string

6. **sentiment_data**
   - id: uuid
   - content_id: string
   - sentiment_score: number
   - timestamp: timestamp

7. **songs**
   - id: uuid
   - title: string
   - lyrics: string
   - audio_url: string
   - style: string
   - created_at: timestamp
   - is_cover: boolean
   - duration: number
   - params_used: string
   - image_url: string (nullable)
   - average_score: number (nullable)
   - vote_count: number (nullable)

8. **song_votes**
   - id: uuid
   - song_id: string (references songs.id)
   - score: number (0-10)
   - timestamp: timestamp

9. **votes**
   - id: uuid
   - proposal_id: string
   - vote_type: string
   - timestamp: timestamp

10. **proposals**
   - id: string
   - title: string
   - description: string
   - status: string
   - created_at: timestamp
   - votes_for: number
   - votes_against: number
   - created_by: string

11. **yona_logs**
   - id: integer
   - timestamp: timestamp with time zone
   - level: text
   - source: text
   - message: text
   - details: jsonb

12. **angus_logs**
   - id: integer
   - timestamp: timestamp with time zone
   - level: text
   - source: text
   - message: text
   - details: jsonb

13. **character_files**
   - id: uuid (primary key, default: uuid_generate_v4())
   - agent_name: text (not nullable)
   - display_name: text (not nullable)
   - content: jsonb (not nullable, stores character profile data)
   - version: integer (not nullable, default: 1)
   - is_active: boolean (not nullable, default: true)
   - created_at: timestamp with time zone (default: now())
   - updated_at: timestamp with time zone (default: now())

## Component Architecture

### UI Components
- **DashboardSidebar**: Main navigation component
- **DashboardHeader**: Top bar with user info and quick actions
- **AgentStatusPanel**: Real-time agent status display
- **ActivityFeed**: Real-time activity updates
- **MetricsPanel**: Key performance indicators
- **LogsPanel**: System activity logs
- **CharacterUploadInterface**: Interface for uploading character JSON files
- **AgentCharacterAssignment**: Component for assigning characters to agents

### Page Components
- **Dashboard**: Main overview page with tabs for Overview and Governance
- **AgentsPage**: Agent management interface
- **AnalyticsPage**: Data visualization and metrics
- **CharactersPage**: Character management interface
- **NewCharacterPage**: Character upload information page
- **GovernancePage**: Proposal and voting management
- **LogsPage**: System logs and filtering
- **MusicPage**: Music content management
- **LiveCodePage**: AI agent internal processes view

## State Management
- React's useState and useEffect for local state
- Real-time subscriptions with Supabase
- Context providers for shared state

## Styling
- Tailwind CSS for utility-first styling
- Custom theme configuration
- Responsive design principles
- Dark mode optimization

## Best Practices

### Code Organization
- Modular component structure
- Clear separation of concerns
- TypeScript interfaces for type safety
- Consistent naming conventions

### Performance
- Dynamic imports for code splitting
- Image optimization
- Efficient data fetching
- Memoization where appropriate

### Security
- Environment variable management
- Authentication flow
- API route protection
- Input validation

## Development Workflow
1. Feature branches from `dev`
2. Pull requests for review
3. Merge to `dev` for testing
4. Production deployment from `main`

## Environment Setup
Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# OPENAI_API_KEY no longer required as character generation is handled externally
```

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Access at `http://localhost:3000`

## Deployment
- Vercel deployment configured
- Automatic deployments from main branch
- Environment variable management
- Build optimization

## Linode Deployment
The application is deployed on a Linode server using Docker. Here's the process for updating the deployment:

### Prerequisites
- SSH access to the Linode server
- Git repository access
- Docker installed on the server

### Deployment Steps
1. **SSH into the Linode server**
   ```bash
   ssh root@marvn.club
   ```

2. **Navigate to the project directory**
   ```bash
   cd /opt/marvin/marvin-dashboard
   ```

3. **Stash any local changes (if needed)**
   ```bash
   git stash
   ```

4. **Pull the latest changes from GitHub**
   ```bash
   git pull origin backdrop-recovered
   ```

5. **Ensure the .env file is properly configured**
   The .env file should contain all necessary environment variables:
   ```
   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key

   # YouTube Channel ID
   YOUTUBE_CHANNEL_ID=your_youtube_channel_id

   # Supabase Credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

6. **Modify the Dockerfile to include the .env file**
   Ensure the Dockerfile includes a line to copy the .env file:
   ```
   COPY .env .env
   ```

7. **Build the Docker image**
   ```bash
   docker build -t marvin-dashboard .
   ```

8. **Run the Docker container**
   ```bash
   docker run -d --name marvin-dashboard-container -p 3000:3000 marvin-dashboard
   ```

9. **Verify the deployment**
   - Check if the container is running: `docker ps`
   - View container logs: `docker logs marvin-dashboard-container`
   - Access the application at: `http://marvn.club:3000`

### Troubleshooting
- If the build fails with environment variable errors, check that the .env file exists and contains all required variables
- If the container fails to start, check the logs for errors: `docker logs marvin-dashboard-container`
- If you need to make changes to the .env file, rebuild the Docker image after making changes

### Container Management
- **Stop the container**: `docker stop marvin-dashboard-container`
- **Remove the container**: `docker rm marvin-dashboard-container`
- **Restart the container**: `docker restart marvin-dashboard-container`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit pull request
5. Code review process

## Future Roadmap
- Enhanced analytics capabilities
- Mobile application integration
- Advanced AI agent features
- Expanded governance tools
- Integration with additional platforms
- Character voice synthesis integration
