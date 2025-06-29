// hooks/use-permissions.ts
import { useAuth } from '@/contexts/auth-context'

export function usePermissions() {
  const { user } = useAuth()

  return {
    canEdit: user?.role === 'admin',
    canDelete: user?.role === 'admin',
    canCreate: user?.role === 'admin',
    canView: !!user, // Ambos perfiles pueden ver
    isAdmin: user?.role === 'admin',
    isViewer: user?.role === 'viewer'
  }
}