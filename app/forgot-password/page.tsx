"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarRecuperacao(event: FormEvent) {
    event.preventDefault();

    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: redirectUrl,
        }
      );

      if (error) {
        setErro(error.message);
        return;
      }

      setSucesso(
        "Enviamos um link de recuperação para seu email. Verifique também a pasta de spam."
      );
    } catch (error) {
      console.error("Erro na recuperação:", error);

      setErro(
        "Não foi possível enviar o email de recuperação. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center">
            Recuperar senha
          </h1>

          <p className="text-slate-400 text-center mt-3 mb-8">
            Informe seu email para receber um link e criar uma nova senha.
          </p>

          <form
            onSubmit={enviarRecuperacao}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="text-sm text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
              />
            </div>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">
                  {erro}
                </p>
              </div>
            )}

            {sucesso && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-green-400 text-sm">
                  {sucesso}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
            >
              {carregando
                ? "Enviando..."
                : "Enviar link de recuperação"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              Voltar para entrar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
