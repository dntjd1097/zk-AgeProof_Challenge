export const TroubleshootingGuide = () => {
    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-amber-800 mb-4">
                🔧 검증 오류 해결 가이드
            </h2>

            <div className="space-y-4 text-sm text-amber-700">
                <div>
                    <h3 className="font-medium mb-2">
                        🔍 가능한 원인들:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>
                            컨트랙트 버전이 회로와 일치하지
                            않음
                        </li>
                        <li>
                            증명 길이가 올바르지 않음 (예상:
                            14082 bytes)
                        </li>
                        <li>
                            공개 입력 개수가 잘못됨 (예상:
                            2개)
                        </li>
                        <li>생성된 증명이 유효하지 않음</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-medium mb-2">
                        🛠️ 해결 방법:
                    </h3>
                    <ol className="list-decimal list-inside space-y-1 ml-4">
                        <li>
                            브라우저 콘솔을 열어 상세한
                            로그를 확인하세요
                        </li>
                        <li>
                            증명 생성 후 길이가 정확한지
                            확인하세요
                        </li>
                        <li>
                            다른 나이/논스 값으로 다시
                            시도해보세요
                        </li>
                        <li>
                            문제가 지속되면 새로운 컨트랙트
                            배포를 고려하세요
                        </li>
                    </ol>
                </div>

                <div>
                    <h3 className="font-medium mb-2">
                        ⚠️ 주의사항:
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>
                            나이는 1-120 사이의 값을
                            입력하세요
                        </li>
                        <li>논스는 양수를 입력하세요</li>
                        <li>
                            최소 나이는 실제 나이보다 작거나
                            같아야 합니다
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
