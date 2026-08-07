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

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
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
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-6">
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
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none"
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
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none"
              />
            </div>

            {erro && (
              <p className="text-red-400 text-sm">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>

          </form>

        </div>

      </div>
    </main>
  );
}