const readline = require("readline");

const fetchTopStories = async () => {
  try {
    const req = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty");

    const json = await req.json();

    const pageSize = 10;
    let currentPage = 1;

    const paginate = async (pageNumber) => {
      const start = (pageNumber - 1) * pageSize;
      const end = pageNumber * pageSize;
      const items = json.slice(start, end);

      const storiesReq = await Promise.all(
        items.map(async (id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`),
        ),
      );

      const storiesJson = await Promise.all(storiesReq.map((req) => req.json()));

      const stories = storiesJson.map((story) => {
        return {
          title: story.title,
          url: story.url,
        };
      });

      return stories;
    };

    const displayPage = async (pageNumber) => {
      const stories = await paginate(pageNumber);
      stories.map((story) => {
        console.log(`\x1b[31m${story.title}`);
        console.log(` \x1b[34m\x1b[4m${new URL(story.url)}\x1b[0m \n`);
      });
    };

    readline.emitKeypressEvents(process.stdin);

    if (process.stdin.setRawMode != null) {
      process.stdin.setRawMode(true);
    }

    let currentPageDisplay = async () => {
      await displayPage(currentPage);
    };

    currentPageDisplay();

    process.stdin.on("keypress", async (str) => {
      if (str === ".") {
        currentPage++;
        await displayPage(currentPage);
      } else {
        console.log("Exiting");
        process.exit(0);
      }
    });
  } catch {
    console.log("Error");
  }
};

fetchTopStories();
