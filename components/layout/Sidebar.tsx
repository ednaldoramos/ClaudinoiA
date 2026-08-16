"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
  getConversations,
  getArchivedConversations,
  createConversation,
  deleteConversation,
  renameConversation,
  archiveConversation,
  restoreConversation,
} from "@/lib/conversations";

import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  title: string;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
};

type ConversationMenuProps = {
  conversation: Conversation;
  archived?: boolean;
  selectedConversation: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete: (id: string) => void;
};

function ConversationMenu({
  conversation,
  archived = false,
  selectedConversation,
  onSelect,
  onRename,
  onArchive,
  onRestore,
  onDelete,
}: ConversationMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="h-full min-h-[48px] px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition"
        title="Opções da conversa"
      >
        ⋮
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          />

          <div className="absolute right-0 top-full mt-2 z-50 w-44 rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onSelect(conversation.id);
              }}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800"
            >
              💬 Continuar
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onRename(conversation.id);
              }}
              className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800"
            >
              ✏️ Renomear
            </button>

            {!archived && onArchive && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onArchive(conversation.id);
                }}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800"
              >
                📁 Arquivar
              </button>
            )}

            {archived && onRestore && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onRestore(conversation.id);
                }}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800"
              >
                ↩️ Restaurar
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(conversation.id);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-950"
            >
              🗑️ Excluir
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const ADMIN_EMAIL = "ednaldo3283@gmail.com";

