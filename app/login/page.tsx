import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { LoginForm } from "@/components/LoginForm";
import "./login.css";

const errorMessages: Record<string, { title: string; body: string }> = {
  credentials: {
    title: "Datos incorrectos",
    body: "Revisa el correo y la contraseña. Las mayúsculas sí importan.",
  },
  setup: {
    title: "Configuración pendiente",
    body: "No hay un usuario propietario. Configura las variables BOOTSTRAP.",
  },
  server: {
    title: "Fallo de conexión",
    body: "No fue posible conectar con la base de datos.",
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] ?? errorMessages.credentials : null;

  return (
    <main className="premium-login-container">
      <div className="premium-orb premium-orb-1" />
      <div className="premium-orb premium-orb-2" />

      <Link href="/cliente" className="premium-back-link">
        <ArrowLeft size={16} /> Ir a página de clientes
      </Link>

      <section className="premium-glass-card">
        <div className="premium-logo-wrapper">
          <AppLogo />
        </div>

        <div className="premium-header">
          <h1>Portal de Acceso</h1>
          <p>Ingresa tus credenciales para gestionar el sistema</p>
        </div>

        {params.created === "1" && (
          <div className="premium-alert premium-alert-success" role="status">
            <strong>¡Cuenta creada exitosamente!</strong>
            <span>Ya puedes ingresar con tus nuevas credenciales.</span>
          </div>
        )}

        {error && (
          <div className="premium-alert premium-alert-error" role="alert">
            <strong>{error.title}</strong>
            <span>{error.body}</span>
          </div>
        )}

        <LoginForm />

        <div className="premium-footer">
          <div className="premium-footer-box">
            <div className="premium-footer-icon">
              <Search size={20} />
            </div>
            <div className="premium-footer-text">
              <strong>¿Eres cliente?</strong>
              <span>Consulta el estado de tu equipo aquí.</span>
            </div>
            <Link href="https://adequate-kindness-production.up.railway.app/" className="premium-footer-link">Rastrear orden →</Link>
          </div>
        </div>
      </section>

      <div className="premium-copyright">
        © {new Date().getFullYear()} LINOEM DEVELOPMENT · SISTEMA DE GESTIÓN PREMIUM
      </div>
    </main>
  );
}
