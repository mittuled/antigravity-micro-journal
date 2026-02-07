

# 📝 Liquid Glass Notes & Journal

A beautiful, full-featured notes and journal app with an iOS 26-inspired liquid glass aesthetic, installable as a PWA on any phone.

---

## 🎨 Design System — Liquid Glass Theme

- **Glassmorphism throughout**: Translucent cards, frosted backgrounds, and soft glow effects inspired by your liquid glass button
- **Animated shine effects** on interactive elements (buttons, cards, toggles)
- **Dark gradient background** (deep blues/purples) to make the glass effects pop
- **Smooth transitions** between views with fade and slide animations
- **Typography**: Clean, modern sans-serif with tight tracking
- **Components**: Use floating Tab bar, floating menu bar, Floating search bar and other liquid glass components for the design

---

## 📱 Core Features

### 1. Entry Management

#### 1.1 Create Entry
- **Description:** Users can write new journal entries with content and an entry type
- **Entry Types:** Dream, Idea, Question, Fear, Wisdom, Memory, Note (system types) + Custom types
- **Input Method:** Multi-line text area with placeholder prompts based on entry type
- **Auto-extraction:** #hashtags and @mentions are automatically parsed from content
- **Haptic Feedback:** Success/error vibration on submission
- **Post-creation:** Navigates to Journal tab to see new entry

#### 1.2 View Entries
- **Timeline View:** Entries displayed chronologically in temporal groups
- **Groupings:** Today, Yesterday, This Week, Earlier
- **Entry Display:** Entry type badge, formatted date, content with highlighted tags/mentions
- **Infinite Scroll:** Loads 20 entries at a time with pagination
- **Pull-to-refresh:** Manual refresh of entry list

#### 1.3 Edit Entry
- **Modal Presentation:** iOS sheet-style modal
- **Pre-populated:** Existing content and entry type
- **Tag/mention sync:** Re-parsed on save

#### 1.4 Delete Entry
- **Confirmation:** iOS alert confirmation dialog
- **Cascade:** Removes entry-tag and entry-mention associations

---

### 2. Organization & Filtering

#### 2.1 Entry Types
- **System Types (7):** Dream, Idea, Question, Fear, Wisdom, Memory, Note
- **Custom Types:** User-defined with custom color, icon, label, prompt
- **Visual Coding:** Each type has a distinct color shown as badge and left border
- **Selection:** ActionSheet picker on iOS for selecting entry type

#### 2.2 Tags (#hashtags)
- **Auto-detection:** Regex pattern `#\w+` in entry content
- **Case-insensitive:** Normalized to lowercase
- **Deduplication:** Same tag only linked once per entry
- **Browsable:** Can filter entries by tag

#### 2.3 Mentions (@mentions)
- **Auto-detection:** Regex pattern `@\w+` in entry content
- **Case-insensitive:** Normalized to lowercase
- **Deduplication:** Same mention only linked once per entry
- **Browsable:** Can filter entries by mention

#### 2.4 Search & Filter
- **Full-text Search:** Query across all entry content
- **Tag Filter:** Filter entries containing specific tag
- **Mention Filter:** Filter entries referencing specific mention
- **Type Filter:** Filter entries by entry type
- **Mutual Exclusion:** Active filter clears text search (and vice versa)

---

### 3. Analytics & Insights

#### 3.1 Overview Statistics
- **Total Entries:** Count of all user entries
- **Most Used Type:** Entry type with highest count
- **Types Used:** Number of distinct entry types

#### 3.2 Entry Breakdown
- **By Type:** List of each entry type with count and percentage
- **Visual:** Color-coded to match entry type colors

#### 3.3 Activity Graph (GitHub-style)
- **Visualization:** Grid of cells representing days
- **Intensity:** Color saturation indicates entry count (0-5+ scale)
- **Time Range:** ~4 months (17 weeks) of history
- **Labels:** Month labels along top, day labels (Mon/Wed/Fri) on left
- **Stats:** Total entries and active days count

---

### 4. User Preferences

#### 4.1 Theme Settings
- **Options:** Light, Dark, System (follows device)
- **Persistence:** Saved to AsyncStorage

#### 4.2 Account Management
- **Profile Display:** Email and username

#### 4.3 Custom Entry Types
- **Create:** Name, label, color, icon, prompt
- **Edit:** Modify label, color, icon, prompt
- **Delete:** Remove custom type (cannot delete system types)
- **Reorder:** Drag to reorder type list

### 5. App Structure

#### 5.1 Navigation
- **Floating Tab Bar**: Use Write, Journal, Analytics as the 3 items in the Floating tab bar along with a search icon
- **Settings**: A floating Menu Bar including Profile and Settings in the Top left

#### 5.2 Page Structure
- **Journal Tab**: Create a timeline view for the notes expecting multiple notes through out the day and show entries in a reverse chronological order grouped by date.
- **Write Tab**: Create a small text box in the bottom third of the screen for reachability with an action sheet component to pick entry type
- **Analytics Tab**: Start with the activity graph at the top and implement the rest of the insights as charts / metrics below using grid view
- **Search View**: Use Token field for search with '@' to create mention tokens and # to create tag tokens. Show results in reverse chronological order grouped by date.


---

## 💾 Data Storage

All data stored locally in the browser using **localStorage/IndexedDB** — no accounts, no cloud, fully private. Data persists across sessions.

---

## 📲 PWA Installation

- Fully installable from the browser to the home screen
- Works offline after first load
- App icon and splash screen with the liquid glass branding
- Feels native with full-screen mode and smooth animations

---

## 🗂 App Navigation

- **Bottom tab bar** (iOS-style) with glass blur effect: Home, Notes, Journal, Settings
- Smooth page transitions between tabs
- Swipe gestures for navigating between entries

