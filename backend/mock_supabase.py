"""
In-memory mock Supabase client.

Mimics the supabase-py query builder interface so the app runs without
real credentials. Swap to the real client by setting SUPABASE_URL and
SUPABASE_KEY in your .env file.
"""

import uuid
import copy
from datetime import datetime, timezone


class MockQueryBuilder:
    """Simulates the Supabase PostgREST query builder chain."""

    def __init__(self, table_name: str, store: dict):
        self._table = table_name
        self._store = store  # reference to the shared data dict
        self._filters: list = []
        self._or_filter: str | None = None
        self._order_col: str | None = None
        self._order_desc: bool = False
        self._range_start: int | None = None
        self._range_end: int | None = None
        self._select_cols: str = "*"
        self._operation: str | None = None
        self._payload: dict | list | None = None

    # ── Select ────────────────────────────────────────────────────────────

    def select(self, columns: str = "*"):
        self._operation = "select"
        self._select_cols = columns
        return self

    # ── Insert ────────────────────────────────────────────────────────────

    def insert(self, data):
        self._operation = "insert"
        self._payload = data
        return self

    # ── Update ────────────────────────────────────────────────────────────

    def update(self, data: dict):
        self._operation = "update"
        self._payload = data
        return self

    # ── Delete ────────────────────────────────────────────────────────────

    def delete(self):
        self._operation = "delete"
        return self

    # ── Filters ───────────────────────────────────────────────────────────

    def eq(self, column: str, value):
        self._filters.append(("eq", column, value))
        return self

    def neq(self, column: str, value):
        self._filters.append(("neq", column, value))
        return self

    def ilike(self, column: str, pattern: str):
        self._filters.append(("ilike", column, pattern))
        return self

    def or_(self, filter_string: str):
        self._or_filter = filter_string
        return self

    # ── Ordering & Pagination ─────────────────────────────────────────────

    def order(self, column: str, desc: bool = False):
        self._order_col = column
        self._order_desc = desc
        return self

    def range(self, start: int, end: int):
        self._range_start = start
        self._range_end = end
        return self

    # ── Execute ───────────────────────────────────────────────────────────

    def execute(self):
        rows = self._store.get(self._table, [])

        if self._operation == "insert":
            return self._do_insert(rows)
        elif self._operation == "update":
            return self._do_update(rows)
        elif self._operation == "delete":
            return self._do_delete(rows)
        else:
            return self._do_select(rows)

    # ── Internal Operations ───────────────────────────────────────────────

    def _do_select(self, rows: list):
        result = [copy.deepcopy(r) for r in rows]
        result = self._apply_filters(result)
        result = self._apply_or_filter(result)
        result = self._apply_order(result)
        result = self._apply_range(result)

        # Column filtering
        if self._select_cols != "*":
            cols = [c.strip() for c in self._select_cols.split(",")]
            result = [{k: r[k] for k in cols if k in r} for r in result]

        return _MockResponse(result)

    def _do_insert(self, rows: list):
        items = self._payload if isinstance(self._payload, list) else [self._payload]
        inserted = []
        for item in items:
            record = copy.deepcopy(item)
            if "id" not in record:
                record["id"] = str(uuid.uuid4())
            if "created_at" not in record:
                record["created_at"] = datetime.now(timezone.utc).isoformat()
            rows.append(record)
            inserted.append(copy.deepcopy(record))
        return _MockResponse(inserted)

    def _do_update(self, rows: list):
        updated = []
        for row in rows:
            if self._matches_filters(row):
                row.update(self._payload)
                updated.append(copy.deepcopy(row))
        return _MockResponse(updated)

    def _do_delete(self, rows: list):
        to_delete = [r for r in rows if self._matches_filters(r)]
        for r in to_delete:
            rows.remove(r)
        return _MockResponse(copy.deepcopy(to_delete))

    # ── Filter Helpers ────────────────────────────────────────────────────

    def _matches_filters(self, row: dict) -> bool:
        for op, col, val in self._filters:
            row_val = row.get(col)
            if op == "eq" and row_val != val:
                return False
            if op == "neq" and row_val == val:
                return False
            if op == "ilike":
                pattern = val.strip("%").lower()
                if pattern not in str(row_val).lower():
                    return False
        return True

    def _apply_filters(self, rows: list) -> list:
        return [r for r in rows if self._matches_filters(r)]

    def _apply_or_filter(self, rows: list) -> list:
        """Parse and apply or_ filter strings like:
        'sender.ilike.%nike%,subject.ilike.%nike%,preview.ilike.%nike%'
        """
        if not self._or_filter:
            return rows

        conditions = self._or_filter.split(",")
        result = []
        for row in self._store.get(self._table, []):
            for cond in conditions:
                parts = cond.strip().split(".")
                if len(parts) >= 3:
                    col = parts[0]
                    op = parts[1]
                    val = ".".join(parts[2:])
                    if op == "ilike":
                        pattern = val.strip("%").lower()
                        if pattern in str(row.get(col, "")).lower():
                            if row not in result:
                                # Also check it passed the eq filters
                                if self._matches_filters(row):
                                    result.append(copy.deepcopy(row))
                            break
        return result if self._or_filter else rows

    def _apply_order(self, rows: list) -> list:
        if not self._order_col:
            return rows
        col = self._order_col
        return sorted(rows, key=lambda r: r.get(col, ""), reverse=self._order_desc)

    def _apply_range(self, rows: list) -> list:
        if self._range_start is not None and self._range_end is not None:
            return rows[self._range_start : self._range_end + 1]
        return rows


