import { emitKeypressEvents } from "readline";
import { exec } from "child_process";

const fetchTopStories = async () => {
  try {
    // Retrieving top news stories IDs
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty",
    );
    const storyIds = await response.json();

    const pageSize = 10;
    let currentPage = 1;
    let currentStories = [];

    const paginate = async (pageNumber) => {
      const start = (pageNumber - 1) * pageSize;
      const end = pageNumber * pageSize;
      const pageItems = storyIds.slice(start, end);

      const storyDetails = await Promise.all(
        pageItems.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then((res) =>
            res.json(),
          ),
        ),
      );

      return storyDetails.map(({ title, url }) => ({ title, url }));
    };

    const displayPage = async (pageNumber) => {
      currentStories = await paginate(pageNumber);
      console.clear();
      currentStories.forEach((story, index) => {
        console.log(`\x1b[34m${index}: \x1b[0m${story.title}`);
      });
      console.log("-".repeat(process.stdout.columns));
    };

    await displayPage(currentPage);

    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode && process.stdin.setRawMode(true);

    process.stdin.on("keypress", async (str, key) => {
      if (str === ".") {
        currentPage++;
        await displayPage(currentPage);
      } else if (key.name.match(/[0-9]/) && parseInt(key.name) <= currentStories.length) {
        const storyIndex = parseInt(key.name) - 1;
        exec(`open ${currentStories[storyIndex].url}`, (err) => {
          if (err) {
            console.error("Failed to open URL:", err);
          }
        });
      } else {
        console.log("Exiting");
        process.exit();
      }
    });
  } catch (error) {
    console.error("Failed to fetch top stories:", error);
  }
};

fetchTopStories();
