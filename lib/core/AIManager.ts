import OpenAI from "openai";

type WebsitePageButton = {
  text: string;
  href: string;
};

type WebsitePageVideo = {
  src: string;
  poster: string;
  type: "video" | "iframe";
};

type WebsitePageBlock = {
  type: "hero" | "section" | "content" | "media" | "footer";
  title: string;
  text: string;
  images: string[];
  videos: WebsitePageVideo[];
  buttons: WebsitePageButton[];
};

type WebsitePageSection = {
  type: string;
  title: string;
  text: string;
};

type WebsitePage = {
  title: string;
  description: string;
  headings: string[];
  buttons: WebsitePageButton[];
  images?: string[];
  videos?: WebsitePageVideo[];
  sections: WebsitePageSection[];
  blocks?: WebsitePageBlock[];
};

type WebsiteStudioRequest = {
  action: string;
  sourceUrl?: string;
  salesUrl?: string;
  whatsappUrl?: string;
  checkoutUrl?: string;
  page: WebsitePage;
};

function getOpenAI() {
  const apiKey =
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY não configurada."
    );
  }

  return new OpenAI({
    apiKey,
  });
}

export class AIManager {
  async chat(data: {
    userId: string;
    conversationId: string;
    message: string;
    history: any[];
    memoryContext: string;
  }) {
    console.log(
      "AIManager recebeu:",
      data
    );

    const pergunta =
      data.message
        .toLowerCase()
        .trim();

    const memoria =
      data.memoryContext
        .split("\n")
        .filter(Boolean)
        .map((item) => {
          const partes =
            item.split(":");

          return {
            chave:
              partes[0]
                ?.trim()
                .toLowerCase(),
            valor:
              partes
                .slice(1)
                .join(":")
                .trim(),
          };
        });

    const buscarMemoria =
      (chave: string) => {
        return memoria.find(
          (item) =>
            item.chave === chave
        )?.valor;
      };

    const respostasDiretas = [
      {
        palavras: [
          "qual meu nome",
          "meu nome",
        ],
        chave: "nome",
      },
      {
        palavras: [
          "qual meu projeto",
          "meu projeto",
        ],
        chave: "projeto",
      },
      {
        palavras: [
          "qual meu sonho",
          "meu sonho",
        ],
        chave: "sonho",
      },
      {
        palavras: [
          "qual minha profissão",
          "minha profissao",
          "meu trabalho",
        ],
        chave: "profissao",
      },
    ];

    for (const item of respostasDiretas) {
      if (
        item.palavras.some(
          (palavra) =>
            pergunta.includes(
              palavra
            )
        )
      ) {
        const valor =
          buscarMemoria(
            item.chave
          );

        return {
          reply: valor
            ? `Seu ${item.chave} é ${valor}.`
            : "Ainda não tenho essa informação salva.",
        };
      }
    }

    const nome =
      buscarMemoria("nome") ||
      "usuário";

    const historyLimitado =
      (data.history || []).slice(-10);

    const messages = [
      {
        role: "system" as const,
        content: `
Você é o ClaudinoIA.

Você é uma inteligência artificial profissional.

Nome do usuário:
${nome}

Memórias disponíveis:

${data.memoryContext}

REGRAS IMPORTANTES:

- Responda em português do Brasil.
- Use memórias apenas como contexto.
- Memória pode estar incompleta ou incorreta.
- Nunca transforme uma memória em uma afirmação sem confirmar.
- Se o usuário corrigir uma informação, a correção tem prioridade.
- Nunca invente informações sobre o usuário.
- Seja natural e inteligente.
- Ajude no desenvolvimento do projeto ClaudinoIA.
`,
      },

      ...historyLimitado.map(
        (item) => ({
          role: item.role,
          content: item.content,
        })
      ),

      {
        role: "user" as const,
        content: data.message,
      },
    ];

    const openai =
      getOpenAI();

    const completion =
      await openai.chat.completions.create(
        {
          model: "gpt-4.1-mini",
          messages,
        }
      );

    return {
      reply:
        completion.choices[0]
          ?.message?.content ||
        "Não consegui responder.",
    };
  }

