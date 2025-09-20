import { NextResponse } from 'next/server'
import { answerDoubt } from '../../../../lib/openaiClient'
import { supabase, dbHelpers } from '../../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const { question, lessonId, courseId, userId } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    let lessonContent = "I'm your AI professor assistant, ready to help with any questions!"
    
    // Get lesson content for context if lessonId is provided
    if (lessonId && lessonId !== 'dashboard' && courseId) {
      try {
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('content, title')
          .eq('id', lessonId)
          .eq('course_id', courseId)
          .single()

        if (!lessonError && lesson) {
          lessonContent = `Lesson: ${lesson.title}\n\nContent: ${lesson.content}`
        }
      } catch (lessonFetchError) {
        console.error('Lesson fetch error:', lessonFetchError)
        // Continue with general context
      }
    } else if (courseId && courseId !== 'general') {
      // Get course content for context
      try {
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('title, description, lessons')
          .eq('id', courseId)
          .single()

        if (!courseError && course) {
          lessonContent = `Course: ${course.title}\n\nDescription: ${course.description}`
          
          if (course.lessons && course.lessons.length > 0) {
            const lessonTitles = course.lessons.map(l => l.title).join(', ')
            lessonContent += `\n\nLessons: ${lessonTitles}`
          }
        }
      } catch (courseFetchError) {
        console.error('Course fetch error:', courseFetchError)
        // Continue with general context
      }
    }

    // Generate answer using OpenAI
    const answer = await answerDoubt(question, lessonContent)

    // Save chat interaction if userId is provided
    if (userId && userId !== 'demo-user') {
      try {
        await dbHelpers.saveChatInteraction(
          userId,
          courseId || 'general',
          lessonId || 'dashboard',
          question,
          answer
        )
      } catch (saveError) {
        console.error('Chat save error:', saveError)
        // Continue even if saving fails
      }
    }

    return NextResponse.json({
      success: true,
      answer: answer,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}
