import { useState } from "react";
import { getAIRecommendations, AIRecommendation } from "../services/aiApi";

export function useAISearch() {
    const [recommendations, setRecommendations] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchWithAI = async (query: string) => {
        try {
            setLoading(true);
            setError(null);

            console.log('AI 검색 시작:', query);

            const result = await getAIRecommendations(query);

            if (result.success) {
                setRecommendations(result.recommendations);
                console.log('AI 검색 결과 받음');
            } else {
                setError(result.error || 'AI 검색에 실패했습니다.');
            }    
        } catch (err: any) {
            console.error('AI 검색 오류:', err);
            setError(err.message || 'AI 검색 중 오류가 발생하였습니다.');
        } finally {
            setLoading(false);
        }
    };

    return { recommendations, loading, error, searchWithAI };
}