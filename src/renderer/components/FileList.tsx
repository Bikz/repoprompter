import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Tree } from 'react-arborist'
import { useRepoContext } from '../hooks/useRepoContext'

interface TreeNode {
  id: string
  name: string
  isFolder: boolean
  children?: TreeNode[]
  path: string
}

function buildArboristTree(files: string[], baseDir: string): TreeNode[] {
  if (!files.length) return []

  const projectName = baseDir.split('/').pop() || 'Project'
  
  // Create a simple flat-to-tree converter
  const createNode = (path: string, name: string, isFolder: boolean): TreeNode => ({
    id: path,
    name: name,
    path: path,
    isFolder: isFolder,
    children: isFolder ? [] : undefined
  })

  // Build tree structure
  const nodeMap = new Map<string, TreeNode>()
  const rootChildren: TreeNode[] = []

  // First pass: create all nodes
  for (const file of files) {
    const parts = file.split('/').filter(part => part.length > 0)
    let currentPath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const previousPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isFolder = i < parts.length - 1
      
      if (!nodeMap.has(currentPath)) {
        const node = createNode(currentPath, part, isFolder)
        nodeMap.set(currentPath, node)
        
        if (previousPath) {
          // Add to parent
          const parent = nodeMap.get(previousPath)
          if (parent && parent.children) {
            parent.children.push(node)
          }
        } else {
          // Top level node
          rootChildren.push(node)
        }
      }
    }
  }

  // Sort children alphabetically (folders first, then files)
  const sortNodes = (nodes: TreeNode[]) => {
    return nodes.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1
      if (!a.isFolder && b.isFolder) return 1
      return a.name.localeCompare(b.name)
    })
  }

  // Sort all children recursively
  nodeMap.forEach(node => {
    if (node.children) {
      node.children = sortNodes(node.children)
    }
  })

  const sortedRootChildren = sortNodes(rootChildren)

  // Return with root wrapper
  return [{
    id: '__ROOT__',
    name: projectName,
    path: '__ROOT__',
    isFolder: true,
    children: sortedRootChildren
  }]
}

function getFileIcon(name: string | undefined, isFolder: boolean, isOpen?: boolean) {
  if (!name) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  
  if (isFolder) {
    if (name === '__ROOT__' || name.includes('Project')) {
      // Project root icon
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-500">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="currentColor"/>
        </svg>
      )
    }
    // Regular folder icon
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className={isOpen ? "text-yellow-600" : "text-yellow-500"}>
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="currentColor"/>
      </svg>
    )
  }

  const ext = name.split('.').pop()?.toLowerCase() || ''
  
  // TypeScript files
  if (ext === 'ts' || ext === 'tsx') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-blue-600">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <text x="12" y="16" textAnchor="middle" className="fill-white text-xs font-bold">TS</text>
      </svg>
    )
  }
  
  // JavaScript files
  if (ext === 'js' || ext === 'jsx') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-yellow-500">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor"/>
        <text x="12" y="16" textAnchor="middle" className="fill-black text-xs font-bold">JS</text>
      </svg>
    )
  }
  
  // React files
  if (ext === 'jsx' || ext === 'tsx') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-cyan-500">
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 1a15.3 15.3 0 0 1 4 0 15.3 15.3 0 0 1 4 0" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M12 23a15.3 15.3 0 0 1-4 0 15.3 15.3 0 0 1-4 0" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M20 5.5a15.3 15.3 0 0 1-4 3.5 15.3 15.3 0 0 1-4 3.5" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M4 18.5a15.3 15.3 0 0 1 4-3.5 15.3 15.3 0 0 1 4-3.5" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )
  }
  
  // JSON files
  if (ext === 'json') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-green-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <text x="12" y="16" textAnchor="middle" className="fill-current text-xs font-bold">{}</text>
      </svg>
    )
  }
  
  // Markdown files
  if (ext === 'md' || ext === 'markdown') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-700">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <text x="12" y="16" textAnchor="middle" className="fill-current text-xs font-bold">M</text>
      </svg>
    )
  }
  
  // CSS files
  if (ext === 'css' || ext === 'scss' || ext === 'sass') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-pink-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )
  }
  
  // HTML files
  if (ext === 'html' || ext === 'htm') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-orange-500">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )
  }
  
  // Image files
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-500">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
        <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2" fill="none"/>
      </svg>
    )
  }
  
  // Default file icon
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-500">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
    </svg>
  )
}

