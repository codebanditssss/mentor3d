

---

```markdown
# AI-Powered EdTech Platform with 3D AI Professor 🎓🤖

## 🚀 Overview
This project is a **web-based platform** where students can generate **custom courses** using skill tags (e.g., `#react.js`, `#data-structures`) and learn from an **interactive 3D AI Professor**.  
The professor teaches lessons, answers **doubts in real-time**, and provides **hands-on project-based assessments** with **instant feedback**.  
A **dashboard** tracks progress, shows reports, and makes learning engaging, personalized, and immersive.  

Built in a **24-hour hackathon** to reimagine online learning.

---

## ✨ Key Features
- **Tag-based Course Generator** → Input tags like `#ml #cloud` to generate a structured course outline.
- **3D AI Professor** → Avatar explains lessons with text-to-speech voice and visual presence.
- **Interactive Doubt Chat** → Ask real questions; AI answers contextually with code snippets.
- **Project-Based Assessments** → Submit mini-projects/quizzes and get auto-graded results.
- **Instant AI Feedback & Reports** → Strengths, weaknesses, and improvement suggestions.
- **Dashboard** → Manage courses, track progress, see recent activity, and quick-launch lessons.

---

## 🛠️ Tech Stack
**Frontend**
- Next.js (React) + Tailwind CSS → UI framework & styling
- React-Three-Fiber + Drei → Render 3D avatar (glTF model)
- Web Speech API → Free text-to-speech for professor’s voice
- Monaco Editor → Code editing for assessments

**Backend & Database**
- Supabase → Authentication, database, and storage
- Supabase Vector DB → Store lesson embeddings for contextual Q&A
- Judge0 API → Run and auto-grade code submissions

**AI**
- OpenAI GPT-4o-mini → Generate courses, explain lessons, answer doubts, write reports
- OpenAI text-embedding-3-small → For semantic search in lessons (doubt resolution)

**Hosting**
- Vercel → Free deployment

---

## 🔄 User Workflow
1. **Login / Signup** → Student logs in (Supabase Auth).  
2. **Dashboard** → Shows courses, progress, and recent activity.  
3. **Generate Course** → Enter tags → AI generates course outline.  
4. **Play Lesson** → 3D Professor teaches content with TTS + code snippets.  
5. **Ask Doubts** → Student types a question → AI professor answers live.  
6. **Take Assessment** → Student submits project/code → Judge0 runs → AI provides feedback.  
7. **View Report** → Dashboard updates with progress + AI-generated learning report.  

---

## 📂 Project Structure (simplified)
```

/project-root
├── /pages
│   ├── index.js            # Landing page
│   ├── dashboard.js        # Main dashboard
│   ├── course/\[id].js      # Course details
│   ├── lesson/\[id].js      # Lesson player
│   ├── assessment/\[id].js  # Assessment page
│   └── api/                # API routes
│       ├── generate-course.js
│       ├── chat.js
│       ├── submit-assessment.js
│       └── dashboard.js
├── /components             # Reusable React components
│   ├── Topbar.jsx
│   ├── LeftNav.jsx
│   ├── CourseCard.jsx
│   ├── Avatar3D.jsx
│   ├── ChatBox.jsx
│   └── ProgressChart.jsx
├── /lib
│   ├── supabaseClient.js   # Supabase setup
│   ├── openaiClient.js     # OpenAI setup
│   └── judge0Client.js     # Judge0 setup
├── project.md              # This file
└── README.md               # General readme

```

---

## 🧪 API Endpoints
- `POST /api/generate-course` → Input: tags → Output: course JSON saved to Supabase  
- `GET /api/dashboard` → Returns user courses, progress, activity  
- `POST /api/chat` → Input: question + lessonId → Output: contextual answer  
- `POST /api/submit-assessment` → Input: code → Output: Judge0 result + AI feedback  

---

## 🧑‍🤝‍🧑 Team Roles (example split)
- **Frontend Lead** → Dashboard, Lesson Player, Avatar integration  
- **Backend Lead** → API routes, Supabase, Judge0 integration  
- **AI Lead** → OpenAI prompts, embeddings, Q&A logic  

---

## 🎯 Hackathon Demo Flow
1. Go to Dashboard → Show quick stats.  
2. Generate course with tags → “#react.js #auth”.  
3. Open Lesson → Avatar introduces concept + speaks lesson.  
4. Ask a doubt → AI answers instantly with code.  
5. Take assessment → Submit code → Get auto-feedback.  
6. Show Dashboard updated report → End with tagline:  
   **“From tags to mastery — a personal AI professor for everyone.”**

---

## 📝 Future Improvements
- Lip-sync avatar animation with speech  
- Gamification (badges, leaderboards, streaks)  
- Collaborative classrooms with multiple students  
- Multi-language support for global learners  

---

## 📌 License
MIT License — free to use, remix, and extend.
```

---