#!/usr/bin/env node
import { emitKeypressEvents } from "readline";
import { exec } from "child_process";

async function fetchTopStoriesIds() {
  try {
    return await (
      await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
    ).json();
  } catch (e) {
    throw new Error("Failed to fetch top stories:", e);
  }
}

async function paginate(ids, pNum, pSize) {
  const pageItems = ids.slice((pNum - 1) * pSize, pNum * pSize);
  return (
    await Promise.all(
      pageItems.map(async (id) => {
        return await (
          await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
        ).json();
      }),
    )
  ).map(({ title, url }) => ({ title, url }));
}

function printRun(runModes) {
  const welcomeStr = "\x1b[0m\x1b[1m\x1b[4mHacker News CLI Reader\x1b[0m\n";
  const makeAlias =
    '\x1b[0mMake this program an alias:\n unix/linix:\n\x1b[1m  alias hn="hn-cli-reader -q" \n \x1b[0mPowershell:\n\x1b[1m   Set-Alias -Name hn -Value "hn-cli-reader -q"\x1b[0m\n\n';
  const runCmds =
    "\x1b[0mUse the --read -r flag to start reading Hacker News stories\n Use the --quiet -q flag to run program in quiet mode\n";
  const instructions = "Use . to paginate\n Use 0-9 to open link in browser\n";

  runModes.some((arg) => /-q(?:uiet)?/.test(arg))
    ? ""
    : runModes.some((arg) => /-r(?:ead)?/.test(arg))
      ? console.log(welcomeStr, instructions)
      : (console.log(welcomeStr, makeAlias, runCmds), process.exit());
}

async function startReading(runModes) {
  const pageSize = 10;
  let currentPage = 1;
  const storyIds = await fetchTopStoriesIds();
  const displayPage = async (pageNumber) => {
    const currentStories = await paginate(storyIds, pageNumber, pageSize);
    console.clear();
    printRun(runModes);
    currentStories.forEach((story, index) => {
      console.log(`\x1b[34m${index}:  \x1b[31m${story.title}`);
    });
  };

  await displayPage(currentPage);

  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode && process.stdin.setRawMode(true);

  process.stdin.on("keypress", async (str, key) => {
    if (str === ".") {
      currentPage++;
      await displayPage(currentPage);
    } else if (str.match(/[0-9]/)) {
      const commands = { darwin: "open", win32: "start", linux: "xdg-open" };
      exec(
        `${
          commands[process.platform] ||
          (() => {
            throw new Error(`Unsupported platform: ${process.platform}`);
          })()
        } "${storyIds[parseInt(key.name)].url}"`,
      );
    } else {
      console.log("Exiting");
      process.exit();
    }
  });
}

startReading(process.argv.slice(2));