export default function Sidebar({
  onSelectConversation,
}: {
  onSelectConversation: (id: string) => void;
}) {
  const router = useRouter();

  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [
    archivedConversations,
    setArchivedConversations,
  ] = useState<Conversation[]>([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<string | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);

  const [showArchived, setShowArchived] =
    useState(false);

  async function loadConversations() {
    try {
      const [
        active,
        archived,
      ] = await Promise.all([
        getConversations(),
        getArchivedConversations(),
      ]);

      setConversations(active || []);
      setArchivedConversations(archived || []);
    } catch (error) {
      console.error(
        "Erro ao carregar conversas:",
        error
      );
    }
  }

  async function checkAdmin() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const email =
        session?.user?.email?.toLowerCase();

      setIsAdmin(
        email === ADMIN_EMAIL.toLowerCase()
      );
    } catch (error) {
      console.error(
        "Erro ao verificar administrador:",
        error
      );

      setIsAdmin(false);
    }
  }

  async function handleNewConversation() {
    try {
      const conversation =
        await createConversation(
          "Nova conversa"
        );

      setConversations((prev) => [
        conversation,
        ...prev,
      ]);

      setSelectedConversation(
        conversation.id
      );

      onSelectConversation(conversation.id);
    } catch (error) {
      console.error(
        "Erro ao criar conversa:",
        error
      );
    }
  }

  async function handleRenameConversation(
    id: string
  ) {
    const conversation =
      [...conversations, ...archivedConversations]
        .find((item) => item.id === id);

    if (!conversation) return;

    const newTitle = window.prompt(
      "Digite o novo nome da conversa:",
      conversation.title || "Nova conversa"
    );

    if (newTitle === null) return;

    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      window.alert(
        "O nome da conversa não pode ficar vazio."
      );

      return;
    }

    try {
      await renameConversation(
        id,
        cleanTitle
      );

      setConversations((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                title: cleanTitle,
              }
            : item
        )
      );

      setArchivedConversations((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                title: cleanTitle,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "Erro ao renomear conversa:",
        error
      );

      window.alert(
        "Não foi possível renomear a conversa."
      );
    }
  }

  async function handleArchiveConversation(
    id: string
  ) {
    try {
      await archiveConversation(id);

      const conversation =
        conversations.find(
          (item) => item.id === id
        );

      setConversations((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      if (conversation) {
        setArchivedConversations(
          (prev) => [
            {
              ...conversation,
              archived: true,
            },
            ...prev,
          ]
        );
      }

      if (selectedConversation === id) {
        setSelectedConversation(null);
        onSelectConversation("");
      }
    } catch (error) {
      console.error(
        "Erro ao arquivar conversa:",
        error
      );

      window.alert(
        "Não foi possível arquivar a conversa."
      );
    }
  }

  async function handleRestoreConversation(
    id: string
  ) {
    try {
      await restoreConversation(id);

      const conversation =
        archivedConversations.find(
          (item) => item.id === id
        );

      setArchivedConversations((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      if (conversation) {
        setConversations((prev) => [
          {
            ...conversation,
            archived: false,
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error(
        "Erro ao restaurar conversa:",
        error
      );

      window.alert(
        "Não foi possível restaurar a conversa."
      );
    }
  }

  async function handleDeleteConversation(
    id: string
  ) {
    const confirmDelete =
      window.confirm(
        "Deseja excluir esta conversa permanentemente?\n\nEssa ação não poderá ser desfeita."
      );

    if (!confirmDelete) return;

    try {
      await deleteConversation(id);

      setConversations((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      setArchivedConversations((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      if (selectedConversation === id) {
        setSelectedConversation(null);
        onSelectConversation("");
      }
    } catch (error) {
      console.error(
        "Erro ao excluir conversa:",
        error
      );

      window.alert(
        "Não foi possível excluir a conversa."
      );
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

        <Button
          onClick={() => router.push("/whatsapp")}
          className="w-full mt-3 bg-green-700 text-white hover:bg-green-600"
        >
          📱 WhatsApp
        </Button>

        {isAdmin && (
          <Button
            onClick={() =>
              router.push("/admin/clients")
            }
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

          {conversations.map(
            (conversation) => (
              <div
                key={conversation.id}
                className="flex gap-2 relative"
              >
                <button
                  type="button"
                  onClick={() =>
                    selectConversation(
                      conversation.id
                    )
                  }
                  className={
                    "flex-1 min-w-0 text-left px-4 py-3 rounded-xl transition " +
                    (
                      selectedConversation ===
                      conversation.id
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                    )
                  }
                >
                  <span className="block truncate">
                    {conversation.title ||
                      "Nova conversa"}
                  </span>
                </button>

                <ConversationMenu
                  conversation={
                    conversation
                  }
                  selectedConversation={
                    selectedConversation
                  }
                  onSelect={
                    selectConversation
                  }
                  onRename={
                    handleRenameConversation
                  }
                  onArchive={
                    handleArchiveConversation
                  }
                  onDelete={
                    handleDeleteConversation
                  }
                />
              </div>
            )
          )}

        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() =>
              setShowArchived(
                (value) => !value
              )
            }
            className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition"
          >
            <span>
              📁 Conversas arquivadas
            </span>

            <span className="text-xs text-zinc-500">
              {archivedConversations.length}
            </span>
          </button>

          {showArchived && (
            <div className="mt-3 space-y-2">
              {archivedConversations.length ===
                0 && (
                <p className="text-zinc-500 text-sm p-3">
                  Nenhuma conversa arquivada.
                </p>
              )}

              {archivedConversations.map(
                (conversation) => (
                  <div
                    key={conversation.id}
                    className="flex gap-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        selectConversation(
                          conversation.id
                        )
                      }
                      className={
                        "flex-1 min-w-0 text-left px-4 py-3 rounded-xl transition " +
                        (
                          selectedConversation ===
                          conversation.id
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                        )
                      }
                    >
                      <span className="block truncate">
                        {conversation.title ||
                          "Nova conversa"}
                      </span>
                    </button>

                    <ConversationMenu
                      conversation={
                        conversation
                      }
                      archived
                      selectedConversation={
                        selectedConversation
                      }
                      onSelect={
                        selectConversation
                      }
                      onRename={
                        handleRenameConversation
                      }
                      onRestore={
                        handleRestoreConversation
                      }
                      onDelete={
                        handleDeleteConversation
                      }
                    />
                  </div>
                )
              )}
            </div>
          )}
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