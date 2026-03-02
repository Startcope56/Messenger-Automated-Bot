const axios = require("axios");

module.exports.config = {
  name: "auto-tiktok-fetch",
  version: "1.0.0",
};

let isStarted = false;

module.exports.handleEvent = async function ({ api }) {
  if (!isStarted) {
    startAutoFetch(api);
    isStarted = true;
  }
};

async function startAutoFetch(api) {

  const checkAndFetch = async () => {
    try {

      const response = await axios.get(
        "https://vern-rest-api.vercel.app/api/tiktok?query=news"
      );

      const data = response.data;

      const message = `
🎬 NEWS VIDEO UPDATE

📌 ${data.title}

👤 Creator: ${data.creator}

🔗 Video (No Watermark):
${data.no_watermark}

#News #Trending #TikTokNews
`;

      console.log(message);

      // placeholder only
      await api.sendMessage?.(message);

    } catch (err) {
      console.error("Error:", err.message);
    }

    setTimeout(checkAndFetch, 2 * 60 * 1000); // 2 minutes
  };

  checkAndFetch();
}
