interface EmptyState {
    message?: string;
}

export default function EmptyState({ message = "검색 결과가 없습니다." }: EmptyState) {
    return (
        <div style={{ textAlign: 'center', padding: '20px'}}>
            <p>{message}</p>
        </div>
    );
}