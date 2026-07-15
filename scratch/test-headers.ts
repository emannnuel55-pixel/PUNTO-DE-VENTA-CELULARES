import http from "node:https";

const url = "https://punto-de-venta-celulares-production.up.railway.app/api/media/eaae3f0e-e89e-4874-ab9a-2bcf513d81cf.webp";

http.get(url, (res) => {
  console.log("STATUS:", res.statusCode);
  console.log("HEADERS:", JSON.stringify(res.headers, null, 2));
  
  let data = "";
  res.on("data", (chunk) => {
    data += chunk.length;
  });
  
  res.on("end", () => {
    console.log("TOTAL BODY SIZE:", data);
  });
}).on("error", (err) => {
  console.error("ERROR:", err.message);
});
