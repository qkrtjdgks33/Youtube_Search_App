// AI 검색 API 서비스
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export interface AIRecommendation {
    success: boolean;
    recommendations: string;
    error?: string;
}

export async function getAIRecommendations(query:string): Promise<AIRecommendation> {
    try {
        console.log('🌐 AI 검색 요청:', query);

        const response = await fetch(`${BACKEND_URL}/api/ai-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error(`AI API 오류: ${response.status}`);
        }

        const data = await response.json();
        console.log('AI 검색 응답 수신:', data);

        return data;
    } catch (error) {
        console.error('AI 검색 오류:', error);
        throw error;
    }
}