"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { getUserPlan } from "@/lib/plans";

const MENTOR_USER_ID =
  "004fed89-55e8-4bb6-bbde-2a3b23b5cd59";

type UserPlan = {
  plan_name: string;
  price: number;
  messages_limit: number | null;
  features: string[];
};

export default function ProfileCard() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState(0);
  const [userId, setUserId] = useState("");
  const [isMentor, setIsMentor] = useState(false);
  const [plan, setPlan] = useState<UserPlan | null>(null);

  const [showFeatures, setShowFeatures] =
    useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        console.log(
          "CLAUDINOIA USER ID:",
          user.id
        );

        console.log(
          "CLAUDINOIA MENTOR ID:",
          MENTOR_USER_ID
        );

        setUserId(user.id);

        const mentor =
          user.id === MENTOR_USER_ID;

        console.log(
          "CLAUDINOIA IS MENTOR:",
          mentor
        );

        setIsMentor(mentor);
        setEmail(user.email ?? "");

        setName(
          user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Usuário"
        );

        if (!mentor) {
          const {
            data: creditData,
            error: creditError,
          } = await supabase
            .from("client_credits")
            .select("credits")
            .eq("user_id", user.id)
            .maybeSingle();

          if (creditError) {
            console.error(
              "Erro ao carregar créditos:",
              creditError
            );
          } else {
            setCredits(
              creditData?.credits ?? 0
            );
          }
        }

        const userPlan =
          await getUserPlan();

        if (mentor) {
          setPlan({
            plan_name: "Mentor",
            price: 0,
            messages_limit: null,
            features: [
              "Acesso vitalício",
              "Mensagens ilimitadas",
              "Memória completa",
              "Histórico de conversas",
              "Todos os recursos",
            ],
          });
        } else {
          setPlan(userPlan);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="text-zinc-400">
        Carregando perfil...
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold">
          {name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">
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

          <p className="text-2xl font-bold mt-2 text-white">
            R$ {plan?.price ?? 0}
          </p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-5">
          <h3 className="text-zinc-400 text-sm">
            Limite de Mensagens
          </h3>

          <p className="text-2xl font-bold mt-2 text-white">
            {isMentor ? "Ilimitado" : credits}
          </p>
        </div>
      </div>

      {/* RECURSOS LIBERADOS */}
      <div className="mt-8">
        <button
          type="button"
          onClick={() =>
            setShowFeatures((prev) => !prev)
          }
          className="w-full flex items-center justify-between bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-xl p-5 text-left"
        >
          <div>
            <h3 className="text-xl font-bold text-white">
              Recursos Liberados
            </h3>

            <p className="text-sm text-zinc-400 mt-1">
              {showFeatures
                ? "Clique para ocultar os recursos"
                : "Clique para visualizar os recursos"}
            </p>
          </div>

          <span
            className={`text-white text-xl transition-transform duration-200 ${
              showFeatures
                ? "rotate-180"
                : ""
            }`}
          >
            ▼
          </span>
        </button>

        {showFeatures && (
          <div className="mt-3 space-y-3">
            {plan?.features?.map(
              (feature, index) => (
                <div
                  key={index}
                  className="bg-zinc-800 rounded-lg p-4 text-white border border-zinc-700"
                >
                  <span className="text-green-400 mr-2">
                    ✓
                  </span>

                  {feature}
                </div>
              )
            )}

            {!plan?.features?.length && (
              <div className="bg-zinc-800 rounded-lg p-4 text-zinc-400">
                Nenhum recurso adicional
                liberado.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 bg-zinc-900 rounded-lg p-4 text-xs text-zinc-500">
        ID da sessão: {userId}
      </div>
    </div>
  );
}