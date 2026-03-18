"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Wand2, QrCode, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Home() {
  const { user, googleLogin, emailLogin, emailRegister, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg-login.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Text Content */}
        <div className="text-center lg:text-left space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 text-sm font-medium text-white/90">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            v1.0 Disponível
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
            Avaliações com <br />
            <span className="text-gradient-primary">Inteligência Artificial</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-xl mx-auto lg:mx-0">
            Gere provas personalizadas em segundos, gerencie turmas e automatize correções. O futuro da educação, hoje.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={googleLogin}
              className="btn btn-primary"
            >
              {loading ? "Carregando..." : (
                <>
                  Começar Agora
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-80">
            <div className="flex items-center gap-2">
              <Wand2 className="text-purple-400" size={20} />
              <span className="text-sm">IA Generativa</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="text-cyan-400" size={20} />
              <span className="text-sm">Identificação QR</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glass Card Login */}
        <div className="flex justify-center animate-float">
          <div className="glass-card p-6 sm:p-8 max-w-md w-full border-t border-white/20">
            <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Wand2 size={20} />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Portal do Professor</h3>
                <p className="text-xs text-gray-400">Acesso Restrito</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                <CheckCircle2 className="text-green-400 mt-1" size={16} />
                <div>
                  <h4 className="text-sm font-bold text-white">Geração Rápida</h4>
                  <p className="text-xs text-gray-400">Crie provas inteiras digitando apenas um tema.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-start gap-3">
                <QrCode className="text-cyan-400 mt-1" size={16} />
                <div>
                  <h4 className="text-sm font-bold text-white">Gestão Simplificada</h4>
                  <p className="text-xs text-gray-400">Controle total de alunos com tecnologia QR Code.</p>
                </div>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setAuthError("");
              setIsProcessing(true);
              try {
                if (isRegistering) {
                  await emailRegister(email, password);
                } else {
                  await emailLogin(email, password);
                }
              } catch (err) {
                if (err.code === 'auth/email-already-in-use') {
                  setAuthError("Este usuário/e-mail já está em uso. (admin@corrigelab.com)");
                } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                  setAuthError("Senha incorreta. Confirme a senha digitada.");
                } else if (err.code === 'auth/user-not-found') {
                  setAuthError("Usuário não encontrado. Use o botão de cadastrar primeiro.");
                } else if (err.code === 'auth/weak-password') {
                  setAuthError("A senha deve ter pelo menos 6 caracteres.");
                } else {
                  setAuthError(`Erro na autenticação: ${err.code || err.message}`);
                }
              } finally {
                setIsProcessing(false);
              }
            }} className="space-y-4">
              {authError && <p className="text-red-400 text-sm text-center mb-2">{authError}</p>}
              <div>
                <input 
                  type="text" 
                  placeholder="E-mail ou 'admin'" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  autoCapitalize="none"
                />
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Senha" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn btn-primary flex items-center justify-center gap-3"
              >
                {isProcessing ? "Aguarde..." : (isRegistering ? "Criar Conta" : "Entrar")}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setAuthError("");
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                {isRegistering ? "Já tem uma conta? Faça login" : "Ainda não tem conta? Criar cadastro próprio"}
              </button>
            </div>
            
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OU</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              onClick={googleLogin}
              type="button"
              className="w-full btn flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl py-3 transition-all"
            >
              <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuar com Google</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
