# Life Changer

An interactive walk-through of the one-day reset protocol from Dan Koe's essay
[How to fix your entire life in 1 day](https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1).

It is an unofficial companion. The ideas are Dan Koe's; the wording in the app is a
simplified paraphrase, not a copy of the essay.

## What it does

| Section | What happens there |
| --- | --- |
| Start | The thesis, your progress through the day, and what to know before you begin. |
| Ideas | The argument in five minutes, with a clickable diagram of the identity loop. |
| Morning | Eleven excavation questions, one at a time: eight on the life you don't want, three on the one you do. |
| Day | Six timed check-ins (11:00, 1:30, 3:15, 5:00, 7:30, 9:00) on a timeline that tracks the clock, plus three questions for idle moments. |
| Evening | Eight synthesis questions that end in a one-year goal, a one-month project, daily actions and constraints. |
| Game | Your six-piece game board, built from the evening answers and editable in place, with a daily quest checklist and a seven-day history. |

Answers are saved in the browser's `localStorage` as you type. Nothing is sent to a server.
The Game section can copy or download everything as plain text.

## Run it

There is no build step and there are no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

To put it online, enable GitHub Pages for this repository (Settings → Pages → deploy from the
branch root).

## Files

- `index.html`: page shell, header, footer.
- `content.js`: every question, hint and explanation. Edit wording here.
- `app.js`: routing, state, rendering and export.
- `styles.css`: design tokens (light and dark) and all styling.

## Known limits

- A web page can't schedule phone notifications reliably, so the Day section offers a
  calendar file (`.ics`) and a copyable schedule instead of ringing by itself.
- Answers live in one browser on one device. Clearing site data deletes them, and they
  don't sync.
- This is a reflection exercise, not mental-health care.
