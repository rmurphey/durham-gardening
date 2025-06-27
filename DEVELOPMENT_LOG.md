# GardenSim Development Log

A developer's journal chronicling the experience of building a garden planning application. This log captures the collaborative process between human intuition and AI assistance, documenting the journey from concept to working application.

## Genesis (Early Sessions)

I had used Claude Code to ask questions about rapu, but I hadn't used it to build anything.

In the meantime, I have a garden.

I started just by asking Claude Code to make some recommendations for my garden based on my location and what I had already planted. The results of that are in the `archive` directory. The logs are not preserved.

The logs aren't preserved for anything, but the commits are pretty good. Eventually I also set up a todo file, and a command for interacting with it.

Claude is really bad at starting a dev server while still allowing me to interact with Claude. wtf. I yelled at it so many times but I think it's finally fixed.

## Focus and Scope Evolution

I started the app with the goal of getting something running in my browser for my very specific location. I explored supporting more locations early on, but decided to focus on other functionality instead. 

We spent a lot of time on getting the core functionality working for Durham, and there are probably still things to improve. A huge gap is that the app doesn't know what I've already planted. The app also doesn't have near-perfect data about the sunlight my garden gets.

## Technical Architecture Decisions

I had to help Claude think through when to use sqlite and when to hard-code things. Helpfully, Claude wrote me a wasm wrapper for sqlite. (Was this actually helpful or good? I haven't actually looked into it.)

At some point it became clear that the app was the thing, not the notes I had assembled. Claude did a pretty successful lift and shift, but left out some config files and such (ironically, Claude command files). I was able to talk it through recovering them, but its first inclination seemed to be to guess what those files might have contained.

## Persistence and Sharing Features

Eventually, to make the app something I would want to show someone, I added the ability to create a garden and the ability to store data about the garden that would persist across sessions, browsers, and devices. I thought Vercel had a free KV store (or rather, Claude said it did), but I had to switch to blob storage to keep it easy and free.

## Geographic Expansion

Once I was happy with the functionality, I asked Claude to make it work for the continental US. Claude needed some help thinking through all the aspects of this, for example, did the DB have all the info it needed, and did Durham-specific recommendations need to be abstracted? It did a decent job of adding the functionality, but it really didn't take into consideration the broader app context without help. For example, it didn't figure out on its own that the crop db needed to include growth-zone-specific data.

## Session Management and Costs

I've done this across several Claude sessions, because sometimes Claude would get wonky and mad and flash things at me for 20 minutes at a time and I couldn't stop it. Indeed I think sometimes it was spending money without actually giving me any value. That means I don't have a good total cost, but I think it's < $300 — someone with Claude admin can tell me for sure.

## Code Quality and Maintenance

Claude has needed a lot of encouragement to modularize things. The app started out as a 3KLOC single file. Claude is pretty good at cleanup tasks.

I asked Claude to fix some "cosmetic" things in the repo that maybe I wouldn't have prioritized ever. The cost was so trivial and I knew the changes would make the repo more accessible.


## Major Philosophical Shift: Habitat Preservation (June 2025)

https://www.reddit.com/r/Austin/comments/1lk9a1f/its_not_just_another_bad_year_hill_country_is_in/

The project took a significant turn when external context (habitat collapse concerns) prompted a fundamental rethinking of the application's purpose. Instead of focusing on *habitat propagation* (adding, installing, enhancing), the app now emphasizes *habitat preservation* (supporting, maintaining, working with existing systems).

This shift affects the entire recommendation system:
- Language changed from intervention to stewardship
- Monthly guidance moved from "install" to "support" 
- Crop recommendations emphasize working with natural conditions
- Companion planting focuses on supporting existing beneficial relationships

**Implementation Status:** ✅ Complete - Successfully updated all recommendation systems

**Reflection (June 2025):** The philosophical shift came from a single Reddit post about Hill Country habitat collapse that deeply resonated as someone who loves Austin. It's remarkable how one piece of external context can fundamentally change an entire application's purpose. Claude demonstrated the ability to systematically translate a philosophical concept into practical code changes - updating language from "install/build/add" to "support/deploy/provide" across multiple service files while maintaining all functionality. The shift felt meaningful rather than cosmetic.

---

## Development Experience Notes

**On AI Collaboration:**
- Claude Code needed constant guidance on broader context and architectural thinking
- Excellent at cleanup tasks and modularization when directed
- Required multiple sessions due to occasional AI instability ("wonky and mad")
- Cost management was important - estimated <$300 total for entire project

**On Technical Architecture:**
- Started as 3KLOC single file, gradually modularized through AI assistance
- SQLite vs hard-coding decisions required human architectural oversight
- Persistence layer evolved: localStorage → Vercel KV → Blob storage (due to cost)
- Geographic expansion (Durham → Continental US) needed significant guidance on data model implications

**On Development Workflow:**
- AI struggles with keeping dev server running while maintaining interactivity
- Commit messages serve as detailed technical log
- This log captures developer experience and high-level project evolution
- Manual intervention needed for major architectural and philosophical decisions