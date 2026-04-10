-- Schema para o banco de dados Neon (PostgreSQL)

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price VARCHAR(50) NOT NULL,
    image_url TEXT NOT NULL,
    affiliate_link TEXT NOT NULL,
    category VARCHAR(100),
    tier VARCHAR(50), -- budget, balanced, performance
    tags TEXT[], -- array de tags como ['oleosa', 'seca', 'acne']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed de exemplo (Nicho Beleza)
INSERT INTO products (title, price, image_url, affiliate_link, category, tier, tags) VALUES
('Sérum Facial CeraVe Ácido Hialurônico', '98,90', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1974&auto=format&fit=crop', '#', 'Skincare', 'budget', ARRAY['seca', 'mista', 'hidratacao']),
('Kit Lancôme Advanced Génifique', '450,00', 'https://images.unsplash.com/photo-1617897903246-7392ce73ec7c?q=80&w=1974&auto=format&fit=crop', '#', 'Skincare', 'performance', ARRAY['antienvelhecimento', 'brilho']),
('Protetor Solar La Roche-Posay Anthelios 60', '89,00', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop', '#', 'Proteção', 'balanced', ARRAY['oleosa', 'mista']),
('Gel de Limpeza Bioderma Sebium', '75,00', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d52d?q=80&w=1974&auto=format&fit=crop', '#', 'Limpeza', 'budget', ARRAY['oleosa', 'acne']);
                                                                                                                                                                                                                                                                                                                                        