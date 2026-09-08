// One-off setup: creates the Shoplive Seller that newly-submitted live campaigns
// are parked under until a Rakuten admin approves them (see design doc §04).
// Run once with: npm run seed
import { readFileSync, appendFileSync } from "node:fs";

const envPath = new URL("../.env", import.meta.url);
const envText = readFileSync(envPath, "utf8");
const separator = envText.endsWith("\n") ? "\n" : "\n\n";
const env = Object.fromEntries(
  envText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
);

if (env.SHOPLIVE_PLACEHOLDER_SELLER_ID) {
  console.log(
    `Placeholder seller already configured: sellerId=${env.SHOPLIVE_PLACEHOLDER_SELLER_ID}`
  );
  process.exit(0);
}

const accessKey = env.SHOPLIVE_ACCESS_KEY;
const jwt = env.SHOPLIVE_JWT_TOKEN;
if (!accessKey || !jwt) {
  console.error("SHOPLIVE_ACCESS_KEY / SHOPLIVE_JWT_TOKEN not found in .env");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${jwt}`,
  "Content-Type": "application/json",
  Accept: "application/json",
};

const createRes = await fetch(`https://private.shopliveapi.com/v2/${accessKey}/seller`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "楽天市場 審査待ち（プレースホルダー）",
    description:
      "新規ライブ申請が管理者承認を得るまでの間、キャンペーンを一時的に保持するための内部用Seller。エンドユーザーには公開されません。",
  }),
});

if (createRes.ok) {
  const data = await createRes.json();
  console.log(`Created placeholder seller: sellerId=${data.sellerId}`);
  appendFileSync(envPath, `${separator}SHOPLIVE_PLACEHOLDER_SELLER_ID=${data.sellerId}\n`);
  console.log("Appended SHOPLIVE_PLACEHOLDER_SELLER_ID to .env");
  process.exit(0);
}

// This Shoplive account's Create-a-seller endpoint returns 500 regardless of
// payload (confirmed by hand during setup) -- likely a plan/permission limit
// on this particular API key, not a request problem. Fall back to reusing an
// existing seller as the placeholder so the demo can still run end to end.
console.warn(
  `Create a seller failed (HTTP ${createRes.status}). Falling back to an existing seller as the placeholder.`
);

const searchRes = await fetch(`https://private.shopliveapi.com/v2/${accessKey}/seller?count=1`, {
  headers,
});
const searchData = await searchRes.json();
const fallbackSeller = searchData?.results?.[0];
if (!searchRes.ok || !fallbackSeller) {
  console.error("Could not find any existing seller to use as a fallback placeholder.");
  process.exit(1);
}

console.log(
  `Using existing seller as placeholder: sellerId=${fallbackSeller.sellerId} (${fallbackSeller.name})`
);
appendFileSync(
  envPath,
  `${separator}SHOPLIVE_PLACEHOLDER_SELLER_ID=${fallbackSeller.sellerId}\n` +
    `# NOTE: Create-a-seller returned 500 on this account, so the placeholder above\n` +
    `# reuses an existing seller instead of a dedicated one. See design doc constraints section.\n`
);
console.log("Appended SHOPLIVE_PLACEHOLDER_SELLER_ID to .env");
