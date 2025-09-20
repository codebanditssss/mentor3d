import { NextResponse } from 'next/server'
import { generateCourse } from '../../../../lib/openaiClient'
import { supabase } from '../../../../lib/supabaseClient'

export async function POST(request) {
  try {
    const { tags, userId } = await request.json()

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'Tags are required and must be an array' },
        { status: 400 }
      )
    }

    // Generate course using OpenAI
    const courseData = await generateCourse(tags)

    // Save course to Supabase
    const { data: course, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        description: courseData.description,
        duration: courseData.duration,
        tags: tags,
        lessons: courseData.lessons,
        assessments: courseData.assessments,
        user_id: userId,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save course' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      course: course
    })

  } catch (error) {
    console.error('Course generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate course' },
      { status: 500 }
    )
  }
}
