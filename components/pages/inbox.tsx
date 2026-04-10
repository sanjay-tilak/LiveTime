"use client"

import { useState, useMemo } from "react"
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
  thread: ThreadMessage[]
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

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "Celsius Energy",
    senderRole: "Brand Partnership Manager",
    senderInitials: "CE",
    senderColor: "bg-orange-500",
    subject: "Partnership Opportunity — Campus Hydration Stations",
    preview: "Hi there! We'd love to explore a co-branded hydration station activation at your upcoming events…",
    fullMessage:
      "Hi there!\n\nWe'd love to explore a co-branded hydration station activation at your upcoming campus events. Celsius has been expanding our college presence and your brand's audience aligns perfectly with our target demographic.\n\nWe're proposing a 3-month partnership that would include:\n• Branded hydration stations at 5+ events\n• Co-branded social media content (3 posts/month)\n• Product sampling for event attendees\n• Shared analytics dashboard\n\nOur budget for this activation is $15,000 and we'd love to discuss revenue sharing models that work for both parties.\n\nWould you be available for a call this week to discuss further?\n\nBest regards,\nSamantha Chen\nBrand Partnership Manager, Celsius Energy",
    timestamp: "2:34 PM",
    date: "Today",
    read: false,
    starred: true,
    status: "new",
    partnershipType: "Sponsorship",
    thread: [
      {
        id: "1a",
        sender: "Celsius Energy",
        senderInitials: "CE",
        senderColor: "bg-orange-500",
        content:
          "Hi there!\n\nWe'd love to explore a co-branded hydration station activation at your upcoming campus events. Celsius has been expanding our college presence and your brand's audience aligns perfectly with our target demographic.\n\nWe're proposing a 3-month partnership that would include:\n• Branded hydration stations at 5+ events\n• Co-branded social media content (3 posts/month)\n• Product sampling for event attendees\n• Shared analytics dashboard\n\nOur budget for this activation is $15,000 and we'd love to discuss revenue sharing models that work for both parties.\n\nWould you be available for a call this week to discuss further?\n\nBest regards,\nSamantha Chen\nBrand Partnership Manager, Celsius Energy",
        timestamp: "2:34 PM",
        isOwn: false,
      },
    ],
  },
  {
    id: "2",
    sender: "Nike Campus",
    senderRole: "University Partnerships Lead",
    senderInitials: "NK",
    senderColor: "bg-gray-900",
    subject: "Nike x LiveTime — Athletic Event Collab",
    preview: "We've been following your athletic event series and would love to partner on the upcoming…",
    fullMessage:
      "Hello!\n\nWe've been following your athletic event series and would love to partner on the upcoming Run & Refuel event. Nike Campus is looking to expand our presence in experiential campus activations.\n\nHere's what we have in mind:\n• Official footwear sponsor for the Run & Refuel series\n• Nike-branded finish line experience\n• Limited-edition event merchandise collaboration\n• Social media takeover during event days\n\nWe'd also love to offer exclusive discounts for event participants through the Nike app.\n\nLet me know if this sounds interesting — happy to set up a meeting!\n\nCheers,\nMarcus Williams\nUniversity Partnerships Lead, Nike",
    timestamp: "11:20 AM",
    date: "Today",
    read: false,
    starred: false,
    status: "new",
    partnershipType: "Co-branding",
    thread: [
      {
        id: "2a",
        sender: "Nike Campus",
        senderInitials: "NK",
        senderColor: "bg-gray-900",
        content:
          "Hello!\n\nWe've been following your athletic event series and would love to partner on the upcoming Run & Refuel event. Nike Campus is looking to expand our presence in experiential campus activations.\n\nHere's what we have in mind:\n• Official footwear sponsor for the Run & Refuel series\n• Nike-branded finish line experience\n• Limited-edition event merchandise collaboration\n• Social media takeover during event days\n\nWe'd also love to offer exclusive discounts for event participants through the Nike app.\n\nLet me know if this sounds interesting — happy to set up a meeting!\n\nCheers,\nMarcus Williams\nUniversity Partnerships Lead, Nike",
        timestamp: "11:20 AM",
        isOwn: false,
      },
    ],
  },
  {
    id: "3",
    sender: "Spotify for Brands",
    senderRole: "Campus Activations Coordinator",
    senderInitials: "SP",
    senderColor: "bg-green-600",
    subject: "Music-Powered Events — Let's Collaborate!",
    preview: "We're launching a new campus playlist partnership program and think your events would be the perfect fit…",
    fullMessage:
      "Hey there!\n\nWe're launching a new campus playlist partnership program and think your events would be the perfect fit. Imagine every event powered by curated Spotify playlists with real-time audience voting.\n\nOur proposal includes:\n• Custom event playlists curated by Spotify editors\n• Interactive listening stations with Premium trials\n• Spotify-branded photo ops & shared content\n• Data insights on music engagement at your events\n\nThis is a pilot program so we're offering this at no cost for the first 3 events, with the option to extend into a paid partnership.\n\nWould love to chat!\n\nBest,\nAlexa Rivera\nCampus Activations, Spotify",
    timestamp: "Yesterday",
    date: "Apr 9",
    read: true,
    starred: true,
    status: "replied",
    partnershipType: "Activation",
    thread: [
      {
        id: "3a",
        sender: "Spotify for Brands",
        senderInitials: "SP",
        senderColor: "bg-green-600",
        content:
          "Hey there!\n\nWe're launching a new campus playlist partnership program and think your events would be the perfect fit. Imagine every event powered by curated Spotify playlists with real-time audience voting.\n\nOur proposal includes:\n• Custom event playlists curated by Spotify editors\n• Interactive listening stations with Premium trials\n• Spotify-branded photo ops & shared content\n• Data insights on music engagement at your events\n\nThis is a pilot program so we're offering this at no cost for the first 3 events, with the option to extend into a paid partnership.\n\nWould love to chat!\n\nBest,\nAlexa Rivera\nCampus Activations, Spotify",
        timestamp: "Apr 9, 3:15 PM",
        isOwn: false,
      },
      {
        id: "3b",
        sender: "You",
        senderInitials: "B",
        senderColor: "bg-pink-500",
        content:
          "Hi Alexa,\n\nThanks so much for reaching out! This sounds like an incredible opportunity. We'd love to explore this further — the real-time voting feature sounds especially engaging for our audience.\n\nCould we schedule a call for next Tuesday?\n\nBest,\nAdmin",
        timestamp: "Apr 9, 5:42 PM",
        isOwn: true,
      },
    ],
  },
  {
    id: "4",
    sender: "Chick-fil-A University",
    senderRole: "Event Catering Partnerships",
    senderInitials: "CF",
    senderColor: "bg-red-600",
    subject: "Catering Partnership for Spring Events",
    preview: "We'd love to be the exclusive food partner for your spring semester events…",
    fullMessage:
      "Good morning!\n\nWe'd love to be the exclusive food partner for your spring semester events. Chick-fil-A University has a dedicated campus events catering program with flexible menus.\n\nOur partnership package includes:\n• Catering for up to 10 events per semester\n• Custom branded food packaging\n• Student meal vouchers for event promotion\n• Social media cross-promotion\n\nWe recently partnered with 12 other campus organizations with great results — average event satisfaction rating of 4.8/5.\n\nLet's connect!\n\nWarm regards,\nDavid Park\nCampus Events, Chick-fil-A",
    timestamp: "Apr 8",
    date: "Apr 8",
    read: true,
    starred: false,
    status: "accepted",
    partnershipType: "Catering",
    thread: [
      {
        id: "4a",
        sender: "Chick-fil-A University",
        senderInitials: "CF",
        senderColor: "bg-red-600",
        content:
          "Good morning!\n\nWe'd love to be the exclusive food partner for your spring semester events. Chick-fil-A University has a dedicated campus events catering program with flexible menus.\n\nOur partnership package includes:\n• Catering for up to 10 events per semester\n• Custom branded food packaging\n• Student meal vouchers for event promotion\n• Social media cross-promotion\n\nWe recently partnered with 12 other campus organizations with great results — average event satisfaction rating of 4.8/5.\n\nLet's connect!\n\nWarm regards,\nDavid Park\nCampus Events, Chick-fil-A",
        timestamp: "Apr 8, 9:00 AM",
        isOwn: false,
      },
      {
        id: "4b",
        sender: "You",
        senderInitials: "B",
        senderColor: "bg-pink-500",
        content: "Hi David,\n\nWe'd love to move forward with this! Let's finalize the details for our Taste of the Tropics event first.\n\nBest,\nAdmin",
        timestamp: "Apr 8, 2:30 PM",
        isOwn: true,
      },
      {
        id: "4c",
        sender: "Chick-fil-A University",
        senderInitials: "CF",
        senderColor: "bg-red-600",
        content:
          "That's wonderful news! I'll send over the catering proposal for Taste of the Tropics by end of day tomorrow. Looking forward to working together!\n\nBest,\nDavid",
        timestamp: "Apr 8, 3:15 PM",
        isOwn: false,
      },
    ],
  },
  {
    id: "5",
    sender: "Adobe Creative Campus",
    senderRole: "Student Programs Manager",
    senderInitials: "AD",
    senderColor: "bg-red-500",
    subject: "Creative Workshop Series — Adobe x LiveTime",
    preview: "Adobe would love to sponsor a creative workshop series at your upcoming career-focused events…",
    fullMessage:
      "Hi!\n\nAdobe would love to sponsor a creative workshop series at your upcoming career-focused events. We're offering hands-on sessions with Adobe Creative Suite, led by Adobe-certified instructors.\n\nPartnership highlights:\n• 4 workshops per semester (Design, Video, Social Media, Portfolio)\n• Free Adobe Creative Cloud licenses for attendees (1 year)\n• Adobe-branded event materials\n• Certificate of completion for participants\n\nThis program has been incredibly popular at other universities, with an average of 85% attendance.\n\nHappy to share more details!\n\nBest,\nJordan Lee\nStudent Programs, Adobe",
    timestamp: "Apr 7",
    date: "Apr 7",
    read: true,
    starred: false,
    status: "declined",
    partnershipType: "Workshop",
    thread: [
      {
        id: "5a",
        sender: "Adobe Creative Campus",
        senderInitials: "AD",
        senderColor: "bg-red-500",
        content:
          "Hi!\n\nAdobe would love to sponsor a creative workshop series at your upcoming career-focused events. We're offering hands-on sessions with Adobe Creative Suite, led by Adobe-certified instructors.\n\nPartnership highlights:\n• 4 workshops per semester (Design, Video, Social Media, Portfolio)\n• Free Adobe Creative Cloud licenses for attendees (1 year)\n• Adobe-branded event materials\n• Certificate of completion for participants\n\nThis program has been incredibly popular at other universities, with an average of 85% attendance.\n\nHappy to share more details!\n\nBest,\nJordan Lee\nStudent Programs, Adobe",
        timestamp: "Apr 7, 10:00 AM",
        isOwn: false,
      },
      {
        id: "5b",
        sender: "You",
        senderInitials: "B",
        senderColor: "bg-pink-500",
        content:
          "Hi Jordan,\n\nThank you for the generous offer! Unfortunately, we've already committed to a similar workshop partnership for this semester. We'd love to revisit this for the fall.\n\nBest,\nAdmin",
        timestamp: "Apr 7, 4:00 PM",
        isOwn: true,
      },
    ],
  },
  {
    id: "6",
    sender: "Red Bull Campus",
    senderRole: "Student Brand Manager",
    senderInitials: "RB",
    senderColor: "bg-blue-700",
    subject: "Energy for Your Next Big Event 🚀",
    preview: "Red Bull wants to fuel your next big campus event! We have a student activation budget ready to deploy…",
    fullMessage:
      "Hey!\n\nRed Bull wants to fuel your next big campus event! We have a dedicated student activation budget and we think your events are the perfect fit.\n\nWhat we're offering:\n• Red Bull sampling and branded bar at events\n• DJ / music performance sponsorship\n• Red Bull Wings Team on-site activation\n• Content creation with Red Bull media team\n• Cash sponsorship: $5,000–$10,000 per event\n\nWe've activated at over 200 campus events this year and our brand ambassadors love getting involved.\n\nLet's make something epic happen!\n\nRyan Torres\nStudent Brand Manager, Red Bull",
    timestamp: "Apr 5",
    date: "Apr 5",
    read: true,
    starred: true,
    status: "replied",
    partnershipType: "Sponsorship",
    thread: [
      {
        id: "6a",
        sender: "Red Bull Campus",
        senderInitials: "RB",
        senderColor: "bg-blue-700",
        content:
          "Hey!\n\nRed Bull wants to fuel your next big campus event! We have a dedicated student activation budget and we think your events are the perfect fit.\n\nWhat we're offering:\n• Red Bull sampling and branded bar at events\n• DJ / music performance sponsorship\n• Red Bull Wings Team on-site activation\n• Content creation with Red Bull media team\n• Cash sponsorship: $5,000–$10,000 per event\n\nWe've activated at over 200 campus events this year and our brand ambassadors love getting involved.\n\nLet's make something epic happen!\n\nRyan Torres\nStudent Brand Manager, Red Bull",
        timestamp: "Apr 5, 1:00 PM",
        isOwn: false,
      },
      {
        id: "6b",
        sender: "You",
        senderInitials: "B",
        senderColor: "bg-pink-500",
        content:
          "Hi Ryan,\n\nThis sounds amazing! We have our Midnight Munchies Mixer coming up and I think Red Bull would be a perfect fit. Can we chat about the $10K sponsorship tier?\n\nBest,\nAdmin",
        timestamp: "Apr 5, 5:00 PM",
        isOwn: true,
      },
    ],
  },
]

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
  const [selectedId, setSelectedId] = useState<string>(mockMessages[0].id)
  const [searchQuery, setSearchQuery] = useState("")
  const [replyText, setReplyText] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [messages, setMessages] = useState<Message[]>(mockMessages)

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

  const selectedMessage = messages.find((m) => m.id === selectedId)

  const handleSelect = (id: string) => {
    setSelectedId(id)
    // Mark as read
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
  }

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)))
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return
    const newThreadMessage: ThreadMessage = {
      id: `${selectedMessage.id}-${Date.now()}`,
      sender: "You",
      senderInitials: "B",
      senderColor: "bg-pink-500",
      content: replyText,
      timestamp: "Just now",
      isOwn: true,
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMessage.id
          ? { ...m, status: "replied" as const, thread: [...m.thread, newThreadMessage] }
          : m
      )
    )
    setReplyText("")
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
            {filteredMessages.length === 0 ? (
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
                      isSelected
                        ? "bg-pink-50/70"
                        : "hover:bg-slate-50"
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
              {selectedMessage.thread.map((msg, index) => (
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
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Archive className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Select a message to view</p>
              <p className="text-xs text-muted-foreground mt-1">Choose a conversation from the left panel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
