#!/usr/bin/env node
import { emitKeypressEvents } from "readline";
import { exec } from "child_process";
async function fetchTopStoriesIds() {
  try {
    return await (
      await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
    ).json();
  } catch (error) {
    console.error("Failed to fetch top stories:", error);
    return [];
  }
}
async function paginate(storyIds, pageNumber, pageSize) {
  const pageItems = storyIds.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  const stories = await Promise.all(
    pageItems.map(async (id) => {
      const response = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`,
      );
      return await response.json();
    }),
  );
  return stories.map(({ title, url }) => ({ title, url }));
}
function printRun(runModes) {
  const welcomeStr = "\x1b[0m\x1b[1m\x1b[4mHacker News CLI Reader\x1b[0m\n";
  const makeAlias =
    'Make this program an alias: \n\n unix/linix:\n\x1b[1m  alias hn="hn-cli-reader -q" \n Powershell:\n\x1b[1m Set-Alias -Name hn -Value hn-cli-reader \x1b[0m\n\n';
  const runCmds =
    "\x1b[0mUse the --read -r flag to start reading Hacker News stories\n Use the --quiet -q flag to run program in quiet mode\n";
  const instructions = "Use . to paginate\n Use 0-9 to open link in browser\n";

  runModes.some((arg) => /-q(?:uiet)?/.test(arg))
    ? ""
    : runModes.some((arg) => /-r(?:ead)?/.test(arg))
      ? console.log(welcomeStr, instructions)
      : (console.log(welcomeStr, makeAlias, runCmds), process.exit());
}
async function startReading(r) {
  const c = 10;
  let l = 1;
  const s = await fetchTopStoriesIds();
  console.clear();
  printRun(r);
  let x = await paginate(s, l, c);
  x.forEach((o, i) => {
    console.log(`\x1b[34m${i}:  \x1b[31m${o.title}`);
  });
  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode && process.stdin.setRawMode(true);
  process.stdin.on("keypress", async (t, k) => {
    if (t === ".") {
      l++;
      console.clear();
      x = await paginate(s, l, c);
      x.forEach((o, i) => {
        console.log(`\x1b[34m${i}:  \x1b[31m${o.title}`);
      });
    } else if (t.match(/[0-9]/)) {
      const p = { darwin: "open", win32: "start", linux: "xdg-open" };
      exec(
        `${
          p[process.platform] ||
          (() => {
            throw new Error(`Unsupported platform: ${process.platform}`);
          })()
        } "${x[parseInt(k.name)].url}"`,
      );
    } else {
      console.log("Exiting");
      process.exit(0);
    }
  });
}
startReading(process.argv.slice(2));
