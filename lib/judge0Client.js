import axios from 'axios'

const JUDGE0_API_URL = process.env.JUDGE0_API_URL
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY

const judge0Client = axios.create({
  baseURL: JUDGE0_API_URL,
  headers: {
    'X-RapidAPI-Key': JUDGE0_API_KEY,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    'Content-Type': 'application/json'
  }
})

// Language ID mappings for Judge0
export const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
  go: 60,
  rust: 73,
  php: 68,
  ruby: 72,
  swift: 83,
  kotlin: 78,
  typescript: 74
}

export async function executeCode(sourceCode, languageId, stdin = '') {
  try {
    // Submit code for execution
    const submitResponse = await judge0Client.post('/submissions', {
      source_code: btoa(sourceCode), // Base64 encode
      language_id: languageId,
      stdin: btoa(stdin),
      wait: true,
      fields: '*'
    })

    const submissionId = submitResponse.data.token

    // Get execution result
    const resultResponse = await judge0Client.get(`/submissions/${submissionId}`)
    
    return {
      stdout: resultResponse.data.stdout ? atob(resultResponse.data.stdout) : '',
      stderr: resultResponse.data.stderr ? atob(resultResponse.data.stderr) : '',
      compile_output: resultResponse.data.compile_output ? atob(resultResponse.data.compile_output) : '',
      status: resultResponse.data.status,
      time: resultResponse.data.time,
      memory: resultResponse.data.memory
    }
  } catch (error) {
    console.error('Error executing code:', error)
    throw error
  }
}

export async function gradeSubmission(code, expectedOutput, languageId) {
  try {
    const result = await executeCode(code, languageId)
    
    // Simple grading logic - you can make this more sophisticated
    const isCorrect = result.stdout.trim() === expectedOutput.trim()
    const hasErrors = result.stderr || result.compile_output
    
    let score = 0
    let feedback = []
    
    if (isCorrect && !hasErrors) {
      score = 100
      feedback.push('✅ Perfect! Your code produces the correct output.')
    } else if (isCorrect && hasErrors) {
      score = 80
      feedback.push('✅ Correct output, but there are warnings.')
      feedback.push(`⚠️ Warnings: ${result.stderr || result.compile_output}`)
    } else if (!hasErrors) {
      score = 50
      feedback.push('❌ Code runs but output is incorrect.')
      feedback.push(`Expected: ${expectedOutput}`)
      feedback.push(`Got: ${result.stdout}`)
    } else {
      score = 20
      feedback.push('❌ Code has compilation/runtime errors.')
      feedback.push(`Error: ${result.stderr || result.compile_output}`)
    }
    
    return {
      score,
      feedback: feedback.join('\n'),
      execution_result: result
    }
  } catch (error) {
    return {
      score: 0,
      feedback: `Error executing code: ${error.message}`,
      execution_result: null
    }
  }
}
