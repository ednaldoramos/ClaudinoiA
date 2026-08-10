"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificarSessao() {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        setErro(
          "O link de recuperação é inválido ou expirou. Solicite um novo link."
        );
      }

      setVerificando(false);
    }

    verificarSessao();
  }, []);

  async function atualizarSenha(event: FormEvent) {
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
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        setErro(error.message);
        return;
      }

      setSucesso(
        "Senha alterada com sucesso! Você já pode entrar no ClaudinoIA."
      );

      setSenha("");
      setConfirmarSenha("");

      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);

      setErro(
        "Não foi possível alterar sua senha. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  if (verificando) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <p className="text-slate-300">
              Verificando link de recuperação...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center">
            Nova senha
          </h1>

          <p className="text-slate-400 text-center mt-3 mb-8">
            Crie uma nova senha para sua conta do ClaudinoIA.
          </p>

          <form
            onSubmit={atualizarSenha}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="senha"
                className="text-sm text-slate-300"
              >
                Nova senha
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
                Confirmar nova senha
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

            {!sucesso && (
              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
              >
                {carregando
                  ? "Alterando senha..."
                  : "Alterar senha"}
              </button>
            )}
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
