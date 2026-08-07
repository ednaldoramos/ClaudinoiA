import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-6">
      <div className="max-w-4xl text-center">

        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          Claudino<span className="text-blue-500">IA</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 mb-8">
          A inteligência artificial que entende seu negócio,
          organiza suas ideias e ajuda você a tomar melhores decisões.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition"
          >
            Entrar no ClaudinoIA
          </Link>

          <Link
            href="/pricing"
            className="border border-slate-600 hover:bg-slate-800 px-8 py-4 rounded-xl font-semibold transition"
          >
            Conhecer planos
          </Link>

        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">
              Memória Inteligente
            </h2>
            <p className="text-slate-400">
              O ClaudinoIA aprende informações importantes
              para oferecer respostas mais personalizadas.
            </p>
          </div>


          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">
              Assistente IA
            </h2>
            <p className="text-slate-400">
              Converse, planeje e crie soluções usando
              inteligência artificial.
            </p>
          </div>


          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-3">
              Para Empresas
            </h2>
            <p className="text-slate-400">
              Uma plataforma criada para profissionais
              e negócios crescerem.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}