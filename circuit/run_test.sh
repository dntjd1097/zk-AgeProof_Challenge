#!/bin/bash

# 간단한 실행 스크립트
echo "🚀 나이 인증 ZK 회로 테스트 실행"
echo "================================="

# 이전 빌드 결과 정리
echo "🧹 이전 빌드 결과 정리 중..."
rm -rf target
echo ""

# 실행 권한 확인 및 부여
if [ ! -x "test_circuit.sh" ]; then
    echo "📝 실행 권한 부여 중..."
    chmod +x test_circuit.sh
fi

# 메인 테스트 스크립트 실행
echo "🔧 메인 테스트 스크립트 실행 중..."
echo ""
./test_circuit.sh 