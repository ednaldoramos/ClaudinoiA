"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      description:
        "Comece conhecendo o poder do ClaudinoIA.",
      features: [
        "Chat com inteligência artificial",
        "Memória básica",
        "Histórico de conversas",
        "1 usuário",
      ],
      button: "Começar agora",
      color: "border-zinc-700",
      action: "/dashboard",
    },

    {
      name: "Profissional",
      price: "R$ 49,90",
      description:
        "Ideal para criadores e profissionais.",
      features: [
        "Mais mensagens com IA",
        "Memória inteligente avançada",
        "Histórico completo",
        "Respostas prioritárias",
        "Recursos profissionais",
      ],
      button: "Assinar Profissional",
      color: "border-blue-500",
      destaque: true,
      action: "/checkout/profissional",
    },

    {
      name: "Empresa",
      price: "R$ 199,90",
      description:
        "Para empresas e equipes.",
      features: [
        "Vários usuários",
        "Painel administrativo",
        "Gestão de equipe",
        "Maior limite de IA",
        "Suporte prioritário",
      ],
      button: "Assinar Empresa",
      color: "border-purple-500",
      action: "/checkout/empresa",
    },
  ];

  function handlePlan(path: string) {
    router.push(path);
  }

  return (
    <main
      className="
      min-h-screen
      bg-zinc-950
      text-white
      px-6
      py-12
      "
    >
      <section className="max-w-6xl mx-auto">

        <div className="text-center mb-14">

          <h1 className="text-5xl font-bold">
            🤖 ClaudinoIA
          </h1>

          <p className="
          text-zinc-400
          mt-4
          text-lg
          ">
            Escolha o plano ideal para sua inteligência artificial.
          </p>

        </div>


        <div className="
        grid
        md:grid-cols-3
        gap-8
        ">

          {plans.map((plan) => (

            <div
              key={plan.name}
              className={`
              relative
              bg-zinc-900
              rounded-2xl
              border
              ${plan.color}
              p-8
              shadow-xl
              `}
            >

              {plan.destaque && (

                <div
                  className="
                  absolute
                  -top-4
                  left-1/2
                  -translate-x-1/2
                  bg-blue-500
                  px-5
                  py-1
                  rounded-full
                  text-sm
                  font-bold
                  "
                >
                  ⭐ Mais escolhido
                </div>

              )}


              <h2 className="
              text-2xl
              font-bold
              ">
                {plan.name}
              </h2>


              <div className="mt-5">

                <span className="
                text-4xl
                font-bold
                ">
                  {plan.price}
                </span>


                {plan.name !== "Gratuito" && (

                  <span className="
                  text-zinc-400
                  ">
                    /mês
                  </span>

                )}

              </div>


              <p className="
              text-zinc-400
              mt-4
              ">
                {plan.description}
              </p>


              <ul className="
              mt-8
              space-y-4
              ">

                {plan.features.map((feature) => (

                  <li
                    key={feature}
                    className="
                    flex
                    gap-2
                    text-zinc-300
                    "
                  >

                    <Check
                      size={20}
                      className="text-green-400"
                    />

                    {feature}

                  </li>

                ))}

              </ul>


              <Button
                className="
                w-full
                mt-10
                "
                onClick={() =>
                  handlePlan(plan.action)
                }
              >
                {plan.button}
              </Button>


            </div>

          ))}

        </div>

      </section>

    </main>
  );
}