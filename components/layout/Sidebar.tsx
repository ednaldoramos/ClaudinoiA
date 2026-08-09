"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  getConversations,
  createConversation,
  deleteConversation,
} from "@/lib/conversations";

import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
};

type SidebarProps = {
  onSelectConversation: (id: string) => void;
};

const ADMIN_EMAIL = "ednaldo3283@gmail.com";

export default function Sidebar({
  onSelectConversation,
}: SidebarProps) {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  async function loadConversations() {
    try {
      const data = await getConversations();

      console.log("SIDEBAR RECEBEU:", data);

      setConversations(data || []);
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    }
  }

  async function checkAdmin() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const email = session?.user?.email?.toLowerCase();

      setIsAdmin(email === ADMIN_EMAIL.toLowerCase());
    } catch (error) {
      console.error("Erro ao verificar administrador:", error);
      setIsAdmin(false);
    }
  }

  async function handleNewConversation() {
    try {
      const conversation = await createConversation("Nova conversa");

      setConversations((prev) => [
        conversation,
        ...prev,
      ]);

      setSelectedConversation(conversation.id);

      onSelectConversation(conversation.id);
    } catch (error) {
      console.error("Erro ao criar conversa:", error);
    }
  }

  async function handleDeleteConversation(id: string) {
    const confirmDelete = window.confirm(
      "Deseja excluir esta conversa?"
    );

    if (!confirmDelete) return;

    try {
      await deleteConversation(id);

      setConversations((prev) =>
        prev.filter((item) => item.id !== id)
      );

      if (selectedConversation === id) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
    }
  }

  function selectConversation(id: string) {
    setSelectedConversation(id);
    onSelectConversation(id);
  }

  useEffect(() => {
    loadConversations();
    checkAdmin();
  }, []);

  return (
    <aside className="w-80 h-screen bg-zinc-950 text-white border-r border-zinc-800 flex flex-col">

      <div className="p-6">

        <h1 className="text-2xl font-bold tracking-tight">
          ClaudinoIA
        </h1>

        <p className="text-sm text-zinc-400 mt-1">
          Sua Inteligência Artificial
        </p>

        <Button
          onClick={handleNewConversation}
          className="w-full mt-6 bg-white text-black hover:bg-zinc-200"
        >
          Nova conversa
        </Button>

        {isAdmin && (
          <Button
            onClick={() => router.push("/admin/clients")}
            className="w-full mt-3 bg-zinc-800 text-white hover:bg-zinc-700"
          >
            Clientes
          </Button>
        )}

      </div>

      <Separator />

      <ScrollArea className="flex-1 p-4">

        <div className="space-y-2">

          {conversations.length === 0 && (
            <p className="text-zinc-500 text-sm p-3">
              Nenhuma conversa ainda.
            </p>
          )}

          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex gap-2"
            >

              <button
                onClick={() =>
                  selectConversation(conversation.id)
                }
                className={
                  "flex-1 text-left px-4 py-3 rounded-xl transition " +
                  (
                    selectedConversation === conversation.id
                      ? "bg-zinc-700 text-white"
                      : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                  )
                }
              >
                {conversation.title || "Nova conversa"}
              </button>

              <button
                onClick={() =>
                  handleDeleteConversation(conversation.id)
                }
                className="px-3 rounded-xl bg-zinc-900 hover:bg-red-900 text-red-400"
              >
                Excluir
              </button>

            </div>
          ))}

        </div>

      </ScrollArea>

      <Separator />

      <div className="p-5 text-sm text-zinc-400">
        Logado como
        <br />
        <strong className="text-white">
          Ednaldo
        </strong>
      </div>

    </aside>
  );
}
