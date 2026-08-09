"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function criarConta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setCarregando(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSucesso(
        "Conta criada com sucesso! Verifique seu email para confirmar a conta e depois faça login."
      );
    } catch (error) {
      console.error(error);
      setErro("Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center">
            Criar conta no ClaudinoIA
          </h1>

          <p className="text-slate-400 text-center mt-3 mb-8">
            Crie sua conta e comece a usar o ClaudinoIA.
          </p>

          <form onSubmit={criarConta} className="space-y-5">
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

            <div>
              <label
                htmlFor="senha"
                className="text-sm text-slate-300"
              >
                Senha
              </label>

              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Mínimo de 6 caracteres"
                required
                autoComplete="new-password"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="text-sm text-slate-300"
              >
                Confirmar senha
              </label>

              <input
                id="confirmarSenha"
                type="password"
                value={confirmarSenha}
                onChange={(event) =>
                  setConfirmarSenha(event.target.value)
                }
                placeholder="Digite a senha novamente"
                required
                autoComplete="new-password"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
              />
            </div>

            {erro && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm">{erro}</p>
              </div>
            )}

            {sucesso && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                <p className="text-green-400 text-sm">{sucesso}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
            >
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Já possui uma conta?
            </p>

            <Link
              href="/login"
              className="inline-block mt-2 text-blue-400 hover:text-blue-300 font-semibold"
            >
              Voltar para entrar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}