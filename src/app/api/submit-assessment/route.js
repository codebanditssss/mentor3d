import { NextResponse } from 'next/server'
import { gradeSubmission, LANGUAGE_IDS } from '../../../../lib/judge0Client'
import { supabase } from '../../../../lib/supabaseClient'
import openai from '../../../../lib/openaiClient'

export async function POST(request) {
  try {
    const { 
      code, 
      language, 
      assessmentId, 
      courseId, 
      userId,
      expectedOutput 
    } = await request.json()

    if (!code || !language || !assessmentId) {
      return NextResponse.json(
        { error: 'Code, language, and assessment ID are required' },
        { status: 400 }
      )
    }

    const languageId = LANGUAGE_IDS[language.toLowerCase()]
    if (!languageId) {
      return NextResponse.json(
        { error: 'Unsupported programming language' },
        { status: 400 }
      )
    }

    // Grade the submission using Judge0
    const gradingResult = await gradeSubmission(code, expectedOutput || '', languageId)

    // Generate AI feedback using OpenAI
    const aiAnalysis = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert programming instructor. Analyze the student's code and provide constructive feedback focusing on code quality, best practices, and learning improvements."
        },
        {
          role: "user",
          content: `Student's Code:
${code}

Execution Result:
- Score: ${gradingResult.score}%
- Output: ${gradingResult.execution_result?.stdout || 'No output'}
- Errors: ${gradingResult.execution_result?.stderr || 'None'}

Please provide detailed feedback on:
1. Code quality and structure
2. Areas for improvement
3. Positive aspects
4. Specific suggestions for learning`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const aiFeedback = aiAnalysis.choices[0].message.content

    // Save submission to database
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        course_id: courseId,
        assessment_id: assessmentId,
        code: code,
        language: language,
        score: gradingResult.score,
        feedback: gradingResult.feedback,
        ai_feedback: aiFeedback,
        execution_result: gradingResult.execution_result,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      result: {
        score: gradingResult.score,
        feedback: gradingResult.feedback,
        aiFeedback: aiFeedback,
        executionResult: gradingResult.execution_result,
        submissionId: submission.id
      }
    })

  } catch (error) {
    console.error('Assessment submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}
