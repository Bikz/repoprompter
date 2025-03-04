import React, { useMemo } from 'react'

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
  level: number  // track recursion depth for indentation
  isLastChild?: boolean // whether this is the last child in its parent list
}

/** Return 'checked', 'partial', or 'unchecked' for the node’s checkbox state */
function getCheckboxState(node: FileNode, selected: Set<string>): 'checked' | 'partial' | 'unchecked' {
  if (!node.children) {
    return selected.has(node.path) ? 'checked' : 'unchecked'
  }

  // has children
  const childStates = node.children.map(child => getCheckboxState(child, selected))
  const allChecked = childStates.every(s => s === 'checked')
  const noneChecked = childStates.every(s => s === 'unchecked')

  if (allChecked) return 'checked'
  if (noneChecked) return 'unchecked'
  return 'partial'
}

/** Decide which icon to show for a file (by extension) or folder. */
function getIconPath(node: FileNode, isExpanded: boolean, isFolder: boolean): string {
  if (isFolder) {
    // show a folder icon that changes for open/close
    return isExpanded
      ? "M2 6C2 4.89543 2.89543 4 4 4H10L12 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z"
      : "M10 4H4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6H12L10 4Z"
  }

  // file icon based on extension
  const ext = node.name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
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
    case 'scss':
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

/** Get the icon CSS class based on file extension */
function getIconClass(node: FileNode, isFolder: boolean): string {
  if (isFolder) return 'folder-icon'
  
  const ext = node.name.split('.').pop()?.toLowerCase() || ''
  switch (ext) {
    case 'ts': return 'ts-icon'
    case 'tsx': return 'tsx-icon'
    case 'js': return 'js-icon'
    case 'jsx': return 'jsx-icon'
    case 'json': return 'json-icon'
    case 'md': return 'md-icon'
    case 'css': return 'css-icon'
    case 'scss': return 'scss-icon'
    case 'html': return 'html-icon'
    default: return ''
  }
}

export function FileTreeNode({
  node,
  selectedSet,
  toggleSelected,
  expandedMap,
  setExpandedMap,
  level,
  isLastChild = false
}: FileTreeNodeProps) {
  const isFolder = !!node.children
  const isExpanded = expandedMap[node.path] || false
  const checkboxState = getCheckboxState(node, selectedSet)
  const isSelected = checkboxState === 'checked' || checkboxState === 'partial'
  
  // Get the correct icon CSS class for colorization
  const iconClass = useMemo(() => getIconClass(node, isFolder), [node, isFolder])

  const handleToggleFolder = () => {
    if (!isFolder) return
    setExpandedMap(prev => ({
      ...prev,
      [node.path]: !prev[node.path]
    }))
  }

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    toggleSelected(node.path, isFolder)
  }

  // Build icon path
  const iconPath = getIconPath(node, isExpanded, isFolder)

  // Determine if we need connector lines (level > 0)
  const needsConnector = level > 0
  
  return (
    <div className={`file-tree-node ${level > 0 ? 'file-tree-node-child' : ''} ${needsConnector ? 'file-tree-node-with-connector' : ''}`}>
      {/* The row containing the checkbox and icon + name */}
      <div
        className={`flex items-center py-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
        style={{ paddingLeft: level > 0 ? `${1.5 + level}rem` : '1rem' }}
        onClick={isFolder ? handleToggleFolder : () => toggleSelected(node.path, isFolder)}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          className="mr-2 file-tree-checkbox"
          checked={checkboxState === 'checked'}
          ref={el => {
            if (el) {
              el.indeterminate = (checkboxState === 'partial')
            }
          }}
          onChange={handleCheckbox}
          onClick={e => e.stopPropagation()}
        />

        {/* Expand/collapse arrow for folders */}
        {isFolder && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 10 10"
            fill="none"
            className={`mr-1 transition-transform file-tree-folder-arrow ${
              isExpanded ? 'rotate-90' : ''
            }`}
          >
            <path
              d="M3 1.5L6.5 5L3 8.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={`mr-2 file-icon ${iconClass}`}
        >
          <path
            d={iconPath}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Name */}
        <span className="text-gray-700 dark:text-gray-200 text-sm truncate">{node.name}</span>
      </div>

      {/* If expanded, render children recursively */}
      {isFolder && isExpanded && node.children && (
        <div className="file-tree-children">
          {node.children.map((child, i) => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedSet={selectedSet}
              toggleSelected={toggleSelected}
              expandedMap={expandedMap}
              setExpandedMap={setExpandedMap}
              level={level + 1}
              isLastChild={i === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}