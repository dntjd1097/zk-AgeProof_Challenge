export const Instructions = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                사용 방법
            </h2>
            <div className="space-y-2 text-gray-600">
                <p>
                    1. 실제 나이, 논스(랜덤 숫자), 최소 나이
                    요구사항을 입력하세요.
                </p>
                <p>
                    2. '증명 생성' 버튼을 클릭하여 ZK 증명을
                    생성하세요.
                </p>
                <p>
                    3. '온체인 검증' 버튼을 클릭하여 Base
                    Sepolia 네트워크에서 증명을 검증하세요.
                </p>
                <p>
                    4. 검증 결과를 확인하여 나이 조건을
                    만족하는지 확인하세요.
                </p>
            </div>
        </div>
    );
};
