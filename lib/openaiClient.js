import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default openai

// Helper function to generate course content
export async function generateCourse(tags) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert curriculum designer. Create a structured course outline based on the provided skill tags. Include lessons, assessments, and learning objectives."
        },
        {
          role: "user",
          content: `Create a comprehensive course outline for these skill tags: ${tags.join(', ')}. 
          
          Format the response as JSON with this structure:
          {
            "title": "Course Title",
            "description": "Course Description",
            "duration": "Estimated duration",
            "lessons": [
              {
                "id": 1,
                "title": "Lesson Title",
                "content": "Lesson content with code examples",
                "duration": "30 minutes",
                "objectives": ["Learning objective 1", "Learning objective 2"]
              }
            ],
            "assessments": [
              {
                "id": 1,
                "title": "Assessment Title",
                "type": "project|quiz|code",
                "description": "Assessment description",
                "requirements": ["Requirement 1", "Requirement 2"]
              }
            ]
          }`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    return JSON.parse(response.choices[0].message.content)
  } catch (error) {
    console.error('Error generating course:', error)
    throw error
  }
}

// Helper function to answer student doubts
export async function answerDoubt(question, lessonContent) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an AI professor. Answer student questions clearly and provide code examples when relevant. Be encouraging and educational."
        },
        {
          role: "user",
          content: `Lesson Context: ${lessonContent}
          
          Student Question: ${question}
          
          Please provide a clear, helpful answer with code examples if applicable.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error answering doubt:', error)
    throw error
  }
}

// Helper function to generate embeddings for semantic search
export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}
