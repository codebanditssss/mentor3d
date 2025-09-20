'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import Avatar3D from '../../components/Avatar3D'
import CourseCard from '../../components/CourseCard'
import ProgressChart from '../../components/ProgressChart'
import ChatBox from '../../components/ChatBox'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAITeaching, setIsAITeaching] = useState(true)
  const [aiMessage, setAiMessage] = useState("Welcome! Let me fetch your personalized dashboard...")
  const [showChatBox, setShowChatBox] = useState(false)
  const [courses, setCourses] = useState([])
  const [userProgress, setUserProgress] = useState({})
  const [recentConversations, setRecentConversations] = useState([])
  const [achievements, setAchievements] = useState([])
  const [learningAnalytics, setLearningAnalytics] = useState({})
  const [error, setError] = useState(null)

  // Fetch user data and dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('User error:', userError)
        // For demo purposes, create a mock user if not authenticated
        setUser({ id: 'demo-user', email: 'demo@mentor3d.com' })
        setProfile({ full_name: 'Demo User', role: 'student' })
        await loadDemoData()
        return
      }

      if (!user) {
        // Redirect to login or create demo user
        setUser({ id: 'demo-user', email: 'demo@mentor3d.com' })
        setProfile({ full_name: 'Demo User', role: 'student' })
        await loadDemoData()
        return
      }

      setUser(user)

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError)
        // Create profile if it doesn't exist
        await createUserProfile(user)
      } else {
        setProfile(profileData)
      }

      // Fetch all dashboard data in parallel
      await Promise.all([
        fetchUserCourses(user.id),
        fetchUserProgress(user.id),
        fetchRecentConversations(user.id),
        fetchAchievements(user.id),
        fetchLearningAnalytics(user.id)
      ])

    } catch (error) {
      console.error('Dashboard error:', error)
      setError('Failed to load dashboard data')
      // Load demo data as fallback
      await loadDemoData()
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || 'Student',
          role: 'student'
        })
        .select()
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error creating profile:', error)
    }
  }

  const fetchUserCourses = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_enrollments!inner(
            user_id,
            enrollment_date,
            progress_percentage,
            status
          )
        `)
        .eq('course_enrollments.user_id', userId)
        .eq('course_enrollments.status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match component expectations
      const transformedCourses = data?.map(course => ({
        ...course,
        lessons: course.lessons || [],
        progress: course.course_enrollments?.[0]?.progress_percentage || 0
      })) || []

      setCourses(transformedCourses)
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([]) // Set empty array on error
    }
  }

  const fetchUserProgress = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select(`
          *,
          lessons(title, course_id),
          courses(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculate progress statistics
      const totalLessons = data?.length || 0
      const completedLessons = data?.filter(p => p.status === 'completed').length || 0
      const averageScore = data?.length > 0 
        ? Math.round(data.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / data.length)
        : 0

      setUserProgress({
        totalLessons,
        completedLessons,
        averageScore,
        progressData: data || []
      })
    } catch (error) {
      console.error('Error fetching user progress:', error)
      setUserProgress({ totalLessons: 0, completedLessons: 0, averageScore: 0 })
    }
  }

  const fetchRecentConversations = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select(`
          *,
          courses(title)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error

      const conversations = data?.map(conv => ({
        question: conv.question,
        answer: conv.answer,
        course: conv.courses?.title,
        time: new Date(conv.created_at).toLocaleDateString()
      })) || []

      setRecentConversations(conversations)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setRecentConversations([])
    }
  }

  const fetchAchievements = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false })
        .limit(3)

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error('Error fetching achievements:', error)
      setAchievements([])
    }
  }

  const fetchLearningAnalytics = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30) // Last 30 sessions

      if (error) throw error

      // Calculate streak and other analytics
      const totalSessions = data?.length || 0
      const totalTime = data?.reduce((sum, session) => sum + (session.total_time_minutes || 0), 0) || 0
      const averageScore = data?.length > 0
        ? Math.round(data.reduce((sum, session) => sum + (session.average_score || 0), 0) / data.length)
        : 0

      // Calculate streak (simplified - consecutive days with activity)
      let streak = 0
      if (data && data.length > 0) {
        const today = new Date()
        const sessionDates = data.map(s => new Date(s.created_at).toDateString())
        const uniqueDates = [...new Set(sessionDates)].sort((a, b) => new Date(b) - new Date(a))
        
        for (let i = 0; i < uniqueDates.length; i++) {
          const sessionDate = new Date(uniqueDates[i])
          const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24))
          
          if (daysDiff === i) {
            streak++
          } else {
            break
          }
        }
      }

      setLearningAnalytics({
        totalSessions,
        totalTime,
        averageScore,
        streak,
        sessionData: data || []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setLearningAnalytics({ totalSessions: 0, totalTime: 0, averageScore: 0, streak: 0 })
    }
  }

  // Load demo data as fallback
  const loadDemoData = async () => {
    setCourses([
      {
        id: 1,
        title: "React.js Fundamentals",
        description: "Master the basics of React including components, props, state, and hooks",
        duration: "6 hours",
        tags: ["react", "javascript", "frontend"],
        lessons: [
          { id: 1, title: "Introduction", completed: true },
          { id: 2, title: "Components", completed: true },
          { id: 3, title: "Props & State", completed: true },
          { id: 4, title: "Hooks", completed: false },
          { id: 5, title: "Project", completed: false }
        ],
        created_at: "2024-01-15",
        status: "active",
        progress: 60
      }
    ])

    setUserProgress({
      totalLessons: 45,
      completedLessons: 24,
      averageScore: 87
    })

    setLearningAnalytics({
      totalSessions: 15,
      totalTime: 180,
      averageScore: 87,
      streak: 7
    })

    setRecentConversations([
      { question: "How does React state work?", time: "2 hours ago" },
      { question: "Debug my JavaScript function", time: "5 hours ago" }
    ])

    setAchievements([
      { title: "Code Master", description: "Completed 10 coding challenges", badge_url: "🏆" },
      { title: "React Expert", description: "Mastered React fundamentals", badge_url: "🎓" }
    ])
  }

  const handleAIChat = async (message) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: message,
          lessonId: 'dashboard',
          courseId: courses[0]?.id || 'general'
        }),
      })

      if (!response.ok) throw new Error('Failed to get AI response')

      const data = await response.json()
      return data.answer || "I'm here to help! Ask me anything about your courses."
    } catch (error) {
      console.error('Chat error:', error)
      return "I'm having trouble connecting right now. Please try again!"
    }
  }

  const handleGenerateCourse = async () => {
    try {
      const tags = prompt("Enter skill tags (e.g., react, python, ai):")?.split(',').map(t => t.trim())
      
      if (!tags || tags.length === 0) return

      const response = await fetch('/api/generate-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags,
          userId: user?.id || 'demo-user'
        }),
      })

      if (!response.ok) throw new Error('Failed to generate course')

      const data = await response.json()
      
      // Refresh courses list
      if (user?.id) {
        await fetchUserCourses(user.id)
      }
      
      alert('Course generated successfully!')
    } catch (error) {
      console.error('Course generation error:', error)
      alert('Failed to generate course. Please try again.')
    }
  }

  // AI message cycling
  const aiMessages = [
    `Welcome back${profile?.full_name ? `, ${profile.full_name}` : ''}! Ready to continue learning?`,
    `You've completed ${userProgress.completedLessons || 0} lessons so far. Great progress!`,
    `Your learning streak is ${learningAnalytics.streak || 0} days. Keep it up!`,
    "What would you like to learn today?",
    "I'm here to help with any questions!"
  ]

  useEffect(() => {
    if (!loading) {
      let messageIndex = 0
      const interval = setInterval(() => {
        setAiMessage(aiMessages[messageIndex])
        messageIndex = (messageIndex + 1) % aiMessages.length
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [loading, profile, userProgress, learningAnalytics])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎓</div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MENTOR3D
              </span>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses, topics, or ask AI..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChatBox(!showChatBox)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
              >
                🤖 Ask AI
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - AI Professor Integration */}
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              {/* AI Professor */}
              <div className="relative">
                <Avatar3D 
                  isTeaching={isAITeaching} 
                  currentText={aiMessage}
                />
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                  LIVE
                </div>
              </div>

              {/* AI Message & Quick Stats */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Hello {profile?.full_name || 'Student'}! 👋
                  </h2>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-gray-800 font-medium">{aiMessage}</p>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={handleGenerateCourse}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-md"
                  >
                    <div className="text-sm font-semibold">🏷️ Generate Course</div>
                  </button>
                  <Link 
                    href={courses[0] ? `/course/${courses[0].id}` : '#'}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md text-center"
                  >
                    <div className="text-sm font-semibold">▶️ Continue Learning</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gamified Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{learningAnalytics.streak || 0}</div>
                  <div className="text-sm opacity-90">Day Streak</div>
                </div>
                <div className="text-2xl">🔥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{courses.length}</div>
                  <div className="text-sm opacity-90">Active Courses</div>
                </div>
                <div className="text-2xl">📚</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{userProgress.completedLessons || 0}</div>
                  <div className="text-sm opacity-90">Lessons Done</div>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{userProgress.averageScore || 0}%</div>
                  <div className="text-sm opacity-90">Avg Score</div>
                </div>
                <div className="text-2xl">📈</div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={handleGenerateCourse}
                className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
              >
                <div className="text-2xl mb-2">🏷️</div>
                <div className="text-sm font-medium text-gray-700">Generate Course</div>
              </button>
              
              <Link
                href={courses[0] ? `/course/${courses[0].id}` : '#'}
                className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-center block"
              >
                <div className="text-2xl mb-2">▶️</div>
                <div className="text-sm font-medium text-gray-700">Continue Learning</div>
              </Link>
              
              <button 
                onClick={() => setShowChatBox(true)}
                className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-center"
              >
                <div className="text-2xl mb-2">💬</div>
                <div className="text-sm font-medium text-gray-700">Ask AI</div>
              </button>
              
              <button className="p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-sm font-medium text-gray-700">Take Quiz</div>
              </button>
            </div>
          </div>
        </section>

        {/* Course Grid */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">📚 My Courses</h3>
            <button className="text-blue-600 hover:text-blue-800 font-medium">View All →</button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
            
            {/* Add New Course Card */}
            <div 
              onClick={handleGenerateCourse}
              className="bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-300 p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
            >
              <div className="text-4xl text-gray-400 group-hover:text-blue-500 mb-4">➕</div>
              <h3 className="text-lg font-semibold text-gray-600 group-hover:text-blue-600 mb-2">Create New Course</h3>
              <p className="text-gray-500 text-sm">Use AI to generate a personalized course</p>
            </div>
          </div>
        </section>

        {/* Analytics & Recent Activity */}
        <section className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Progress Chart */}
          <div className="bg-white rounded-xl shadow-lg">
            <ProgressChart userProgress={userProgress} />
          </div>

          {/* Recent AI Conversations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-2">💬</span>
              Recent AI Conversations
            </h3>
            <div className="space-y-4">
              {recentConversations.length > 0 ? (
                recentConversations.map((conv, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-sm">🤖</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{conv.question}</p>
                      <p className="text-xs text-gray-500">{conv.time}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p>No conversations yet</p>
                  <p className="text-sm">Start chatting with your AI professor!</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowChatBox(true)}
              className="w-full mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Start New Conversation →
            </button>
          </div>
        </section>

        {/* Achievement Showcase */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">🎯 Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">{achievement.badge_url || '🏆'}</div>
                    <div className="font-semibold">{achievement.title}</div>
                    <div className="text-sm opacity-90">{achievement.description}</div>
                  </div>
                ))
              ) : (
                <>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="font-semibold">First Steps</div>
                    <div className="text-sm opacity-90">Welcome to Mentor3D!</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🎓</div>
                    <div className="font-semibold">Learner</div>
                    <div className="text-sm opacity-90">Ready to start your journey</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold">Explorer</div>
                    <div className="text-sm opacity-90">Discover new topics</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Chat Box */}
      {showChatBox && (
        <div className="fixed bottom-4 right-4 w-96 z-50">
          <div className="relative">
            <button
              onClick={() => setShowChatBox(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 z-10"
            >
              ×
            </button>
            <ChatBox 
              onSendMessage={handleAIChat}
              messages={[]}
              placeholder="Ask your AI professor anything..."
            />
          </div>
        </div>
      )}
    </div>
  )
}