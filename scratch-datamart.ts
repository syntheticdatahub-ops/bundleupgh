import https from "node:https";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const DATAMART_API_KEY = process.env.DATAMART_API_KEY;

const payload = {
  phoneNumber: "0244785285",
  network: "YELLO",
  capacity: "1",
  gateway: "wallet",
};

const options = {
  hostname: "api.datamartgh.shop",
  path: "/api/developer/purchase",
  method: "POST",
  headers: {
    "X-API-Key": DATAMART_API_KEY || "",
    "Content-Type": "application/json",
    "X-Idempotency-Key": "oXoQOg0GYRlTHK2dMqbp" // same id
  },
  family: 4,
  rejectUnauthorized: false,
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
  });
});

req.on("error", (e) => console.error(e));
req.write(JSON.stringify(payload));
req.end();
