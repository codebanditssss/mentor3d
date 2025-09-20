import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Service role client for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Helper functions for database operations
export const dbHelpers = {
  // Create user profile
  async createProfile(userId, userData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...userData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get user's courses with enrollment data
  async getUserCourses(userId) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_enrollments!inner(
          user_id,
          enrollment_date,
          progress_percentage,
          status,
          last_accessed
        )
      `)
      .eq('course_enrollments.user_id', userId)
      .eq('course_enrollments.status', 'active')
      .order('course_enrollments.last_accessed', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Create course enrollment
  async enrollInCourse(userId, courseId) {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'active',
        progress_percentage: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update user progress
  async updateProgress(userId, lessonId, courseId, progressData) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        course_id: courseId,
        ...progressData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Save chat interaction
  async saveChatInteraction(userId, courseId, lessonId, question, answer) {
    const { data, error } = await supabase
      .from('chat_history')
      .insert({
        user_id: userId,
        course_id: courseId,
        lesson_id: lessonId,
        question,
        answer,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Log learning session
  async logLearningSession(userId, courseId, sessionData) {
    const { data, error } = await supabase
      .from('learning_analytics')
      .insert({
        user_id: userId,
        course_id: courseId,
        ...sessionData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Create achievement
  async createAchievement(userId, achievementData) {
    const { data, error } = await supabase
      .from('achievements')
      .insert({
        user_id: userId,
        ...achievementData,
        earned_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}
