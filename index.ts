import { refreshToken, isExpired } from "./authToken";
import { TICKETS_API } from "./constants";
import { openBrowser } from "./utils";

import axios from "axios";
import beeper from "beeper";

let attempt = 0;
let token = "";
let isRefreshing = false;
let isPaused = false;

const checkAvailability = async () => {
  attempt++;

  if (isRefreshing) return;

  try {
    if (isExpired(token)) {
      isRefreshing = true;

      console.log("Token expired, refreshing...");

      token = await refreshToken();

      console.log("Token refreshed!");

      isRefreshing = false;
    }

    const response = await axios.get(TICKETS_API, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const lizard = response.data.first_step.data["ticket-market-rates"]["rates_with_group"][0]["children"][0];
    const wanbli = response.data.first_step.data["ticket-market-rates"]["rates_with_group"][0]["children"][1];

    const BellTent3P = lizard.rates[0].quantity_available;
    const BellTent4P = lizard.rates[1].quantity_available;
    const DomoTent6P = lizard.rates[2].quantity_available;
    const StarTent5P = wanbli.rates[0].quantity_available;
    const StarTent2P = wanbli.rates[2].quantity_available;
    const Tipi2P = wanbli.rates[3].quantity_available;
    const Tipi6P = wanbli.rates[4].quantity_available;

    const foundTicket =
      BellTent3P > 0 ||
      BellTent4P > 0 ||
      DomoTent6P > 0 ||
      StarTent5P > 0 ||
      StarTent2P > 0 ||
      Tipi2P > 0 ||
      Tipi6P > 0;

    if (foundTicket) {
      if (!isPaused) {
        isPaused = true;
        console.log("Ticket available", "Attempt:", attempt);
        console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅");
        beeper("***-***");
        openBrowser();
      }
    } else {
      isPaused = false;
      console.log("No ticket available.", "Attempt:", attempt);
    }
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
};

setInterval(checkAvailability, 250);
