import { emitKeypressEvents } from "readline";

const fetchTopStories = async () => {
  try {
    //retrieving top news stroies IDs
    const req = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty");
    const json = await req.json();

    // set up var
    const pageSize = 10;
    let currentPage = 1;

    // paginating fn
    const paginate = async (pageNumber) => {
      // setup for pagenation
      const start = (pageNumber - 1) * pageSize;
      const end = pageNumber * pageSize;
      const items = json.slice(start, end);

      // call at end of list
      if (end === undefined) {
        console.log("You have reached the end");
        process.exit(0);
      }

      // get info news from HN
      const storiesReq = await Promise.all(
        items.map(async (id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`),
        ),
      );
      const storiesJson = await Promise.all(storiesReq.map((req) => req.json()));

      // remove keys that I dont need
      const stories = storiesJson.map((story) => {
        return {
          title: story.title,
          url: story.url,
        };
      });

      return stories;
    };
    //
    const displayPage = async (pageNumber) => {
      const stories = await paginate(pageNumber);
      stories.map((story) => {
        console.log(`\x1b[31m${story.title}`);
        console.log(` \x1b[34m\x1b[4m${new URL(story.url)}\x1b[0m \n`);
      });
      console.log("-".repeat(process.stdout.columns));
    };

    emitKeypressEvents(process.stdin);

    if (process.stdin.setRawMode != null) {
      process.stdin.setRawMode(true);
    }

    let currentPageDisplay = async () => {
      await displayPage(currentPage);
    };
    // run 1st call
    currentPageDisplay();

    // listener for pagination
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
