import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Wallet, PlusCircle, History, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const handleAddExpense = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Extract info from: "${input}". Return ONLY JSON: {"amount": number, "category": string, "label": string}. Categories: Food, Bills, Fun, Transport.`;
      const result = await model.generateContent(prompt);
      const json = JSON.parse(result.response.text().replace(/```json|```/g, ""));
      setData([{ ...json, id: Date.now() }, ...data]);
      setInput("");
    } catch (e) { alert("Check your Gemini API Key!"); }
    setLoading(false);
  };

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a' }}><Wallet /> Dhanflow 2.0</h1>
        <div><p>Total Spent</p><h2>₹{total}</h2></div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <section style={{ background: '#f9fafb', padding: '20px', borderRadius: '15px' }}>
          <h3><PlusCircle size={18}/> Add with AI</h3>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Spent 500 on dinner..." style={{ width: '100%', height: '80px', marginBottom: '10px' }} />
          <button onClick={handleAddExpense} disabled={loading} style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px' }}>
            {loading ? "Analyzing..." : "Track Expense"}
          </button>
        </section>

        <section style={{ background: '#f9fafb', padding: '20px', borderRadius: '15px' }}>
          <h3><BarChart3 size={18}/> Spending</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data}><XAxis dataKey="category" /><Tooltip /><Bar dataKey="amount" fill="#16a34a" /></BarChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section style={{ marginTop: '30px' }}>
        <h3><History size={18}/> Recent History</h3>
        {data.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
            <span>{item.label} ({item.category})</span>
            <span style={{ color: 'red', fontWeight: 'bold' }}>-₹{item.amount}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
