import { spawn } from "node:child_process";

const processes = [
  spawn("npm", ["run", "dev:server"], { stdio: "inherit" }),
  spawn("npm", ["run", "dev:client"], { stdio: "inherit" }),
];

let shuttingDown = false;
const shutdown = (signal = "SIGTERM") => {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) if (!child.killed) child.kill(signal);
};

for (const child of processes) {
  child.on("exit", (code, signal) => {
    if (!shuttingDown && code !== 0) {
      shutdown("SIGTERM");
      process.exitCode = code ?? (signal ? 1 : 0);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
