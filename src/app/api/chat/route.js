import { NextResponse } from 'next/server'
import { answerDoubt } from '../../../../lib/openaiClient'
import { supabase } from '../../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const { question, lessonId, courseId } = await request.json()

    if (!question || !lessonId) {
      return NextResponse.json(
        { error: 'Question and lesson ID are required' },
        { status: 400 }
      )
    }

    // Get lesson content for context
    const { data: course, error } = await supabase
      .from('courses')
      .select('lessons')
      .eq('id', courseId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch lesson content' },
        { status: 500 }
      )
    }

    const lesson = course.lessons.find(l => l.id == lessonId)
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }

    // Generate answer using OpenAI
    const answer = await answerDoubt(question, lesson.content)

    // Save chat interaction (optional)
    await supabase
      .from('chat_history')
      .insert({
        course_id: courseId,
        lesson_id: lessonId,
        question: question,
        answer: answer,
        timestamp: new Date().toISOString()
      })

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
