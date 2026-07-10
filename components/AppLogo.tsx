import Image from "next/image";

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return <Image className={`logo-image${compact ? " compact" : ""}`} src="/logo-linoem.png" alt="LINOEM Development" width={530} height={199} priority />;
}