class _MockResponse:
    """Mimics the Supabase API response object."""

    def __init__(self, data: list):
        self.data = data
        self.count = len(data)


class MockSupabaseClient:
    """
    Drop-in replacement for the Supabase client.
    Stores everything in memory with the same query builder API.
    """

    def __init__(self):
        self._store: dict[str, list[dict]] = {
            "messages": [],
            "thread_messages": [],
        }
        self._seed_initial_data()

    def table(self, table_name: str) -> MockQueryBuilder:
        if table_name not in self._store:
            self._store[table_name] = []
        return MockQueryBuilder(table_name, self._store)

    def _seed_initial_data(self):
        """Pre-populate with the same mock data from the frontend."""
        messages = [
            {
                "id": "msg-001",
                "sender": "Celsius Energy",
                "sender_role": "Brand Partnership Manager",
                "sender_initials": "CE",
                "sender_color": "bg-orange-500",
                "subject": "Partnership Opportunity — Campus Hydration Stations",
                "preview": "Hi there! We'd love to explore a co-branded hydration station activation at your upcoming events…",
                "full_message": (
                    "Hi there!\n\nWe'd love to explore a co-branded hydration station activation at your upcoming campus events. "
                    "Celsius has been expanding our college presence and your brand's audience aligns perfectly with our target demographic.\n\n"
                    "We're proposing a 3-month partnership that would include:\n"
                    "• Branded hydration stations at 5+ events\n"
                    "• Co-branded social media content (3 posts/month)\n"
                    "• Product sampling for event attendees\n"
                    "• Shared analytics dashboard\n\n"
                    "Our budget for this activation is $15,000 and we'd love to discuss revenue sharing models that work for both parties.\n\n"
                    "Would you be available for a call this week to discuss further?\n\n"
                    "Best regards,\nSamantha Chen\nBrand Partnership Manager, Celsius Energy"
                ),
                "timestamp": "2:34 PM",
                "date": "Today",
                "read": False,
                "starred": True,
                "status": "new",
                "partnership_type": "Sponsorship",
                "created_at": "2026-04-17T18:34:00Z",
            },
            {
                "id": "msg-002",
                "sender": "Nike Campus",
                "sender_role": "University Partnerships Lead",
                "sender_initials": "NK",
                "sender_color": "bg-gray-900",
                "subject": "Nike x LiveTime — Athletic Event Collab",
                "preview": "We've been following your athletic event series and would love to partner on the upcoming…",
                "full_message": (
                    "Hello!\n\nWe've been following your athletic event series and would love to partner on the upcoming Run & Refuel event. "
                    "Nike Campus is looking to expand our presence in experiential campus activations.\n\n"
                    "Here's what we have in mind:\n"
                    "• Official footwear sponsor for the Run & Refuel series\n"
                    "• Nike-branded finish line experience\n"
                    "• Limited-edition event merchandise collaboration\n"
                    "• Social media takeover during event days\n\n"
                    "We'd also love to offer exclusive discounts for event participants through the Nike app.\n\n"
                    "Let me know if this sounds interesting — happy to set up a meeting!\n\n"
                    "Cheers,\nMarcus Williams\nUniversity Partnerships Lead, Nike"
                ),
                "timestamp": "11:20 AM",
                "date": "Today",
                "read": False,
                "starred": False,
                "status": "new",
                "partnership_type": "Co-branding",
                "created_at": "2026-04-17T15:20:00Z",
            },
            {
                "id": "msg-003",
                "sender": "Spotify for Brands",
                "sender_role": "Campus Activations Coordinator",
                "sender_initials": "SP",
                "sender_color": "bg-green-600",
                "subject": "Music-Powered Events — Let's Collaborate!",
                "preview": "We're launching a new campus playlist partnership program and think your events would be the perfect fit…",
                "full_message": (
                    "Hey there!\n\nWe're launching a new campus playlist partnership program and think your events would be the perfect fit. "
                    "Imagine every event powered by curated Spotify playlists with real-time audience voting.\n\n"
                    "Our proposal includes:\n"
                    "• Custom event playlists curated by Spotify editors\n"
                    "• Interactive listening stations with Premium trials\n"
                    "• Spotify-branded photo ops & shared content\n"
                    "• Data insights on music engagement at your events\n\n"
                    "This is a pilot program so we're offering this at no cost for the first 3 events, "
                    "with the option to extend into a paid partnership.\n\n"
                    "Would love to chat!\n\nBest,\nAlexa Rivera\nCampus Activations, Spotify"
                ),
                "timestamp": "Yesterday",
                "date": "Apr 9",
                "read": True,
                "starred": True,
                "status": "replied",
                "partnership_type": "Activation",
                "created_at": "2026-04-09T19:15:00Z",
            },
            {
                "id": "msg-004",
                "sender": "Chick-fil-A University",
                "sender_role": "Event Catering Partnerships",
                "sender_initials": "CF",
                "sender_color": "bg-red-600",
                "subject": "Catering Partnership for Spring Events",
                "preview": "We'd love to be the exclusive food partner for your spring semester events…",
                "full_message": (
                    "Good morning!\n\nWe'd love to be the exclusive food partner for your spring semester events. "
                    "Chick-fil-A University has a dedicated campus events catering program with flexible menus.\n\n"
                    "Our partnership package includes:\n"
                    "• Catering for up to 10 events per semester\n"
                    "• Custom branded food packaging\n"
                    "• Student meal vouchers for event promotion\n"
                    "• Social media cross-promotion\n\n"
                    "We recently partnered with 12 other campus organizations with great results — average event satisfaction rating of 4.8/5.\n\n"
                    "Let's connect!\n\nWarm regards,\nDavid Park\nCampus Events, Chick-fil-A"
                ),
                "timestamp": "Apr 8",
                "date": "Apr 8",
                "read": True,
                "starred": False,
                "status": "accepted",
                "partnership_type": "Catering",
                "created_at": "2026-04-08T13:00:00Z",
            },
            {
                "id": "msg-005",
                "sender": "Adobe Creative Campus",
                "sender_role": "Student Programs Manager",
                "sender_initials": "AD",
                "sender_color": "bg-red-500",
                "subject": "Creative Workshop Series — Adobe x LiveTime",
                "preview": "Adobe would love to sponsor a creative workshop series at your upcoming career-focused events…",
                "full_message": (
                    "Hi!\n\nAdobe would love to sponsor a creative workshop series at your upcoming career-focused events. "
                    "We're offering hands-on sessions with Adobe Creative Suite, led by Adobe-certified instructors.\n\n"
                    "Partnership highlights:\n"
                    "• 4 workshops per semester (Design, Video, Social Media, Portfolio)\n"
                    "• Free Adobe Creative Cloud licenses for attendees (1 year)\n"
                    "• Adobe-branded event materials\n"
                    "• Certificate of completion for participants\n\n"
                    "This program has been incredibly popular at other universities, with an average of 85% attendance.\n\n"
                    "Happy to share more details!\n\nBest,\nJordan Lee\nStudent Programs, Adobe"
                ),
                "timestamp": "Apr 7",
                "date": "Apr 7",
                "read": True,
                "starred": False,
                "status": "declined",
                "partnership_type": "Workshop",
                "created_at": "2026-04-07T14:00:00Z",
            },
            {
                "id": "msg-006",
                "sender": "Red Bull Campus",
                "sender_role": "Student Brand Manager",
                "sender_initials": "RB",
                "sender_color": "bg-blue-700",
                "subject": "Energy for Your Next Big Event 🚀",
                "preview": "Red Bull wants to fuel your next big campus event! We have a student activation budget ready to deploy…",
                "full_message": (
                    "Hey!\n\nRed Bull wants to fuel your next big campus event! We have a dedicated student activation budget "
                    "and we think your events are the perfect fit.\n\n"
                    "What we're offering:\n"
                    "• Red Bull sampling and branded bar at events\n"
                    "• DJ / music performance sponsorship\n"
                    "• Red Bull Wings Team on-site activation\n"
                    "• Content creation with Red Bull media team\n"
                    "• Cash sponsorship: $5,000–$10,000 per event\n\n"
                    "We've activated at over 200 campus events this year and our brand ambassadors love getting involved.\n\n"
                    "Let's make something epic happen!\n\nRyan Torres\nStudent Brand Manager, Red Bull"
                ),
                "timestamp": "Apr 5",
                "date": "Apr 5",
                "read": True,
                "starred": True,
                "status": "replied",
                "partnership_type": "Sponsorship",
                "created_at": "2026-04-05T17:00:00Z",
            },
        ]

        thread_messages = [
            # Celsius — single brand message
            {
                "id": "thread-001",
                "message_id": "msg-001",
                "sender": "Celsius Energy",
                "sender_initials": "CE",
                "sender_color": "bg-orange-500",
                "content": messages[0]["full_message"],
                "timestamp": "2:34 PM",
                "is_own": False,
                "created_at": "2026-04-17T18:34:00Z",
            },
            # Nike — single brand message
            {
                "id": "thread-002",
                "message_id": "msg-002",
                "sender": "Nike Campus",
                "sender_initials": "NK",
                "sender_color": "bg-gray-900",
                "content": messages[1]["full_message"],
                "timestamp": "11:20 AM",
                "is_own": False,
                "created_at": "2026-04-17T15:20:00Z",
            },
            # Spotify — brand + our reply
            {
                "id": "thread-003a",
                "message_id": "msg-003",
                "sender": "Spotify for Brands",
                "sender_initials": "SP",
                "sender_color": "bg-green-600",
                "content": messages[2]["full_message"],
                "timestamp": "Apr 9, 3:15 PM",
                "is_own": False,
                "created_at": "2026-04-09T19:15:00Z",
            },
            {
                "id": "thread-003b",
                "message_id": "msg-003",
                "sender": "You",
                "sender_initials": "B",
                "sender_color": "bg-pink-500",
                "content": (
                    "Hi Alexa,\n\nThanks so much for reaching out! This sounds like an incredible opportunity. "
                    "We'd love to explore this further — the real-time voting feature sounds especially engaging for our audience.\n\n"
                    "Could we schedule a call for next Tuesday?\n\nBest,\nAdmin"
                ),
                "timestamp": "Apr 9, 5:42 PM",
                "is_own": True,
                "created_at": "2026-04-09T21:42:00Z",
            },
            # Chick-fil-A — brand + reply + follow-up
            {
                "id": "thread-004a",
                "message_id": "msg-004",
                "sender": "Chick-fil-A University",
                "sender_initials": "CF",
                "sender_color": "bg-red-600",
                "content": messages[3]["full_message"],
                "timestamp": "Apr 8, 9:00 AM",
                "is_own": False,
                "created_at": "2026-04-08T13:00:00Z",
            },
            {
                "id": "thread-004b",
                "message_id": "msg-004",
                "sender": "You",
                "sender_initials": "B",
                "sender_color": "bg-pink-500",
                "content": "Hi David,\n\nWe'd love to move forward with this! Let's finalize the details for our Taste of the Tropics event first.\n\nBest,\nAdmin",
                "timestamp": "Apr 8, 2:30 PM",
                "is_own": True,
                "created_at": "2026-04-08T18:30:00Z",
            },
            {
                "id": "thread-004c",
                "message_id": "msg-004",
                "sender": "Chick-fil-A University",
                "sender_initials": "CF",
                "sender_color": "bg-red-600",
                "content": "That's wonderful news! I'll send over the catering proposal for Taste of the Tropics by end of day tomorrow. Looking forward to working together!\n\nBest,\nDavid",
                "timestamp": "Apr 8, 3:15 PM",
                "is_own": False,
                "created_at": "2026-04-08T19:15:00Z",
            },
            # Adobe — brand + our decline
            {
                "id": "thread-005a",
                "message_id": "msg-005",
                "sender": "Adobe Creative Campus",
                "sender_initials": "AD",
                "sender_color": "bg-red-500",
                "content": messages[4]["full_message"],
                "timestamp": "Apr 7, 10:00 AM",
                "is_own": False,
                "created_at": "2026-04-07T14:00:00Z",
            },
            {
                "id": "thread-005b",
                "message_id": "msg-005",
                "sender": "You",
                "sender_initials": "B",
                "sender_color": "bg-pink-500",
                "content": (
                    "Hi Jordan,\n\nThank you for the generous offer! Unfortunately, we've already committed to a similar workshop "
                    "partnership for this semester. We'd love to revisit this for the fall.\n\nBest,\nAdmin"
                ),
                "timestamp": "Apr 7, 4:00 PM",
                "is_own": True,
                "created_at": "2026-04-07T20:00:00Z",
            },
            # Red Bull — brand + our reply
            {
                "id": "thread-006a",
                "message_id": "msg-006",
                "sender": "Red Bull Campus",
                "sender_initials": "RB",
                "sender_color": "bg-blue-700",
                "content": messages[5]["full_message"],
                "timestamp": "Apr 5, 1:00 PM",
                "is_own": False,
                "created_at": "2026-04-05T17:00:00Z",
            },
            {
                "id": "thread-006b",
                "message_id": "msg-006",
                "sender": "You",
                "sender_initials": "B",
                "sender_color": "bg-pink-500",
                "content": (
                    "Hi Ryan,\n\nThis sounds amazing! We have our Midnight Munchies Mixer coming up and I think Red Bull would be a perfect fit. "
                    "Can we chat about the $10K sponsorship tier?\n\nBest,\nAdmin"
                ),
                "timestamp": "Apr 5, 5:00 PM",
                "is_own": True,
                "created_at": "2026-04-05T21:00:00Z",
            },
        ]

        self._store["messages"] = messages
        self._store["thread_messages"] = thread_messages
