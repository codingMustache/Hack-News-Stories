# HN-CLI-READER

Never leave your key board. This is a cli program that will allow you to paginate Hacker News in your terminal.

# To install

run `npm install -g hn-cli-reader`

## How to use

```
hn-clireader -RunMode
```

| RunMode   | Mode information   |
| --------- | ------------------ |
| -r -read  | Runs in read mode  |
| -q -quiet | Runs in quiet mode |

Pagination is done with `.`, using the number, `0-9`, to the right of the story title you can open the story in your default browser. You can exit the program using any key except `0-9` and `.`

Run example:

```
0:  Meta Horizon OS
1:  Equinox.space
2:  An Exploration of SBCL Internals (2020)
3:  Parquet-WASM: Rust-based WebAssembly bindings to read and write Parquet data
4:  Show HN: OpenOrb, a curated search engine for Atom and RSS feeds
5:  HockeyStack (YC S23) Is Hiring Young Founding Engineers in the Bay Area
6:  Py2wasm – A Python to WASM Compiler
7:  Inside the Super Nintendo cartridges
8:  JEDEC Extends DDR5 Memory Spec to 8800 MT/S, Adds Anti-Rowhammer Features
9:  Intel Gaudi 3 the New 128GB HBM2e AI Chip in the Wild
```
