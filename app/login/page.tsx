```tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center mb-2">
            Entrar no <span className="text-blue-500">ClaudinoIA</span>
          </h1>

          <p className="text-slate-400 text-center mb-8">
            Acesse sua inteligência artificial personalizada.
          </p>

          <form onSubmit={entrar} className="space-y-5">
            <div>
              <label className="text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">
                Senha
              </label>

              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="********"
                required
                autoComplete="current-password"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
              />
            </div>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Ainda não possui uma conta?
            </p>

            <button
              type="button"
              onClick={() => router.push("/register")}
              className="mt-2 text-blue-400 hover:text-blue-300 font-semibold"
            >
              Criar conta grátis
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
```
