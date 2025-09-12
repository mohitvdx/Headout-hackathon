import { useState, useEffect } from 'react'

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = (type) => {
    const baseStyles = "fixed top-4 right-4 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 max-w-md transition-all duration-300 transform backdrop-blur-sm border"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-50/95 to-emerald-50/95 border-green-200/50 text-green-800`
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-50/95 to-rose-50/95 border-red-200/50 text-red-800`
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-yellow-50/95 to-amber-50/95 border-yellow-200/50 text-yellow-800`
      case 'info':
        return `${baseStyles} bg-gradient-to-r from-blue-50/95 to-sky-50/95 border-blue-200/50 text-blue-800`
      default:
        return `${baseStyles} bg-gradient-to-r from-amber-50/95 to-yellow-50/95 border-amber-200/50 text-amber-800`
    }
  }

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  }

  return (
    <div className={`${isVisible ? getToastStyles(type) + ' opacity-100 translate-y-0' : getToastStyles(type) + ' opacity-0 -translate-y-2'}`}>
      <span className="text-lg mr-2">{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="ml-auto text-lg hover:opacity-70 transition-opacity"
      >
        ×
      </button>
    </div>
  )
}

export default Toast
