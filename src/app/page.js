'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Avatar3D from '../components/Avatar3D'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [demoText, setDemoText] = useState('')

  const demoMessages = [
    "Welcome to the future of learning! 🎓",
    "I'm your AI Professor, ready to teach you anything!",
    "Generate courses with simple tags like #react #python #ai",
    "Ask me questions and get instant, contextual answers!",
    "Let's start your learning journey together!"
  ]

  useEffect(() => {
    setIsLoaded(true)
    
    // Demo text rotation
    let messageIndex = 0
    const interval = setInterval(() => {
      setDemoText(demoMessages[messageIndex])
      messageIndex = (messageIndex + 1) % demoMessages.length
    }, 3000)

    return () => clearInterval(interval)
  }, [demoMessages])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🎓</div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Professor
              </span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/dashboard"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <br />
                <span className="text-gray-900">Learning Platform</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Generate custom courses with simple tags, learn from an interactive 3D AI Professor, 
                and get instant feedback on your projects. The future of education is here.
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">#</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Tag-Based Courses</h3>
                  <p className="text-sm text-gray-600">Generate courses instantly with skill tags</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600">🤖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">3D AI Professor</h3>
                  <p className="text-sm text-gray-600">Interactive avatar with voice explanations</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600">💬</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Q&A</h3>
                  <p className="text-sm text-gray-600">Ask questions and get instant answers</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Feedback</h3>
                  <p className="text-sm text-gray-600">Instant grading and personalized reports</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Start Learning Now
              </Link>
              <button
                onClick={() => {
                  document.getElementById('demo-section').scrollIntoView({ 
                    behavior: 'smooth' 
                  })
                }}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                See Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1000+</div>
                <div className="text-sm text-gray-600">Courses Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Tech Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">AI Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - 3D Avatar Demo */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Meet Your AI Professor</h3>
                <p className="text-sm text-gray-600">Interactive • Voice-Enabled • Always Available</p>
              </div>
              
              <Avatar3D 
                isTeaching={isLoaded} 
                currentText={demoText}
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">Currently saying:</div>
                <div className="text-gray-900 font-medium min-h-[1.5rem]">
                  {demoText || "Welcome to AI-powered learning!"}
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg">
              <span className="text-sm font-semibold">Live AI</span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white p-3 rounded-full shadow-lg">
              <span className="text-sm font-semibold">3D Avatar</span>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <section id="demo-section" className="mt-24 py-16 bg-white rounded-2xl shadow-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              From Tags to Mastery in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              See how our AI transforms simple skill tags into comprehensive learning experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-600">#</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Enter Tags</h3>
              <p className="text-gray-600">Type skills like #react #nodejs #auth</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-purple-600">🎓</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">2. AI Generates Course</h3>
              <p className="text-gray-600">Complete curriculum with lessons & projects</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-600">🚀</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Start Learning</h3>
              <p className="text-gray-600">Interactive lessons with AI professor</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-2xl mb-4">🎓</div>
          <h3 className="text-xl font-semibold mb-2">AI Professor Platform</h3>
            <p className="text-gray-400 mb-8">
              &ldquo;From tags to mastery — a personal AI professor for everyone.&rdquo;
            </p>
          <div className="text-sm text-gray-500">
            Built with Next.js, React Three Fiber, OpenAI, and Supabase
          </div>
        </div>
      </footer>
    </div>
  )
}
