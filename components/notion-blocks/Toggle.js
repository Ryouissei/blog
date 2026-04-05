import { useState } from 'react'

export default function Toggle (props) {
  const { block, children } = props
  const [open, setOpen] = useState(false)

  return (
    <div className="notion-toggle border-l-2 border-gray-200 dark:border-gray-800 pl-4 py-1 my-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-900/40 rounded-r-md">
      <div 
        className="flex items-center cursor-pointer select-none py-1 group"
        onClick={() => setOpen(!open)}
      >
        <span className={`mr-2 transform transition-transform duration-200 ${open ? 'rotate-90' : ''}`}>
          <svg viewBox="0 0 100 100" className="w-3 h-3 fill-current text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
            <polygon points="5.9,88.2 50,11.8 94.1,88.2" />
          </svg>
        </span>
        <div className="font-medium text-gray-700 dark:text-gray-300">
          {block.properties.title[0][0]}
        </div>
      </div>
      {open && (
        <div className="notion-toggle-content mt-2 text-gray-600 dark:text-gray-400">
          {children}
        </div>
      )}
    </div>
  )
}
