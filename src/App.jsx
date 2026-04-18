import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles, Star, ExternalLink, ShieldCheck, ArrowDown,
  Heart, Truck, BadgeCheck, Check, ShoppingBag,
  Zap, Lock, LogOut, RefreshCcw, Search,
  LayoutDashboard, MousePointer2, RefreshCw, X, Globe, Play, MessageCircle
} from 'lucide-react';

// === DB QUERY ===
const neonQuery = async (q) => {
  const r = await fetch("/api/query", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  return r.json();
};

// === HERO ===
const Hero = ({ productCount, onLogin }) => (
  <header className="relative overflow-hidden bg-gradient-hero text-white">
    <button onClick={onLogin} className="absolute right-6 top-6 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur transition-smooth hover:bg-white/20"><Lock className="h-3.5 w-3.5" /> Admin</button>
    <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-secondary/40 blur-3xl animate-float" />
    <div className="pointer-events-none absolute right-0 top-32 h-80 w-80 rounded-full bg-accent/40 blur-3xl animate-float" style={{ animationDelay: '1.2s' }} />
    <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-gold/30 blur-3xl animate-float" style={{ animationDelay: '0.6s' }} />

    <div className="container relative z-10 flex flex-col items-center py-20 text-center md:py-28">
      <div className="mb-6 flex items-center gap-3 animate-fade-in-up">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold shadow-gold">
          <Sparkles className="h-6 w-6 text-gold-foreground" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-extrabold tracking-tight">
          Gold <span className="text-gradient-gold">Shop</span>
        </span>
      </div>

      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <ShieldCheck className="h-4 w-4 text-gold" />
        Curadoria 100% testada e aprovada
      </div>

      <h1 className="mb-5 max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        Garimpamos as melhores ofertas{' '}
        <span className="text-gradient-gold">do Mercado Livre</span> pra você
      </h1>

      <p className="mb-10 max-w-2xl text-balance text-base text-white/80 md:text-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        Selecionamos produtos com o melhor custo-benefício, testados de verdade. Você compra
        direto no Mercado Livre, com toda segurança da plataforma.
      </p>

      <div className="flex flex-col items-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <a href="#vitrine" className="inline-flex items-center gap-2 bg-gradient-gold text-gold-foreground hover:opacity-90 shadow-gold transition-smooth h-12 px-8 text-base font-bold rounded-lg no-underline">
          Ver vitrine <ArrowDown className="h-4 w-4" />
        </a>
        <p className="text-xs text-white/60">{productCount} produtos selecionados esta semana</p>
      </div>
    </div>

    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background" />
  </header>
);

// === CATEGORY FILTER ===
const CategoryFilter = ({ categories, active, onChange, count }) => (
  <div className="space-y-4">
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Vitrine <span className="text-gradient-brand">curada</span>
      </h2>
      <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'produto' : 'produtos'}</span>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      {['Todos', ...categories].map(cat => (
        <button key={cat} onClick={() => onChange(cat)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-smooth ${active === cat
            ? 'border-transparent bg-gradient-brand text-white shadow-card-hover'
            : 'border-border bg-card text-foreground hover:border-primary/40 hover:text-primary'
            }`}>
          {cat}
        </button>
      ))}
    </div>
  </div>
);

// === PRODUCT CARD ===
const ProductCard = ({ product, onClick }) => {
  const price = parseFloat(product.price?.toString().replace(',', '.') || 0);
  const originalPrice = parseFloat(product.original_price?.toString().replace(',', '.') || price);
  const discount = product.discount || 0;

  const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <article onClick={onClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:border-gold/50 hover:shadow-glow">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={product.image_url || product.image} alt={product.title} loading="lazy"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gradient-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-foreground shadow-gold">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} /> Curadoria Gold
        </div>
        {discount > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-gradient-brand px-2.5 py-1 text-xs font-bold text-white shadow-card">
            -{discount}%
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {product.category}
        </span>
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-foreground">
          {product.title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-gold text-gold" />
          <span className="font-semibold text-foreground">4.8</span>
          <span>(curadoria)</span>
        </div>
        <div className="mt-auto space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-foreground">{formatBRL(price)}</span>
            <span className="text-sm text-muted-foreground line-through">{formatBRL(originalPrice)}</span>
          </div>
          <button className="w-full rounded-lg bg-gradient-brand py-2.5 text-sm font-semibold text-white transition-smooth hover:opacity-90"
            onClick={e => { e.stopPropagation(); onClick(); }}>
            Ver detalhes
          </button>
        </div>
      </div>
    </article>
  );
};

// === PRODUCT MODAL ===
const ProductModal = ({ product, onClose }) => {
  if (!product) return null;
  const price = parseFloat(product.price?.toString().replace(',', '.') || 0);
  const originalPrice = parseFloat(product.original_price?.toString().replace(',', '.') || price);
  const discount = product.discount || 0;
  const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in-up" onClick={onClose}>
      <div className="relative max-h-[92vh] max-w-5xl w-full overflow-y-auto rounded-2xl bg-card shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth">
          <X size={16} />
        </button>

        <div className="grid gap-0 md:grid-cols-2">
          {/* Gallery */}
          <div className="relative bg-muted p-4 md:p-6">
            <div className="absolute left-6 top-6 z-10 flex items-center gap-1 rounded-full bg-gradient-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold-foreground shadow-gold">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} /> Curadoria Gold
            </div>
            <div className="aspect-square overflow-hidden rounded-xl bg-card">
              <img src={product.image_url || product.image} alt={product.title} className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 p-6 md:p-8">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{product.category}</span>
            </div>

            <h2 className="text-xl font-bold leading-tight md:text-2xl">{product.title}</h2>

            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
              </div>
              <span className="font-semibold">4.8</span>
              <span className="text-muted-foreground">(curadoria Gold)</span>
            </div>

            {/* Price */}
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-foreground md:text-4xl">{formatBRL(price)}</span>
                {discount > 0 && (
                  <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-xs font-bold text-white">-{discount}%</span>
                )}
              </div>
              <span className="text-sm text-muted-foreground line-through">de {formatBRL(originalPrice)}</span>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-2.5 text-center">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-[11px] font-medium leading-tight">Frete rápido</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-2.5 text-center">
                <ShieldCheck className="h-4 w-4 text-secondary" />
                <span className="text-[11px] font-medium leading-tight">Compra segura ML</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-2.5 text-center">
                <BadgeCheck className="h-4 w-4 text-accent" />
                <span className="text-[11px] font-medium leading-tight">Vendedor verificado</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description || 'Produto selecionado pela curadoria Gold Shop por sua qualidade e custo-benefício.'}
            </p>

            {/* Curator note */}
            <div className="rounded-xl border border-gold/30 bg-gold-soft/60 p-4">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gold-foreground">
                <Heart className="h-3.5 w-3.5 fill-current" /> Por que recomendamos
              </div>
              <p className="text-sm leading-relaxed text-gold-foreground/90">
                Produto garimpado pela curadoria Gold Shop. Avaliamos preço, qualidade, reputação do vendedor e satisfação dos compradores.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-2 space-y-2">
              <a href={product.affiliate_link} target="_blank" rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-gold py-3.5 text-base font-bold text-gold-foreground shadow-gold transition-smooth hover:opacity-90 no-underline">
                Comprar no Mercado Livre <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-center text-[11px] text-muted-foreground">
                Link de afiliado — você paga o mesmo preço e ajuda a manter a curadoria 💛
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === FOOTER ===
const Footer = () => (
  <footer className="mt-20 border-t border-border bg-muted/40">
    <div className="container py-10">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-md">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
              <Sparkles className="h-4 w-4 text-gold-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Gold <span className="text-gradient-gold">Shop</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Curadoria independente de produtos do Mercado Livre. Garimpamos só o que vale a pena
            de verdade, testado e aprovado.
          </p>
        </div>
        <div className="flex gap-2">
          {[Globe, Play, MessageCircle].map((Icon, i) => (
            <a key={i} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-smooth hover:border-primary hover:text-primary">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} Gold Shop — Todos os direitos reservados.</p>
        <p>Os links da vitrine são de afiliado. Ganhamos uma pequena comissão sem custo extra para você.</p>
      </div>
    </div>
  </footer>
);

// === ADMIN PANEL ===
const AdminPanel = ({ onClose, onRefresh }) => {
  const [pw, setPw] = useState('');
  const [auth, setAuth] = useState(false);
  const [items, setItems] = useState([]);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => { const d = await neonQuery("SELECT * FROM products ORDER BY id DESC"); setItems(d.rows || []); };
  useEffect(() => { if (auth) load(); }, [auth]);

  if (!auth) return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="bg-card rounded-2xl p-10 max-w-sm w-full shadow-2xl text-center">
        <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-gold">
          <Lock size={32} className="text-gold-foreground" />
        </div>
        <h2 className="text-2xl font-extrabold mb-2">Admin Access</h2>
        <p className="text-muted-foreground text-xs font-medium mb-8">Gold Shop Panel</p>
        <input type="password" className="w-full p-4 bg-muted rounded-xl mb-4 outline-none text-center text-xl border border-border focus:border-primary transition-smooth" placeholder="••••••" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { pw === 'gold2026' ? setAuth(true) : alert('Incorreta'); } }} />
        <button onClick={() => { pw === 'gold2026' ? setAuth(true) : alert('Incorreta'); }} className="w-full bg-gradient-brand text-white py-4 rounded-xl font-bold text-sm transition-smooth hover:opacity-90">Entrar</button>
        <button onClick={onClose} className="mt-4 text-muted-foreground text-xs font-medium block w-full">Cancelar</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-background overflow-y-auto p-8 animate-fade-in-up">
      <div className="container">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center text-white shadow-card"><LayoutDashboard size={24} /></div>
            <div>
              <h1 className="text-2xl font-extrabold">Gold Panel</h1>
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />Conectado</span>
            </div>
          </div>
          <button onClick={onClose} className="border border-border bg-card px-6 py-3 rounded-xl text-foreground text-xs font-semibold transition-smooth hover:border-primary flex items-center gap-2"><LogOut size={14} /> Sair</button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><Zap size={16} className="text-gold" /> Capturar Produto</h3>
              <input className="w-full p-3.5 bg-muted rounded-xl mb-3 text-sm outline-none border border-border focus:border-primary transition-smooth" placeholder="🔗 Link do Mercado Livre" value={link} onChange={e => setLink(e.target.value)} />
              <button onClick={async () => { if (!link.trim()) return; setBusy(true); try { await fetch(`/bot/capture?url=${encodeURIComponent(link)}`); setLink(''); setTimeout(() => { load(); onRefresh(); }, 2000); } catch { } finally { setBusy(false); } }} disabled={busy} className="w-full bg-gradient-gold text-gold-foreground py-3 rounded-xl font-bold text-xs transition-smooth hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold">
                {busy ? <RefreshCcw size={14} className="animate-spin" /> : <Zap size={14} />} {busy ? 'Capturando...' : 'Capturar & Postar'}
              </button>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><MousePointer2 size={16} className="text-gold" /> Gold Push</h3>
              <a href="javascript:(function(){try{var t=(document.querySelector('.ui-pdp-title')||document.querySelector('h1'))?.innerText.trim()||document.title;var pc=document.querySelector('.ui-pdp-price__second-line')||document.querySelector('.ui-pdp-price');var f=pc?.querySelector('.andes-money-amount__fraction')?.innerText.replace(/\D/g,'')||'0';var c=pc?.querySelector('.andes-money-amount__cents')?.innerText||'00';var p=f+','+c;var opc=document.querySelector('.ui-pdp-price__part--metadata');var opf=opc?.querySelector('.andes-money-amount__fraction')?.innerText.replace(/\D/g,'')||f;var opc=opc?.querySelector('.andes-money-amount__cents')?.innerText||c;var op=opf+','+opc;var d=document.querySelector('.ui-pdp-price__second-line .ui-pdp-price__discount')?.innerText.replace(/\D/g,'')||0;var i=document.querySelector('.ui-pdp-gallery__figure__image')?.src||document.querySelector('meta[property=\'og:image\']')?.content||'';var url=encodeURIComponent(window.location.href);var target='https://filiados.onrender.com/capture?format=html&url='+url+'&title='+encodeURIComponent(t)+'&price='+encodeURIComponent(p)+'&originalPrice='+encodeURIComponent(op)+'&discount='+encodeURIComponent(d)+'&image='+encodeURIComponent(i);window.open(target,'GoldPush','width=500,height=400')}catch(e){window.open('https://filiados.onrender.com/capture?format=html&url='+encodeURIComponent(window.location.href),'GoldPush','width=500,height=400')}})()" className="inline-block bg-gradient-gold text-gold-foreground px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-gold hover:opacity-90 transition-smooth no-underline">🚀 Arraste para Favoritos</a>
            </div>
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card text-center">
              <button onClick={async () => { try { await fetch('https://filiados.onrender.com/run-automation', { method: 'POST' }); alert('🔄 Sincronização iniciada!'); } catch { } }} className="w-full p-3 bg-gold-soft border border-gold/20 rounded-xl text-gold-foreground font-bold text-xs transition-smooth hover:bg-gold-soft/80 flex items-center justify-center gap-2">
                <RefreshCw size={14} /> Sincronizar Catálogo
              </button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-card min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold flex items-center gap-3">Catálogo <span className="text-gold text-xs">{items.length}</span></h3>
                <button onClick={load} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-smooth"><RefreshCcw size={16} /></button>
              </div>
              <div className="space-y-3">
                {items.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-gold/30 transition-smooth group">
                    <img src={p.image_url || p.image} className="w-14 h-14 rounded-lg object-cover" alt="" />
                    <div className="flex-grow min-w-0">
                      <h4 className="font-semibold text-foreground text-xs truncate">{p.title}</h4>
                      <p className="text-gold font-bold text-xs">R$ {p.price}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{p.category}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// === APP ===
function App() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = () => {
    neonQuery("SELECT * FROM products ORDER BY id DESC")
      .then(data => { setProducts(data.rows || []); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => { loadData(); const i = setInterval(loadData, 30000); return () => clearInterval(i); }, []);

  const visible = products.filter(p => p.is_visible !== false);
  const categories = [...new Set(visible.map(p => p.category))];

  const filtered = useMemo(() =>
    visible.filter(p =>
      (activeCategory === 'Todos' || p.category === activeCategory) &&
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [visible, activeCategory, searchQuery]);

  const handleLogoClick = () => {
    const n = logoClicks + 1;
    if (n === 3) { setShowAdmin(true); setLogoClicks(0); }
    else { setLogoClicks(n); setTimeout(() => setLogoClicks(0), 3000); }
  };

  const handleSelect = (p) => { setSelectedProduct(p); setModalOpen(true); };

  if (isLoading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-gradient-gold rounded-2xl flex items-center justify-center shadow-gold animate-float">
        <Sparkles size={28} className="text-gold-foreground" />
      </div>
      <p className="mt-6 text-gold font-bold text-xs animate-pulse">Carregando curadoria...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} onRefresh={loadData} />}
      {modalOpen && <ProductModal product={selectedProduct} onClose={() => setModalOpen(false)} />}

      {/* Click logo 3x = admin */}
      <div onClick={handleLogoClick} className="fixed top-5 left-6 z-[120] cursor-pointer" />

      <Hero productCount={visible.length} onLogin={() => setShowAdmin(true)} />

      <main id="vitrine" className="container scroll-mt-8 py-12 md:py-16">
        {/* Search */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input className="w-full bg-card border border-border rounded-xl p-3 pl-11 text-sm outline-none focus:border-primary transition-smooth shadow-card" placeholder="Buscar produtos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} count={filtered.length} />

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
              <ProductCard product={product} onClick={() => handleSelect(product)} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground py-20">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Nenhum produto nesta categoria ainda.</p>
            <p className="text-sm">Volte em breve! ✨</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
