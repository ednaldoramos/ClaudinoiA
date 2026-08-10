"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import {
  getMessages,
  saveMessage,
} from "@/lib/messages";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatBoxProps = {
  conversationId: string;
};

export default function ChatBox({
  conversationId,
}: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadMessages() {
    try {
      const data = await getMessages(conversationId);

      setMessages(
        data.map((item: any) => ({
          role: item.role,
          content: item.content,
        }))
      );
    } catch (error) {
      console.error("Erro mensagens:", error);
    }
  }

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userText = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userText,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error(
          "Sua sessão expirou. Faça login novamente."
        );
      }

      await saveMessage(
        userText,
        conversationId,
        "user"
      );

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: userText,
          conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.reply || data.error || "Erro na API."
        );
      }

      const aiReply =
        data.reply || "Sem resposta";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiReply,
        },
      ]);

      await saveMessage(
        aiReply,
        conversationId,
        "assistant"
      );
    } catch (error: any) {
      console.error("ERRO CHAT:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Erro ao conectar com o ClaudinoIA: " +
            (error?.message || "Erro desconhecido."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-5 text-zinc-900">
        🤖 Bate-papo ClaudinoIA
      </h2>

      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 min-h-[350px] mb-5">
        {messages.length === 0 && (
          <p className="text-zinc-500">
            Comece uma conversa...
          </p>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className="mb-4"
          >
            {msg.role === "user" ? (
              <p className="text-zinc-800">
                👤 <strong>Você:</strong>{" "}
                {msg.content}
              </p>
            ) : (
              <p className="text-blue-600">
                🤖 <strong>ClaudinoIA:</strong>{" "}
                {msg.content}
              </p>
            )}
          </div>
        ))}

        {loading && (
          <p className="text-blue-500">
            🤖 ClaudinoIA pensando...
          </p>
        )}
      </div>

      <Textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        placeholder="Digite sua mensagem..."
        className="mb-4 bg-white text-zinc-900 border-zinc-300 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-blue-500"
      />

      <Button
        onClick={sendMessage}
        disabled={loading}
        className="bg-blue-600 text-white hover:bg-blue-700"
      >
        {loading
          ? "Enviando..."
          : "Enviar mensagem"}
      </Button>
    </div>
  );
}
