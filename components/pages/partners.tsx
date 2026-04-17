"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Users,
  Search,
  MapPin,
  Calendar,
  ExternalLink,
  TrendingUp,
  Star,
  Building2,
  Mail,
  Phone,
  Globe,
  ArrowUpRight,
} from "lucide-react"

// ─── Mock Data ─────────────────────────────────────────────────────
interface Partner {
  id: number
  name: string
  logo: string
  category: string
  status: "active" | "pending" | "paused"
  location: string
  since: string
  eventsCollaborated: number
  totalReach: string
  rating: number
  description: string
  contactEmail: string
  contactPhone: string
  website: string
}

const partners: Partner[] = [
  {
    id: 1,
    name: "SoundWave Studios",
    logo: "",
    category: "Music & Entertainment",
    status: "active",
    location: "Los Angeles, CA",
    since: "Jan 2024",
    eventsCollaborated: 24,
    totalReach: "45.2K",
    rating: 4.8,
    description:
      "A premier music production studio specializing in live events, concerts, and immersive audio experiences across the West Coast.",
    contactEmail: "collab@soundwavestudios.com",
    contactPhone: "(310) 555-0192",
    website: "soundwavestudios.com",
  },
  {
    id: 2,
    name: "BrewHouse Collective",
    logo: "",
    category: "Food & Beverage",
    status: "active",
    location: "Chicago, IL",
    since: "Mar 2024",
    eventsCollaborated: 18,
    totalReach: "32.1K",
    rating: 4.6,
    description:
      "Craft brewery network bringing artisanal beverages to community events and pop-up tastings throughout the Midwest.",
    contactEmail: "events@brewhousecollective.com",
    contactPhone: "(312) 555-0847",
    website: "brewhousecollective.com",
  },
  {
    id: 3,
    name: "Urban Fitness Co.",
    logo: "",
    category: "Health & Wellness",
    status: "active",
    location: "New York, NY",
    since: "Jun 2024",
    eventsCollaborated: 12,
    totalReach: "28.7K",
    rating: 4.9,
    description:
      "Lifestyle fitness brand hosting outdoor boot camps, wellness retreats, and health expos in major metropolitan areas.",
    contactEmail: "partnerships@urbanfitnessco.com",
    contactPhone: "(212) 555-0334",
    website: "urbanfitnessco.com",
  },
  {
    id: 4,
    name: "Neon Nights Events",
    logo: "",
    category: "Event Production",
    status: "pending",
    location: "Miami, FL",
    since: "Dec 2024",
    eventsCollaborated: 3,
    totalReach: "8.4K",
    rating: 4.3,
    description:
      "Boutique event production company known for immersive nightlife experiences and themed pop-up events.",
    contactEmail: "hello@neonnightsevents.com",
    contactPhone: "(305) 555-0621",
    website: "neonnightsevents.com",
  },
  {
    id: 5,
    name: "GreenLeaf Markets",
    logo: "",
    category: "Retail & Markets",
    status: "active",
    location: "Austin, TX",
    since: "Sep 2023",
    eventsCollaborated: 31,
    totalReach: "52.0K",
    rating: 4.7,
    description:
      "Organic farmers' market chain partnering with local brands for weekend markets, food fairs, and sustainable living events.",
    contactEmail: "partners@greenleafmarkets.com",
    contactPhone: "(512) 555-0413",
    website: "greenleafmarkets.com",
  },
  {
    id: 6,
    name: "Peak Sports Agency",
    logo: "",
    category: "Sports & Recreation",
    status: "paused",
    location: "Denver, CO",
    since: "Feb 2024",
    eventsCollaborated: 7,
    totalReach: "15.6K",
    rating: 4.1,
    description:
      "Sports management agency connecting brands with athletic events, tournaments, and community sports initiatives.",
    contactEmail: "team@peaksportsagency.com",
    contactPhone: "(720) 555-0958",
    website: "peaksportsagency.com",
  },
]

// ─── Helper ────────────────────────────────────────────────────────
function statusColor(status: Partner["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 border-emerald-200"
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200"
    case "paused":
      return "bg-slate-100 text-slate-500 border-slate-200"
  }
}

function statusDot(status: Partner["status"]) {
  switch (status) {
    case "active":
      return "bg-emerald-500"
    case "pending":
      return "bg-amber-500"
    case "paused":
      return "bg-slate-400"
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const categoryColors: Record<string, string> = {
  "Music & Entertainment": "bg-purple-100 text-purple-700",
  "Food & Beverage": "bg-orange-100 text-orange-700",
  "Health & Wellness": "bg-teal-100 text-teal-700",
  "Event Production": "bg-pink-100 text-pink-700",
  "Retail & Markets": "bg-green-100 text-green-700",
  "Sports & Recreation": "bg-blue-100 text-blue-700",
}

// ─── Stars ─────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground font-medium">
        {rating}
      </span>
    </div>
  )
}

