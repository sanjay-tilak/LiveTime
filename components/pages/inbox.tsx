"use client"

import { useState, useMemo, useEffect } from "react"
import { Calendar, Bell, Search, Send, Paperclip, Star, Archive, MoreHorizontal, Check, CheckCheck, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/ui/searchbar"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string
  sender: string
  senderRole: string
  senderInitials: string
  senderColor: string
  subject: string
  preview: string
  fullMessage: string
  timestamp: string
  date: string
  read: boolean
  starred: boolean
  status: "new" | "replied" | "accepted" | "declined"
  partnershipType: string
  thread?: ThreadMessage[]
}

interface ThreadMessage {
  id: string
  sender: string
  senderInitials: string
  senderColor: string
  content: string
  timestamp: string
  isOwn: boolean
}

// ─── Status Config ───────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-pink-100 text-pink-700 border-pink-200" },
  replied: { label: "Replied", className: "bg-blue-100 text-blue-700 border-blue-200" },
  accepted: { label: "Accepted", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  declined: { label: "Declined", className: "bg-slate-100 text-slate-500 border-slate-200" },
}

// ─── Filter Options ──────────────────────────────────────────────────────────

type FilterType = "all" | "unread" | "starred" | "new" | "replied" | "accepted" | "declined"

// ─── Component ───────────────────────────────────────────────────────────────

