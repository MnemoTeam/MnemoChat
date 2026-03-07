import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, WifiOff, ShieldOff, Shield, User, LogOut, Eye, EyeOff, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  DiscoverCard as DiscoverCardType,
  DiscoverFeedTab,
  GridDensity,
} from './types'
import type { DiscoverQuery } from '@shared/library-types'
import { DiscoverCard } from './DiscoverCard'
import { CardDetailOverlay } from './CardDetailOverlay'
import { getDiscoverCards, getDiscoverCard, likeDiscoverCard, importDiscoverCard, getTokenStatus, setSetting } from '@/lib/api'

interface DiscoverFeedProps {
  feedTabs: DiscoverFeedTab[]
  gridDensity?: GridDensity
  onImportCard?: (cardId: string) => void
  onFollowCreator?: (creatorName: string) => void
  onOpenCreatorProfile?: (creatorName: string) => void
}

const feedLabels: Record<DiscoverFeedTab, string> = {
  featured: 'Featured',
  trending: 'Trending',
  new: 'New',
  following: 'Following',
  recommended: 'For You',
}

const feedToSort: Record<DiscoverFeedTab, DiscoverQuery['sort']> = {
  featured: 'latest',
  trending: 'trending',
  new: 'latest',
  following: 'following',
  recommended: 'gems',
}

interface AccountInfo {
  hasToken: boolean
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  error?: string
}

