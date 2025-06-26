# TODOs for Claude Code

## ✅ COMPLETED: Incorporate current weather and forecast data async

- ✅ Created forecast API route with 10-day weather data from National Weather Service
- ✅ Built Vercel cron function to update forecast every 6 hours
- ✅ Added forecast data storage in Vercel KV for caching
- ✅ Created ForecastWidget component with garden-specific alerts and recommendations
- ✅ Integrated forecast display on dashboard with simulation impact factors
- ✅ Added growing degree days, frost risk, and heat stress calculations
- ✅ Built garden planning recommendations based on weather conditions

## Rethink settings

- Eliminate the settings page. 
- Allow settings on the dashboard and analysis pages.
- Reduce the visual footprint of climate options and strategy options.## Is there further modularization/componentization we should do?

## I should be able to say "yes, I will do this thing" on the calendar, and it should offer to generate a shopping item.

## consider how to make the app usable for more zip codes

- Use the zip code 27707 for Durham for now

## Make the setup a collapsible part of the dashboard, and eliminate the setup page

## Is `NODE_ENV` set properly for dev vs production?

## ✅ COMPLETED: Combine Garden Tasks and Calendar

- ✅ Replace Garden Tasks with the Calendar, and incorporate task information into the calendar
- ✅ For non-recurring calendar items, let me dismiss the item once it's done.
- ✅ For recurring calendar items (like watering), let me mark them as done so you'll remind me when to do them again.
- ✅ This involves refreshing the interface async without user input!

## ✅ COMPLETED: Move the calendar to the dashboard

## COMPLETED: Plan a system that allows for cross-session persistence

Right now, the application is based entirely on browser storage. What would it take to add authenticated users (via some existing SSO provider e.g. Google or Github)?

# evergreen todos

## Does the design system need any updates?

## Eliminate unused code

## Review navigation styling

## Does the CSS need to be refactored into modules, or is it fine as is?

## Eliminate duplicate / unnecessary CSS