export function FileList() {
  const { baseDir, fileList, selectedFiles, toggleSelectedFile, getTokenData } = useRepoContext()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(400)

  const treeData = useMemo(() => {
    if (!fileList.length || !baseDir) return []
    return buildArboristTree(fileList, baseDir)
  }, [fileList, baseDir])

  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles])

  // Calculate container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerHeight(rect.height || 400)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const handleSelect = (nodes: TreeNode[]) => {
    // Handle selection changes
    const newSelection = nodes.map(n => n.path).filter(path => path !== '__ROOT__')
    
    // Find files to add and remove
    const toAdd = newSelection.filter(path => !selectedFiles.includes(path))
    const toRemove = selectedFiles.filter(path => !newSelection.includes(path))
    
    // Apply changes
    toAdd.forEach(path => toggleSelectedFile(path))
    toRemove.forEach(path => toggleSelectedFile(path))
  }

  const isSelected = (node: TreeNode) => {
    if (node.path === '__ROOT__') {
      // Root is selected if all files are selected
      return fileList.length > 0 && fileList.every(file => selectedFiles.includes(file))
    }
    return selectedSet.has(node.path)
  }

  const Node = ({ node, style, dragHandle }: any) => {
    if (!node) return null
    
    // React-arborist wraps our data - access the actual data
    const nodeData = node.data || node
    
    const selected = isSelected(nodeData)
    const icon = getFileIcon(nodeData.name, nodeData.isFolder, node.isOpen)
    const tokenData = !nodeData.isFolder ? getTokenData(nodeData.path) : null
    
    const handleClick = () => {
      if (nodeData.isFolder) {
        if (nodeData.path === '__ROOT__') {
          // Special handling for root - select/unselect ALL items (files + directories)
          const gatherAllPaths = (n: TreeNode): string[] => {
            const paths: string[] = []
            if (n.path !== '__ROOT__') {
              paths.push(n.path)
            }
            if (n.children) {
              n.children.forEach(child => {
                paths.push(...gatherAllPaths(child))
              })
            }
            return paths
          }
          
          const allPaths = gatherAllPaths(nodeData)
          const allSelected = allPaths.every(path => selectedFiles.includes(path))
          
          if (allSelected) {
            // Unselect all
            allPaths.forEach(path => {
              if (selectedFiles.includes(path)) {
                toggleSelectedFile(path)
              }
            })
          } else {
            // Select all
            allPaths.forEach(path => {
              if (!selectedFiles.includes(path)) {
                toggleSelectedFile(path)
              }
            })
          }
        } else {
          // For regular folders, gather all descendant files
          const gatherFiles = (n: TreeNode): string[] => {
            if (!n.isFolder) return [n.path]
            if (!n.children) return []
            return n.children.flatMap(gatherFiles)
          }
          
          const allFiles = gatherFiles(nodeData)
          const allSelected = allFiles.every(file => selectedFiles.includes(file))
          
          if (allSelected) {
            // Unselect all
            allFiles.forEach(file => {
              if (selectedFiles.includes(file)) {
                toggleSelectedFile(file)
              }
            })
          } else {
            // Select all
            allFiles.forEach(file => {
              if (!selectedFiles.includes(file)) {
                toggleSelectedFile(file)
              }
            })
          }
        }
      } else {
        // Single file
        toggleSelectedFile(nodeData.path)
      }
    }

    return (
      <div
        ref={dragHandle}
        style={style}
        className={`flex items-center py-0.5 px-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors group ${
          selected ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' : ''
        }`}
      >
        {/* Expand/collapse arrow for folders */}
        {nodeData.isFolder ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              node.toggle()
            }}
            className="w-4 h-4 flex items-center justify-center mr-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-sm transition-all opacity-70 hover:opacity-100"
          >
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              className={`transform transition-transform duration-150 ${node.isOpen ? 'rotate-90' : ''}`}
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="w-4 h-4 mr-1" />
        )}
        
        <input
          type="checkbox"
          checked={selected}
          onChange={() => {}}
          onClick={handleClick}
          className="mr-2 w-3 h-3 rounded-sm border border-gray-300 dark:border-gray-600 cursor-pointer accent-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="mr-2 flex-shrink-0">{icon}</div>
        <span 
          className="truncate text-gray-800 dark:text-gray-200 text-sm cursor-pointer flex-1 font-medium"
          onClick={handleClick}
        >
          {nodeData.name || 'Unknown'}
        </span>
        
        {/* Token info for files (only show for medium/large files) */}
        {tokenData && tokenData.shouldShow && (
          <span className={`text-xs ml-2 font-mono ${tokenData.colorClass}`}>
            ({tokenData.formatted} ⏺ {tokenData.percentage}%)
          </span>
        )}
      </div>
    )
  }

  if (!baseDir || fileList.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-300">
        <span className="flex items-center justify-center space-x-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M9 13h6m-3-3v6m-9-6h.01M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m-5-4v-8a2 2 0 012-2h2.5M15 3H9m6 0v2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>No files. Please select a directory.</span>
        </span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-full react-arborist-tree">
      <Tree
        data={treeData}
        openByDefault={(node) => node.data?.path === '__ROOT__'}
        width={containerRef.current?.clientWidth || 300}
        height={containerHeight}
        indent={16}
        rowHeight={24}
        overscanCount={20}
        disableDrop
        disableDrag
        disableMultiSelection={true}
        padding={2}
      >
        {Node}
      </Tree>
    </div>
  )
}