// ─── Partner Card ──────────────────────────────────────────────────
function PartnerCard({
  partner,
  onSelect,
}: {
  partner: Partner
  onSelect: (p: Partner) => void
}) {
  return (
    <Card
      className="group hover:shadow-lg hover:shadow-pink-100/50 transition-all duration-300 cursor-pointer border-border/60 hover:border-pink-200 relative overflow-hidden"
      onClick={() => onSelect(partner)}
    >
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="p-5">
        {/* Top row: avatar + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-pink-100 group-hover:ring-pink-300 transition-all">
              <AvatarImage src={partner.logo} alt={partner.name} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white font-bold text-sm">
                {getInitials(partner.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm leading-tight group-hover:text-pink-600 transition-colors">
                {partner.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-xs">{partner.location}</span>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusColor(
              partner.status
            )}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusDot(
                partner.status
              )}`}
            />
            {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
          </div>
        </div>

        {/* Category badge */}
        <Badge
          variant="secondary"
          className={`mb-3 text-[11px] rounded-full px-2.5 py-0.5 border-0 ${
            categoryColors[partner.category] || "bg-gray-100 text-gray-600"
          }`}
        >
          {partner.category}
        </Badge>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-slate-50 group-hover:bg-pink-50/50 transition-colors">
            <div className="text-base font-bold text-foreground">
              {partner.eventsCollaborated}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              Events
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 group-hover:bg-pink-50/50 transition-colors">
            <div className="text-base font-bold text-foreground">
              {partner.totalReach}
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              Reach
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-50 group-hover:bg-pink-50/50 transition-colors">
            <Stars rating={partner.rating} />
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
              Rating
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            Since {partner.since}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 h-7 px-2 text-xs gap-1"
          >
            View details
            <ArrowUpRight className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Partner Detail Dialog ─────────────────────────────────────────
function PartnerDetail({
  partner,
  open,
  onClose,
}: {
  partner: Partner | null
  open: boolean
  onClose: () => void
}) {
  if (!partner) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 ring-2 ring-pink-200">
              <AvatarImage src={partner.logo} alt={partner.name} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 to-rose-500 text-white font-bold">
                {getInitials(partner.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-lg">{partner.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {partner.location}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Status + Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusColor(
                partner.status
              )}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${statusDot(
                  partner.status
                )}`}
              />
              {partner.status.charAt(0).toUpperCase() +
                partner.status.slice(1)}
            </div>
            <Badge
              variant="secondary"
              className={`text-xs rounded-full px-3 py-1 border-0 ${
                categoryColors[partner.category] || "bg-gray-100 text-gray-600"
              }`}
            >
              {partner.category}
            </Badge>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold mb-1.5">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {partner.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl bg-gradient-to-b from-pink-50 to-white border border-pink-100">
              <div className="text-xl font-bold text-pink-600">
                {partner.eventsCollaborated}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Events
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-b from-pink-50 to-white border border-pink-100">
              <div className="text-xl font-bold text-pink-600">
                {partner.totalReach}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Total Reach
              </div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gradient-to-b from-pink-50 to-white border border-pink-100">
              <div className="flex items-center justify-center">
                <Stars rating={partner.rating} />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Rating
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-pink-400" />
                {partner.contactEmail}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-pink-400" />
                {partner.contactPhone}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Globe className="w-4 h-4 text-pink-400" />
                {partner.website}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white rounded-lg gap-2">
              <Mail className="w-4 h-4" />
              Send Message
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-lg gap-2 hover:bg-pink-50 hover:border-pink-200"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Partners Component ───────────────────────────────────────
export function Partners() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState("all")
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)

  const filtered = partners.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchesTab = tab === "all" || p.status === tab
    return matchesSearch && matchesTab
  })

  const activeCount = partners.filter((p) => p.status === "active").length
  const pendingCount = partners.filter((p) => p.status === "pending").length
  const pausedCount = partners.filter((p) => p.status === "paused").length
  const totalReach = partners.reduce((sum, p) => {
    const num = parseFloat(p.totalReach.replace("K", ""))
    return sum + num
  }, 0)

  return (
    <div className="p-6 bg-white space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Partners
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your brand partnerships
          </p>
        </div>
        <Button className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-5 gap-2 shadow-md shadow-pink-200/50">
          <Users className="w-4 h-4" />
          Add Partner
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Total Partners
                </p>
                <p className="text-2xl font-bold mt-1">{partners.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Active
                </p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">
                  {activeCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Pending
                </p>
                <p className="text-2xl font-bold mt-1 text-amber-600">
                  {pendingCount}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Combined Reach
                </p>
                <p className="text-2xl font-bold mt-1 text-pink-600">
                  {totalReach.toFixed(1)}K
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-slate-50 border-border/50 focus:bg-white"
          />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="rounded-full bg-slate-100">
            <TabsTrigger
              value="all"
              className="rounded-full px-4 text-xs data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              All ({partners.length})
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-full px-4 text-xs data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Active ({activeCount})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="rounded-full px-4 text-xs data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger
              value="paused"
              className="rounded-full px-4 text-xs data-[state=active]:bg-pink-500 data-[state=active]:text-white"
            >
              Paused ({pausedCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Partner Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onSelect={setSelectedPartner}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-semibold text-lg text-foreground">
            No partners found
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Try adjusting your search or filter to find the partners you're
            looking for.
          </p>
        </div>
      )}

      {/* Detail Dialog */}
      <PartnerDetail
        partner={selectedPartner}
        open={!!selectedPartner}
        onClose={() => setSelectedPartner(null)}
      />
    </div>
  )
}
