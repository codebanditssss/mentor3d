import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabaseClient'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Fetch user's courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('Courses fetch error:', coursesError)
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      )
    }

    // Fetch recent submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select(`
        *,
        courses (title)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(10)

    if (submissionsError) {
      console.error('Submissions fetch error:', submissionsError)
    }

    // Calculate progress statistics
    const stats = {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.status === 'active').length,
      completedCourses: courses.filter(c => c.status === 'completed').length,
      totalLessons: courses.reduce((sum, course) => sum + (course.lessons?.length || 0), 0),
      completedLessons: 0, // This would need to be tracked in a separate table
      averageScore: 0,
      recentActivity: []
    }

    // Calculate average score from submissions
    if (submissions && submissions.length > 0) {
      const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0)
      stats.averageScore = Math.round(totalScore / submissions.length)
    }

    // Format recent activity
    if (submissions) {
      stats.recentActivity = submissions.slice(0, 5).map(sub => ({
        type: 'submission',
        title: `Assessment submitted for ${sub.courses?.title || 'Unknown Course'}`,
        score: sub.score,
        date: sub.submitted_at
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        courses: courses,
        stats: stats,
        recentSubmissions: submissions || [],
        recentActivity: stats.recentActivity
      }
    })

  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
