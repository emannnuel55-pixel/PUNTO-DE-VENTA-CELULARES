"use client";

import { useState } from "react";
import { Eye, EyeOff, LoaderCircle, Lock, Mail, ArrowRight } from "lucide-react";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action="/api/auth/login"
      method="post"
      className="premium-form"
      onSubmit={() => setSubmitting(true)}
    >
      <div className="premium-field-group">
        <label htmlFor="email">Correo electrónico</label>
        <div className="premium-input-wrapper">
          <Mail className="premium-input-icon" size={18} />
          <input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            placeholder="ejemplo@empresa.com"
            className="premium-input"
          />
        </div>
      </div>

      <div className="premium-field-group">
        <label htmlFor="password">Contraseña</label>
        <div className="premium-input-wrapper">
          <Lock className="premium-input-icon" size={18} />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="••••••••"
            className="premium-input"
          />
          <button
            className="premium-password-toggle"
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button className="premium-submit-btn" type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <LoaderCircle className="premium-spinner" size={20} />
            Verificando...
          </>
        ) : (
          <>
            Iniciar Sesión
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