  async generateWebsite(
    data: WebsiteStudioRequest
  ) {
    const openai =
      getOpenAI();

    const actionInstructions: Record<
      string,
      string
    > = {
      "Melhorar headline":
        "Crie uma headline mais clara, forte e persuasiva, sem fazer promessas médicas ou financeiras indevidas.",

      "Melhorar CTA":
        "Melhore os textos dos botões e chamadas para ação, tornando-os claros e orientados à conversão.",

      "Criar oferta":
        "Crie uma estrutura de oferta comercial clara, com benefício principal, diferenciais, chamada para ação e apresentação objetiva.",

      "Melhorar página":
        "Melhore a estrutura, clareza, hierarquia e persuasão de toda a página.",

      "Versão mobile":
        "Reorganize a estrutura pensando primeiro em telas pequenas, leitura rápida, botões acessíveis e seções bem organizadas.",

      "Adicionar WhatsApp":
        "Integre chamadas para WhatsApp de forma natural nos pontos apropriados da página.",
    };

    const instruction =
      actionInstructions[
        data.action
      ] ||
      "Melhore a página de forma profissional.";

    const originalImages =
      data.page.images || [];

    const originalVideos =
      data.page.videos || [];

    const originalBlocks =
      data.page.blocks || [];

    const prompt = `
Você é o motor de criação de páginas de vendas do ClaudinoIA.

O usuário está trabalhando em uma página que possui autorização para reconstruir ou transformar.

OBJETIVO:

${instruction}

REGRAS:

- Não copie literalmente textos protegidos de terceiros.
- Reescreva o conteúdo de maneira original.
- Não invente depoimentos, avaliações, números, certificações ou resultados.
- Não faça alegações médicas garantidas.
- Não crie informações falsas.
- Escreva em português do Brasil.
- Preserve os links fornecidos.
- Não altere URLs existentes.
- Não utilize URLs fictícias.
- Não invente mídias.
- NÃO remova imagens existentes.
- NÃO remova vídeos existentes.
- NÃO remova iframes existentes.
- NÃO remova posters existentes.
- Preserve a ordem dos blocos.
- Preserve a associação das mídias aos blocos.
- Você pode melhorar textos, títulos e CTAs.
- Você pode reorganizar apenas textos dentro dos blocos quando isso for necessário para a ação solicitada.
- As mídias existentes são patrimônio da estrutura analisada e devem ser preservadas.

CONFIGURAÇÃO:

Página de referência:
${data.sourceUrl || ""}

Página de vendas:
${data.salesUrl || ""}

WhatsApp:
${data.whatsappUrl || ""}

Checkout:
${data.checkoutUrl || ""}

ESTRUTURA ATUAL:

${JSON.stringify(
  data.page,
  null,
  2
)}

MÍDIAS QUE OBRIGATORIAMENTE DEVEM SER PRESERVADAS:

IMAGENS:
${JSON.stringify(
  originalImages,
  null,
  2
)}

VÍDEOS:
${JSON.stringify(
  originalVideos,
  null,
  2
)}

BLOCOS:
${JSON.stringify(
  originalBlocks,
  null,
  2
)}

RETORNE SOMENTE JSON VÁLIDO.
NÃO USE MARKDOWN.
NÃO USE BLOCOS DE CÓDIGO.

FORMATO:

{
  "title": "Título da página",
  "description": "Descrição principal",
  "headings": [],
  "buttons": [],
  "images": [],
  "videos": [],
  "sections": [],
  "blocks": []
}

IMPORTANTE:

Os campos "images", "videos" e "blocks" devem preservar as mídias e a estrutura recebidas.

Se a ação não exigir alteração de uma mídia, copie exatamente seus dados.

Gere uma versão profissional da página.
`;

    const completion =
      await openai.chat.completions.create(
        {
          model: "gpt-4.1-mini",
          temperature: 0.3,
          max_tokens: 3000,
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "Você é um especialista profissional em criação e transformação de páginas de vendas. Preserve rigorosamente mídias e URLs existentes. Retorne somente JSON válido e seja objetivo.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }
      );

    const content =
      completion.choices[0]
        ?.message?.content;

    if (!content) {
      throw new Error(
        "A IA não retornou conteúdo para a página."
      );
    }

    let result: WebsitePage;

    try {
      result =
        JSON.parse(content);
    } catch (error) {
      console.error(
        "Erro ao interpretar resposta da IA:",
        error
      );

      throw new Error(
        "A IA retornou uma resposta inválida."
      );
    }

    return {
      ...data.page,
      ...result,

      images:
        originalImages.length > 0
          ? originalImages
          : result.images || [],

      videos:
        originalVideos.length > 0
          ? originalVideos
          : result.videos || [],

      blocks:
        originalBlocks.length > 0
          ? originalBlocks.map(
              (originalBlock, index) => {
                const generatedBlock =
                  result.blocks?.[index];

                return {
                  ...originalBlock,
                  ...(generatedBlock || {}),
                  images:
                    originalBlock.images || [],
                  videos:
                    originalBlock.videos || [],
                };
              }
            )
          : result.blocks || [],
    };
  }
}

export const aiManager =
  new AIManager();

