"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Client = {
  id: string;
  email: string;
  name: string;
  credits: number;
};

const ADMIN_EMAIL = "ednaldo3283@gmail.com";

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClients() {
      try {
        const result = await supabase.auth.getSession();
        const session = result.data.session;

        if (!session) {
          router.push("/");
          return;
        }

        if (session.user.email !== ADMIN_EMAIL) {
          router.push("/dashboard");
          return;
        }

        const response = await fetch("/api/admin/clients", {
          headers: {
            Authorization: "Bearer " + session.access_token
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao carregar clientes.");
        }

        setClients(data.clients || []);
      } catch (err: unknown) {
        console.error("Erro ao carregar clientes:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Erro ao carregar clientes.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadClients();
  }, [router]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold">
              Clientes
            </h1>

            <p className="text-zinc-400 mt-2">
              Área administrativa do ClaudinoIA.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700"
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
          <div className="bg-red-950 border border-red-800 rounded-2xl p-6 text-red-300">
            <p className="font-semibold">
              Erro
            </p>

            <p className="mt-2">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

            {clients.length === 0 ? (
              <div className="p-10 text-center text-zinc-500">
                Nenhum cliente cadastrado ainda.
              </div>
            ) : (
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
                      Créditos
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {clients.map((client) => (
                    <tr
                      key={client.id}
                      className="border-b border-zinc-800"
                    >
                      <td className="px-6 py-5">
                        {client.name}
                      </td>

                      <td className="px-6 py-5 text-zinc-300">
                        {client.email}
                      </td>

                      <td className="px-6 py-5">
                        {client.credits}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
