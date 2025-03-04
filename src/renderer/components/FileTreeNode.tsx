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
  level: number  // new: track recursion depth for indentation
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
      return "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.88 2.88"
    default:
      return "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
  }
}

export function FileTreeNode({
  node,
  selectedSet,
  toggleSelected,
  expandedMap,
  setExpandedMap,
  level
}: FileTreeNodeProps) {
  const isFolder = !!node.children
  const isExpanded = expandedMap[node.path] || false
  const checkboxState = getCheckboxState(node, selectedSet)

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

  // Indentation style: left padding grows with "level"
  // We'll show a subtle vertical connector for child nodes with tailwind borders
  return (
    <div className="file-tree-node">
      {/* The row containing the checkbox and icon + name */}
      <div
        className={`flex items-center py-1 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
        style={{ paddingLeft: `${1.5 + level * 1.5}rem` }}
        onClick={isFolder ? handleToggleFolder : undefined}
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
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            className={`mr-1 transition-transform ${
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
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className="mr-2 text-gray-600 dark:text-gray-300"
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
        <span className="text-gray-700 dark:text-gray-200 text-sm">{node.name}</span>
      </div>

      {/* If expanded, render children recursively */}
      {isFolder && isExpanded && node.children && (
        <>
          {node.children.map(child => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedSet={selectedSet}
              toggleSelected={toggleSelected}
              expandedMap={expandedMap}
              setExpandedMap={setExpandedMap}
              level={level + 1}
            />
          ))}
        </>
      )}
    </div>
  )
}