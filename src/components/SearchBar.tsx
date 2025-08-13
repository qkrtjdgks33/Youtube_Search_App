import { useMemo, useState } from "react";

export default function SearchBar({ onSearch, loading=false}:{
  onSearch: (q: string) => void; loading?: boolean;
}) {
  const [keyword, setKeyword] = useState("");
  const canSearch = useMemo(() => keyword.trim().length >=2, [keyword]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSearch) onSearch(keyword.trim());
  };

  return (
    <form onSubmit={submit}>
      <input
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      placeholder="검색어를 입력하세요 (2글자 이상)"
      disabled={loading}
      style={{ padding: "8px", marginRight: "8px" }}
      />
      <button type="submit" disabled={!canSearch || loading} style={{ padding: "8px 16px" }}>
        {loading ? "검색중입니다..." : "검색"}
        </button>
    </form>
  )
}
