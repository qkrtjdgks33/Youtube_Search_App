import { useState } from "react";

export {}

interface AISearchBarProps {
    onAISearch: (query: string) => void;
    loading: boolean;
}

export default function AISearchBar({ onAISearch, loading}: AISearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onAISearch(query);
        }
    };

    return (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px'}}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333'}}>🤖 AI로 노래 찾기</h3>
            <form onSubmit={handleSubmit}>
                <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 최근 유행하는 노래를 10곡 알려줘"
                style={{
                    width: '100%',
                    padding: '10px',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '16px'
                }}
                />
                <button
                type="submit"
                disabled={loading}
                style={{
                    padding: '10px 16px',
                    backgroundColor: loading ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? "not-allowed" : 'pointer',
                    fontSize: '16px'
                }}
                >
                    {loading ? "검색중..." : "검색"}
                </button>
            </form>
        </div>
    );

}
