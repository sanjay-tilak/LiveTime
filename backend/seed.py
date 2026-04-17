"""
Seed script — populates Supabase with the mock data from the frontend.

Usage:
    python seed.py

This will clear existing data and insert fresh seed records.
"""

from database import supabase


def seed():
    print("🌱 Seeding database...")

    # ── Clear existing data (order matters for FK constraints) ──
    print("  Clearing thread_messages...")
    supabase.table("thread_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print("  Clearing messages...")
    supabase.table("messages").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()

    # ── Messages ──
    messages = [
        {
            "sender": "Celsius Energy",
            "sender_role": "Brand Partnership Manager",
            "sender_initials": "CE",
            "sender_color": "bg-orange-500",
            "subject": "Partnership Opportunity — Campus Hydration Stations",
            "preview": "Hi there! We'd love to explore a co-branded hydration station activation at your upcoming events…",
            "full_message": (
                "Hi there!\n\n"
                "We'd love to explore a co-branded hydration station activation at your upcoming campus events. "
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
        },
        {
            "sender": "Nike Campus",
            "sender_role": "University Partnerships Lead",
            "sender_initials": "NK",
            "sender_color": "bg-gray-900",
            "subject": "Nike x LiveTime — Athletic Event Collab",
            "preview": "We've been following your athletic event series and would love to partner on the upcoming…",
            "full_message": (
                "Hello!\n\n"
                "We've been following your athletic event series and would love to partner on the upcoming Run & Refuel event. "
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
        },
        {
            "sender": "Spotify for Brands",
            "sender_role": "Campus Activations Coordinator",
            "sender_initials": "SP",
            "sender_color": "bg-green-600",
            "subject": "Music-Powered Events — Let's Collaborate!",
            "preview": "We're launching a new campus playlist partnership program and think your events would be the perfect fit…",
            "full_message": (
                "Hey there!\n\n"
                "We're launching a new campus playlist partnership program and think your events would be the perfect fit. "
                "Imagine every event powered by curated Spotify playlists with real-time audience voting.\n\n"
                "Our proposal includes:\n"
                "• Custom event playlists curated by Spotify editors\n"
                "• Interactive listening stations with Premium trials\n"
                "• Spotify-branded photo ops & shared content\n"
                "• Data insights on music engagement at your events\n\n"
                "This is a pilot program so we're offering this at no cost for the first 3 events, "
                "with the option to extend into a paid partnership.\n\n"
                "Would love to chat!\n\n"
                "Best,\nAlexa Rivera\nCampus Activations, Spotify"
            ),
            "timestamp": "Yesterday",
            "date": "Apr 9",
            "read": True,
            "starred": True,
            "status": "replied",
            "partnership_type": "Activation",
        },
        {
            "sender": "Chick-fil-A University",
            "sender_role": "Event Catering Partnerships",
            "sender_initials": "CF",
            "sender_color": "bg-red-600",
            "subject": "Catering Partnership for Spring Events",
            "preview": "We'd love to be the exclusive food partner for your spring semester events…",
            "full_message": (
                "Good morning!\n\n"
                "We'd love to be the exclusive food partner for your spring semester events. "
                "Chick-fil-A University has a dedicated campus events catering program with flexible menus.\n\n"
                "Our partnership package includes:\n"
                "• Catering for up to 10 events per semester\n"
                "• Custom branded food packaging\n"
                "• Student meal vouchers for event promotion\n"
                "• Social media cross-promotion\n\n"
                "We recently partnered with 12 other campus organizations with great results "
                "— average event satisfaction rating of 4.8/5.\n\n"
                "Let's connect!\n\n"
                "Warm regards,\nDavid Park\nCampus Events, Chick-fil-A"
            ),
            "timestamp": "Apr 8",
            "date": "Apr 8",
            "read": True,
            "starred": False,
            "status": "accepted",
            "partnership_type": "Catering",
        },
        {
            "sender": "Adobe Creative Campus",
            "sender_role": "Student Programs Manager",
            "sender_initials": "AD",
            "sender_color": "bg-red-500",
            "subject": "Creative Workshop Series — Adobe x LiveTime",
            "preview": "Adobe would love to sponsor a creative workshop series at your upcoming career-focused events…",
            "full_message": (
                "Hi!\n\n"
                "Adobe would love to sponsor a creative workshop series at your upcoming career-focused events. "
                "We're offering hands-on sessions with Adobe Creative Suite, led by Adobe-certified instructors.\n\n"
                "Partnership highlights:\n"
                "• 4 workshops per semester (Design, Video, Social Media, Portfolio)\n"
                "• Free Adobe Creative Cloud licenses for attendees (1 year)\n"
                "• Adobe-branded event materials\n"
                "• Certificate of completion for participants\n\n"
                "This program has been incredibly popular at other universities, with an average of 85% attendance.\n\n"
                "Happy to share more details!\n\n"
                "Best,\nJordan Lee\nStudent Programs, Adobe"
            ),
            "timestamp": "Apr 7",
            "date": "Apr 7",
            "read": True,
            "starred": False,
            "status": "declined",
            "partnership_type": "Workshop",
        },
        {
            "sender": "Red Bull Campus",
            "sender_role": "Student Brand Manager",
            "sender_initials": "RB",
            "sender_color": "bg-blue-700",
            "subject": "Energy for Your Next Big Event 🚀",
            "preview": "Red Bull wants to fuel your next big campus event! We have a student activation budget ready to deploy…",
            "full_message": (
                "Hey!\n\n"
                "Red Bull wants to fuel your next big campus event! We have a dedicated student activation budget "
                "and we think your events are the perfect fit.\n\n"
                "What we're offering:\n"
                "• Red Bull sampling and branded bar at events\n"
                "• DJ / music performance sponsorship\n"
                "• Red Bull Wings Team on-site activation\n"
                "• Content creation with Red Bull media team\n"
                "• Cash sponsorship: $5,000–$10,000 per event\n\n"
                "We've activated at over 200 campus events this year and our brand ambassadors love getting involved.\n\n"
                "Let's make something epic happen!\n\n"
                "Ryan Torres\nStudent Brand Manager, Red Bull"
            ),
            "timestamp": "Apr 5",
            "date": "Apr 5",
            "read": True,
            "starred": True,
            "status": "replied",
            "partnership_type": "Sponsorship",
        },
    ]

    print(f"  Inserting {len(messages)} messages...")
    msg_response = supabase.table("messages").insert(messages).execute()
    inserted_messages = msg_response.data

    # Build a lookup: sender → inserted message id
    msg_id_map = {m["sender"]: m["id"] for m in inserted_messages}

    # ── Thread Messages ──
    thread_messages = [
        # Celsius Energy — single message from brand
        {
            "message_id": msg_id_map["Celsius Energy"],
            "sender": "Celsius Energy",
            "sender_initials": "CE",
            "sender_color": "bg-orange-500",
            "content": messages[0]["full_message"],
            "timestamp": "2:34 PM",
            "is_own": False,
        },
        # Nike Campus — single message from brand
        {
            "message_id": msg_id_map["Nike Campus"],
            "sender": "Nike Campus",
            "sender_initials": "NK",
            "sender_color": "bg-gray-900",
            "content": messages[1]["full_message"],
            "timestamp": "11:20 AM",
            "is_own": False,
        },
        # Spotify — brand message + our reply
        {
            "message_id": msg_id_map["Spotify for Brands"],
            "sender": "Spotify for Brands",
            "sender_initials": "SP",
            "sender_color": "bg-green-600",
            "content": messages[2]["full_message"],
            "timestamp": "Apr 9, 3:15 PM",
            "is_own": False,
        },
        {
            "message_id": msg_id_map["Spotify for Brands"],
            "sender": "You",
            "sender_initials": "B",
            "sender_color": "bg-pink-500",
            "content": (
                "Hi Alexa,\n\n"
                "Thanks so much for reaching out! This sounds like an incredible opportunity. "
                "We'd love to explore this further — the real-time voting feature sounds especially engaging for our audience.\n\n"
                "Could we schedule a call for next Tuesday?\n\n"
                "Best,\nAdmin"
            ),
            "timestamp": "Apr 9, 5:42 PM",
            "is_own": True,
        },
        # Chick-fil-A — brand message + our reply + their follow-up
        {
            "message_id": msg_id_map["Chick-fil-A University"],
            "sender": "Chick-fil-A University",
            "sender_initials": "CF",
            "sender_color": "bg-red-600",
            "content": messages[3]["full_message"],
            "timestamp": "Apr 8, 9:00 AM",
            "is_own": False,
        },
        {
            "message_id": msg_id_map["Chick-fil-A University"],
            "sender": "You",
            "sender_initials": "B",
            "sender_color": "bg-pink-500",
            "content": (
                "Hi David,\n\n"
                "We'd love to move forward with this! Let's finalize the details for our Taste of the Tropics event first.\n\n"
                "Best,\nAdmin"
            ),
            "timestamp": "Apr 8, 2:30 PM",
            "is_own": True,
        },
        {
            "message_id": msg_id_map["Chick-fil-A University"],
            "sender": "Chick-fil-A University",
            "sender_initials": "CF",
            "sender_color": "bg-red-600",
            "content": (
                "That's wonderful news! I'll send over the catering proposal for Taste of the Tropics by end of day tomorrow. "
                "Looking forward to working together!\n\n"
                "Best,\nDavid"
            ),
            "timestamp": "Apr 8, 3:15 PM",
            "is_own": False,
        },
        # Adobe — brand message + our decline
        {
            "message_id": msg_id_map["Adobe Creative Campus"],
            "sender": "Adobe Creative Campus",
            "sender_initials": "AD",
            "sender_color": "bg-red-500",
            "content": messages[4]["full_message"],
            "timestamp": "Apr 7, 10:00 AM",
            "is_own": False,
        },
        {
            "message_id": msg_id_map["Adobe Creative Campus"],
            "sender": "You",
            "sender_initials": "B",
            "sender_color": "bg-pink-500",
            "content": (
                "Hi Jordan,\n\n"
                "Thank you for the generous offer! Unfortunately, we've already committed to a similar workshop partnership "
                "for this semester. We'd love to revisit this for the fall.\n\n"
                "Best,\nAdmin"
            ),
            "timestamp": "Apr 7, 4:00 PM",
            "is_own": True,
        },
        # Red Bull — brand message + our reply
        {
            "message_id": msg_id_map["Red Bull Campus"],
            "sender": "Red Bull Campus",
            "sender_initials": "RB",
            "sender_color": "bg-blue-700",
            "content": messages[5]["full_message"],
            "timestamp": "Apr 5, 1:00 PM",
            "is_own": False,
        },
        {
            "message_id": msg_id_map["Red Bull Campus"],
            "sender": "You",
            "sender_initials": "B",
            "sender_color": "bg-pink-500",
            "content": (
                "Hi Ryan,\n\n"
                "This sounds amazing! We have our Midnight Munchies Mixer coming up and I think Red Bull would be a perfect fit. "
                "Can we chat about the $10K sponsorship tier?\n\n"
                "Best,\nAdmin"
            ),
            "timestamp": "Apr 5, 5:00 PM",
            "is_own": True,
        },
    ]

    print(f"  Inserting {len(thread_messages)} thread messages...")
    supabase.table("thread_messages").insert(thread_messages).execute()

    print("✅ Seed complete!")
    print(f"   → {len(messages)} messages")
    print(f"   → {len(thread_messages)} thread messages")


if __name__ == "__main__":
    seed()
