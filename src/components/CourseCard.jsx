'use client'
import Link from 'next/link'

export default function CourseCard({ course, progress = 0 }) {
  const {
    id,
    title,
    description,
    duration,
    lessons = [],
    tags = [],
    created_at
  } = course

  const completedLessons = lessons.filter(lesson => lesson.completed).length
  const totalLessons = lessons.length
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const getTagColor = (tag) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ]
    return colors[tag.length % colors.length]
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        <div className="flex items-center justify-between text-sm opacity-90">
          <span>🕐 {duration}</span>
          <span>📚 {totalLessons} lessons</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{description}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(tag)}`}
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {completedLessons} of {totalLessons} lessons completed
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            href={`/course/${id}`}
            className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            {progressPercentage === 0 ? 'Start Learning' : 'Continue'}
          </Link>
          
          {progressPercentage > 0 && (
            <Link
              href={`/course/${id}/dashboard`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              📊
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-500">
        Created {new Date(created_at).toLocaleDateString()}
      </div>
    </div>
  )
}