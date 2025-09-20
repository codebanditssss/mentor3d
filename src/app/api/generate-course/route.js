import { NextResponse } from 'next/server'
import { generateCourse } from '../../../../lib/openaiClient'
import { supabase, dbHelpers } from '../../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const { tags, userId } = await request.json()

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Tags are required and must be an array' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Generate course using OpenAI
    const courseData = await generateCourse(tags)

    // Calculate estimated hours and lesson count
    const totalLessons = courseData.lessons?.length || 0
    const estimatedHours = totalLessons * 0.5 // Assume 30 min per lesson

    // Save course to Supabase
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        duration: courseData.duration,
        tags: tags,
        lessons: courseData.lessons,
        assessments: courseData.assessments,
        user_id: userId,
        instructor_id: userId,
        status: 'active',
        total_lessons: totalLessons,
        estimated_hours: estimatedHours,
        difficulty_level: 'beginner'
      })
      .select()
      .single()

    if (courseError) {
      console.error('Database error:', courseError)
      return NextResponse.json(
        { error: 'Failed to save course' },
        { status: 500 }
      )
    }

    // Create course enrollment for the user
    try {
      await dbHelpers.enrollInCourse(userId, course.id)
    } catch (enrollError) {
      console.error('Enrollment error:', enrollError)
      // Continue even if enrollment fails
    }

    // Create lessons in the database
    if (courseData.lessons && courseData.lessons.length > 0) {
      const lessonInserts = courseData.lessons.map((lesson, index) => ({
        course_id: course.id,
        title: lesson.title,
        content: lesson.content || '',
        lesson_type: 'theory',
        order_number: index + 1,
        duration_minutes: 30,
        objectives: lesson.objectives || [],
        is_published: true
      }))

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonInserts)

      if (lessonsError) {
        console.error('Lessons creation error:', lessonsError)
        // Continue even if lessons creation fails
      }
    }

    // Create assessments in the database
    if (courseData.assessments && courseData.assessments.length > 0) {
      const assessmentInserts = courseData.assessments.map(assessment => ({
        course_id: course.id,
        title: assessment.title,
        description: assessment.description,
        assessment_type: assessment.type || 'quiz',
        questions: assessment.questions || {},
        max_score: 100,
        passing_score: 70,
        time_limit_minutes: 60,
        is_published: true
      }))

      const { error: assessmentsError } = await supabase
        .from('assessments')
        .insert(assessmentInserts)

      if (assessmentsError) {
        console.error('Assessments creation error:', assessmentsError)
        // Continue even if assessments creation fails
      }
    }

    // Log learning analytics
    try {
      await dbHelpers.logLearningSession(userId, course.id, {
        total_time_minutes: 5, // Course generation time
        lessons_completed: 0,
        questions_asked: 0,
        assessments_taken: 0,
        engagement_score: 100,
        device_type: 'web',
        browser_info: 'web-app'
      })
    } catch (analyticsError) {
      console.error('Analytics error:', analyticsError)
      // Continue even if analytics logging fails
    }

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        lessons: courseData.lessons,
        assessments: courseData.assessments
      }
    })

  } catch (error) {
    console.error('Course generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate course' },
      { status: 500 }
    )
  }
}
