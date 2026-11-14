import { createContext, useContext, useState, type ReactNode } from 'react'

interface IncidentContextType {
  activeIncidentId: string | null
  setActiveIncidentId: (id: string | null) => void
  hasActiveIncident: boolean
  clearActiveIncident: () => void
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined)

export function IncidentProvider({ children }: { children: ReactNode }) {
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>('INC-07')

  const clearActiveIncident = () => {
    setActiveIncidentId(null)
  }

  return (
    <IncidentContext.Provider
      value={{
        activeIncidentId,
        setActiveIncidentId,
        hasActiveIncident: activeIncidentId !== null,
        clearActiveIncident,
      }}
    >
      {children}
    </IncidentContext.Provider>
  )
}

export function useIncident() {
  const context = useContext(IncidentContext)
  if (!context) {
    throw new Error('useIncident must be used within an IncidentProvider')
  }
  return context
}
