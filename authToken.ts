import { TICKETS_API, TICKETS_API_RECAPTCHA, TICKETS_URL } from "./constants";

export const refreshToken = async () => {
  const recaptcha_token = await capsolver();
  const authToken = await getAuthToken(recaptcha_token);

  console.log("Token successfully refreshed!");

  return authToken;
};

export const isExpired = (token: string) => {
  if (!token) return true;

  const decoded = JSON.parse(atob(token.split(".")[1]));

  return decoded.exp * 1000 < Date.now();
};

const capsolver = async () => {
  try {
    const { taskId } = await fetch("https://api.capsolver.com/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientKey: process.env.CAPSOLVER_API_KEY,
        task: {
          type: "ReCaptchaV2TaskProxyLess",
          websiteKey: "6LcFu9YUAAAAAO3sykMNOrP6sFv6b4ki880AbDBh",
          websiteURL: TICKETS_URL,
        },
      }),
    }).then((res) => res.json());
    console.log("🚀 ~ capsolver ~ taskId:", taskId);

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay for 1 second

      const resp = await fetch("https://api.capsolver.com/getTaskResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientKey: process.env.CAPSOLVER_API_KEY,
          taskId,
        }),
      }).then((res) => res.json());
      const status = resp.status;

      if (status === "ready") {
        return resp.solution.gRecaptchaResponse;
      }
      if (status === "failed" || resp.errorId) {
        console.error("Solve failed! response:", resp);

        return await capsolver();
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const getAuthToken = async (recaptcha_token: string) => {
  const bearerToken = await fetch(`${TICKETS_API}?`)
    .then((res) => res.json())
    .then((res) => res.first_step.token);

  const myHeaders = new Headers();
  myHeaders.append("accept", "application/json");
  myHeaders.append("accept-language", "fr-FR");
  myHeaders.append("authorization", `Bearer ${bearerToken}`);
  myHeaders.append("cache-control", "no-cache");
  myHeaders.append("content-type", "application/json; charset=utf-8");
  myHeaders.append("origin", "https://widget.weezevent.com");
  myHeaders.append("pragma", "no-cache");
  myHeaders.append("priority", "u=1, i");
  myHeaders.append("referer", "https://widget.weezevent.com/");
  myHeaders.append("sec-ch-ua", '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"');
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("sec-ch-ua-platform", '"macOS"');
  myHeaders.append("sec-fetch-dest", "empty");
  myHeaders.append("sec-fetch-mode", "cors");
  myHeaders.append("sec-fetch-site", "same-site");
  myHeaders.append(
    "user-agent",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
  );

  const payload = { recaptcha_token };

  const { token } = await fetch(TICKETS_API_RECAPTCHA, {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify(payload),
    redirect: "follow",
  }).then((response) => response.json());
  return token;
};
