"use client";
export default function GlobalError({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="auth-form-wrap" style={{minHeight:"100vh"}}><div className="auth-card"><h2>No fue posible completar la operación</h2><p>El sistema protegió la transacción. Intenta nuevamente.</p><button className="btn btn-primary" onClick={reset}>Reintentar</button></div></main>;}
