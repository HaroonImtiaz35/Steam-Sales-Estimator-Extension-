// extension/content.js

function text(el) {
  return el?.textContent?.trim() || "";
}

function parseNumber(str) {
  if (!str) return 0;
  const m = String(str).match(/([\d,.]+)/);
  if (!m) return 0;
  return parseFloat(m[1].replace(/,/g, ""));
}

function getSteamData() {
  const title =
    text(document.querySelector(".apphub_AppName")) ||
    text(document.querySelector("title")) ||
    "Unknown Game";

  const tags = [...document.querySelectorAll(".app_tag")]
    .map(el => text(el))
    .filter(Boolean);

  let price = 0;
  const priceEl =
    document.querySelector(".game_purchase_price") ||
    document.querySelector(".discount_final_price") ||
    document.querySelector(".game_area_purchase_game .game_purchase_price");

  if (priceEl) {
    const priceText = text(priceEl);
    price = priceText.toLowerCase().includes("free") ? 0 : parseNumber(priceText);
  }

  let positiveReviews = 0;
  let negativeReviews = 0;

  const metaResponsive = document.querySelector(".user_reviews_summary_row");
  if (metaResponsive) {
    const dataTooltip = metaResponsive.getAttribute("data-tooltip-html");
    if (dataTooltip) {
      const cleanTooltip = dataTooltip.replace(/&nbsp;|<br>/g, " ");
      const totalMatch = cleanTooltip.match(/([\d,]+)\s+user reviews/i);
      const ratioMatch = cleanTooltip.match(/(\d+)%/);

      if (totalMatch && ratioMatch) {
        const total = parseInt(totalMatch[1].replace(/,/g, ""), 10);
        const ratio = parseInt(ratioMatch[1], 10) / 100;
        positiveReviews = Math.round(total * ratio);
        negativeReviews = total - positiveReviews;
      }
    }
  }

  if (positiveReviews === 0) {
    const reviewMetaBlock = document.querySelector("#userReviews");
    if (reviewMetaBlock) {
      const pageText = reviewMetaBlock.innerText || "";
      const reviewTextMatches = pageText.match(/([\d,]+)\s+user reviews?/i);
      const positiveRatioMatch = pageText.match(/(\d+)%\s+of/i);

      if (reviewTextMatches && positiveRatioMatch) {
        const total = parseInt(reviewTextMatches[1].replace(/,/g, ""), 10);
        const ratio = parseInt(positiveRatioMatch[1], 10) / 100;
        positiveReviews = Math.round(total * ratio);
        negativeReviews = total - positiveReviews;
      }
    }
  }

  const releaseDateEl = document.querySelector(".release_date .date");
  let releaseYear = new Date().getFullYear();
  if (releaseDateEl) {
    const releaseText = text(releaseDateEl);
    const yearMatch = releaseText.match(/(\d{4})/);
    if (yearMatch) {
      releaseYear = parseInt(yearMatch[1], 10);
    }
  }

  return {
    title,
    tags,
    price,
    positiveReviews,
    negativeReviews,
    releaseYear
  };
}

// --- PORTED BACKEND MATH LOGIC ---
function tagMultiplier(tags = []) {
  const t = tags.join(" ").toLowerCase();
  let m = 1.0;
  if (t.includes("mmo")) m *= 1.8;
  if (t.includes("strategy")) m *= 1.15;
  if (t.includes("simulation")) m *= 1.12;
  if (t.includes("rpg")) m *= 1.08;
  if (t.includes("action")) m *= 1.05;
  if (t.includes("horror")) m *= 1.04;
  if (t.includes("casual")) m *= 0.92;
  if (t.includes("family friendly")) m *= 0.88;
  if (t.includes("visual novel")) m *= 0.95;
  return m;
}

function priceMultiplier(price = 0) {
  if (price <= 0) return 1.0;
  if (price < 5) return 0.9;
  if (price < 10) return 1.0;
  if (price < 20) return 1.05;
  if (price < 30) return 1.1;
  if (price < 50) return 1.2;
  return 1.3;
}

function calculateEstimates(data) {
  const { price, positiveReviews, negativeReviews, releaseYear, tags } = data;
  const totalReviews = positiveReviews + negativeReviews;
  const positiveRatio = totalReviews > 0 ? positiveReviews / totalReviews : 1.0;

  // Box-leiter core multiplier
  let baseRatio = 30;
  if (releaseYear < 2018) baseRatio = 50;
  else if (releaseYear < 2020) baseRatio = 40;
  else if (releaseYear < 2022) baseRatio = 32;

  const tagM = tagMultiplier(tags);
  const priceM = priceMultiplier(price);
  const ratio = baseRatio * tagM * priceM;

  const salesMid = Math.round(totalReviews * ratio);
  const salesLow = Math.round(salesMid * 0.7);
  const salesHigh = Math.round(salesMid * 1.5);

  const grossLow = Math.round(salesLow * price);
  const grossHigh = Math.round(salesHigh * price);

  const steamNetFactor = 0.70; // Steam's 30% cut
  const netLow = Math.round(grossLow * steamNetFactor);
  const netHigh = Math.round(grossHigh * steamNetFactor);

  let confidence = "medium";
  if (totalReviews >= 100 && tags.length >= 2) confidence = "high";
  if (totalReviews < 20) confidence = "low";
  if (price <= 0) confidence = "low";

  return {
    confidence,
    reviewRatioUsed: Number(ratio.toFixed(2)),
    estimatedSales: { low: salesLow, high: salesHigh },
    estimatedRevenueGross: { low: grossLow, high: grossHigh },
    estimatedRevenueNet: { low: netLow, high: netHigh }
  };
}

