
import React from 'react';
import { Asset } from '../types';
import { ShoppingCart, Star, Tag, Download, Eye } from 'lucide-react';

const mockAssets: Asset[] = [
  { id: 'a1', name: 'Cyberpunk City Kit', type: '3D Model', price: '$49.99', rating: 4.8, image: 'https://picsum.photos/300/200?seed=asset1' },
  { id: 'a2', name: 'Ambient Space Vol. 1', type: 'Audio', price: 'Free', rating: 4.5, image: 'https://picsum.photos/300/200?seed=asset2' },
  { id: 'a3', name: 'Master Shaders Pro', type: 'Script', price: '$12.00', rating: 4.9, image: 'https://picsum.photos/300/200?seed=asset3' },
  { id: 'a4', name: '8K Earth Textures', type: 'Texture', price: '$15.50', rating: 4.2, image: 'https://picsum.photos/300/200?seed=asset4' },
  { id: 'a5', name: 'Sci-Fi UI Pack', type: 'Texture', price: '$24.99', rating: 4.7, image: 'https://picsum.photos/300/200?seed=asset5' },
  { id: 'a6', name: 'Advanced AI Toolkit', type: 'Script', price: '$89.00', rating: 5.0, image: 'https://picsum.photos/300/200?seed=asset6' },
  { id: 'a7', name: 'Mecha Robot Pack', type: '3D Model', price: '$35.00', rating: 4.4, image: 'https://picsum.photos/300/200?seed=asset7' },
  { id: 'a8', name: 'Nature Foliage', type: '3D Model', price: 'Free', rating: 4.6, image: 'https://picsum.photos/300/200?seed=asset8' },
];

const AssetStore: React.FC = () => {
  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="relative h-64 rounded-3xl overflow-hidden group">
        <img 
          src="https://picsum.photos/1200/400?seed=hero" 
          alt="Featured Asset" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-center p-12">
          <span className="text-cyan-400 font-bold text-sm tracking-widest uppercase mb-2">Featured Collection</span>
          <h2 className="text-4xl font-bold max-w-lg leading-tight">Hyper-Realistic Cyber Environments</h2>
          <p className="text-slate-300 mt-4 max-w-md">Get the modular asset pack used in top-tier AAA titles. Optimized for real-time engines.</p>
          <div className="mt-8 flex gap-4">
            <button className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20">
              Browse Pack
            </button>
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-bold transition-all border border-white/10">
              Watch Trailer
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Trending Assets</h3>
        <div className="flex gap-2">
          {['All', '3D Models', 'Materials', 'Audio', 'Scripts'].map((cat, i) => (
            <button 
              key={i}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${i === 0 ? 'bg-cyan-500 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockAssets.map((asset) => (
          <div key={asset.id} className="group glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col hover:border-slate-700 transition-all">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={asset.image} 
                alt={asset.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="w-10 h-10 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <Eye size={18} />
                </button>
                <button className="w-10 h-10 bg-cyan-500 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  <ShoppingCart size={18} />
                </button>
              </div>
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                {asset.type}
              </div>
            </div>
            
            <div className="p-4 flex-1">
              <h4 className="font-bold text-slate-100 mb-1 truncate">{asset.name}</h4>
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold">{asset.rating}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <span className="text-lg font-bold text-cyan-400">{asset.price}</span>
                <button className="p-2 text-slate-400 hover:text-emerald-400 transition-colors">
                  {asset.price === 'Free' ? <Download size={20} /> : <Tag size={20} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetStore;
