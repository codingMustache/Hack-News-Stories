#!/usr/bin/env node
import { emitKeypressEvents } from "readline";
import { exec } from "child_process";

class HackerNewsReader {
  constructor() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.storyIds = [];
    this.runModes = [];
    this.currentStories = [];
  }

  async fetchTopStoriesIds() {
    try {
      this.storyIds = await (
        await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
      ).json();
    } catch (error) {
      console.error("Failed to fetch top stories:", error);
    }
  }

  async paginate(pageNumber) {
    const pageItems = this.storyIds.slice(
      (pageNumber - 1) * this.pageSize,
      pageNumber * this.pageSize,
    );

    return (
      await Promise.all(
        pageItems.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then((res) =>
            res.json(),
          ),
        ),
      )
    ).map(({ title, url }) => ({ title, url }));
  }

  async displayPage(pageNumber) {
    this.currentStories = await this.paginate(pageNumber);
    console.clear();
    this.printRun();
    this.currentStories.forEach((story, index) => {
      console.log(`\x1b[34m${index}:  \x1b[31m${story.title}`);
    });
  }

  async startReading(runModes) {
    this.runModes = runModes;
    await this.fetchTopStoriesIds();
    await this.displayPage(this.currentPage);

    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode && process.stdin.setRawMode(true);

    process.stdin.on("keypress", async (str, key) => {
      if (str === ".") {
        this.currentPage++;
        await this.displayPage(this.currentPage);
      } else if (str.match(/[0-9]/)) {
        const commands = { darwin: "open", win32: "start", linux: "xdg-open" };
        exec(
          `${
            commands[process.platform] ||
            (() => {
              throw new Error(`Unsupported platform: ${process.platform}`);
            })()
          } "${this.currentStories[parseInt(key.name)].url}"`,
        );
      } else {
        console.log("Exiting");
        process.exit();
      }
    });
  }

  printRun() {
    const welcomeStr = "\x1b[0m\x1b[1m\x1b[4\x1b[4mHacker News CLI Reader\x1b[0m\n";
    const makeAlias =
      'Make this program an alias: \n\n unix/linix:\n\x1b[1m  alias hn="hn-cli-reader -q" \n Powershell:\n\x1b[1m Set-Alias -Name hn -Value hn-cli-reader \x1b[0m\n\n';
    const runCmds =
      "\x1b[0mUse the --read -r flag to start reading Hacker News stories\n Use the --quiet -q flag to run program in quiet mode\n";
    const instructions = "Use . to paginate\n Use 0-9 to open link in browser\n";

    this.runModes.some((arg) => /-q(?:uiet)?/.test(arg))
      ? ""
      : this.runModes.some((arg) => /-r(?:ead)?/.test(arg))
        ? console.log(welcomeStr, instructions)
        : console.log(welcomeStr, makeAlias, runCmds);
  }
}

const pgm = new HackerNewsReader();
pgm.startReading(process.argv.slice(2));
