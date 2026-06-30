import React from 'react'

export const SkeletonCard = () => {
  return (
    <div className="rounded-lg overflow-hidden bg-white border border-gray-200 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-300" />

      {/* Content skeleton */}
      <div className="p-4 space-y-4">
        <div className="h-6 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-5/6" />

        {/* Stats skeleton */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto mb-2" />
            <div className="h-3 bg-gray-300 rounded w-1/3 mx-auto" />
          </div>
          <div className="flex-1">
            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto mb-2" />
            <div className="h-3 bg-gray-300 rounded w-1/3 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export const SkeletonRow = () => {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg animate-pulse">
      <div className="w-16 h-16 bg-gray-300 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-1/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
      </div>
      <div className="flex gap-4">
        <div className="h-8 bg-gray-300 rounded w-12" />
        <div className="h-8 bg-gray-300 rounded w-12" />
      </div>
    </div>
  )
}

export const SkeletonList = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}
