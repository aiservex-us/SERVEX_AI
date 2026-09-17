import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX, FiShield } from 'react-icons/fi';
import { supabase } from '../../../lib/supabaseClient';

const ConfigXML = ({ externalSearchSKU }) => {
    const [xmlDoc, setXmlDoc] = useState(null);
    const [products, setProducts] = useState([]);
    const [selectedSKU, setSelectedSKU] = useState("");
    const [loadingXML, setLoadingXML] = useState(true);
    const [selectedConfigs, setSelectedConfigs] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchXML = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return setLoadingXML(false);
                const { data, error } = await supabase.from('ClientsSERVEX_WBTX').select('xml_raw').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
                if (error) throw error;
                if (data?.xml_raw) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data.xml_raw, "text/xml");
                    setXmlDoc(doc);
                    const codes = [...doc.getElementsByTagName("Product")].map(p => p.getElementsByTagName("Code")[0]?.textContent).filter(Boolean);
                    setProducts(codes);
                }
            } catch (err) { console.error("Error XML:", err); }
            finally { setLoadingXML(false); }
        };
        fetchXML();
    }, []);

    // Escuchar cambios del CSV
    useEffect(() => {
        if (externalSearchSKU) handleSearch(externalSearchSKU, true);
    }, [externalSearchSKU]);

    const handleSearch = (sku, isAuto = false) => {
        if (!xmlDoc || !sku) return;
        setSelectedConfigs(prev => {
            if (prev.find(c => c.sku === sku)) return prev;
            const productNode = [...xmlDoc.getElementsByTagName("Product")].find(p => p.getElementsByTagName("Code")[0]?.textContent === sku);
            if (!productNode) return prev;

            const featureNodes = [...productNode.getElementsByTagName("Feature")];
            const featureRefs = [...productNode.getElementsByTagName("FeatureRef")];
            const allFeatures = [...featureNodes.map(f => ({ node: f, type: 'direct' })), ...featureRefs.map(r => ({ code: r.textContent.trim(), type: 'ref' }))];

            const resolvedFeatures = allFeatures.map(item => {
                let fDetail = item.type === 'ref' ? [...xmlDoc.getElementsByTagName("Feature")].find(f => f.getElementsByTagName("Code")[0]?.textContent === item.code) : item.node;
                if (!fDetail) return null;
                const fCode = fDetail.getElementsByTagName("Code")[0]?.textContent;
                const fName = fDetail.querySelector("Description")?.textContent || fCode;
                const options = [...fDetail.getElementsByTagName("Option")].map(o => ({
                    code: o.getElementsByTagName("Code")[0]?.textContent,
                    desc: o.querySelector("Description")?.textContent || "Opción",
                    price: parseFloat(o.querySelector("OptionPrice > Value")?.textContent || 0)
                })).filter(opt => opt.price > 0);
                return options.length > 0 ? { id: fCode, name: fName, options } : null;
            }).filter(Boolean);

            const newConfig = {
                sku,
                name: productNode.querySelector("Description")?.textContent || "Modelo",
                basePrice: parseFloat(productNode.querySelector("Price > Value")?.textContent || 0),
                selections: {},
                features: resolvedFeatures
            };
            if (!isAuto) { setExpandedIndex(0); setShowDropdown(false); setSelectedSKU(""); }
            return [newConfig, ...prev];
        });
    };

    const calculateProductTotal = (config) => {
        return config.basePrice + Object.values(config.selections).reduce((a, b) => a + b.price, 0);
    };

    if (loadingXML) return <div className="p-10 text-[10px] font-bold text-[#464775]">LOADING PIM...</div>;

    return (
        <div className="flex-grow h-full bg-[#F9F9F9] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-white border-b shrink-0" ref={dropdownRef}>
                <div className="relative">
                    <div className="flex items-center bg-[#F3F2F1] rounded px-3 border-b-2 border-transparent focus-within:border-[#464775] transition-all">
                        <FiSearch className="text-gray-400" size={14} />
                        <input type="text" placeholder="AÑADIR SKU..." className="w-full p-2.5 bg-transparent outline-none text-[11px] font-bold uppercase"
                            value={selectedSKU} onChange={(e) => { setSelectedSKU(e.target.value.toUpperCase()); setShowDropdown(true); }} />
                    </div>
                    {showDropdown && selectedSKU && (
                        <div className="absolute w-full mt-1 bg-white shadow-2xl rounded border z-50 max-h-60 overflow-auto border-[#EDEBE9]">
                            {products.filter(p => p.includes(selectedSKU)).slice(0, 8).map(p => (
                                <div key={p} onClick={() => handleSearch(p)} className="p-3 hover:bg-[#F3F2F1] cursor-pointer text-[10px] font-black border-b last:border-none text-[#464775]">
                                    {p}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-3 space-y-3">
                {selectedConfigs.length > 0 ? (
                    selectedConfigs.map((config, pIdx) => (
                        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} key={pIdx} className="bg-white border border-[#EDEBE9] rounded-lg shadow-sm overflow-hidden">
                            <div onClick={() => setExpandedIndex(expandedIndex === pIdx ? null : pIdx)}
                                className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${expandedIndex === pIdx ? 'bg-[#464775] text-white' : 'hover:bg-gray-50'}`}>
                                <div><p className="text-[10px] font-black leading-none">{config.sku}</p><p className={`text-[9px] mt-1 font-bold ${expandedIndex === pIdx ? 'text-white/70' : 'text-[#464775]'}`}>${calculateProductTotal(config).toLocaleString()}</p></div>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedConfigs(prev => prev.filter((_, i) => i !== pIdx)); }} className="p-1 hover:bg-black/10 rounded"><FiX size={12} /></button>
                            </div>
                            {expandedIndex === pIdx && (
                                <div className="p-3 space-y-4 border-t border-[#EDEBE9] bg-white">
                                    {config.features.map(feat => (
                                        <div key={feat.id} className="space-y-1">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{feat.name}</span>
                                            <div className="grid gap-1">
                                                {feat.options.map((opt, i) => (
                                                    <button key={i} onClick={() => {
                                                        const nc = [...selectedConfigs];
                                                        nc[pIdx].selections[feat.id] = opt;
                                                        setSelectedConfigs(nc);
                                                    }} className={`p-2.5 text-left text-[9px] rounded border transition-all flex justify-between items-center ${config.selections[feat.id]?.code === opt.code ? 'border-[#464775] bg-[#F3F2F1] font-bold shadow-sm' : 'border-[#F0F0F0] hover:bg-gray-50'}`}>
                                                        <span className="pr-2">{opt.desc}</span><span className="text-[#464775] font-black">+$ {opt.price}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-10">
                        <FiShield size={40} className="mb-4 text-[#464775]" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#464775]">Empty PIM Panel</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConfigXML;