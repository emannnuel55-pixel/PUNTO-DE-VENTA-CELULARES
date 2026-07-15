async function run() {
  try {
    const res = await fetch("https://punto-de-venta-celulares-production.up.railway.app/api/media/eaae3f0e-e89e-4874-ab9a-2bcf513d81cf.webp");
    console.log("STATUS:", res.status);
    console.log("HEADERS:");
    res.headers.forEach((val, key) => console.log(`  ${key}: ${val}`));
    const text = await res.text();
    console.log("BODY START:", text.slice(0, 200));
  } catch (e: any) {
    console.error("FETCH ERROR:", e);
  }
}
run();
