// Checks /api/chat rejects bad input and rate limits, without spending any Gemini quota.
import assert from "node:assert/strict";

const url = `${process.argv[2] ?? "http://localhost:3000"}/api/chat`;
const post = (body) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body }).then((r) => r.status);
const messages = (...list) => JSON.stringify({ messages: list });

const bad = [
  "not json",
  "{}",
  messages(),
  messages({ from: "system", text: "hi" }),
  messages({ from: "you", text: "" }),
  messages({ from: "you", text: "x".repeat(2001) }),
  messages({ from: "zeke", text: "last turn must be the visitor" }),
  JSON.stringify({ messages: Array(11).fill({ from: "you", text: "hi" }) }),
];
for (const body of bad) assert.equal(await post(body), 400, body.slice(0, 60));

assert.equal((await fetch(url)).status, 405);

let status;
for (let i = 0; i < 10; i++) status = await post("{}");
assert.equal(status, 429);

console.log("ok");
