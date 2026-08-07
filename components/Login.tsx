
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setMessage("");

   const { error } = await signIn(email, password);

console.log("LOGIN TESTE:", {
  email,
  error,
});

    if (error) {
      setMessage(error.message);
    } else {
      router.push("/dashboard");
    }

    setLoading(false);
  }

  async function handleCreateAccount() {
    setLoading(true);
    setMessage("");

    const { error } = await signUp(email, password);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Conta criada! Verifique seu e-mail.");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
      }}
    >
      <div
        style={{
          width: "350px",
          background: "#1e293b",
          padding: "30px",
          borderRadius: "12px",
          color: "white",
        }}
      >
        <h1 style={{ textAlign: "center" }}>
          🤖 ClaudinoIA
        </h1>

        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            borderRadius: "8px",
          }}
        />

        <input
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            borderRadius: "8px",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          onClick={handleCreateAccount}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            background: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Criar conta
        </button>

        {message && (
          <p style={{ marginTop: "20px", textAlign: "center" }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}