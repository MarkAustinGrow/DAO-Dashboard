# DAO Dashboard: Current Specification

## Project Overview

The DAO Dashboard (formerly Marvin Dashboard) is a comprehensive web application designed for The Push Collective, providing a central platform to manage and monitor AI agents, music content, analytics, and governance. The dashboard delivers real-time insights, task management, and detailed analytics across multiple platforms.

## Technical Specifications

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
- **Deployment**: Docker containerization on Linode

## Core Features

### 1. Dashboard Overview
- Real-time activity feed showing latest actions across the platform
- Agent status monitoring with visual indicators
- Quick access to key metrics and performance indicators
- Unified navigation to all major sections

### 2. Agent Management
- Comprehensive agent status tracking with real-time updates
- Task assignment and monitoring system
- Performance metrics and analytics
- Agent-character assignment capabilities

### 3. Analytics Dashboard
- **Engagement Metrics**
  - Platform-specific engagement tracking (likes, shares, comments)
  - Time-based trend analysis with visual representations
  - Comparative performance metrics
  
- **Sentiment Analysis**
  - Real-time sentiment scoring of content and feedback
  - Trend visualization with historical data
  - Content performance tracking based on sentiment
  
- **Platform Distribution**
  - Listener distribution across different platforms
  - Regional breakdown of audience engagement
  - Platform-specific performance metrics
  
- **Feedback Analysis**
  - User feedback tracking and categorization
  - Rating analytics with statistical breakdowns
  - Sentiment evaluation of user comments

### 4. Governance System
- **Proposal Management**
  - Creation and tracking of governance proposals
  - Voting mechanism with support for multiple voting types
  - Status monitoring and outcome tracking
  
- **Community Engagement**
  - Voting activity tracking with participation metrics
  - Transparent decision-making process
  - Historical record of governance actions

### 5. Logs System
- Detailed activity logging with timestamps
- Categorized events for easier filtering
- Real-time updates of system activities
- Searchable log entries
- Agent-specific logging (Yona and Angus)

### 6. Music Content Management
- Song catalog management with metadata
- Version control for music content
- Distribution tracking across platforms
- Performance analytics for music content
- Anonymous voting system for song ratings
- Song rankings based on aggregated user votes

### 7. Live Code
- Real-time view of AI agent internal processes
- Minimalist terminal-like interface for process monitoring
- Time and message display for each log entry
- Tab-based navigation between different agents
- Real-time updates via Supabase subscriptions

### 8. Character Management
- AI character profile management system
- Character JSON file upload and download functionality
- Integration with Eliza-Character-Gen for character creation
- Character version control with history tracking
- Active/inactive status management
- Assignment of characters to specific agents
- Detailed character profile viewing

## Privacy Features

### Anonymous Voting System
- **Privacy-First Design**: No tracking of IP addresses, cookies, or persistent identifiers
- **Anonymous Voting**: Users can rate songs from 0 to 10 without creating an account
- **Daily Reset**: Votes are stored locally and reset daily to maintain privacy
- **Transparent Rankings**: Songs are ranked by average score with vote counts displayed

## Database Schema

The application uses a comprehensive database schema with the following key tables:

1. **activity_logs**: Tracks all system activities
2. **tasks**: Manages agent task assignments
3. **engagement_metrics**: Stores platform-specific engagement data
4. **feedback**: Contains user feedback and ratings
5. **platform_distribution**: Tracks listener distribution
6. **sentiment_data**: Stores sentiment analysis results
7. **songs**: Manages music content metadata
8. **song_votes**: Records anonymous song ratings
9. **votes**: Tracks governance proposal voting
10. **proposals**: Manages governance proposals
11. **yona_logs** & **angus_logs**: Agent-specific activity logs
12. **character_files**: Stores AI character profiles

## Deployment

The application is containerized using Docker and deployed on a Linode server, providing:
- Scalable infrastructure
- Consistent environment across development and production
- Simplified deployment process
- Environment variable management
- Automated build process

## Future Development

Planned enhancements include:
- Enhanced analytics capabilities
- Mobile application integration
- Advanced AI agent features
- Expanded governance tools
- Integration with additional platforms
- Character voice synthesis integration

---

*This specification represents the current state of the DAO Dashboard as of April 2025.*
