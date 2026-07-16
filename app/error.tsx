"use client";
export default function GlobalError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="auth-form-wrap" style={{minHeight:"100vh"}}><div className="auth-card"><h2>Error</h2><pre>{error.message}</pre><pre>{error.stack}</pre><button className="btn btn-primary" onClick={reset}>Reintentar</button></div></main>;}
