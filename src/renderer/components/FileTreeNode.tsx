import React from 'react'

interface FileNode {
  name: string
  path: string
  children?: FileNode[]
}

interface FileTreeNodeProps {
  node: FileNode
  selectedSet: Set<string>
  toggleSelected: (pathStr: string, isFolder: boolean) => void
  expandedMap: Record<string, boolean>
  setExpandedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}

/** Determine checkbox state: checked, partial, or unchecked */
function getCheckboxState(node: FileNode, selected: Set<string>): 'checked' | 'partial' | 'unchecked' {
  if (!node.children) {
    return selected.has(node.path) ? 'checked' : 'unchecked'
  }

  const children = node.children
  if (!children || children.length === 0) {
    return 'unchecked'
  }

  let allChecked = true
  let anyChecked = false

  for (const child of children) {
    const childState = getCheckboxState(child, selected)
    if (childState !== 'checked') {
      allChecked = false
    }
    if (childState !== 'unchecked') {
      anyChecked = true
    }
  }

  if (allChecked) return 'checked'
  if (anyChecked) return 'partial'
  return 'unchecked'
}

/** Renders file type icon based on extension */
const FileIcon = ({ fileName }: { fileName: string }) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || ''

  const getIconPath = () => {
    switch (extension) {
      case 'ts':
      case 'tsx':
        return "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      case 'js':
      case 'jsx':
        return "M12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5z"
      case 'json':
        return "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      case 'md':
        return "M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"
      case 'html':
        return "M5 4.5c0-.53-.21-1.04-.586-1.414S3.53 2.5 3 2.5l.9 8.1 1.1-8.1-1 8 1-8zM17.414 3.086C17.79 3.46 18 3.97 18 4.5l-.9 8.1-1.1-8.1 1 8-1-8z"
      case 'css':
        return "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.88 2.88"
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      default:
        return "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    }
  }

  const getIconColor = () => {
    switch (extension) {
      case 'ts':
      case 'tsx':
        return "#3178c6"
      case 'js':
      case 'jsx':
        return "#f7df1e"
      case 'json':
        return "#999999"
      case 'md':
        return "#663399"
      case 'html':
        return "#e34c26"
      case 'css':
        return "#264de4"
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return "#ff9800"
      default:
        return "#6b7280"
    }
  }

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-1.5"
    >
      <path
        d={getIconPath()}
        stroke={getIconColor()}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function FileTreeNode({
  node,
  selectedSet,
  toggleSelected,
  expandedMap,
  setExpandedMap
}: FileTreeNodeProps) {
  const checkboxState = getCheckboxState(node, selectedSet)
  const isFolder = !!node.children
  const isExpanded = expandedMap[node.path] || false

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    toggleSelected(node.path, isFolder)
  }

  const handleToggleFolder = () => {
    if (!isFolder) return
    setExpandedMap(prev => ({ ...prev, [node.path]: !prev[node.path] }))
  }

  // Extra class if fully 'checked' -> highlight
  const itemClasses = [
    'file-tree-item',
    checkboxState === 'checked' ? 'bg-black/5 dark:bg-white/5' : ''
  ].join(' ')

  return (
    <div className="ml-2">
      <div
        className={itemClasses}
        onClick={isFolder ? handleToggleFolder : undefined}
      >
        <input
          type="checkbox"
          className="file-tree-checkbox"
          checked={checkboxState === 'checked'}
          ref={el => {
            if (el) {
              el.indeterminate = (checkboxState === 'partial')
            }
          }}
          onChange={handleCheckboxChange}
          onClick={e => e.stopPropagation()}
        />

        {isFolder ? (
          <>
            <div className={`file-tree-folder-arrow ${isExpanded ? 'expanded' : ''}`}>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.5 1.5L7.5 5L3.5 8.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="mr-2">
              {isExpanded ? '📂' : '📁'}
            </span>
          </>
        ) : (
          <FileIcon fileName={node.name} />
        )}

        <span className="text-gray-700 dark:text-gray-200">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children && (
        <div className="pl-6 ml-4 border-l-4 border-gray-200 dark:border-gray-700 mt-1">
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedSet={selectedSet}
              toggleSelected={toggleSelected}
              expandedMap={expandedMap}
              setExpandedMap={setExpandedMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}