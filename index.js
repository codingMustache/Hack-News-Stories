
const fetchTopStories = async () => {
  try {
    const req = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty",
    );

    const json = await req.json();
    const topTen = json.slice(0, 20);

    const topTenStoriesReq = await Promise.all(
      topTen.map(async (id) =>
        fetch(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`,
        ),
      ),
    );

    const topTenStoriesJson = await Promise.all(
      topTenStoriesReq.map((req) => req.json()),
    )

    const topTenStories = topTenStoriesJson.map((story) => {
      return {
        title: story.title,
        url: story.url,
      }
    })
    
    console.log(topTenStories);
  } catch {
    console.log("error");
  }
};
fetchTopStories();