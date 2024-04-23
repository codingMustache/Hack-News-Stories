import readline from "readline";
import { exec } from "child_process";
async function fetchTopStoriesIds() {
  try {
    return (
      await fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty")
    ).json();
  } catch (e) {
    throw new Error("Failed to fetch top stories:", e);
  }
}
async function paginate(ids, pNum, pSize) {
  return await Promise.all(
    ids.slice((pNum - 1) * pSize, pNum * pSize).map(async (id) => {
      return await (
        await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
      ).json();
    }),
  );
}
function printRun(r) {
  console.log("\x1b[0m\x1b[1m\x1b[4mHacker News CLI Reader\x1b[0m\n");
  const m =
    '\x1b[0mMake this program an alias:\n unix/linux:\n\x1b[1m  alias hn="hn-cli-reader -q" \n \x1b[0mPowershell:\n\x1b[1m  Set-Alias -Name hn -Value "hn-cli-reader -q"\x1b[0m\n';
  const u =
    "\x1b[0mUse the --read -r flag to start reading Hacker News stories\n Use the --quiet -q flag to run program in quiet mode\n";
  const i = "Use . to paginate\n Use 0-9 to open link in browser";
  if (r.some((arg) => /-q(?:uiet)?/.test(arg))) {
    return;
  } else if (r.some((arg) => /-r(?:ead)?/.test(arg))) {
    console.log(i);
  } else {
    console.log(i, m, u);
    process.exit(0);
  }
}
async function startReading(r) {
  const c = 10;
  let l = 0;
  printRun(r);
  const s = await fetchTopStoriesIds();
  let x = await paginate(s, l, c);
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode && process.stdin.setRawMode(true);
  process.stdin.on("keypress", async (t, k) => {
    if (t === ".") {
      l++;
      x = await paginate(s, l, c);
      console.clear();
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
