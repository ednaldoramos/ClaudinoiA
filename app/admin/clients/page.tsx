"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  email: string;
  name: string;
  credits: number;
};

const ADMIN_EMAIL =
  "ednaldo3283@gmail.com";

export default function AdminClientsPage() {
  const router = useRouter();

  const [
    clients,
    setClients,
  ] = useState<Client[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    processingId,
    setProcessingId,
  ] = useState<string | null>(null);

  async function loadClients() {
    try {
      setError("");

      const result =
        await supabase.auth.getSession();

      const session =
        result.data.session;

      if (!session) {
        router.push("/");
        return;
      }

      if (
        session.user.email !==
        ADMIN_EMAIL
      ) {
        router.push("/dashboard");
        return;
      }

      const response =
        await fetch(
          "/api/admin/clients",
          {
            headers: {
              Authorization:
                "Bearer " +
                session.access_token,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao carregar clientes."
        );
      }

      setClients(
        data.clients || []
      );
    } catch (err: unknown) {
      console.error(
        "Erro ao carregar clientes:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Erro ao carregar clientes."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, [router]);

  async function changeCredits(
    client: Client,
    operation:
      | "add"
      | "remove"
  ) {
    const input =
      window.prompt(
        operation === "add"
          ? `Quantos créditos deseja adicionar para ${client.name}?`
          : `Quantos créditos deseja retirar de ${client.name}?`
      );

    if (
      input === null ||
      input.trim() === ""
    ) {
      return;
    }

    const amount =
      Number(input);

    if (
      !Number.isInteger(amount) ||
      amount <= 0
    ) {
      window.alert(
        "Digite uma quantidade inteira maior que zero."
      );
      return;
    }

    if (
      operation === "remove" &&
      amount > client.credits
    ) {
      window.alert(
        `Saldo insuficiente. O cliente possui ${client.credits} créditos.`
      );
      return;
    }

    const confirmed =
      window.confirm(
        operation === "add"
          ? `Adicionar ${amount} créditos para ${client.name}?`
          : `Retirar ${amount} créditos de ${client.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(
        client.id
      );
      setError("");

      const {
        data: sessionData,
      } =
        await supabase.auth.getSession();

      const session =
        sessionData.session;

      if (!session) {
        router.push("/");
        return;
      }

      const finalAmount =
        operation === "add"
          ? amount
          : -amount;

      const response =
        await fetch(
          "/api/admin/clients",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                "Bearer " +
                session.access_token,
            },
            body: JSON.stringify({
              userId:
                client.id,
              amount:
                finalAmount,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erro ao alterar créditos."
        );
      }

      setClients(
        (current) =>
          current.map(
            (item) =>
              item.id === client.id
                ? {
                    ...item,
                    credits:
                      Number(
                        data.credits
                      ),
                  }
                : item
          )
      );
    } catch (err: unknown) {
      console.error(
        "Erro ao alterar créditos:",
        err
      );

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Erro ao alterar créditos."
        );
      }
    } finally {
      setProcessingId(
        null
      );
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Clientes
            </h1>

            <p className="text-zinc-400 mt-2">
              Gerenciamento de clientes e créditos do ClaudinoIA.
            </p>
          </div>

          <button
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>

        {loading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            Carregando clientes...
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-950 border border-red-800 rounded-2xl p-6 text-red-300 mb-6">
            <p className="font-semibold">
              Erro
            </p>

            <p className="mt-2">
              {error}
            </p>
          </div>
        )}

        {!loading &&
          !error && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

              {clients.length === 0 ? (
                <div className="p-10 text-center text-zinc-500">
                  Nenhum cliente cadastrado ainda.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">

                    <thead>
                      <tr className="border-b border-zinc-800 text-left text-zinc-400">
                        <th className="px-6 py-4">
                          Nome
                        </th>

                        <th className="px-6 py-4">
                          E-mail
                        </th>

                        <th className="px-6 py-4">
                          Saldo
                        </th>

                        <th className="px-6 py-4">
                          Gerenciar
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {clients.map(
                        (client) => {
                          const processing =
                            processingId ===
                            client.id;

                          return (
                            <tr
                              key={
                                client.id
                              }
                              className="border-b border-zinc-800 last:border-0"
                            >
                              <td className="px-6 py-5 font-medium">
                                {
                                  client.name
                                }
                              </td>

                              <td className="px-6 py-5 text-zinc-300">
                                {
                                  client.email
                                }
                              </td>

                              <td className="px-6 py-5">
                                <span className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-800 font-semibold">
                                  {
                                    client.credits
                                  }
                                </span>
                              </td>

                              <td className="px-6 py-5">
                                <div className="flex flex-wrap gap-2">

                                  <button
                                    disabled={
                                      processing
                                    }
                                    onClick={() =>
                                      changeCredits(
                                        client,
                                        "add"
                                      )
                                    }
                                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                                  >
                                    {processing
                                      ? "Processando..."
                                      : "+ Adicionar"}
                                  </button>

                                  <button
                                    disabled={
                                      processing ||
                                      client.credits <=
                                        0
                                    }
                                    onClick={() =>
                                      changeCredits(
                                        client,
                                        "remove"
                                      )
                                    }
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                                  >
                                    {processing
                                      ? "Processando..."
                                      : "− Retirar"}
                                  </button>

                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>

                  </table>
                </div>
              )}
            </div>
          )}

      </div>
    </main>
  );
}
