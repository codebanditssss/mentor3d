'use client'
import { useState, useEffect } from 'react'

export default function ProgressChart({ 
  userProgress = {},
  timeframe = 'week' // 'week', 'month', 'year'
}) {
  const [chartData, setChartData] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    averageScore: 0,
    streak: 0
  })

  useEffect(() => {
    // Generate mock data for visualization
    const generateChartData = () => {
      const days = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365
      const data = []
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        
        data.push({
          date: date.toISOString().split('T')[0],
          lessons: Math.floor(Math.random() * 5),
          hours: Math.random() * 3,
          score: 70 + Math.random() * 30
        })
      }
      
      return data
    }

    setChartData(generateChartData())
    
    // Calculate stats from userProgress
    setStats({
      totalCourses: userProgress.courses?.length || 3,
      completedLessons: userProgress.completedLessons || 24,
      totalLessons: userProgress.totalLessons || 45,
      averageScore: userProgress.averageScore || 87,
      streak: userProgress.streak || 7
    })
  }, [timeframe, userProgress])

  const maxLessons = Math.max(...chartData.map(d => d.lessons))

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">{stats.totalCourses}</div>
          <div className="text-sm opacity-90">Active Courses</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">{stats.completedLessons}</div>
          <div className="text-sm opacity-90">Lessons Done</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">{Math.round((stats.completedLessons / stats.totalLessons) * 100)}%</div>
          <div className="text-sm opacity-90">Progress</div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">{stats.averageScore}%</div>
          <div className="text-sm opacity-90">Avg Score</div>
        </div>
        
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-4 rounded-lg">
          <div className="text-2xl font-bold">{stats.streak}</div>
          <div className="text-sm opacity-90">Day Streak 🔥</div>
        </div>
      </div>

      {/* Chart Title */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Learning Activity</h3>
        <div className="flex space-x-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeframe === period
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setTimeframe && setTimeframe(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="relative">
        <div className="flex items-end justify-between h-48 mb-4">
          {chartData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div
                className="bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm w-full min-h-[4px] transition-all duration-300 hover:from-blue-600 hover:to-blue-400"
                style={{
                  height: `${(day.lessons / (maxLessons || 1)) * 100}%`
                }}
                title={`${day.lessons} lessons, ${day.hours.toFixed(1)} hours`}
              ></div>
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-gray-500">
          {chartData.map((day, index) => {
            if (timeframe === 'week' || index % 7 === 0) {
              return (
                <span key={index} className="flex-1 text-center">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              )
            }
            return <span key={index} className="flex-1"></span>
          })}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-semibold text-gray-800 mb-3">Recent Achievements</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-lg">🏆</span>
            <span className="text-gray-700">Completed React.js Fundamentals</span>
            <span className="text-gray-500">2 days ago</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-lg">🔥</span>
            <span className="text-gray-700">7-day learning streak!</span>
            <span className="text-gray-500">Today</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-lg">⭐</span>
            <span className="text-gray-700">Perfect score on JavaScript Assessment</span>
            <span className="text-gray-500">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}