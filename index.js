#!/usr/bin/env node
import { emitKeypressEvents } from "readline";
import { exec } from "child_process";

class HackerNewsReader {
  constructor() {
    this.pageSize = 10;
    this.currentPage = 1;
    this.currentStories = [];
    this.storyIds = [];
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
    this.currentStories.forEach((story, index) => {
      console.log(`\x1b[34m${index}:  \x1b[31m${story.title}`);
    });
    console.log("\x1b[32m", "-".repeat(process.stdout.columns - 2));
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
        exec(`open ${this.currentStories[storyIndex].url}`, (err) => {
          if (err) {
            console.error("Failed to open URL:", err);
          }
        });
      } else {
        console.log("Exiting");
        process.exit();
      }
    });
  }
}

const hackerNewsReader = new HackerNewsReader();
hackerNewsReader.startReading();
