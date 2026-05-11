# 📊 Steam Sales Estimator

A lightweight, lightning-fast Chrome Extension that injects a native-looking **"Calculate Revenue Info"** button directly onto any Steam store page. With a single click, it estimates unit sales, gross revenue, and net revenue (after Steam's 30% cut) using an optimized **Box-Leiter review multiplier model**.

This extension runs **100% client-side** inside your browser. No external API calls, no servers, zero latency, and complete privacy.

---

## ✨ Features

* **Direct Steam Integration:** Injects a sleek, native-themed blue button directly below the Steam wishlist/ignore panels.
* **Accurate Scraper:** Autodetects positive/negative reviews, price, release year, and game tags.
* **Box-Leiter Estimation Engine:** Adjusts calculation multipliers dynamically based on the game's release year, tag genres (MMO, Strategy, Casual, etc.), and price range.
* **Revenue Breakdown:** Calculates estimated sales volume, Gross Revenue, and Net Revenue (deducting Steam's platform cut).
* **100% Private & Serverless:** Your browsing data never leaves your computer. No databases, no hosting, completely free forever.

---

## 🚀 Installation Guide (Developer Mode)

Since this is an open-source developer utility, you can easily load it into Google Chrome manually:

### 1. Download the Extension
* Click the green **Code** button at the top of this repository.
* Select **Download ZIP** and extract the contents to a folder on your computer (e.g., `Documents/steam-sales-estimator`).

### 2. Load it into Chrome
1.  Open Google Chrome and navigate to: `chrome://extensions/`
2.  In the top-right corner, toggle **Developer mode** to **ON** (🔴).
3.  In the top-left corner, click the **Load unpacked** button.
4.  Select the `extension` folder containing the `manifest.json` file.

That's it! The extension is now active.

---

## 🎮 How to Use

1.  Go to any game page on the [Steam Store](https://store.steampowered.com/).
2.  Locate the bright blue **📊 Calculate Revenue Info** button in the sidebar (under the purchase options or next to the wishlist actions).
3.  Click it to instantly toggle a sleek, interactive breakdown overlay at the bottom-right corner of your screen.

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** HTML5, CSS3, JavaScript (ES6 DOM Manipulation)
* **Manifest Standard:** Chrome Extensions Manifest V3
* **Algorithm:** Box-Leiter Multiplier adjusted dynamically for launch eras:
    * *Pre-2018:* ~50x reviews
    * *2018 - 2019:* ~40x reviews
    * *2020 - 2021:* ~32x reviews
    * *Post-2022:* ~30x reviews (further modified by price and tag weightings).

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with 💙 for the indie game development community. If you found this tool useful, give it a ⭐ to help other devs find it!*
