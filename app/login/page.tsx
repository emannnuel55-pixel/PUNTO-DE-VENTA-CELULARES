import Link from "next/link";
import { ArrowLeft, BadgeCheck, PackageSearch, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";
import { LoginForm } from "@/components/LoginForm";

const errorMessages: Record<string, { title: string; body: string }> = {
  credentials: {
    title: "Datos incorrectos",
    body: "Revisa el correo y la contraseña. Las mayúsculas sí importan en la contraseña.",
  },
  setup: {
    title: "Administrador pendiente de configurar",
    body: "La base de datos todavía no contiene un usuario propietario. Configura las variables BOOTSTRAP de Railway y vuelve a desplegar.",
  },
  server: {
    title: "No fue posible validar el acceso",
    body: "La aplicación no logró consultar la base de datos. Revisa DATABASE_URL y el despliegue de PostgreSQL en Railway.",
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
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-orb login-orb-one" />
        <div className="login-orb login-orb-two" />
        <div className="login-grid-pattern" />

        <div className="login-brand-content">
          <Link className="login-back-link" href="/">
            <ArrowLeft size={17} /> Volver a la página principal
          </Link>

          <div className="login-logo-wrap">
            <AppLogo />
          </div>

          <span className="login-eyebrow">
            <BadgeCheck size={17} /> Gestión profesional para tienda y taller
          </span>

          <h1>
            Tu negocio, tus reparaciones y tus ventas en <span>un solo lugar.</span>
          </h1>

          <p className="login-brand-copy">
            Controla clientes, inventario, caja, técnicos y seguimiento de equipos con acceso seguro por rol.
          </p>

          <div className="login-feature-grid">
            <article>
              <span><Smartphone size={21} /></span>
              <div><strong>Reparaciones</strong><small>Seguimiento completo por equipo</small></div>
            </article>
            <article>
              <span><PackageSearch size={21} /></span>
              <div><strong>Punto de venta</strong><small>Ventas, existencias y reportes</small></div>
            </article>
            <article>
              <span><Wrench size={21} /></span>
              <div><strong>Trabajo técnico</strong><small>Órdenes, avances y evidencias</small></div>
            </article>
          </div>
        </div>

        <div className="login-brand-footer">
          <ShieldCheck size={18} />
          <span>Sesiones protegidas y permisos separados por responsabilidad.</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-mobile-logo"><AppLogo compact /></div>

        <div className="login-card">
          <div className="login-card-heading">
            <span className="login-card-kicker">PORTAL INTERNO</span>
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresa con la cuenta asignada por el administrador.</p>
          </div>

          {params.created === "1" && (
            <div className="login-message login-message-success" role="status">
              <strong>Cuenta creada correctamente.</strong>
              <span>Ya puedes iniciar sesión con tus nuevas credenciales.</span>
            </div>
          )}

          {error && (
            <div className="login-message login-message-error" role="alert">
              <strong>{error.title}</strong>
              <span>{error.body}</span>
            </div>
          )}

          <LoginForm />

          <div className="login-help-box">
            <ShieldCheck size={19} />
            <div>
              <strong>¿Eres cliente?</strong>
              <span>No necesitas una cuenta. Consulta tu reparación con el código privado.</span>
            </div>
            <Link href="/seguimiento">Consultar</Link>
          </div>
        </div>

        <p className="login-copyright">
          © {new Date().getFullYear()} LINOEM DEVELOPMENT · PUNTO DE VENTA CELULARES
        </p>
      </section>
    </main>
  );
}