function AccountButton({ account, onTokenSaved, onLogout }: {
  account: AccountInfo | null
  onTokenSaved: () => void
  onLogout: () => void
}) {
  const [showPopover, setShowPopover] = useState(false)
  const [tokenInput, setTokenInput] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPopover])

  async function handleSaveToken() {
    if (!tokenInput.trim()) return
    setSaving(true)
    await setSetting('mnemoApiToken', tokenInput.trim())
    setTokenInput('')
    setSaving(false)
    setShowPopover(false)
    onTokenSaved()
  }

  async function handleLogout() {
    await setSetting('mnemoApiToken', '')
    setShowPopover(false)
    onLogout()
  }

  const isLoggedIn = account?.hasToken && account?.username

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setShowPopover((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
          isLoggedIn
            ? 'border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700'
            : 'border-indigo-600/50 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'
        )}
      >
        {isLoggedIn ? (
          <>
            {account.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt=""
                className="h-5 w-5 rounded-full object-cover"
              />
            ) : (
              <User className="h-4 w-4" />
            )}
            <span className="max-w-[100px] truncate text-xs font-medium">
              {account.displayName || account.username}
            </span>
          </>
        ) : (
          <>
            <User className="h-4 w-4" />
            <span className="text-xs font-medium">Sign In</span>
          </>
        )}
      </button>

      {showPopover && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
          {isLoggedIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {account.avatarUrl ? (
                  <img
                    src={account.avatarUrl}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                    <User className="h-5 w-5 text-zinc-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {account.displayName || account.username}
                  </p>
                  {account.displayName && account.username && (
                    <p className="truncate text-xs text-zinc-500">@{account.username}</p>
                  )}
                </div>
              </div>
              <div className="rounded-lg border border-green-800/40 bg-green-900/20 px-3 py-2 text-xs text-green-400">
                Connected to mnemo.studio
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-zinc-200">Connect to mnemo.studio</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Enter your personal API token to unlock personalized recommendations and sync favorites.
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveToken() }}
                    placeholder="Paste API token..."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 pl-3 pr-9 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-500/50"
                  />
                  <button
                    onClick={() => setShowToken((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <button
                  onClick={handleSaveToken}
                  disabled={saving || !tokenInput.trim()}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
              </div>
              {account?.hasToken && account?.error && (
                <div className="rounded-lg border border-amber-800/40 bg-amber-900/20 px-3 py-2 text-xs text-amber-400">
                  {account.error}
                </div>
              )}
              <p className="text-[11px] text-zinc-600">
                Generate a token from Settings on{' '}
                <a
                  href="https://mnemo.studio/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  mnemo.studio
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function DiscoverFeed({
  feedTabs,
  gridDensity = 'comfortable',
  onImportCard,
  onFollowCreator,
  onOpenCreatorProfile,
}: DiscoverFeedProps) {
  const [activeFeed, setActiveFeed] = useState<DiscoverFeedTab>('featured')
  const [showNsfw, setShowNsfw] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<DiscoverCardType | null>(null)
  const [cards, setCards] = useState<DiscoverCardType[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Load account status on mount
  useEffect(() => {
    getTokenStatus().then(setAccount).catch(() => setAccount({ hasToken: false }))
  }, [])

  function refreshAccount() {
    getTokenStatus().then(setAccount).catch(() => setAccount({ hasToken: false }))
  }

  // Debounce search input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  // Fetch cards when feed/search changes
  const fetchCards = useCallback(async (pageNum: number, append: boolean) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    try {
      const result = await getDiscoverCards({
        sort: feedToSort[activeFeed],
        search: debouncedSearch || undefined,
        showNsfw: showNsfw || undefined,
        page: pageNum,
        pageSize: 20,
      })

      if (result.error) {
        setError(result.error)
      } else {
        setError(null)
      }

      if (append) {
        setCards((prev) => [...prev, ...result.cards])
      } else {
        setCards(result.cards)
      }
      setHasMore(result.hasMore)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [activeFeed, debouncedSearch, showNsfw])

  // Reset and fetch on tab/search change
  useEffect(() => {
    fetchCards(0, false)
  }, [fetchCards])

  function handleLoadMore() {
    fetchCards(page + 1, true)
  }

  async function handleOpenDetail(card: DiscoverCardType) {
    setSelectedCard(card)
    // Fetch full details
    try {
      const full = await getDiscoverCard(card.id)
      setSelectedCard(full)
    } catch {
      // Keep the preview data
    }
  }

  async function handleLike(cardId: string) {
    try {
      const result = await likeDiscoverCard(cardId)
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, isLiked: result.liked } : c
        )
      )
      if (selectedCard?.id === cardId) {
        setSelectedCard((prev) => prev ? { ...prev, isLiked: result.liked } : null)
      }
    } catch (err) {
      console.error('Failed to like card:', err)
    }
  }

  async function handleImport(cardId: string) {
    try {
      await importDiscoverCard(cardId)
      onImportCard?.(cardId)
    } catch (err) {
      console.error('Failed to import card:', err)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-zinc-800 px-6">
        {feedTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFeed(tab)}
            className={cn(
              'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              activeFeed === tab
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            )}
          >
            {feedLabels[tab]}
          </button>
        ))}
        <div className="flex-1" />
        <AccountButton
          account={account}
          onTokenSaved={refreshAccount}
          onLogout={() => setAccount({ hasToken: false })}
        />
      </div>

      <div className="flex items-center gap-3 px-6 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search characters, creators, tags..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 py-2 pl-10 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-indigo-500/50"
          />
        </div>
        <button
          onClick={() => setShowNsfw((v) => !v)}
          title={showNsfw ? 'Showing NSFW content — click to hide' : 'NSFW content hidden — click to show'}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
            showNsfw
              ? 'border-red-700/50 bg-red-900/30 text-red-400 hover:bg-red-900/50'
              : 'border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'
          )}
        >
          {showNsfw ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
          NSFW
        </button>
      </div>

      {error && (
        <div className="mx-6 mb-3 flex items-center gap-2 rounded-lg border border-amber-800/50 bg-amber-900/20 px-4 py-2.5 text-sm text-amber-300">
          <WifiOff className="h-4 w-4 shrink-0" />
          <span>Could not connect to community server. Check your internet connection.</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <p className="text-sm">
              {debouncedSearch
                ? 'No characters found matching your search.'
                : activeFeed === 'following'
                  ? 'Follow creators to see their characters here.'
                  : 'No characters available.'}
            </p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'grid gap-3',
                gridDensity === 'compact'
                  ? 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              )}
            >
              {cards.map((card) => (
                <DiscoverCard
                  key={card.id}
                  card={card}
                  density={gridDensity}
                  onOpenDetail={() => handleOpenDetail(card)}
                  onImport={() => handleImport(card.id)}
                  onLike={() => handleLike(card.id)}
                  onOpenCreatorProfile={() => onOpenCreatorProfile?.(card.creatorName)}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedCard && (
        <CardDetailOverlay
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onImport={() => {
            handleImport(selectedCard.id)
            setSelectedCard(null)
          }}
          onLike={() => handleLike(selectedCard.id)}
          onFollowCreator={() => onFollowCreator?.(selectedCard.creatorName)}
          onOpenCreatorProfile={() => onOpenCreatorProfile?.(selectedCard.creatorName)}
        />
      )}
    </div>
  )
}
