import { createUser, resetUserPassword, updateUserRole, toggleUserStatus } from "@/app/actions/users";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const administrativeRoles = [Role.OWNER, Role.ADMIN];

const roleLabels: Record<Role, string> = {
  OWNER: "Propietario",
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  RECEPTION: "Recepción",
  TECHNICIAN: "Técnico",
  SALES: "Ventas",
  WAREHOUSE: "Almacén",
  FINANCE: "Finanzas",
  AUDITOR: "Auditor",
};

export default async function UsersPage() {
  const currentAdmin = await requireUser(administrativeRoles);
  const users = await db.user.findMany({
    orderBy: { name: "asc" },
    include: { branch: true }
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Gestión de Personal</h2>
          <p>Control administrativo de cuentas, accesos, contraseñas y roles.</p>
        </div>
      </div>

      <div className="grid-two">
        <section className="card" style={{ height: "fit-content" }}>
          <h3>Nuevo trabajador</h3>
          <form action={createUser} className="form-grid one">
            <div className="field">
              <label>Nombre completo</label>
              <input name="name" required placeholder="Ej. Juan Pérez" />
            </div>
            <div className="field">
              <label>Correo electrónico</label>
              <input name="email" type="email" required placeholder="ejemplo@linoem.mx" />
            </div>
            <div className="field">
              <label>Contraseña inicial</label>
              <input name="password" type="password" required minLength={8} placeholder="Mínimo 8 caracteres" />
            </div>
            <div className="field">
              <label>Rol asignado</label>
              <select name="role" required defaultValue={Role.TECHNICIAN}>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <option value={role} key={role}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: "12px" }}>
              Registrar empleado
            </button>
          </form>
        </section>

        <section className="card">
          <h3>Personal registrado</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <br />
                      <small className="muted">{u.email}</small>
                      {u.branch && (
                        <>
                          <br />
                          <small className="muted" style={{ fontSize: "0.75rem" }}>
                            Sucursal: {u.branch.name}
                          </small>
                        </>
                      )}
                    </td>
                    <td>
                      <form action={updateUserRole.bind(null, u.id)} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <select name="role" defaultValue={u.role} style={{ padding: "6px 8px", fontSize: "0.85rem", width: "auto" }}>
                          {Object.entries(roleLabels).map(([role, label]) => (
                            <option value={role} key={role}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className="btn btn-small btn-secondary" style={{ padding: "8px 10px", fontSize: "0.75rem" }}>
                          ✓
                        </button>
                      </form>
                    </td>
                    <td>
                      <span className={`badge ${u.active ? "success" : "danger"}`}>
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {u.id !== currentAdmin.id && (
                          <form action={toggleUserStatus.bind(null, u.id)}>
                            <button
                              type="submit"
                              className={`btn btn-small ${u.active ? "btn-danger" : "btn-primary"}`}
                              style={{ width: "100%", fontSize: "0.8rem", padding: "6px 10px" }}
                            >
                              {u.active ? "Desactivar" : "Activar"}
                            </button>
                          </form>
                        )}
                        <details style={{ width: "100%" }}>
                          <summary style={{ cursor: "pointer", fontSize: "0.8rem", color: "#3b82f6", fontWeight: "600", padding: "4px 0" }}>
                            Resetear clave
                          </summary>
                          <form action={resetUserPassword.bind(null, u.id)} className="form-grid one" style={{ marginTop: "8px", minWidth: "180px" }}>
                            <div className="field">
                              <input
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                placeholder="Nueva contraseña"
                                style={{ padding: "6px 8px", fontSize: "0.85rem" }}
                              />
                            </div>
                            <button type="submit" className="btn btn-small btn-primary" style={{ padding: "6px", fontSize: "0.8rem" }}>
                              Guardar clave
                            </button>
                          </form>
                        </details>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