export function Inbox() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [replyText, setReplyText] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all messages on initial load
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/inbox/messages")
        const data = await res.json()
        setMessages(data)
        if (data.length > 0) {
          setSelectedId(data[0].id)
        }
      } catch (e) {
        console.error("Failed to fetch messages:", e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchMessages()
  }, [])

  // Fetch message detail (thread) when a message is selected
  useEffect(() => {
    if (!selectedId) return
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/inbox/messages/${selectedId}`)
        const data = await res.json()
        setSelectedMessage(data)
      } catch (e) {
        console.error("Failed to fetch message detail:", e)
      }
    }
    fetchDetail()
  }, [selectedId])

  const filteredMessages = useMemo(() => {
    let filtered = messages

    // Apply status / property filter
    switch (activeFilter) {
      case "unread":
        filtered = filtered.filter((m) => !m.read)
        break
      case "starred":
        filtered = filtered.filter((m) => m.starred)
        break
      case "new":
      case "replied":
      case "accepted":
      case "declined":
        filtered = filtered.filter((m) => m.status === activeFilter)
        break
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.sender.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [messages, activeFilter, searchQuery])

  const handleSelect = async (id: string) => {
    setSelectedId(id)

    // Check if it's already read locally to avoid unnecessary API calls
    const msg = messages.find((m) => m.id === id)
    if (msg && !msg.read) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
      try {
        await fetch(`http://localhost:8000/api/inbox/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ read: true }),
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const toggleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const msg = messages.find((m) => m.id === id) || (selectedMessage?.id === id ? selectedMessage : null)
    if (!msg) return
    const newStarred = !msg.starred

    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, starred: newStarred } : m)))
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, starred: newStarred })
    }

    try {
      await fetch(`http://localhost:8000/api/inbox/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ starred: newStarred }),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return
    try {
      const res = await fetch(`http://localhost:8000/api/inbox/messages/${selectedMessage.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyText,
          sender: "You",
          senderInitials: "B",
          senderColor: "bg-pink-500",
        }),
      })
      const newThreadMessage = await res.json()

      setSelectedMessage({
        ...selectedMessage,
        status: "replied",
        thread: [...(selectedMessage.thread || []), newThreadMessage],
      })

      setMessages((prev) =>
        prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: "replied" as const } : m))
      )
      setReplyText("")
    } catch (e) {
      console.error(e)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
    { key: "starred", label: "Starred" },
    { key: "new", label: "New" },
    { key: "replied", label: "Replied" },
    { key: "accepted", label: "Accepted" },
    { key: "declined", label: "Declined" },
  ]

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1 max-w-sm">
            <Input placeholder="Search" className="bg-muted" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-muted rounded-lg transition">
            <Calendar className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg relative transition">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              B
            </div>
            <div className="text-sm">
              <div className="font-semibold">Admin Name</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Message List ── */}
        <div className="w-[420px] border-r border-border flex flex-col bg-white flex-shrink-0">
          {/* Inbox Header */}
          <div className="px-5 pt-5 pb-3 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Inbox</h1>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-pink-500 text-white text-xs font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>

            {/* Search within inbox */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search messages…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 transition"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {filterButtons.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeFilter === f.key
                      ? "bg-pink-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm px-6">
                <p className="font-medium">Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm px-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Archive className="w-5 h-5 text-slate-400" />
                </div>
                <p className="font-medium">No messages found</p>
                <p className="text-xs mt-1">Try a different filter or search query</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = msg.id === selectedId
                const statusInfo = statusConfig[msg.status]

                return (
                  <button
                    key={msg.id}
                    onClick={() => handleSelect(msg.id)}
                    className={`w-full text-left px-5 py-4 border-b border-slate-100 transition-all group relative ${
                      isSelected ? "bg-pink-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-pink-500 rounded-r-full" />
                    )}

                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full ${msg.senderColor} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm`}>
                        {msg.senderInitials}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-sm truncate ${!msg.read ? "font-bold text-foreground" : "font-medium text-slate-700"}`}>
                            {msg.sender}
                          </span>
                          <span className="text-[11px] text-muted-foreground flex-shrink-0">
                            {msg.timestamp}
                          </span>
                        </div>

                        <p className={`text-sm truncate mb-1 ${!msg.read ? "font-semibold text-foreground" : "text-slate-600"}`}>
                          {msg.subject}
                        </p>

                        <p className="text-xs text-muted-foreground truncate">
                          {msg.preview}
                        </p>

                        {/* Bottom row: badges */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            {msg.partnershipType}
                          </span>

                          {/* Star */}
                          <button
                            onClick={(e) => toggleStar(msg.id, e)}
                            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Star
                              className={`w-3.5 h-3.5 transition ${
                                msg.starred ? "fill-amber-400 text-amber-400" : "text-slate-300 hover:text-amber-400"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!msg.read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-pink-500 flex-shrink-0 mt-2 shadow-sm shadow-pink-300" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Right: Message Detail ── */}
        {selectedMessage ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Detail Header */}
            <div className="px-8 py-5 border-b border-border flex items-start justify-between bg-white flex-shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold truncate">{selectedMessage.subject}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusConfig[selectedMessage.status].className}`}>
                    {statusConfig[selectedMessage.status].label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{selectedMessage.sender}</span>
                  <span>·</span>
                  <span>{selectedMessage.senderRole}</span>
                  <span>·</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                    {selectedMessage.partnershipType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={(e) => toggleStar(selectedMessage.id, e)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <Star
                    className={`w-4 h-4 transition ${
                      selectedMessage.starred ? "fill-amber-400 text-amber-400" : "text-slate-400 hover:text-amber-400"
                    }`}
                  />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <Archive className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <MoreHorizontal className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-slate-50/50">
              {(selectedMessage.thread || []).map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full ${msg.senderColor} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm`}>
                    {msg.senderInitials}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${msg.isOwn ? "items-end" : ""}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">{msg.sender}</span>
                      <span className="text-[11px] text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                        msg.isOwn
                          ? "bg-pink-500 text-white rounded-tr-md"
                          : "bg-white border border-slate-200 text-slate-700 rounded-tl-md"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < msg.content.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    {msg.isOwn && (
                      <div className="flex justify-end mt-1">
                        <CheckCheck className="w-3.5 h-3.5 text-pink-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Composer */}
            <div className="px-8 py-4 border-t border-border bg-white flex-shrink-0">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selectedMessage.sender}…`}
                    rows={2}
                    className="w-full resize-none rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 transition"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        handleSendReply()
                      }
                    }}
                  />
                  <button className="absolute right-3 bottom-3 p-1 text-slate-400 hover:text-slate-600 transition">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="rounded-xl bg-pink-500 hover:bg-pink-600 text-white px-5 h-11 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono">⌘ Enter</kbd> to send
              </p>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center bg-slate-50/50">
            <div className="text-center">
              {isLoading ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Archive className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500 animate-pulse">Loading message details...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Archive className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Select a message to view</p>
                  <p className="text-xs text-muted-foreground mt-1">Choose a conversation from the left panel</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
