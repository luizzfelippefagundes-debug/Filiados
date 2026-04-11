import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Star,
  Share2,
  Zap,
  Lock,
  Plus,
  Trash2,
  LogOut,
  RefreshCcw,
  Search,
  Filter,
  Eye,
  EyeOff,
  AlertTriangle,
  Settings,
  Wifi,
  WifiOff,
  LayoutDashboard,
  Trophy,
  MousePointer2
} from 'lucide-react';

// --- COMPONENTES ---

const ProductCard = ({ title, price, image_url, image, affiliate_link, category }) => (
  <div className="bg-white/70 backdrop-blur-md border border-white rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-gold-200/50 transition-all duration-500 group flex flex-col h-full animate-entrance premium-shadow">
    <div className="relative aspect-[4/5] overflow-hidden">
      <img
        src={image_url || image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400'}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div className="absolute top-4 left-4">
        <span className="bg-slate-900/90 backdrop-blur-sm text-gold-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm border border-gold-900/20">
          {category}
        </span>
      </div>
      <button className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-400 hover:text-gold-500 transition-all shadow-lg overflow-hidden group/heart">
        <Heart className="group-hover/heart:fill-gold-500 transition-all" size={20} />
      </button>
    </div>
    <div className="p-7 flex flex-col flex-grow bg-gradient-to-b from-transparent to-gold-50/10">
      <h3 className="font-bold text-slate-800 text-lg mb-3 leading-tight group-hover:text-gold-600 transition-colors uppercase tracking-tight line-clamp-2">{title}</h3>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-gold-400 text-gold-400" />)}
        <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-tight">(4.9)</span>
      </div>

      <div className="mt-auto">
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-2xl font-black text-slate-900 tracking-tighter italic">R$ {price}</span>
          <span className="text-slate-400 text-[10px] line-through font-bold opacity-60 italic">R$ {(parseFloat(price.replace(',', '.')) * 1.35 || 0).toFixed(2).replace('.', ',')}</span>
        </div>
        <a
          href={affiliate_link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-slate-900 hover:bg-gold-500 text-white px-8 py-4 rounded-full font-black transition-all duration-500 transform active:scale-95 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-slate-200 no-underline"
        >
          Ver no Mercado Livre <ExternalLink size={14} />
        </a>
      </div>
    </div>
  </div>
);

const Quiz = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const steps = [
    {
      title: "Como você sente sua pele hoje?",
      field: 'type',
      options: [
        { label: "Mais Oleosa", value: "oleosa", icon: "💧", desc: "Com alguns pontos de brilho" },
        { label: "Mais Seca", value: "seca", icon: "🌵", desc: "Sinto que está sem viço" },
        { label: "Mista", value: "mista", icon: "🌓", desc: "Brilho apenas na zona T" },
        { label: "Sensível", value: "sensivel", icon: "🌸", desc: "Irrita-se com facilidade" }
      ]
    },
    {
      title: "Qual seu sonho para sua pele?",
      field: 'goal',
      options: [
        { label: "Rejuvenescer", value: "antienvelhecimento", icon: "⏳", desc: "Suavizar linhas e rugas" },
        { label: "Pele de Porcelana", value: "acne", icon: "✨", desc: "Sem manchas e poros limpos" },
        { label: "Hidratação Máxima", value: "hidratacao", icon: "🌊", desc: "Sempre macia e renovada" },
        { label: "Brilho Natural", value: "brilho", icon: "💡", desc: "Iluminada de dentro pra fora" }
      ]
    },
    {
      title: "Quanto gostaria de investir?",
      field: 'budget',
      options: [
        { label: "Produtos Essenciais", value: "budget", icon: "🏷️", desc: "Melhores achados acessíveis" },
        { label: "Kit Equilibrado", value: "balanced", icon: "💎", desc: "O melhor custo-benefício" },
        { label: "Luxo Tecnológico", value: "performance", icon: "👑", desc: "Tecnologia de ponta mundial" }
      ]
    }
  ];

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [steps[step].field]: value };
    setAnswers(newAnswers);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-10 bg-white rounded-[3rem] shadow-2xl shadow-gold-200/40 border border-white animate-entrance">
      <div className="flex justify-between items-center mb-16">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-700 ${i <= step ? 'bg-gold-500' : 'bg-gold-100'}`} />
          ))}
        </div>
        <span className="text-[9px] font-black text-gold-400 uppercase tracking-[0.3em]">Advisor Passo 0{step + 1}</span>
      </div>

      <h2 className="text-4xl font-black text-slate-800 mb-4 leading-tight tracking-tight italic">
        {steps[step].title}
      </h2>
      <p className="text-slate-400 mb-12 text-xs uppercase tracking-[0.2em] font-bold opacity-80">Consultoria Premium de Beleza</p>

      <div className="grid gap-5">
        {steps[step].options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className="flex items-center gap-6 p-7 bg-white border border-gold-50 rounded-[2rem] hover:border-gold-300 hover:bg-gold-50/20 hover:shadow-xl hover:shadow-gold-100/50 transition-all duration-500 text-left group cursor-pointer"
          >
            <div className="w-16 h-16 bg-gold-50 rounded-2xl flex items-center justify-center text-4xl group-hover:bg-gold-100 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-white">
              {opt.icon}
            </div>
            <div>
              <span className="block font-black text-slate-800 text-lg group-hover:text-gold-600 transition-colors uppercase tracking-tight">{opt.label}</span>
              <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold opacity-70">{opt.desc}</span>
            </div>
            <ArrowRight size={20} className="ml-auto text-gold-200 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-12 flex items-center gap-2 text-gold-400 hover:text-gold-600 font-black text-[9px] uppercase tracking-[0.4em] transition-all"
        >
          <ChevronLeft size={16} /> Voltar
        </button>
      )}
    </div>
  );
};

const AdminPanel = ({ onClose, onRefresh, apiUrl, onUpdateApi }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connError, setConnError] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [tempApi, setTempApi] = useState(apiUrl);

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_visible !== false).length,
    hidden: products.filter(p => p.is_visible === false).length
  };

  const ensureSchema = async () => {
    try {
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;" })
      });
      setConnError(false);
    } catch (e) {
      setConnError(true);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: "SELECT * FROM products ORDER BY id DESC" })
      });
      const data = await res.json();
      const list = data.rows || data;
      setProducts(Array.isArray(list) ? list : []);
      setConnError(false);
    } catch (e) {
      setProducts([]);
      setConnError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      ensureSchema().then(fetchProducts);
    }
  }, [isAuthenticated, apiUrl]);

  const handleLogin = () => { if (password === 'gold2026') setIsAuthenticated(true); else alert('Senha Incorreta'); };

  const handleDelete = async (id) => {
    if (!confirm('Excluir permanentemente este item do banco?')) return;
    setLoading(true);
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `DELETE FROM products WHERE id = ${id}` })
    });
    fetchProducts();
    onRefresh();
  };

  const toggleVisibility = async (id, currentStatus) => {
    setLoading(true);
    const newStatus = !currentStatus;
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `UPDATE products SET is_visible = ${newStatus} WHERE id = ${id}` })
    });
    fetchProducts();
    onRefresh();
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900/95 flex items-center justify-center p-6 backdrop-blur-xl">
        <div className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-3xl text-center border border-white">
          <div className="w-20 h-20 bg-gold-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-10 shadow-xl shadow-gold-200 text-white">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase italic">Admin Access</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-10">Gold Shop Management</p>
          <input
            type="password"
            className="w-full p-6 bg-slate-50 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-gold-500 font-bold text-center text-2xl"
            placeholder="••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl">
            Entrar no Painel
          </button>
          <button onClick={onClose} className="mt-6 text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] block w-full">Voltar para a Loja</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 overflow-y-auto p-12 animate-entrance font-sans">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-gold-500 shadow-xl">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Gold Panel</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full ${connError ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${connError ? 'text-red-500' : 'text-emerald-600'}`}>
                  {connError ? 'Erro de Sincronização' : 'Conectado ao Neon DB'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowApiConfig(true)} className="bg-white border border-gold-100 p-4 rounded-2xl hover:bg-gold-50 transition-all text-slate-400 shadow-sm">
              <Settings size={20} />
            </button>
            <button onClick={onClose} className="bg-white border border-gold-100 px-8 py-4 rounded-2xl hover:bg-gold-50 transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-gold-600 shadow-sm">
              Sair do Painel <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Catálogo Total', val: stats.total, icon: ShoppingBag, color: 'slate' },
            { label: 'Produtos Ativos', val: stats.active, icon: Eye, color: 'gold' },
            { label: 'Itens Ocultos', val: stats.hidden, icon: EyeOff, color: 'slate' }
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-white shadow-xl flex items-center justify-between group hover:border-gold-200 transition-all">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic">{s.val}</h4>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.color === 'gold' ? 'bg-gold-500 text-white shadow-gold-200 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                <s.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Collection Column */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[3rem] p-10 border border-slate-800 shadow-3xl sticky top-12 overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gold-500 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl shadow-gold-500/20">
                  <Zap size={32} fill="currentColor" />
                </div>
                <h2 className="text-white text-3xl font-black uppercase italic leading-tight mb-4 tracking-tighter">Gold Push <br /><span className="text-gold-500">Magic Button</span></h2>
                <p className="text-slate-400 text-xs font-bold leading-relaxed mb-10 opacity-80 uppercase tracking-widest">
                  Este é o seu único mecanismo de entrada. Arraste para a barra de favoritos e clique no Mercado Livre para cadastrar.
                </p>

                <div className="p-1 bg-white/5 rounded-[2rem] border border-white/10 mb-8 backdrop-blur-sm">
                  <a
                    href={`javascript:(function(){const t=document.querySelector('.ui-pdp-title')?.innerText||document.title;let p=document.querySelector('.ui-pdp-price__part .andes-money-amount__fraction')?.innerText||'0';p=p.replace(/\\./g,'').replace(',','.');const i=document.querySelector('.ui-pdp-gallery__figure__image')?.src||'';const u=window.location.href;const c=prompt('Qual a categoria deste produto?', 'Geral');if(!c)return;const q="INSERT INTO products (title, price, image_url, affiliate_link, category, tier, is_visible) VALUES ('"+t.replace(/'/g,"''")+"', '"+p+"', '"+i+"', '"+u+"', '"+c+"', 'balanced', true)";fetch('${apiUrl}',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q})}).then(r=>r.ok?alert('✅ Adicionado!'):alert('❌ Erro no Banco')).catch(()=>alert('❌ Erro de Conexão: Verifique o n8n e a URL no painel'));})()`}
                    className="flex items-center justify-center gap-4 bg-white text-slate-900 px-8 py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gold-500 hover:text-white transition-all shadow-xl active:scale-95 cursor-grab no-underline w-full"
                    onClick={e => e.preventDefault()}
                  >
                    <MousePointer2 size={18} /> GOLD PUSH
                  </a>
                </div>

                <div className="bg-gold-500/5 p-6 rounded-2xl border border-gold-500/10 flex items-center gap-4">
                  <Trophy className="text-gold-500" size={24} />
                  <span className="text-white text-[9px] font-bold uppercase tracking-[0.2em]">Curadoria Premium Ativada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Listagem */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[3rem] p-10 border border-white shadow-xl min-h-[600px]">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-800 uppercase italic flex items-center gap-4">
                  Produtos Selecionados
                  {loading && <RefreshCcw size={18} className="animate-spin text-gold-500" />}
                </h3>
                <button onClick={fetchProducts} className="bg-gold-50 text-gold-600 p-4 rounded-2xl hover:bg-gold-100 transition-all shadow-sm">
                  <RefreshCcw size={20} />
                </button>
              </div>

              <div className="grid gap-4">
                {products.length === 0 && !loading && (
                  <div className="py-32 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                    <ShoppingBag size={48} className="mx-auto text-slate-200 mb-6" />
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest italic leading-relaxed">Seu catálogo está vazio.<br />Use o Gold Push no Mercado Livre para começar.</p>
                  </div>
                )}
                {products.map(p => (
                  <div key={p.id} className="flex items-center gap-6 p-5 bg-white rounded-[2rem] group hover:shadow-2xl hover:scale-[1.01] transition-all border border-slate-100 hover:border-gold-200">
                    <img src={p.image_url || p.image} className="w-24 h-24 rounded-2xl object-cover shadow-lg border border-slate-100" />
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 text-slate-500 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">{p.category}</span>
                      </div>
                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight line-clamp-1">{p.title}</h4>
                      <p className="text-gold-600 font-black text-xs mt-1 italic italic italic italic">R$ {p.price}</p>
                    </div>
                    <div className="flex items-center gap-3 pr-4">
                      <button
                        onClick={() => toggleVisibility(p.id, p.is_visible !== false)}
                        className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest ${p.is_visible === false ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' : 'bg-gold-500 text-white shadow-lg shadow-gold-200'}`}
                      >
                        {p.is_visible === false ? <><EyeOff size={14} /> Ativar</> : <><Eye size={14} /> Visível</>}
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {showApiConfig && (
        <div className="fixed inset-0 z-[210] bg-slate-900/80 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-white p-12 rounded-[3.5rem] max-w-lg w-full shadow-2xl border border-white">
            <h3 className="font-black text-slate-800 text-2xl mb-6 uppercase italic flex items-center gap-3">
              <Wifi className="text-gold-500" /> Webhook Setup
            </h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase mb-8 leading-relaxed tracking-widest">Insira o URL final do seu webhook do n8n para sincronizar os produtos.</p>
            <input
              className="w-full p-6 bg-slate-50 rounded-2xl mb-8 font-bold text-sm border border-transparent focus:border-gold-300 outline-none"
              value={tempApi}
              onChange={e => setTempApi(e.target.value)}
              placeholder="https://sua-url.ngrok-free.app/webhook/..."
            />
            <div className="flex gap-4">
              <button onClick={() => setShowApiConfig(false)} className="flex-1 bg-slate-50 text-slate-400 p-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancelar</button>
              <button onClick={() => { onUpdateApi(tempApi); setShowApiConfig(false); }} className="flex-1 bg-gold-500 text-white p-6 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Salvar URL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPAL ---

function App() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tudo');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('gold-shop-api') || '');
  const [apiStatus, setApiStatus] = useState('checking');

  // URL da API REST do Neon para configurações globais
  const NEON_DB_URL = "https://ep-gentle-hall-amii66wb.apirest.c-5.us-east-1.aws.neon.tech/neondb/rest/v1";
  const NEON_API_KEY = "napi_7ze1ed1kp2efek7hvtx2der33iw2v57trx2oc7vv1b5j0goybgjwqlk1h40adlu0";

  // Buscar URL da API automaticamente no Banco Neon na inicialização
  useEffect(() => {
    const autoSyncApi = async () => {
      try {
        const response = await fetch(NEON_DB_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${NEON_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: "SELECT value FROM settings WHERE key = 'api_webhook_url' LIMIT 1" })
        });
        const data = await response.json();
        // O Neon REST API costuma retornar { rows: [...] } ou direto o array
        const rows = data.rows || data;
        if (rows && rows[0] && rows[0].value) {
          console.log("🔗 API Auto-detectada do Banco:", rows[0].value);
          if (rows[0].value !== apiUrl) {
            setApiUrl(rows[0].value);
            localStorage.setItem('gold-shop-api', rows[0].value);
          }
        }
      } catch (err) {
        console.warn("⚠️ Falha na sincronização automática da API:", err);
      }
    };
    autoSyncApi();
  }, []);

  const updateApi = (newUrl) => {
    localStorage.setItem('gold-shop-api', newUrl);
    setApiUrl(newUrl);
    window.location.reload();
  };

  const loadData = () => {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "SELECT * FROM products ORDER BY id DESC" })
    })
      .then(res => res.json())
      .then(data => {
        const productsList = data.rows || data;
        setProducts(Array.isArray(productsList) ? productsList : []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar do Neon:", err);
        fetch('/products.json').then(res => res.json()).then(data => setProducts(data)).finally(() => setIsLoading(false));
      });
  };

  useEffect(() => { loadData(); }, [apiUrl]);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 3) { setShowAdmin(true); setLogoClicks(0); }
    setTimeout(() => setLogoClicks(0), 3000);
  };

  const handleQuizComplete = (answers) => {
    setResults(answers);
    setShowQuiz(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  };

  const filteredProducts = products.filter(p => {
    if (p.is_visible === false) return false;
    const matchesCategory = selectedCategory === 'Tudo' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesQuiz = results
      ? (p.tier === results.budget || (p.tags && p.tags.includes(results.type)))
      : true;
    return matchesCategory && matchesSearch && matchesQuiz;
  });

  const categories = ['Tudo', ...new Set(products.filter(p => p.is_visible !== false).map(p => p.category))];

  if (isLoading && !showQuiz && !results) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center animate-bounce shadow-2xl shadow-gold-500/50 text-white">
          <ShoppingBag size={32} />
        </div>
        <p className="mt-8 text-gold-500 font-black text-xs uppercase tracking-[0.5em] animate-pulse">Iniciando Gold Shop...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfdfc] overflow-x-hidden selection:bg-gold-100 selection:text-gold-900 font-sans">

      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onRefresh={loadData} apiUrl={apiUrl} onUpdateApi={updateApi} />}

      {/* Navbar Gold */}
      <nav className="fixed w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-gold-100/50">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between gap-8">
          <div onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group active:scale-95 transition-all">
            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-gold-500 shadow-lg group-hover:rotate-12 group-hover:bg-gold-500 group-hover:text-white transition-all">
              <ShoppingBag size={20} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase italic leading-none">
              GOLD<span className="gold-text-gradient">SHOP</span>
            </span>
          </div>

          <div className="hidden md:flex flex-grow max-w-xl relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full bg-slate-100/50 border border-transparent focus:border-gold-300 focus:bg-white p-4 pl-14 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner"
              placeholder="O que você está procurando?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => { setResults(null); setShowQuiz(true); }}
            className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-gold-500 transition-all shadow-xl shadow-slate-200"
          >
            Beauty Advisor <Sparkles size={14} className="text-gold-400" />
          </button>
        </div>
      </nav>

      <main>
        {!showQuiz && !results && (
          <>
            <header className="pt-40 container mx-auto px-6 text-center md:text-left">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-12 mb-16">
                <div>
                  <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.8] tracking-tighter uppercase italic py-2">
                    Meus <br /> <span className="gold-text-gradient">Achados.</span>
                  </h1>
                  <p className="mt-8 text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Curadoria exclusiva dos melhores produtos do Mercado Livre.</p>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 w-full md:w-auto justify-center md:justify-start">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border ${selectedCategory === cat
                        ? 'bg-slate-900 text-gold-400 border-slate-900 shadow-xl'
                        : 'bg-white text-slate-400 border-slate-100 hover:border-gold-200'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-32">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(p => <ProductCard key={p.id} {...p} />)
                ) : (
                  <div className="col-span-full py-40 text-center bg-slate-50/50 rounded-[4rem] border-2 border-dashed border-slate-100">
                    <AlertTriangle size={48} className="mx-auto text-slate-200 mb-6" />
                    <p className="text-slate-400 font-black uppercase italic tracking-widest text-lg">Nenhum produto em destaque.</p>
                    <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">O administrador ainda não liberou ofertas!</p>
                  </div>
                )}
              </div>
            </header>
          </>
        )}

        {showQuiz && (
          <section className="pt-48 pb-32 flex items-center justify-center px-6">
            <Quiz onComplete={handleQuizComplete} />
          </section>
        )}

        {results && !showQuiz && !isLoading && (
          <section id="results" className="pt-40 pb-48 px-6 animate-entrance">
            <div className="container mx-auto">
              <div className="flex justify-between items-end mb-16">
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 italic tracking-tighter uppercase">Advisor <br /> <span className="gold-text-gradient">Results.</span></h2>
                <button onClick={() => setResults(null)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 pb-2 hover:text-gold-600 hover:border-gold-500 transition-all">Limpar Filtros</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {filteredProducts.map(p => <ProductCard key={p.id} {...p} />)}
              </div>
            </div>
          </section>
        )}

        {isLoading && results && (
          <div className="min-h-screen flex flex-col items-center justify-center pt-24">
            <Sparkles className="text-gold-500 animate-spin" size={64} />
            <p className="mt-8 text-slate-800 font-black uppercase tracking-widest italic">Personalizando seu Gold Advisor...</p>
          </div>
        )}
      </main>

      <footer className="py-24 border-t border-gold-100 bg-white">
        <div className="container mx-auto px-10 text-center">
          <div className="inline-flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-gold-500 text-xl font-black">G</div>
            <span className="font-black text-2xl tracking-tighter text-slate-800 uppercase italic">GOLD<span className="gold-text-gradient">SHOP</span></span>
          </div>
          <p className="text-slate-300 font-black text-[9px] uppercase tracking-[0.5em] italic">
            &copy; 2026 Gold Shop Affiliate Hub. Curation Platform Active.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
