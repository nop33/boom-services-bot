import { TICKETS_URL } from "./constants";

export const openBrowser = async () => {
  const { exec } = require("child_process");
  const platform = process.platform;

  let command: string;

  switch (platform) {
    case "darwin": // macOS
      // command = `open "${TICKETS_URL}?locale=en-GB"`;
      // command = `open "https://widget.weezevent.com/ticket/b461e964-eac0-4644-aefb-eed43c648d10/?locale=en_GB"`;
      command = `open "https://tickets.boomfestival.org/resale.html"`;
      break;
    case "win32": // Windows
      command = `start "${TICKETS_URL}?locale=en-GB"`;
      break;
    case "linux": // Linux
      command = `xdg-open "${TICKETS_URL}?locale=en-GB"`;
      break;
    default:
      console.log("Unsupported platform");
      return;
  }

  exec(command, (error) => {
    if (error) {
      console.error("Error opening browser:", error);
    }
  });
};
