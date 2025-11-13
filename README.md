WhisperVault – AI-Powered Anonymous Confessions
A privacy-focused, AI-moderated anonymous confession platform
WhisperVault is a modern, secure, anonymous confession platform that uses Google Gemini AI for tone transformation and content moderation.
Users can safely share thoughts, express emotions, or post emoji-only confessions with optional auto-blurred images, while admins can review, approve, or reject submissions through a dedicated moderation panel.

WhisperVault Demo Video
<a href="https://drive.google.com/file/d/1w78AsIDiNF5o9wzWWujG11qL8jjJhppa/view?usp=sharing" target="_blank">
  <img src="https://img.icons8.com/fluency/480/play-button-circled.png" width="150" alt="Play Video"/>
</a>
Click the play button to watch the demo.

This project demonstrates:
AI integration (Gemini API)
Secure backend architecture (Node/Express server with protected API key)
Modern frontend (React + TypeScript + Vite)
Real-time moderation workflows
Read-once privacy features
Tailwind CSS UI components
In-memory feed with admin dashboards

 Features
 1. Anonymous Confession Submission
Users can submit confessions anonymously with the following options:
Normal text confession
Emoji-only confession mode
Optional image attachment (automatically blurred for privacy)
Read-once mode (disappears after it is read)
Comments Locked mode (disable comments on sensitive confessions)

2. AI-Powered Tone Transformation (Gemini)
Users can rewrite their confession using AI-powered tones:
Caustic
Poetic
Dark Humor
Brutally Honest
Academic
Frontend sends a request → server calls Gemini → returns tone-rewritten text.

3. AI Moderation System (Gemini Moderation)
Every confession is moderated by Gemini before being published.
The moderation grades map to:
A1 – Safe → Auto Approved
B2 – Mixed → Added as Pending
C4 – Concerning → Flagged
X – Not allowed → Rejected
Admins can later re-review flagged/pending posts.

 4. Fully Private Image System
Uploaded images never leave the browser.
The app:
Loads the image in the browser
Blurs it using <canvas>
Uploads only the blurred version
This keeps user identity completely protected.

 5. Read-Once Confessions
Users may mark a confession as Read Once, meaning:
It is visible only the first time someone views it
After reading, it disappears from the feed
Stored as hasBeenRead = true in the system
This provides a secure, ephemeral messaging experience.

 6. Admin Dashboard
Admins have advanced controls to manage the entire platform.
Features include:
Approve / Reject / Flag confessions
Delete submissions
Review flagged or pending items
Adjust retention policy (auto-delete old confessions after X days)

7. Retention Policy (Auto-Deletion)
Admins can configure:
retentionDays = number_of_days
Any confession older than this is automatically deleted in a scheduled interval.

8. Secure Backend with Gemini Integration


Architecture:
Frontend calls /api/change-tone or /api/moderate
Node.js + Express server calls Gemini API
Result returned safely to client

🏗️ Tech Stack
Frontend
React (TypeScript)
Vite
Tailwind CSS
HTML5 Canvas (for image blurring)
Backend
Node.js
Express.js
Google Gemini API (@google/genai)
