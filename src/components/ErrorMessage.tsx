interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export default function ErrorMessage({ message,onRetry }: ErrorMessageProps) {
    return (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
            <p>{message}</p>
            {onRetry && (
                <button onClick={onRetry} style={{ marginTop: '10px'}}>
                    다시시도
                </button>
            )}
        </div>
    );
};