// --- RENDERING OVERLAY ---
function requestEstimate(buttonEl) {
  return new Promise((resolve) => {
    const data = getSteamData();
    const result = calculateEstimates(data); // Runs calculation instantly locally!
    showOverlay(data, result);
    resolve();
  });
}

function showOverlay(data, result) {
  let panel = document.getElementById("steam-estimator-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "steam-estimator-panel";
    panel.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 350px;
      z-index: 999999;
      background: #111827;
      color: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,.5);
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      border: 1px solid #374151;
    `;
    document.body.appendChild(panel);
  }

  const estSalesLow = result.estimatedSales.low;
  const estSalesHigh = result.estimatedSales.high;
  const grossRevLow = result.estimatedRevenueGross.low;
  const grossRevHigh = result.estimatedRevenueGross.high;
  const netRevLow = result.estimatedRevenueNet.low;
  const netRevHigh = result.estimatedRevenueNet.high;

  panel.innerHTML = `
    <div style="font-weight:bold;font-size:16px;margin-bottom:8px;color:#10b981;">Steam Sales Estimator</div>
    <div><strong>Game:</strong> ${data.title}</div>
    <div><strong>Price:</strong> $${data.price}</div>
    <div><strong>Positive Reviews:</strong> ${data.positiveReviews}</div>
    <div><strong>Negative Reviews:</strong> ${data.negativeReviews}</div>
    <div><strong>Release Year:</strong> ${data.releaseYear}</div>
    <div><strong>Tags:</strong> ${data.tags.slice(0, 6).join(", ") || "None"}</div>
    <hr style="border: none; border-top: 1px solid #374151; margin: 10px 0;">
    <div><strong>Confidence:</strong> ${result.confidence}</div>
    <div><strong>Review Ratio Used:</strong> ${result.reviewRatioUsed}x</div>
    <div><strong>Estimated Sales:</strong> ${estSalesLow.toLocaleString()} - ${estSalesHigh.toLocaleString()}</div>
    <div><strong>Gross Revenue:</strong> $${grossRevLow.toLocaleString()} - $${grossRevHigh.toLocaleString()}</div>
    <div><strong>Net Revenue:</strong> $${netRevLow.toLocaleString()} - $${netRevHigh.toLocaleString()}</div>
    <div style="margin-top:8px;color:#9ca3af;font-size:11px;line-height:1.2;">Calculated locally using optimized Box-Leiter review multiplying models.</div>
    <button id="steam-estimator-close" style="margin-top:12px;padding:6px 12px;border:none;border-radius:6px;cursor:pointer;background:#ef4444;color:white;font-weight:bold;width:100%;">Close</button>
  `;

  document.getElementById("steam-estimator-close").onclick = () => panel.remove();
}

function injectCalculateButton() {
  if (document.getElementById("steam-estimator-inject-btn")) return;

  const targetContainer = document.querySelector(".queue_actions_panel") || 
                          document.querySelector(".game_meta_data") ||
                          document.querySelector(".apphub_UserReviewScoreDetails");

  if (!targetContainer) return;

  const btn = document.createElement("button");
  btn.id = "steam-estimator-inject-btn";
  btn.textContent = "📊 Calculate Revenue Info";
  btn.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient( to right, #47bfff 0%, #1a9fff 100%);
    border: none;
    border-radius: 3px;
    color: #fff;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: normal;
    font-family: Arial, Helvetica, sans-serif;
    cursor: pointer;
    margin: 10px 0;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    transition: background 0.2s;
  `;

  btn.addEventListener("mouseover", () => {
    btn.style.background = "linear-gradient( to right, #5cd6ff 0%, #33a8ff 100%)";
  });
  btn.addEventListener("mouseout", () => {
    btn.style.background = "linear-gradient( to right, #47bfff 0%, #1a9fff 100%)";
  });

  btn.addEventListener("click", () => {
    requestEstimate(btn);
  });

  targetContainer.insertBefore(btn, targetContainer.firstChild);
}

injectCalculateButton();
const observer = new MutationObserver(injectCalculateButton);
observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "estimate") {
    requestEstimate()
      .then(() => sendResponse({ ok: true }))
      .catch((err) => {
        console.error(err);
        sendResponse({ ok: false });
      });
    return true; 
  }
});