"use client";

import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, LogIn, Mail } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action="/api/auth/login"
      method="post"
      className="login-form"
      onSubmit={() => setSubmitting(true)}
    >
      <div className="login-field">
        <label htmlFor="email">Correo electrónico</label>
        <div className="login-input-shell">
          <Mail aria-hidden="true" size={19} />
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            placeholder="admin@linoem.mx"
          />
        </div>
      </div>

      <div className="login-field">
        <div className="login-label-row">
          <label htmlFor="password">Contraseña</label>
          <span>Acceso seguro</span>
        </div>
        <div className="login-input-shell">
          <LockKeyhole aria-hidden="true" size={19} />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="Escribe tu contraseña"
          />
          <button
            className="password-toggle"
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      <button className="login-submit" type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="login-spinner" aria-hidden="true" size={20} />
            Verificando acceso...
          </>
        ) : (
          <>
            <LogIn aria-hidden="true" size={20} />
            Entrar a la plataforma
          </>
        )}
      </button>
    </form>
  );
}
