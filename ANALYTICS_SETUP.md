# Google Analytics 4 Setup Guide

This project has comprehensive Google Analytics 4 (GA4) tracking implemented to monitor user behavior and gameplay.

## What's Being Tracked

### User Journey
- **Session Start**: When a user first loads the app, with language and location
- **Screen Views**: All screen transitions (home, game, turn, end)
- **Language Changes**: When users switch between Hebrew and English

### Game Lifecycle
- **Team Added**: Each time a team is added (tracks team number and color)
- **Game Started**: When gameplay begins (tracks team count and language)
- **Turn Started**: Each turn with team name and turn number
- **Turn Completed**: End of each turn with words guessed, skipped, and final score
- **Game Completed**: When a winner is declared (tracks winner, total turns, duration)
- **Game Reset**: When a new game is started

### User Interactions
- **Word Guessed**: Each time "Got It" is clicked (with time remaining)
- **Word Skipped**: Each time "Skip" is clicked (with time remaining)
- **Game Rules Viewed**: When users open the rules modal

## Setup Instructions

### Step 1: Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Under **Property**, click **Create Property**
4. Enter property details:
   - Property name: "Alias Game" (or your preferred name)
   - Reporting time zone: Choose your timezone
   - Currency: Choose your currency
5. Click **Next**, fill in business details
6. Click **Create**

### Step 2: Set Up a Data Stream

1. After creating the property, click **Data Streams**
2. Click **Add stream** > **Web**
3. Enter your website details:
   - Website URL: `https://play.getalias.xyz` (your production URL)
   - Stream name: "Alias Game Web"
4. Click **Create stream**
5. **Copy the Measurement ID** (format: `G-XXXXXXXXXX`)

### Step 3: Add Measurement ID to Your App

#### For Production (Amplify):
1. Open `frontend/.env.production`
2. Add your Measurement ID:
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

#### For Development (Local):
1. Open `frontend/.env`
2. Add your Measurement ID (can use the same or create a separate dev property):
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

#### For Amplify Deployment:
1. Go to your Amplify console
2. Navigate to your app > **Environment variables**
3. Add a new variable:
   - Key: `REACT_APP_GA_MEASUREMENT_ID`
   - Value: `G-XXXXXXXXXX`
4. Save and redeploy

### Step 4: Test the Integration

1. Start your app locally:
   ```bash
   cd frontend
   npm start
   ```

2. Open browser DevTools > Console
3. You should see messages like:
   ```
   Google Analytics initialized
   📊 Session Start: ...
   📊 Screen View: home
   ```

4. Test in GA4 Real-Time view:
   - Go to GA4 > **Reports** > **Realtime**
   - Perform actions in your app
   - You should see events appearing in real-time

## Viewing Analytics Data

### Real-Time Reports
- **Reports > Realtime**: See live user activity
- Shows: Active users, events per minute, top screens

### Event Reports
- **Reports > Engagement > Events**: See all tracked events
- Key events to monitor:
  - `page_view` (screen views)
  - `game_started`
  - `turn_completed`
  - `game_completed`
  - `word_guessed`
  - `word_skipped`

### Custom Reports
You can create custom reports and explorations:
1. Go to **Explore** > **Create a new exploration**
2. Add dimensions: `page_path`, `language`, etc.
3. Add metrics: `event_count`, `active_users`, etc.

## Exporting to Google Sheets

### Method 1: Google Analytics Add-on
1. Open Google Sheets
2. **Extensions** > **Add-ons** > **Get add-ons**
3. Search for "Google Analytics"
4. Install the official Google Analytics add-on
5. Configure it to pull your GA4 data

### Method 2: BigQuery + Google Sheets
1. In GA4, go to **Admin** > **BigQuery Links**
2. Link your GA4 property to BigQuery (free tier available)
3. In Google Sheets, use **Data** > **Data connectors** > **BigQuery**
4. Query your analytics data directly

### Method 3: GA4 API + Apps Script
For automated daily exports:
1. Create a Google Sheet
2. **Extensions** > **Apps Script**
3. Use the GA4 API to fetch data
4. Set up a daily trigger

## Tracked Events Reference

| Event Name | Parameters | Purpose |
|------------|------------|---------|
| `session_start` | `language`, `user_location` | Track new user sessions |
| `page_view` | `page`, `title`, `language`, `teamCount` | Track screen navigation |
| `language_changed` | `label` (from → to) | Track language switching |
| `team_added` | `value` (team number) | Track team creation |
| `game_started` | `label` (language), `value` (team count) | Track game initiation |
| `turn_started` | `label` (team name), `value` (turn number) | Track turn beginning |
| `turn_completed` | `label` (team name), `value` (final score) | Track turn results |
| `turn_stats` | `label` (guessed/skipped), `value` (guessed count) | Detailed turn data |
| `game_completed` | `label` (winner), `value` (total turns) | Track game completion |
| `game_reset` | - | Track new game starts |
| `word_guessed` | `value` (time remaining) | Track word success |
| `word_skipped` | `value` (time remaining) | Track word skips |
| `game_rules_viewed` | `label` (language) | Track rules engagement |

## Privacy & Compliance

- **IP Anonymization**: Enabled by default
- **User IDs**: Not tracked (anonymous by default)
- **Data Retention**: 2 months (can be extended to 14 months in GA4 settings)
- **GDPR**: Consider adding a cookie consent banner if serving EU users

## Troubleshooting

### Events Not Showing Up
1. Check console for "Google Analytics initialized" message
2. Verify `REACT_APP_GA_MEASUREMENT_ID` is set correctly
3. Check browser ad blockers aren't blocking GA
4. Wait 24-48 hours for events to fully process (Real-time should be instant)

### Testing Locally
- Events work in development mode with a valid Measurement ID
- Use GA4 DebugView for detailed event debugging:
  1. Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/)
  2. Enable it and reload your app
  3. View events in GA4 > **Admin** > **DebugView**

## Next Steps

1. Set up **Custom Dimensions** for deeper analysis
2. Create **Audiences** for user segmentation
3. Set up **Conversion Events** (e.g., game completion)
4. Configure **Data Retention** settings
5. Set up **BigQuery Export** for advanced analysis

## Support

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [BigQuery Export](https://support.google.com/analytics/answer/9358801)
