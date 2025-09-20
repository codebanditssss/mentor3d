# AI-Powered EdTech Platform with 3D AI Professor 🎓🤖

> "From tags to mastery — a personal AI professor for everyone."

A revolutionary web-based learning platform where students generate custom courses using skill tags and learn from an interactive 3D AI Professor with real-time doubt resolution and project-based assessments.

## ✨ Features

- **🏷️ Tag-Based Course Generation** - Input skills like `#react #python #ai` to generate structured courses
- **🤖 3D AI Professor** - Interactive avatar with text-to-speech explanations  
- **💬 Real-time Q&A** - Ask questions and get contextual answers with code examples
- **📝 Auto-Graded Assessments** - Submit code projects and receive instant AI feedback
- **📊 Progress Dashboard** - Track learning progress with detailed analytics
- **🎯 Personalized Learning** - AI adapts to your pace and learning style

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- OpenAI API key
- RapidAPI account (for Judge0)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd mentor3d
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Fill in your API keys in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Judge0 (for code execution)
JUDGE0_API_KEY=your_rapidapi_key
```

3. **Set up Supabase Database:**

Create these tables in your Supabase dashboard:

```sql
-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  tags TEXT[],
  lessons JSONB,
  assessments JSONB,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table  
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  course_id UUID REFERENCES courses(id),
  assessment_id TEXT,
  code TEXT,
  language TEXT,
  score INTEGER,
  feedback TEXT,
  ai_feedback TEXT,
  execution_result JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat history table
CREATE TABLE chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  lesson_id TEXT,
  question TEXT,
  answer TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. **Run the development server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your AI Professor in action!

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **React Three Fiber** - 3D graphics and avatar rendering
- **Monaco Editor** - Code editing experience
- **Web Speech API** - Text-to-speech for AI professor

### Backend & Database  
- **Supabase** - Authentication, database, and real-time features
- **Supabase Vector DB** - Semantic search for contextual Q&A
- **Judge0 API** - Code execution and auto-grading

### AI Integration
- **OpenAI GPT-4o-mini** - Course generation, explanations, and feedback
- **OpenAI Embeddings** - Semantic search for lesson content

## 📁 Project Structure

```
mentor3d/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── generate-course/
│   │   │   ├── chat/
│   │   │   ├── submit-assessment/
│   │   │   └── dashboard/
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── course/           # Course pages
│   │   └── page.js           # Landing page
│   └── components/           # Reusable components
│       ├── Avatar3D.jsx      # 3D AI Professor
│       ├── ChatBox.jsx       # Q&A interface  
│       ├── CourseCard.jsx    # Course display
│       └── ProgressChart.jsx # Analytics
├── lib/                      # Utility libraries
│   ├── supabaseClient.js     # Database client
│   ├── openaiClient.js       # AI client
│   └── judge0Client.js       # Code execution
└── project.md                # This documentation
```

## 🔄 User Flow

1. **🚪 Login** - Student authenticates via Supabase
2. **📊 Dashboard** - View courses, progress, and recent activity  
3. **🏷️ Generate Course** - Enter tags like `#react #auth` → AI creates curriculum
4. **🎓 Learn** - 3D Professor teaches with voice + interactive elements
5. **❓ Ask Doubts** - Real-time Q&A with contextual answers
6. **📝 Take Assessment** - Submit code → Auto-grading + AI feedback
7. **📈 Track Progress** - Updated dashboard with learning analytics

## 🎯 Demo Script

Perfect for showcasing the platform:

1. **Dashboard Overview** - Show learning statistics and active courses
2. **Course Generation** - Input `#react #auth` and watch AI create curriculum  
3. **Lesson Experience** - 3D professor explains React concepts with voice
4. **Interactive Q&A** - Ask "How do I handle form validation?" → Get code examples
5. **Assessment** - Submit a React component → Receive detailed AI feedback
6. **Progress Report** - Updated dashboard showing improvement areas

## 🔮 Future Enhancements

- **🎬 Avatar Lip Sync** - Synchronized speech animation
- **🎮 Gamification** - Badges, streaks, and leaderboards  
- **👥 Collaborative Learning** - Multi-student virtual classrooms
- **🌍 Multi-language** - Global accessibility
- **📱 Mobile App** - Native iOS/Android experience

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Acknowledgments

Built with love during a 24-hour hackathon to reimagine the future of education.

---

**Ready to revolutionize learning? Start your AI-powered education journey today!** 🚀