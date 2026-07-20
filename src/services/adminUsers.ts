import { supabase } from '../lib/supabase'

export interface AdminUserProfile {
  userId: string
  email: string
  username: string
  isActive: boolean
  isAdmin: boolean
  createdAt: string
}

interface UserProfileRecord {
  user_id: string
  email: string
  username: string | null
  is_active: boolean
  is_admin: boolean
  created_at: string
}

function mapProfile(record: UserProfileRecord): AdminUserProfile {
  return {
    userId: record.user_id,
    email: record.email,
    username: record.username ?? '',
    isActive: record.is_active,
    isAdmin: record.is_admin,
    createdAt: record.created_at,
  }
}

export async function fetchAdminUsers(): Promise<AdminUserProfile[]> {
  if (!supabase) {
    throw new Error('Supabase ist nicht konfiguriert.')
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id,email,username,is_active,is_admin,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapProfile)
}

export async function updateAdminUser(
  userId: string,
  updates: { isActive: boolean; isAdmin: boolean },
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase ist nicht konfiguriert.')
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({
      is_active: updates.isActive,
      is_admin: updates.isAdmin,
    })
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
