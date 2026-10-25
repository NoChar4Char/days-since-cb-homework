# Days Since CB Homework

A live tracker that counts how long it's been since someone first asked for Codebusters homework.

- **Live site:** https://nochar4char.github.io/days-since-cb-homework/
- **Repo:** https://github.com/NoChar4Char/days-since-cb-homework

Everything on the site (the incident log, the text, the colors) comes from one file: [`src/data.json`](https://github.com/NoChar4Char/days-since-cb-homework/blob/main/src/data.json). To update the tracker, you edit that file and send the change in as a **pull request**.

---

## Add an incident

You can do all of this on the GitHub website.

### 1. Make a GitHub account

If you don't have one, sign up for free at https://github.com/signup and log in.

### 2. Open the data file

Go to **[src/data.json](https://github.com/NoChar4Char/days-since-cb-homework/blob/main/src/data.json)**.

### 3. Click the pencil icon

It's near the top right of the file and says **"Edit this file"** when you hover over it.

GitHub will say you need to **fork** the repository first. Click **"Fork this repository"**. A fork is just your own copy of the project, and GitHub makes it for you automatically.

### 4. Add your entry

Scroll down to `"history": [`. Each incident is one block inside the square brackets. Add yours as a new block, for example:

```json
    {
      "date": "10/25/2026",
      "time": "7:35 PM",
      "subject": "Day 4 of asking for homework",
      "note": "@discord-user"
    }
```

| Field     | What to type                                                         |
| --------- | -------------------------------------------------------------------- |
| `date`    | Month/day/year: `MM/DD/YYYY` (example: `10/25/2026`)                 |
| `time`    | 12-hour time with AM or PM, **Pacific time** (example: `7:35 PM`)    |
| `subject` | A short description of what happened                                 |
| `note`    | Anything extra, like who asked (example: `@discord-user`)            |

You can put the new entry anywhere in the list. The site sorts entries by date and time on its own.

> **⚠️ Watch the commas.** Every block needs a comma after its closing `}` **except the last one** in the list. A missing or extra comma breaks the whole file.
>
> ```json
> "history": [
>   { ...first entry... },
>   { ...second entry... },
>   { ...your new entry... }     <- last one: no comma
> ]
> ```
>
> Use straight quotes (`"`), not curly ones (`“ ”`). Curly quotes tend to sneak in if you copy from a phone or a doc.

### 5. Save it as a proposed change

1. Click the green **"Commit changes..."** button.
2. Write a short message, like `Add incident 10/25/2026`.
3. Click **"Propose changes"**.

### 6. Open the pull request

1. On the next page, click **"Create pull request"**.
2. Click **"Create pull request"** again to confirm.

That's it! The maintainer will review it and merge it, and then your entry shows up on the live site.

---

## Other settings in `data.json`

You can change these the same way (edit the file, then send a pull request).

| Field                | What it does                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------------- |
| `title`              | Name shown in the browser tab (after the live timer)                                          |
| `systemLabel`        | Small label in the top-left corner                                                            |
| `liveColor`          | Color of the blinking **LIVE** dot and text (any CSS color, such as `"red"` or `"#4ade80"`)   |
| `headline`           | Big heading at the top                                                                        |
| `tagline`            | Smaller line under the heading                                                                |
| `longestStreak`      | The record to beat, as `{ "days": 0, "hours": 0, "minutes": 0 }`                               |
| `recordLabel`        | Heading of the record box                                                                     |
| `newRecordText`      | Badge shown when the current streak beats the record                                          |
| `currentStreakLabel` | Label before the current streak                                                               |
| `previousBestLabel`  | Label before the old record, shown once it's beaten                                           |
| `ofRecordLabel`      | Text after the percentage (example: "45% **of record**")                                      |
| `statusLevels`       | The message under the timer. Each level has `minDays` (shown once the timer reaches that many days), `label` (the text) and `color-all` (its color) |
| `historyTitle`       | Heading of the incident log                                                                   |
| `newestFirst`        | `true` shows the newest incident at the top of the log; `false` shows the oldest at the top   |
| `latestLabel`        | Badge on the newest incident                                                                  |
| `noHistoryText`      | Shown if the log is empty                                                                     |
| `history`            | The incident log (see above)                                                                  |

The big timer counts up from the **earliest** incident in `history`.

---

## For developers

You'll need [Node.js](https://nodejs.org/) installed.

```bash
git clone https://github.com/NoChar4Char/days-since-cb-homework.git
cd days-since-cb-homework
npm install
npm run dev
```

Then open the address it prints (usually http://localhost:5173). The page reloads by itself when you save `src/data.json`.

| Command          | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `npm run dev`    | Runs the site locally with live reload           |
| `npm run build`  | Builds the site into `dist/`                     |
| `npm run deploy` | Builds and publishes the site to GitHub Pages    |

The site uses React and [Motion](https://motion.dev/) for the animations, built with [Vite](https://vite.dev/). The code is in `src/`.

### For the maintainer: publishing changes

The live site doesn't update by itself when a pull request is merged. After merging, run:

```bash
git pull
npm run deploy
```

---

## License

[MIT](LICENSE)
