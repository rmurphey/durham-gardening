# GardenSim Development Log

A chronicle of building a garden planning application through collaboration between a human gardener and Claude Code AI.

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

## Philosophical Shift (June 27, 2025)

I might have read a post on the r/Austin reddit about how habitats are collapsing, and so I've provided the new guidance to prioritize habitat preservation.

---

## Session Log: June 27, 2025

**Human Input:** "the 'new garden' button is huge. let's also move the garden id and the ability to fork it to the header"

**AI Response:** Continued work from previous session on moving garden management features to the header. Successfully:
- Added smaller header button styling (`.header-garden-btn` class)
- Moved garden ID display to AppHeader component
- Consolidated fork and share functionality in the header
- Removed redundant garden-info panel from GardenAppContent

**Human Input:** "omg, i still somehow see two navs on the dashboard page"

**AI Analysis & Fix:** Discovered routing architecture issue where garden routes were nested inside AppContent, causing double navigation rendering:
- **Problem:** `App.js → AppContent (Navigation) → GardenAppContent (Navigation)`
- **Solution:** Separated garden routes to top-level routing
- **Result:** Clean single navigation experience

**Commits:**
- c1b1a12: Move garden ID and actions to header, reduce button sizes
- 2964b04: Fix duplicate navigation by separating garden and app routes

**Human Input:** "Whereas the goal might have previously been habitat propagation, now it's habitat preservation. Adjust recommendations accordingly."

**AI Analysis:** Identified major philosophical shift requiring updates to:
- Monthly focus recommendations (installation → support)
- Crop descriptions (improvement → preservation) 
- Daily guidance (control → stewardship)
- Companion plant relationships (attract → support existing)

**Key Philosophy Changes:**
- From "Install drip irrigation" → "Support natural rainfall with targeted watering"
- From "Add beneficial insects" → "Support existing beneficial populations"  
- From "Enhance soil conditions" → "Maintain soil ecosystem health"

**Status:** Analysis complete, implementation pending

**Session Cost:** $22.38 total across multiple sessions
**Session Stats:** 1229 lines added, 476 lines removed