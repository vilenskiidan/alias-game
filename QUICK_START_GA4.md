# 🚀 Quick Start: Google Analytics 4

Get analytics running in 5 minutes!

## Step 1: Get Your Measurement ID

1. Go to https://analytics.google.com/
2. **Admin** (bottom left) → **Create Property**
3. Name it "Alias Game", click through setup
4. Click **Data Streams** → **Add stream** → **Web**
5. URL: `https://play.getalias.xyz`
6. **Copy your Measurement ID** (looks like `G-XXXXXXXXXX`)

## Step 2: Add to Your App

### For Amplify (Production):

1. Open Amplify Console
2. Go to your app → **Environment variables**
3. Add:
   - **Key**: `REACT_APP_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (your ID)
4. **Save** and **Redeploy**

### For Local Testing:

1. Open `frontend/.env`
2. Add:
   ```
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Restart your dev server

## Step 3: Verify It's Working

### Real-Time View (in 30 seconds):
1. Visit your website
2. In GA4: **Reports** → **Realtime**
3. You should see yourself as an active user!

### Check Events:
- Click around your app
- Watch events appear in Realtime view
- Look for: `page_view`, `game_started`, `word_guessed`, etc.

## Step 4: Export to Google Sheets

### Easiest Method (Google Analytics Add-on):

1. Open Google Sheets
2. **Extensions** → **Add-ons** → **Get add-ons**
3. Search "Google Analytics", install official add-on
4. **Add-ons** → **Google Analytics** → **Create new report**
5. Select:
   - Your account → Property → View
   - Metrics: Sessions, Users, Events
   - Dimensions: Date, Event Name
6. **Create Report**
7. Set up automatic refresh daily

## What's Being Tracked?

✅ Every screen visit (home, game, turn, end)
✅ Every game start and completion
✅ Every turn with stats (words guessed/skipped)
✅ Language changes
✅ User location and language preference

## View Your Data

**Daily Summary:**
- **Reports** → **Life cycle** → **Engagement** → **Events**

**User Behavior:**
- **Reports** → **Life cycle** → **Engagement** → **Pages and screens**

**Custom Analysis:**
- **Explore** → Create custom reports with any dimensions

## Troubleshooting

**Not seeing data?**
- Check Measurement ID is correct
- Disable ad blockers
- Wait 24-48 hours for historical data (Real-time should work immediately)

**Want more details?**
See [ANALYTICS_SETUP.md](ANALYTICS_SETUP.md) for the complete guide.

---

That's it! You're now tracking user behavior and can export to Google Sheets. 🎉
