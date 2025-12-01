"use client"

import { createContext, useContext, useState, ReactNode } from "react"

const LoadingContext = createContext<{
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}>({
  isLoading: false,
  setIsLoading: () => {},
})

export function useLoading() {
  return useContext(LoadingContext)
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}