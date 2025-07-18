interface ProofResultsProps {
    commitment: string;
    proof: string;
    publicInputs: string[];
    localVerificationResult: boolean | null;
    verificationResult: boolean | null;
    error: string;
    logs: string[];
    isVerifying: boolean;
    onVerify: () => void;
}

export const ProofResults = ({
    commitment,
    proof,
    publicInputs,
    localVerificationResult,
    verificationResult,
    error,
    logs,
    isVerifying,
    onVerify,
}: ProofResultsProps) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                증명 결과
            </h2>

            {/* 로그 표시 */}
            {logs.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        📋 실행 로그
                    </h3>
                    <div className="bg-gray-900 text-green-400 p-3 rounded-lg max-h-32 overflow-y-auto font-mono text-sm">
                        {logs.map((log, index) => (
                            <div
                                key={index}
                                className="mb-1"
                            >
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 로컬 검증 결과 */}
            {localVerificationResult !== null && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        🔍 로컬 검증 결과
                    </h3>
                    <div
                        className={`p-3 rounded-lg ${
                            localVerificationResult
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {localVerificationResult
                            ? '✅ 로컬 증명이 유효합니다'
                            : '❌ 로컬 증명이 유효하지 않습니다'}
                    </div>
                </div>
            )}

            {commitment && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        🔒 Commitment
                    </h3>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        <code className="text-sm break-all text-gray-800">
                            {commitment}
                        </code>
                    </div>
                </div>
            )}

            {proof && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        🔐 ZK Proof
                    </h3>
                    <div className="bg-gray-100 p-3 rounded-lg max-h-32 overflow-y-auto">
                        <code className="text-sm break-all text-gray-800">
                            {/* {proof.substring(0, 200)}... */}
                            {proof}
                        </code>
                    </div>
                </div>
            )}

            {publicInputs.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        📤 Public Inputs
                    </h3>
                    <div className="bg-gray-100 p-3 rounded-lg">
                        {publicInputs.map(
                            (input, index) => (
                                <div
                                    key={index}
                                    className="mb-2"
                                >
                                    <code className="text-sm break-all text-gray-800">
                                        {index}: {input}
                                    </code>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {proof && localVerificationResult === true && (
                <div className="mb-6">
                    <button
                        onClick={onVerify}
                        disabled={isVerifying}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isVerifying
                            ? '검증 중...'
                            : '🌐 검증'}
                    </button>
                </div>
            )}

            {verificationResult !== null && (
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                        🌐 검증 결과
                    </h3>
                    <div
                        className={`p-3 rounded-lg ${
                            verificationResult
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {verificationResult
                            ? '✅ 증명이 유효합니다'
                            : '❌ 증명이 유효하지 않습니다'}
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        <strong>오류:</strong> {error}
                    </div>
                </div>
            )}
        </div>
    );
};
