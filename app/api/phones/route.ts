import { NextResponse } from "next/server";

interface PhoneDevice {
  brand: string;
  model: string;
}

const POPULAR_PHONES: PhoneDevice[] = [
  // Apple
  { brand: "Apple", model: "iPhone 15 Pro Max" },
  { brand: "Apple", model: "iPhone 15 Pro" },
  { brand: "Apple", model: "iPhone 15 Plus" },
  { brand: "Apple", model: "iPhone 15" },
  { brand: "Apple", model: "iPhone 14 Pro Max" },
  { brand: "Apple", model: "iPhone 14 Pro" },
  { brand: "Apple", model: "iPhone 14 Plus" },
  { brand: "Apple", model: "iPhone 14" },
  { brand: "Apple", model: "iPhone 13 Pro Max" },
  { brand: "Apple", model: "iPhone 13 Pro" },
  { brand: "Apple", model: "iPhone 13 mini" },
  { brand: "Apple", model: "iPhone 13" },
  { brand: "Apple", model: "iPhone 12 Pro Max" },
  { brand: "Apple", model: "iPhone 12 Pro" },
  { brand: "Apple", model: "iPhone 12 mini" },
  { brand: "Apple", model: "iPhone 12" },
  { brand: "Apple", model: "iPhone 11 Pro Max" },
  { brand: "Apple", model: "iPhone 11 Pro" },
  { brand: "Apple", model: "iPhone 11" },
  { brand: "Apple", model: "iPhone XS Max" },
  { brand: "Apple", model: "iPhone XS" },
  { brand: "Apple", model: "iPhone XR" },
  { brand: "Apple", model: "iPhone X" },
  { brand: "Apple", model: "iPhone 8 Plus" },
  { brand: "Apple", model: "iPhone 8" },
  { brand: "Apple", model: "iPhone SE (2022)" },
  { brand: "Apple", model: "iPhone SE (2020)" },

  // Samsung
  { brand: "Samsung", model: "Galaxy S24 Ultra" },
  { brand: "Samsung", model: "Galaxy S24+" },
  { brand: "Samsung", model: "Galaxy S24" },
  { brand: "Samsung", model: "Galaxy S23 Ultra" },
  { brand: "Samsung", model: "Galaxy S23+" },
  { brand: "Samsung", model: "Galaxy S23" },
  { brand: "Samsung", model: "Galaxy S22 Ultra" },
  { brand: "Samsung", model: "Galaxy S22+" },
  { brand: "Samsung", model: "Galaxy S22" },
  { brand: "Samsung", model: "Galaxy S21 Ultra" },
  { brand: "Samsung", model: "Galaxy S21 FE" },
  { brand: "Samsung", model: "Galaxy S21" },
  { brand: "Samsung", model: "Galaxy S20 FE" },
  { brand: "Samsung", model: "Galaxy Note 20 Ultra" },
  { brand: "Samsung", model: "Galaxy A54 5G" },
  { brand: "Samsung", model: "Galaxy A34 5G" },
  { brand: "Samsung", model: "Galaxy A14 5G" },
  { brand: "Samsung", model: "Galaxy A04s" },
  { brand: "Samsung", model: "Galaxy Z Fold 5" },
  { brand: "Samsung", model: "Galaxy Z Flip 5" },

  // Xiaomi
  { brand: "Xiaomi", model: "Redmi Note 13 Pro+ 5G" },
  { brand: "Xiaomi", model: "Redmi Note 13 Pro" },
  { brand: "Xiaomi", model: "Redmi Note 13" },
  { brand: "Xiaomi", model: "Redmi Note 12 Pro 5G" },
  { brand: "Xiaomi", model: "Redmi Note 12" },
  { brand: "Xiaomi", model: "Redmi Note 11 Pro" },
  { brand: "Xiaomi", model: "Redmi Note 11" },
  { brand: "Xiaomi", model: "Poco F5 Pro" },
  { brand: "Xiaomi", model: "Poco X6 Pro" },
  { brand: "Xiaomi", model: "Poco X5 Pro" },
  { brand: "Xiaomi", model: "Xiaomi 14 Ultra" },
  { brand: "Xiaomi", model: "Xiaomi 13T Pro" },

  // Motorola
  { brand: "Motorola", model: "Edge 40 Pro" },
  { brand: "Motorola", model: "Edge 40 Neo" },
  { brand: "Motorola", model: "Edge 30 Ultra" },
  { brand: "Motorola", model: "Razr 40 Ultra" },
  { brand: "Motorola", model: "Moto G84 5G" },
  { brand: "Motorola", model: "Moto G54 5G" },
  { brand: "Motorola", model: "Moto G24 Power" },
  { brand: "Motorola", model: "Moto G14" },
  { brand: "Motorola", model: "Moto G23" },
  { brand: "Motorola", model: "Moto E13" },

  // Huawei
  { brand: "Huawei", model: "P60 Pro" },
  { brand: "Huawei", model: "Mate 60 Pro" },
  { brand: "Huawei", model: "Nova 11 Pro" },
  { brand: "Huawei", model: "Nova Y91" },
  { brand: "Huawei", model: "P40 Lite" },
  { brand: "Huawei", model: "Y9 Prime" },

  // OPPO
  { brand: "OPPO", model: "Find N3 Flip" },
  { brand: "OPPO", model: "Reno 10 Pro 5G" },
  { brand: "OPPO", model: "Reno 7" },
  { brand: "OPPO", model: "A78 5G" },
  { brand: "OPPO", model: "A58" },
  { brand: "OPPO", model: "A18" },

  // Google
  { brand: "Google", model: "Pixel 8 Pro" },
  { brand: "Google", model: "Pixel 8" },
  { brand: "Google", model: "Pixel 7a" },
  { brand: "Google", model: "Pixel 7 Pro" },
  { brand: "Google", model: "Pixel 6a" }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase().trim() || "";

  if (!query) {
    return NextResponse.json(POPULAR_PHONES.slice(0, 20));
  }

  const filtered = POPULAR_PHONES.filter(
    (phone) =>
      phone.brand.toLowerCase().includes(query) ||
      phone.model.toLowerCase().includes(query) ||
      `${phone.brand} ${phone.model}`.toLowerCase().includes(query)
  );

  return NextResponse.json(filtered.slice(0, 15));
}
