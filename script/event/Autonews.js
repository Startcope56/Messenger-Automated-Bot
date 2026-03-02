const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "auto-news",
  version: "3.0.0",
};

let isAutoPostStarted = false;

module.exports.handleEvent = async function ({ api }) {
  if (!isAutoPostStarted) {
    startAutoPost(api);
    isAutoPostStarted = true;
  }
};

async function startAutoPost(api) {

  const NEWS_API_KEY = "pub_9b2ebaed017e456791f1076b6c770a63";
  let lastPostedTitle = "";

  const checkAndPost = async () => {
    try {

      const now = moment().tz("Asia/Manila");
      console.log("Checking news:", now.format("YYYY-MM-DD HH:mm:ss"));

      // 🇵🇭 Philippines News
      const phNews = await axios.get(
        `https://newsdata.io/api/1/latest?apikey=${NEWS_API_KEY}&country=ph`
      );

      // 🌍 International News
      const worldNews = await axios.get(
        `https://newsdata.io/api/1/latest?apikey=${NEWS_API_KEY}&category=top`
      );

      const combinedNews = [
        ...(phNews.data.results || []),
        ...(worldNews.data.results || [])
      ];

      if (combinedNews.length === 0) {
        console.log("No news found.");
        return scheduleNext();
      }

      // Random news para hindi pare-pareho
      const news = combinedNews[Math.floor(Math.random() * combinedNews.length)];

      if (news.title === lastPostedTitle) {
        console.log("Duplicate skipped.");
        return scheduleNext();
      }

      lastPostedTitle = news.title;

      const publishedTime = news.pubDate
        ? moment(news.pubDate).tz("Asia/Manila").format("MMMM D, YYYY • h:mm A")
        : now.format("MMMM D, YYYY • h:mm A");

      const locationTag = news.country?.includes("philippines")
        ? "🇵🇭 PHILIPPINES"
        : "🌍 INTERNATIONAL";

      const message = `
━━━━━━━━━━━━━━━━━━
📰 𝗟𝗜𝗩𝗘 𝗡𝗘𝗪𝗦 𝗨𝗣𝗗𝗔𝗧𝗘
━━━━━━━━━━━━━━━━━━

${locationTag}

📌 ${news.title}

${news.description || "Click the link below to read full details."}

🕒 ${publishedTime}

🔗 READ MORE:
${news.link}

━━━━━━━━━━━━━━━━━━
#BreakingNews #Philippines #WorldNews #NewsUpdate
`;

      console.log("Prepared Post:\n", message);

      // 🔥 Palitan mo ito ng actual posting method
      await api.createPost?.(message);

      console.log("Posted successfully!");

    } catch (error) {
      console.error("Auto News Error:", error.message);
    }

    scheduleNext();
  };

  function scheduleNext() {
    setTimeout(checkAndPost, 8 * 60 * 1000);
  }

  checkAndPost();
}
