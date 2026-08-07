"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getUserPlan } from "@/lib/plans";

type UserPlan = {
  plan_name: string;
  price: number;
  messages_limit: number;
  features: string[];
};

export default function ProfileCard() {
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [plan, setPlan] = useState<UserPlan | null>(
    null
  );

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email ?? "");

          setName(
            user.user_metadata?.name ||
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "Usuário"
          );
        }

        const userPlan =
          await getUserPlan();

        setPlan(userPlan);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div className="mt-8 bg-zinc-900 rounded-2xl border border-zinc-800 p-8">

      <div className="flex items-center gap-4">

        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
          {name.charAt(0).toUpperCase()}
        </div>

        <div>

          <h2 className="text-2xl font-bold">
            {name}
          </h2>

          <p className="text-zinc-400">
            {email}
          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">

        <div className="bg-zinc-800 rounded-xl p-5">

          <h3 className="text-zinc-400 text-sm">
            Plano Atual
          </h3>

          <p className="text-2xl font-bold text-green-400 mt-2">
            {plan?.plan_name ?? "Sem plano"}
          </p>

        </div>

        <div className="bg-zinc-800 rounded-xl p-5">

          <h3 className="text-zinc-400 text-sm">
            Valor
          </h3>

          <p className="text-2xl font-bold mt-2">
            R$ {plan?.price ?? 0}
          </p>

        </div>

        <div className="bg-zinc-800 rounded-xl p-5">

          <h3 className="text-zinc-400 text-sm">
            Limite de Mensagens
          </h3>

          <p className="text-2xl font-bold mt-2">
            {plan?.messages_limit ?? 0}
          </p>

        </div>

      </div>

      <div className="mt-8">

        <h3 className="text-xl font-bold mb-4">
          Recursos Liberados
        </h3>

        <div className="space-y-3">

          {plan?.features?.map(
            (feature, index) => (
              <div
                key={index}
                className="bg-zinc-800 rounded-lg p-4"
              >
                ✅ {feature}
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}