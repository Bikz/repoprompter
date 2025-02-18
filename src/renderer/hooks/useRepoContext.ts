/** @jsxRuntime classic */
/** @jsx React.createElement */
/** @jsxFrag React.Fragment */

import * as React from 'react';
import { createContext, useContext, useState, type ReactNode } from 'react';

interface RepoContextType {
  baseDir: string;
  setBaseDir: (dir: string) => void;
  fileList: string[];
  setFileList: (files: string[]) => void;
  selectedFiles: string[];
  toggleSelectedFile: (file: string) => void;
}

const RepoContext = createContext<RepoContextType | undefined>(undefined);

interface RepoProviderProps {
  children: ReactNode;
}

export function RepoProvider({ children }: RepoProviderProps): JSX.Element {
  const [baseDir, setBaseDir] = useState('');
  const [fileList, setFileList] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const toggleSelectedFile = React.useCallback((file: string) => {
    setSelectedFiles(prev =>
      prev.includes(file)
        ? prev.filter(f => f !== file)
        : [...prev, file]
    );
  }, []);

  const contextValue = React.useMemo(() => ({
    baseDir,
    setBaseDir,
    fileList,
    setFileList,
    selectedFiles,
    toggleSelectedFile,
  }), [baseDir, fileList, selectedFiles, toggleSelectedFile]);

  return React.createElement(
    RepoContext.Provider,
    { value: contextValue },
    children
  );
}

export function useRepoContext(): RepoContextType {
  const context = useContext(RepoContext);
  if (context === undefined) {
    throw new Error('useRepoContext must be used within a RepoProvider');
  }
  return context;
}