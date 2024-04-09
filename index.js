const fetchTopStories = async () => {
  try {
    const req = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty");

    const json = await req.json();
    const topTen = json.slice(0, 20);

    const topTenStoriesReq = await Promise.all(
      topTen.map(async (id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`),
      ),
    );

    const topTenStoriesJson = await Promise.all(topTenStoriesReq.map((req) => req.json()));

    topTenStoriesJson.map((story) => {
      console.log(`\x1b[31m${story.title}`);
      console.log(` \x1b[34m\x1b[4m${new URL(story.url)}\x1b[0m \n`);
    });

    //console.log(topTenStories);
  } catch {
    console.log("error");
  }
};
fetchTopStories();
