# Life Changer

An interactive walk-through of the one-day reset protocol from Dan Koe's essay
[How to fix your entire life in 1 day](https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1),
and a game board to keep using for the year that follows.

It is an unofficial companion. The ideas are Dan Koe's; the wording in the app is a
simplified paraphrase, not a copy of the essay.

## What it does

**Day one**

| Section | What happens there |
| --- | --- |
| Start | The thesis, your progress through the day, and what to know before you begin. |
| Ideas | The essay's five arguments in five minutes, with a clickable identity loop and the nine stages of ego development. |
| Morning | Fourteen excavation questions, one at a time: four on present pain, seven building the anti-vision, three on the vision. Later questions show the earlier answer they build on. |
| Day | Six timed check-ins on a timeline that tracks the clock, with the essay's suggested times (11:00, 1:30, 3:15, 5:00, 7:30, 9:00) editable to fit your day, plus three questions for idle moments. |
| Evening | Eight synthesis questions that end in a one-year lens, a one-month lens, tomorrow's actions and constraints, with the day's answers available to reread. |

**The rest of the year** (the Game section, which becomes the home screen once the board is filled in)

- **Daily quests.** Your daily levers as a checklist, with the last seven days and a year grid showing every day.
- **Monthly review.** The one-month project runs for a calendar month. When it ends, three review questions close it out and you set the next project and levers. Closed months stay on the board. The review questions are this app's addition, built on the essay's steering loop.
- **Year clock.** The year starts on the day you write your first answer. After twelve months the app suggests running the protocol again; the finished run is filed under past runs.
- **Reminders.** A calendar file with a daily reminder for the quests and a monthly one for the review.
- **Backup and restore.** Download or copy a backup, and restore it on the same phone or a new one.

## Using it as two people

Each person opens the app on their own phone. Answers are saved in that browser only, so
nobody sees anyone else's, and nothing is sent to a server. To show each other a game
board, use "Copy the game board" and send it as a message.

On a phone, add the page to the home screen (iPhone: Share, then Add to Home Screen;
Android: browser menu, then Install app). It then opens like an app, works offline, and
its data is less likely to be cleared by the browser.

## Run it

There is no build step and there are no dependencies. Serve the folder and open it:

```sh
python3 -m http.server 8000
```

To put it online, enable GitHub Pages for this repository (Settings → Pages → deploy from the
branch root).

## Files

- `index.html`: page shell, header, footer.
- `content.js`: every question, hint and explanation. Edit wording here.
- `app.js`: routing, state, rendering, the year and month clocks, backup and export.
- `styles.css`: design tokens (light and dark) and all styling.
- `manifest.webmanifest`, `icons/`, `sw.js`: home-screen install and offline support. When you
  change the list of files the app needs, update `SHELL` in `sw.js` and bump `CACHE`.

## Known limits

- A web page can't schedule phone notifications reliably, so reminders are calendar files
  and a copyable schedule.
- Answers live in one browser on one device and don't sync. Clearing site data deletes
  them, so make a backup now and then. The Game section shows how long ago the last one was.
- This is a reflection exercise, not mental-health care.
