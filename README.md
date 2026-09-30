# TaskFlow — Dynamic To-Do App

Auspify Technologies Frontend Developer Internship, Task 3.

A task manager built with plain HTML5, CSS3 and JavaScript (no frameworks). Tasks are saved in the browser with Local Storage, so they survive a page reload.

## Features

- Add tasks through a form (with validation for empty or overly long text)
- Mark tasks complete with an animated checkbox
- Edit a task by double-clicking its text, or using the edit button
- Delete a task with a smooth remove animation
- Filter by All / Active / Completed
- Live task count and "tasks left" counter
- "Clear completed" action once at least one task is done
- Empty states for no tasks and for an empty filter result
- Same premium dark glass theme as the rest of the portfolio
- Keyboard accessible (Tab, Enter to save an edit, Escape to cancel)

## Project structure

```
Task3_Dynamic_ToDo_App/
├── index.html
├── css/style.css
├── js/script.js
└── README.md
```

## How it works

- **DOM manipulation:** a `<template>` holds one task's markup; JavaScript clones it for every task and updates the list whenever tasks change.
- **Event handling:** one click listener on the list (event delegation) handles checkbox, edit and delete actions for every task, instead of attaching a listener per item.
- **Local Storage:** the task array is saved as JSON under the key `taskflow-tasks-v1` after every change, and loaded back when the page opens.

## Run locally

Open `index.html` in a browser, or use the Live Server extension in VS Code.

## Customise

- Change the storage key in `js/script.js` (`STORAGE_KEY`) if you want a fresh list.
- Adjust the 120-character task limit in both `index.html` (`maxlength`) and `js/script.js`.

## Deploy

Push the folder to GitHub, then enable GitHub Pages (Settings, Pages, branch `main`, folder `/root`).
