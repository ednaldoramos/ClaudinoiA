"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  email: string;
  name: string;
  credits: number;
};

export default function AdminPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadClients() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      if (user.email !== "ednaldo3283@gmail.com") {
        setError("Acesso negado.");
        return;
      }

      const response = await fetch("/api/admin/clients");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Erro ao carregar clientes."
        );
      }

      setClients(data.clients || []);
    } catch (error: any) {
      console.error("Erro painel administrativo:", error);

      setError(
        error.message ||
          "Não foi possível carregar os clientes."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateCredits(
    userId: string,
    amount: number
  ) {
    try {
      const response = await fetch(
        "/api/admin/credits",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            amount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao atualizar créditos."
        );
      }

      setClients((prev) =>
        prev.map((client) =>
          client.id === userId
            ? {
                ...client,
                credits: data.credits,
              }
            : client
        )
      );
    } catch (error: any) {
      alert(
        error.message ||
          "Erro ao atualizar créditos."
      );
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            🤖 ClaudinoIA
          </h1>

          <p className="text-zinc-400 mt-3">
            Carregando painel administrativo...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold">
            Acesso administrativo
          </h1>

          <p className="text-red-400 mt-4">
            {error}
          </p>

          <button
            onClick={() =>
              (window.location.href = "/dashboard")
            }
            className="mt-6 bg-white text-black px-5 py-3 rounded-xl hover:bg-zinc-200"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">
            🤖 ClaudinoIA Admin
          </h1>

          <p className="text-zinc-400 mt-2">
            Controle de clientes e créditos.
          </p>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-zinc-800">
            <h2 className="text-2xl font-bold">
              Clientes
            </h2>

            <p className="text-zinc-400 mt-1">
              Total: {clients.length}
            </p>
          </div>

          {clients.length === 0 ? (
            <div className="p-10 text-center text-zinc-400">
              Nenhum cliente encontrado.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                >
                  <div>
                    <h3 className="text-lg font-semibold">
                      {client.name}
                    </h3>

                    <p className="text-zinc-400 text-sm">
                      {client.email}
                    </p>

                    <p className="mt-2">
                      Créditos:{" "}
                      <strong className="text-blue-400">
                        {client.credits}
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        updateCredits(
                          client.id,
                          10
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                    >
                      +10
                    </button>

                    <button
                      onClick={() =>
                        updateCredits(
                          client.id,
                          50
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                    >
                      +50
                    </button>

                    <button
                      onClick={() =>
                        updateCredits(
                          client.id,
                          100
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700"
                    >
                      +100
                    </button>

                    <button
                      onClick={() =>
                        updateCredits(
                          client.id,
                          -10
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                    >
                      -10
                    </button>

                    <button
                      onClick={() =>
                        updateCredits(
                          client.id,
                          -50
                        )
                      }
                      className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700"
                    >
                      -50
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}