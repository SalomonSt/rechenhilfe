import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { AdminUserProfile } from '../services/adminUsers'
import { fetchAdminUsers, updateAdminUser } from '../services/adminUsers'
import type { CategoryId, Product } from '../types'
import { formatCurrency, parseCurrencyInputToCents } from '../utils/currency'
import { deleteProduct, upsertProduct } from '../services/productStore'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface AdminPanelProps {
  products: Product[]
  onProductsChanged: () => Promise<void>
}

type AuthMode = 'login' | 'register'
const ROOT_ADMIN_USERNAME = 'salislp'

interface EditableProduct {
  id: string
  name: string
  priceInput: string
  category: CategoryId
  imagePath: string
}

const CATEGORY_OPTIONS: Array<{ value: CategoryId; label: string }> = [
  { value: 'essen', label: 'Essen' },
  { value: 'alkoholfrei', label: 'Alkoholfreie Getraenke' },
  { value: 'bier-spritzer', label: 'Bier & Spritzer' },
  { value: 'longdrinks', label: 'Longdrinks' },
]

function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',')
}

export function AdminPanel({ products, onProductsChanged }: AdminPanelProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [session, setSession] = useState<Session | null>(null)
  const [isActiveAccount, setIsActiveAccount] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profileUsername, setProfileUsername] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [managedUsers, setManagedUsers] = useState<AdminUserProfile[]>([])
  const [statusMessage, setStatusMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [newProduct, setNewProduct] = useState<EditableProduct>({
    id: '',
    name: '',
    priceInput: '',
    category: 'essen',
    imagePath: '/products/sausage.svg',
  })
  const [editingMap, setEditingMap] = useState<Record<string, EditableProduct>>({})

  const canManageProducts = isSupabaseConfigured && !!session && isActiveAccount && isAdmin
  const isRootAdmin =
    canManageProducts &&
    (profileUsername.toLowerCase() === ROOT_ADMIN_USERNAME ||
      profileEmail.split('@')[0]?.toLowerCase() === ROOT_ADMIN_USERNAME)

  useEffect(() => {
    const client = supabase
    if (!client) {
      return
    }

    const boot = async () => {
      const { data } = await client.auth.getSession()
      setSession(data.session)
      if (data.session?.user.id) {
        await loadProfile(data.session.user.id)
      }
    }

    boot()

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession)
      if (!currentSession?.user.id) {
        setIsActiveAccount(false)
        setIsAdmin(false)
        setProfileUsername('')
        setProfileEmail('')
        setManagedUsers([])
      } else {
        void loadProfile(currentSession.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const editingRows = useMemo(() => {
    const rows: Record<string, EditableProduct> = {}
    for (const product of products) {
      rows[product.id] =
        editingMap[product.id] ?? {
          id: product.id,
          name: product.name,
          priceInput: centsToInput(product.priceCents),
          category: product.category,
          imagePath: product.imagePath,
        }
    }
    return rows
  }, [editingMap, products])

  useEffect(() => {
    if (!isRootAdmin) {
      setManagedUsers([])
      return
    }

    void loadManagedUsers()
  }, [isRootAdmin])

  const loadManagedUsers = async () => {
    if (!supabase) {
      return
    }

    try {
      const data = await fetchAdminUsers()
      setManagedUsers(data)
    } catch {
      setStatusMessage('Benutzerliste konnte nicht geladen werden.')
    }
  }

  const loadProfile = async (userId: string) => {
    if (!supabase) {
      return
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('email,username,is_active,is_admin')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      setStatusMessage('Profil konnte nicht geladen werden.')
      setIsActiveAccount(false)
      setIsAdmin(false)
      return
    }

    setIsActiveAccount(Boolean(data?.is_active))
    setIsAdmin(Boolean(data?.is_admin))
    setProfileUsername(data?.username ?? '')
    setProfileEmail(data?.email ?? '')
  }

  const handleAuthAction = async () => {
    if (!supabase) {
      setStatusMessage('Supabase ist nicht konfiguriert. Siehe README.')
      return
    }

    if (!email || !password) {
      setStatusMessage('Bitte E-Mail und Passwort eingeben.')
      return
    }

    setBusy(true)
    setStatusMessage('')

    try {
      if (authMode === 'register') {
        const trimmedUsername = username.trim().toLowerCase()
        if (!trimmedUsername) {
          setStatusMessage('Bitte einen Benutzernamen eingeben.')
          return
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: trimmedUsername,
            },
          },
        })
        if (error) {
          throw error
        }

        setStatusMessage(
          'Konto erstellt. Bitte in der Datenbank user_profiles.is_active und is_admin auf true setzen.',
        )
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        throw error
      }

      if (!data.user) {
        setStatusMessage('Login fehlgeschlagen.')
        return
      }

      await loadProfile(data.user.id)

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('is_active,is_admin')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      if (!profile?.is_active || !profile?.is_admin) {
        await supabase.auth.signOut()
        setStatusMessage('Konto ist noch nicht aktiviert oder hat keine Admin-Rechte.')
        return
      }

      setStatusMessage('Login erfolgreich.')
      await loadManagedUsers()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler'
      setStatusMessage(message)
    } finally {
      setBusy(false)
    }
  }

  const handleLogout = async () => {
    if (!supabase) {
      return
    }
    await supabase.auth.signOut()
    setStatusMessage('Abgemeldet.')
  }

  const persistProduct = async (input: EditableProduct) => {
    const normalizedId = input.id.trim().toLowerCase()
    const normalizedName = input.name.trim()
    const priceCents = parseCurrencyInputToCents(input.priceInput)

    if (!normalizedId || !normalizedName || priceCents === null) {
      setStatusMessage('Bitte gueltige Produktdaten eingeben.')
      return
    }

    setBusy(true)
    try {
      await upsertProduct({
        id: normalizedId,
        name: normalizedName,
        priceCents,
        category: input.category,
        imagePath: input.imagePath.trim() || '/products/cup.svg',
      })
      await onProductsChanged()
      setStatusMessage(`Produkt ${normalizedName} gespeichert.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Produkt konnte nicht gespeichert werden.'
      setStatusMessage(message)
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    try {
      await deleteProduct(id)
      await onProductsChanged()
      setStatusMessage('Produkt geloescht.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Produkt konnte nicht geloescht werden.'
      setStatusMessage(message)
    } finally {
      setBusy(false)
    }
  }

  const handleManagedUserChange = (
    userId: string,
    field: 'isActive' | 'isAdmin',
    value: boolean,
  ) => {
    setManagedUsers((current) =>
      current.map((entry) => (entry.userId === userId ? { ...entry, [field]: value } : entry)),
    )
  }

  const handleManagedUserSave = async (entry: AdminUserProfile) => {
    setBusy(true)
    try {
      await updateAdminUser(entry.userId, {
        isActive: entry.isActive,
        isAdmin: entry.isAdmin,
      })
      await loadManagedUsers()
      setStatusMessage(`Benutzer ${entry.email} aktualisiert.`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Benutzer konnte nicht aktualisiert werden.'
      setStatusMessage(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-panel" aria-label="Admin Panel">
      <h2>Admin Panel</h2>
      <p className="muted">Produkte und Preise zentral verwalten.</p>

      {!isSupabaseConfigured && (
        <p className="error">
          Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen.
        </p>
      )}

      {!session && (
        <div className="auth-card">
          <div className="admin-tabs">
            <button
              type="button"
              className={authMode === 'login' ? 'category-tab is-active' : 'category-tab'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'category-tab is-active' : 'category-tab'}
              onClick={() => setAuthMode('register')}
            >
              Konto anlegen
            </button>
          </div>

          {authMode === 'register' && (
            <>
              <label htmlFor="admin-username">Benutzername</label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
              />
            </>
          )}

          <label htmlFor="admin-email">E-Mail</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />

          <label htmlFor="admin-password">Passwort</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
          />

          <button type="button" className="primary-button" onClick={handleAuthAction} disabled={busy}>
            {authMode === 'login' ? 'Einloggen' : 'Konto erstellen'}
          </button>
        </div>
      )}

      {session && (
        <div className="auth-card">
          <p className="muted">Angemeldet als {session.user.email}</p>
          <button type="button" className="secondary-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}

      {canManageProducts && (
        <div className="admin-products">
          <h3>Neues Produkt</h3>
          <div className="admin-grid">
            <input
              placeholder="ID (z. B. cola-zero)"
              value={newProduct.id}
              onChange={(event) =>
                setNewProduct((current) => ({ ...current, id: event.target.value }))
              }
            />
            <input
              placeholder="Name"
              value={newProduct.name}
              onChange={(event) =>
                setNewProduct((current) => ({ ...current, name: event.target.value }))
              }
            />
            <input
              placeholder="Preis (z. B. 4,50)"
              value={newProduct.priceInput}
              onChange={(event) =>
                setNewProduct((current) => ({ ...current, priceInput: event.target.value }))
              }
            />
            <select
              value={newProduct.category}
              onChange={(event) =>
                setNewProduct((current) => ({
                  ...current,
                  category: event.target.value as CategoryId,
                }))
              }
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Bildpfad (/products/cup.svg)"
              value={newProduct.imagePath}
              onChange={(event) =>
                setNewProduct((current) => ({ ...current, imagePath: event.target.value }))
              }
            />
            <button
              type="button"
              className="primary-button"
              onClick={() => void persistProduct(newProduct)}
              disabled={busy}
            >
              Hinzufuegen
            </button>
          </div>

          <h3>Bestehende Produkte</h3>
          <div className="admin-list">
            {products.map((product) => {
              const row = editingRows[product.id]
              return (
                <article key={product.id} className="admin-item">
                  <p>
                    <strong>{product.name}</strong> ({formatCurrency(product.priceCents)})
                  </p>
                  <div className="admin-grid">
                    <input
                      value={row.id}
                      onChange={(event) =>
                        setEditingMap((current) => ({
                          ...current,
                          [product.id]: { ...row, id: event.target.value },
                        }))
                      }
                    />
                    <input
                      value={row.name}
                      onChange={(event) =>
                        setEditingMap((current) => ({
                          ...current,
                          [product.id]: { ...row, name: event.target.value },
                        }))
                      }
                    />
                    <input
                      value={row.priceInput}
                      onChange={(event) =>
                        setEditingMap((current) => ({
                          ...current,
                          [product.id]: { ...row, priceInput: event.target.value },
                        }))
                      }
                    />
                    <select
                      value={row.category}
                      onChange={(event) =>
                        setEditingMap((current) => ({
                          ...current,
                          [product.id]: {
                            ...row,
                            category: event.target.value as CategoryId,
                          },
                        }))
                      }
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      value={row.imagePath}
                      onChange={(event) =>
                        setEditingMap((current) => ({
                          ...current,
                          [product.id]: { ...row, imagePath: event.target.value },
                        }))
                      }
                    />
                    <div className="admin-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => void persistProduct(row)}
                        disabled={busy}
                      >
                        Speichern
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => void handleDelete(product.id)}
                        disabled={busy}
                      >
                        Loeschen
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      )}

      {isRootAdmin && (
        <div className="admin-users-section">
          <h3>Admins und Aktivierungen</h3>
          <p className="muted">
            Root-Admin {ROOT_ADMIN_USERNAME} kann hier weitere Konten aktivieren und Admin-Rechte vergeben.
          </p>
          <div className="admin-list">
            {managedUsers.map((entry) => (
              <article key={entry.userId} className="admin-item">
                <p>
                  <strong>{entry.username || '(ohne Benutzername)'}</strong> - {entry.email}
                </p>
                <div className="admin-user-grid">
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={entry.isActive}
                      onChange={(event) =>
                        handleManagedUserChange(entry.userId, 'isActive', event.target.checked)
                      }
                    />
                    <span>Aktiv</span>
                  </label>
                  <label className="admin-toggle">
                    <input
                      type="checkbox"
                      checked={entry.isAdmin}
                      onChange={(event) =>
                        handleManagedUserChange(entry.userId, 'isAdmin', event.target.checked)
                      }
                    />
                    <span>Admin</span>
                  </label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => void handleManagedUserSave(entry)}
                    disabled={busy}
                  >
                    Benutzer speichern
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {statusMessage && (
        <p className={statusMessage.includes('erfolgreich') ? 'muted' : 'error'}>{statusMessage}</p>
      )}
    </section>
  )
}
