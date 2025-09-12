const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} border-4 border-amber-200/50 border-t-amber-500 rounded-full animate-spin shadow-sm`}></div>
      {text && <p className="text-amber-700/70 text-sm font-medium">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
