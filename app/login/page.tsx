import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">

          <h1 className="text-3xl font-bold text-center mb-2">
            Entrar no <span className="text-blue-500">ClaudinoIA</span>
          </h1>

          <p className="text-slate-400 text-center mb-8">
            Acesse sua inteligência artificial personalizada.
          </p>


          <form className="space-y-5">

            <div>
              <label className="text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
              />
            </div>


            <div>
              <label className="text-sm text-slate-300">
                Senha
              </label>

              <input
                type="password"
                placeholder="********"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-blue-500"
              />
            </div>


            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition"
            >
              Entrar
            </button>

          </form>


          <div className="text-center mt-6">

            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white"
            >
              Voltar para início
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}