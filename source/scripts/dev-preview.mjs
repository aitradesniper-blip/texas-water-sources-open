import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const input = process.argv.slice(2);
const args = ["dev"];

for (let index = 0; index < input.length; index += 1) {
  const value = input[index];
  if (value === "--host") {
    args.push("--hostname", input[index + 1]);
    index += 1;
    continue;
  }
  if (value === "--strictPort") continue;
  args.push(value);
}

const child = spawn(process.execPath, [nextCli, ...args], { stdio: "inherit" });
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
