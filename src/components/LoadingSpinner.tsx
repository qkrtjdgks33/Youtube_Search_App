interface LoadingSpinner {
    message?: string;
}

export default function LoadingSpinner({ message = "검색중 입니다.." }: LoadingSpinner) {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>{message}</p>
        </div>
    );
};