#!/usr/bin/env node
import { emitKeypressEvents } from "readline";
import { exec } from "child_process";

class HackerNewsReader {
  constructor() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.currentStories = [];
    this.storyIds = [];
    this.runMode = "";
  }

  async fetchTopStoriesIds() {
    try {
      const response = await fetch(
        "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty",
      );
      this.storyIds = await response.json();
    } catch (error) {
      console.error("Failed to fetch top stories:", error);
    }
  }

  async paginate(pageNumber) {
    const start = (pageNumber - 1) * this.pageSize;
    const end = pageNumber * this.pageSize;
    const pageItems = this.storyIds.slice(start, end);

    const storyDetails = await Promise.all(
      pageItems.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then((res) =>
          res.json(),
        ),
      ),
    );

    return storyDetails.map(({ title, url }) => ({ title, url }));
  }

  async displayPage(pageNumber) {
    this.currentStories = await this.paginate(pageNumber);
    console.clear();
    this.printRun();
    this.currentStories.forEach((story, index) => {
      console.log(`\x1b[34m${index}:  \x1b[31m${story.title}`);
    });
  }

  getOpenCommand(url) {
    const commands = {
      darwin: "open",
      win32: "start",
      linux: "xdg-open",
    };

    const command = commands[process.platform];
    if (!command) {
      throw new Error(`Unsupported platform: ${process.platform}`);
    }

    return `${command} "${url}"`;
  }

  async startReading() {
    await this.fetchTopStoriesIds();
    await this.displayPage(this.currentPage);

    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode && process.stdin.setRawMode(true);

    process.stdin.on("keypress", async (str, key) => {
      if (str === ".") {
        this.currentPage++;
        await this.displayPage(this.currentPage);
      } else if (key.name.match(/[0-9]/) && parseInt(key.name) <= this.currentStories.length) {
        const storyIndex = parseInt(key.name);
        exec(this.getOpenCommand(this.currentStories[storyIndex].url), (e) => {
          if (e) {
            console.error("Failed to open URL:", err);
          }
        });
      } else {
        console.log("Exiting");
        process.exit();
      }
    });
  }

  printRun() {
    const welcomeStr = "\x1b[1m\x1b[4\x1b[4mHacker News CLI Reader\x1b[0m\n";
    const makeAlias =
      'Make this program an alias: \n\n unix/linix:\n\x1b[1m  alias hn="hn-cli-reader -q" \n Powershell:\n\x1b[1m Set-Alias -Name hn -Value hn-cli-reader \x1b[0m\n\n';
    const runCmds =
      "\x1b[0mUse the --read -r flag to start reading Hacker News stories\n Use the --quite -q flag to run program in quiet mode\n";
    const instructions = "Use . to paginate\n Use 0-9 to open link in browser\n";
    if (this.runMode === "quiet") {
      return;
    } else if (this.runMode === "read") {
      console.log(welcomeStr, instructions);
    } else {
      console.log(welcomeStr, makeAlias, runCmds);
      process.exit();
    }
  }
  setPrintMode(passedArgs) {
    if (passedArgs.some((arg) => /-q(?:uiet)?/.test(arg))) {
      this.runMode = "quiet";
    } else if (passedArgs.some((arg) => /-r(?:ead)?/.test(arg))) {
      this.runMode = "read";
    } else {
      this.runMode = "verbose";
    }
  }
}
const pgm = new HackerNewsReader();
const args = process.argv.slice(2);
pgm.setPrintMode(args);
pgm.startReading();
