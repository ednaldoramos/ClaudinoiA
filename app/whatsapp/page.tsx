"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Connection = {
  id: string;
  phone_number_id: string | null;
  waba_id: string | null;
  business_id: string | null;
  phone_number: string | null;
  display_name: string | null;
  status: string;
};

export default function WhatsAppPage() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);

  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    loadConnection();
  }, []);

  async function loadConnection() {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Usuário não autenticado.");
        return;
      }

      const response = await fetch("/api/whatsapp/connection", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (data.connection) {
        const item = data.connection as Connection;

        setConnection(item);
        setConnected(item.status === "connected");

        setPhoneNumberId(item.phone_number_id || "");
        setWabaId(item.waba_id || "");
        setBusinessId(item.business_id || "");
        setPhoneNumber(item.phone_number || "");
        setDisplayName(item.display_name || "");
      }
    } catch (error) {
      console.error("Erro ao carregar conexão WhatsApp:", error);
    } finally {
      setLoading(false);
    }
  }

  async function connectWhatsApp() {
    try {
      setSaving(true);
      setMessage("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage("Sua sessão expirou. Faça login novamente.");
        return;
      }

      if (!phoneNumberId || !wabaId) {
        setMessage(
          "Preencha pelo menos o Phone Number ID e o WABA ID."
        );
        return;
      }

      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          phone_number_id: phoneNumberId,
          waba_id: wabaId,
          business_id: businessId || null,
          phone_number: phoneNumber || null,
          display_name: displayName || null,
          access_token: accessToken || null,
          status: "connected",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data);
        setMessage(
          data?.error || "Não foi possível conectar o WhatsApp."
        );
        return;
      }

      setConnection(data.connection);
      setConnected(true);
      setMessage("WhatsApp conectado com sucesso.");

      setAccessToken("");
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error);
      setMessage("Erro inesperado ao conectar o WhatsApp.");
    } finally {
      setSaving(false);
    }
  }

  async function disconnectWhatsApp() {
    setConnected(false);
    setMessage(
      "A conexão foi marcada para desconexão. A remoção definitiva será feita na próxima etapa."
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                📱 WhatsApp
              </h1>

              <p className="mt-2 text-slate-400">
                Central de atendimento, automações e inteligência do ClaudinoIA.
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                connected
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {loading
                ? "● Verificando..."
                : connected
                  ? "● Conectado"
                  : "● Não conectado"}
            </div>
          </div>
        </div>

        {/* Mensagem */}
        {message && (
          <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm text-slate-300">
            {message}
          </div>
        )}

        {/* Conexão */}
        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Conectar WhatsApp
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Esta área será usada por cada cliente do ClaudinoIA para
              conectar sua própria conta do WhatsApp Business.
            </p>
          </div>

          {connected && connection ? (
            <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-5">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-sm text-green-400">
                    WhatsApp conectado
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    {connection.display_name || "WhatsApp Business"}
                  </h3>

                  {connection.phone_number && (
                    <p className="mt-1 text-sm text-slate-400">
                      Número: {connection.phone_number}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={disconnectWhatsApp}
                  className="rounded-xl border border-red-900/60 bg-red-950/30 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-950/60"
                >
                  Desconectar
                </button>

              </div>
            </div>
          ) : (
            <div className="space-y-5">

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Phone Number ID
                  </label>

                  <input
                    value={phoneNumberId}
                    onChange={(event) =>
                      setPhoneNumberId(event.target.value)
                    }
                    placeholder="Ex.: 123456789012345"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    WhatsApp Business Account ID (WABA)
                  </label>

                  <input
                    value={wabaId}
                    onChange={(event) =>
                      setWabaId(event.target.value)
                    }
                    placeholder="Ex.: 123456789012345"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Business ID
                  </label>

                  <input
                    value={businessId}
                    onChange={(event) =>
                      setBusinessId(event.target.value)
                    }
                    placeholder="Opcional"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Número do WhatsApp
                  </label>

                  <input
                    value={phoneNumber}
                    onChange={(event) =>
                      setPhoneNumber(event.target.value)
                    }
                    placeholder="+55..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Nome de exibição
                  </label>

                  <input
                    value={displayName}
                    onChange={(event) =>
                      setDisplayName(event.target.value)
                    }
                    placeholder="Nome da empresa"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Access Token
                  </label>

                  <input
                    type="password"
                    value={accessToken}
                    onChange={(event) =>
                      setAccessToken(event.target.value)
                    }
                    placeholder="Token da API do WhatsApp"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-green-500"
                  />
                </div>

              </div>

              <div className="rounded-xl border border-yellow-900/40 bg-yellow-950/20 p-4 text-sm text-yellow-300">
                <strong>Atenção:</strong> esta tela é a configuração
                técnica inicial. A conexão oficial via Meta Embedded
                Signup será integrada na próxima etapa.
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={connectWhatsApp}
                className="rounded-xl bg-green-600 px-6 py-3 font-semibold transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Conectando..."
                  : "Salvar e conectar WhatsApp"}
              </button>

            </div>
          )}
        </section>

        {/* Recursos */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Recursos do WhatsApp
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <Feature
              icon="💬"
              title="Caixa de entrada"
              description="Centralize as conversas dos seus clientes."
            />

            <Feature
              icon="🤖"
              title="Respostas automáticas com IA"
              description="Deixe o ClaudinoIA responder seus clientes automaticamente."
            />

            <Feature
              icon="🔀"
              title="Fluxos de automação"
              description="Crie sequências automáticas para diferentes situações."
            />

            <Feature
              icon="🧩"
              title="Gatilhos"
              description="Execute automações quando determinadas ações acontecerem."
            />

            <Feature
              icon="⏱️"
              title="Agendamentos"
              description="Programe mensagens e ações para seus clientes."
            />

            <Feature
              icon="🏷️"
              title="Tags"
              description="Organize seus contatos por categorias."
            />

            <Feature
              icon="👥"
              title="Contatos"
              description="Gerencie todos os contatos da empresa."
            />

            <Feature
              icon="📋"
              title="Histórico"
              description="Consulte o histórico completo das conversas."
            />

            <Feature
              icon="🧠"
              title="Memória do cliente"
              description="Permita que a IA conheça o contexto de cada cliente."
            />

            <Feature
              icon="📊"
              title="Estatísticas"
              description="Acompanhe o desempenho do atendimento."
            />

            <Feature
              icon="🔗"
              title="Webhooks"
              description="Receba eventos do WhatsApp em tempo real."
            />

            <Feature
              icon="🔐"
              title="Controle de acesso"
              description="Controle quem pode acessar os recursos."
            />

          </div>
        </section>

      </div>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">

      <div className="mb-3 text-2xl">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

    </div>
  );
}