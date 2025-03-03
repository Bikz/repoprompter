import React, { useState, useMemo } from 'react'
import { useRepoContext } from '../hooks/useRepoContext'

interface FileNode {
  name: string
  path: string
  children?: FileNode[]
}

// File type icon component
const FileIcon = ({ fileName }: { fileName: string }) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const getIconPath = () => {
    switch(extension) {
      case 'ts':
      case 'tsx':
        return "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"; // TypeScript
      case 'js':
      case 'jsx':
        return "M12 18.75a6.75 6.75 0 110-13.5 6.75 6.75 0 010 13.5z"; // JavaScript
      case 'json':
        return "M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"; // JSON
      case 'md':
        return "M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z"; // Markdown
      case 'html':
        return "M5 4.5c0-.53-.21-1.04-.586-1.414S3.53 2.5 3 2.5l.9 8.1 1.1-8.1-1 8 1-8zM17.414 3.086C17.79 3.46 18 3.97 18 4.5l-.9 8.1-1.1-8.1 1 8-1-8z"; // HTML
      case 'css':
        return "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.88 2.88M6.75 17.25h.008v.008H6.75v-.008z"; // CSS
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"; // Images
      default:
        return "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"; // Default file
    }
  };

  const getIconColor = () => {
    switch(extension) {
      case 'ts':
      case 'tsx':
        return "#3178c6";
      case 'js':
      case 'jsx':
        return "#f7df1e";
      case 'json':
        return "#999";
      case 'md':
        return "#663399";
      case 'html':
        return "#e34c26";
      case 'css':
        return "#264de4";
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return "#ff9800";
      default:
        return "#6b7280";
    }
  };

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
  );
};

function buildFileTree(files: string[]): FileNode[] {
  const root: Record<string, FileNode> = {}

  for (const file of files) {
    const parts = file.split(/[/\\]/)
    let currentLevel = root
    let cumulativePath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      cumulativePath = cumulativePath ? `${cumulativePath}/${part}` : part

      if (!currentLevel[part]) {
        currentLevel[part] = { name: part, path: cumulativePath, children: {} }
      }
      if (i === parts.length - 1) {
        currentLevel[part].children = undefined
      } else {
        if (!currentLevel[part].children) {
          currentLevel[part].children = {}
        }
      }
      if (currentLevel[part].children) {
        currentLevel = currentLevel[part].children as Record<string, FileNode>
      }
    }
  }

  function convertToArray(obj: Record<string, FileNode>): FileNode[] {
    return Object.values(obj).map(node => {
      if (node.children) {
        return {
          name: node.name,
          path: node.path,
          children: convertToArray(node.children as Record<string, FileNode>)
        }
      } else {
        return { name: node.name, path: node.path }
      }
    })
  }

  return convertToArray(root)
}

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

function FileTreeNode({
  node,
  selectedSet,
  toggleSelected,
  expandedMap,
  setExpandedMap
}: {
  node: FileNode
  selectedSet: Set<string>
  toggleSelected: (pathStr: string, isFolder: boolean) => void
  expandedMap: Record<string, boolean>
  setExpandedMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
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

  return (
    <div className="ml-2">
      <div
        className="file-tree-item"
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
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 1.5L7.5 5L3.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="mr-2">
              {isExpanded ? '📂' : '📁'}
            </span>
          </>
        ) : (
          <FileIcon fileName={node.name} />
        )}
        <span className="text-gray-700">{node.name}</span>
      </div>

      {isFolder && isExpanded && node.children && (
        <div className="pl-1 border-l border-gray-200 ml-1">
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

export function FileList() {
  const { fileList, selectedFiles, toggleSelectedFile } = useRepoContext()
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles])
  const fileTree = useMemo(() => buildFileTree(fileList || []), [fileList])

  const handleToggleSelected = (pathStr: string, isFolder: boolean) => {
    if (!isFolder) {
      toggleSelectedFile(pathStr)
      return
    }

    function findNode(list: FileNode[]): FileNode | null {
      for (const item of list) {
        if (item.path === pathStr) return item
        if (item.children) {
          const found = findNode(item.children)
          if (found) return found
        }
      }
      return null
    }
    const folderNode = findNode(fileTree)
    if (!folderNode) return

    function gatherAllDescendants(node: FileNode): string[] {
      if (!node.children) return [node.path]
      let result: string[] = []
      for (const child of node.children) {
        if (!child.children) {
          result.push(child.path)
        } else {
          result = result.concat(gatherAllDescendants(child))
        }
      }
      return result
    }
    const allDesc = gatherAllDescendants(folderNode)
    const allSelected = allDesc.every(d => selectedSet.has(d))

    const newSelected = [...selectedFiles]
    if (allSelected) {
      for (const d of allDesc) {
        const idx = newSelected.indexOf(d)
        if (idx >= 0) {
          newSelected.splice(idx, 1)
        }
      }
    } else {
      for (const d of allDesc) {
        if (!newSelected.includes(d)) {
          newSelected.push(d)
        }
      }
    }

    // We want to sync the final list
    const toRemove = selectedFiles.filter(sf => !newSelected.includes(sf))
    const toAdd = newSelected.filter(nf => !selectedFiles.includes(nf))

    toRemove.forEach(sf => toggleSelectedFile(sf))
    toAdd.forEach(nf => toggleSelectedFile(nf))
  }

  if (!fileList || fileList.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded text-sm text-gray-500">
        No files. Please select a directory.
      </div>
    )
  }

  return (
    <div className="file-tree">
      {fileTree.map(node => (
        <FileTreeNode
          key={node.path}
          node={node}
          selectedSet={selectedSet}
          toggleSelected={handleToggleSelected}
          expandedMap={expandedMap}
          setExpandedMap={setExpandedMap}
        />
      ))}
    </div>
  )
}