#!/bin/bash

# 나이 인증 ZK 회로 테스트 스크립트 (Barretenberg bb CLI 사용)
# Age Verification ZK Circuit Test Script (Using Barretenberg bb CLI)

echo "🔧 나이 인증 ZK 회로 테스트 시작 (Starting Age Verification ZK Circuit Test)"
echo "=================================================="

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 이전 빌드 결과 정리
echo -e "${YELLOW}0. 이전 빌드 결과 정리 (Clean Previous Build)${NC}"
echo "🧹 target 디렉토리 삭제 중..."
rm -rf target
echo -e "${GREEN}✅ 이전 빌드 결과 정리 완료${NC}"
echo ""

# 함수: 단계별 실행 및 결과 출력
run_step() {
    local step_name="$1"
    local command="$2"
    
    echo -e "${BLUE}📋 $step_name${NC}"
    echo "명령어: $command"
    echo "----------------------------------------"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ $step_name 성공${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ $step_name 실패${NC}"
        echo ""
        return 1
    fi
}

# 파일 존재 확인 함수
check_file() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $description: $file${NC}"
        ls -la "$file"
        echo ""
        return 0
    else
        echo -e "${RED}❌ $description 파일이 없습니다: $file${NC}"
        return 1
    fi
}

# Commitment 자동 계산 함수
calculate_and_update_commitment() {
    echo -e "${YELLOW}0.5. Commitment 자동 계산 및 업데이트 (Auto-Calculate Commitment)${NC}"
    
    # Prover.toml에서 age와 nonce 값 읽기
    local age=$(grep '^age' Prover.toml | cut -d'"' -f2)
    local nonce=$(grep '^nonce' Prover.toml | cut -d'"' -f2)
    
    echo "📖 Prover.toml에서 읽은 값들:"
    echo "   Age: $age"
    echo "   Nonce: $nonce"
    
    # src/main.nr의 테스트 함수 값 업데이트
    sed -i.bak "s/let age = [0-9]*;/let age = $age;/" src/main.nr
    sed -i.bak "s/let nonce = [0-9]*;/let nonce = $nonce;/" src/main.nr
    
    # 임시 빌드 및 테스트 실행으로 commitment 계산
    echo "🔧 Commitment 계산 중..."
    nargo build > /dev/null 2>&1
    
    # 테스트 실행하여 commitment 값 추출
    local test_output=$(nargo test test_calculate_commitment_from_prover_toml --show-output 2>&1)
    local commitment=$(echo "$test_output" | grep "COMMITMENT_VALUE=" | cut -d'=' -f2)
    
    if [ -n "$commitment" ]; then
        echo "✅ 계산된 Commitment: $commitment"
        
        # Prover.toml 업데이트
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/commitment = \"0x[0-9a-fA-F]*\"/commitment = \"$commitment\"/" Prover.toml
        else
            # Linux
            sed -i "s/commitment = \"0x[0-9a-fA-F]*\"/commitment = \"$commitment\"/" Prover.toml
        fi
        
        echo "✅ Prover.toml 업데이트 완료"
        echo ""
    else
        echo -e "${RED}❌ Commitment 계산 실패${NC}"
        echo "테스트 출력:"
        echo "$test_output"
        return 1
    fi
}

# 단계별 테스트 실행
echo -e "${YELLOW}1. 회로 빌드 (Circuit Build)${NC}"
if ! run_step "회로 빌드" "nargo build"; then
    echo -e "${RED}❌ 회로 빌드 실패. 테스트 중단.${NC}"
    exit 1
fi

# Commitment 자동 계산 및 업데이트
if ! calculate_and_update_commitment; then
    echo -e "${RED}❌ Commitment 계산 실패. 테스트 중단.${NC}"
    exit 1
fi

echo -e "${YELLOW}2. 단위 테스트 실행 (Unit Tests)${NC}"
if ! run_step "단위 테스트" "nargo test"; then
    echo -e "${RED}❌ 단위 테스트 실패. 테스트 중단.${NC}"
    exit 1
fi

echo -e "${YELLOW}3. 회로 실행 및 witness 생성 (Circuit Execution & Witness Generation)${NC}"
if ! run_step "회로 실행" "nargo execute"; then
    echo -e "${RED}❌ 회로 실행 실패. 테스트 중단.${NC}"
    exit 1
fi

# 생성된 파일들 확인
echo -e "${PURPLE}📁 생성된 파일들 확인:${NC}"
check_file "./target/circuit.json" "회로 파일"
check_file "./target/circuit.gz" "Witness 파일"

echo -e "${YELLOW}4. Barretenberg를 사용한 증명 생성 (Proof Generation with bb)${NC}"
if ! run_step "증명 생성" "bb prove -b ./target/circuit.json -w ./target/circuit.gz -o ./target --oracle_hash keccak  --output_format bytes_and_fields"; then
    echo -e "${RED}❌ 증명 생성 실패. 테스트 중단.${NC}"
    exit 1
fi

# 증명 파일 확인
echo -e "${PURPLE}📁 증명 파일들 확인:${NC}"
check_file "./target/proof" "증명 파일"
check_file "./target/public_inputs" "Public Inputs 파일"

echo -e "${YELLOW}5. 검증 키 생성 (Verification Key Generation)${NC}"
if ! run_step "검증키 생성" "bb write_vk -b ./target/circuit.json -o ./target --oracle_hash keccak"; then
    echo -e "${RED}❌ 검증키 생성 실패. 테스트 중단.${NC}"
    exit 1
fi

# 검증키 파일 확인
echo -e "${PURPLE}📁 검증키 파일 확인:${NC}"
check_file "./target/vk" "검증키 파일"

echo -e "${YELLOW}6. Solidity Verifier 생성 (Solidity Verifier Generation)${NC}"
if ! run_step "Solidity Verifier 생성" "bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol"; then
    echo -e "${RED}❌ Solidity Verifier 생성 실패. 테스트 중단.${NC}"
    exit 1
fi

# Solidity verifier 파일 확인
echo -e "${PURPLE}📁 Solidity Verifier 파일 확인:${NC}"
check_file "./target/Verifier.sol" "Solidity Verifier"

# contracts 디렉토리로 Verifier.sol 복사
echo -e "${BLUE}📋 contracts 디렉토리로 Verifier.sol 복사 중...${NC}"
if [ -f "./target/Verifier.sol" ]; then
    cp "./target/Verifier.sol" "../contracts/Verifier.sol"
    echo -e "${GREEN}✅ Verifier.sol이 ../contracts/Verifier.sol로 복사되었습니다${NC}"
else
    echo -e "${RED}❌ ./target/Verifier.sol 파일을 찾을 수 없습니다${NC}"
fi
echo ""

echo -e "${YELLOW}7. 증명 검증 (Proof Verification)${NC}"
if ! run_step "증명 검증" "bb verify -k ./target/vk -p ./target/proof -i ./target/public_inputs --oracle_hash keccak"; then
    echo -e "${RED}❌ 증명 검증 실패. 테스트 중단.${NC}"
    exit 1
fi

# 사용된 값들 출력
echo -e "${PURPLE}📊 사용된 값들:${NC}"
final_age=$(grep '^age' Prover.toml | cut -d'"' -f2)
final_nonce=$(grep '^nonce' Prover.toml | cut -d'"' -f2)
final_commitment=$(grep '^commitment' Prover.toml | cut -d'"' -f2)
final_min_age=$(grep '^min_age' Prover.toml | cut -d'"' -f2)

echo "• Age: $final_age"
echo "• Nonce: $final_nonce"
echo "• Commitment: $final_commitment"
echo "• Min Age: $final_min_age"
echo ""

# 모든 테스트 완료
echo "=================================================="
echo -e "${GREEN}🎉 모든 테스트 완료! 나이 인증 ZK 회로가 정상적으로 작동합니다.${NC}"
echo ""
echo -e "${BLUE}📊 테스트 결과 요약:${NC}"
echo "✅ 이전 빌드 결과 정리: 성공"
echo "✅ 회로 빌드: 성공"
echo "✅ Commitment 자동 계산: 성공"
echo "✅ 단위 테스트: 성공"
echo "✅ 회로 실행 및 witness 생성: 성공"
echo "✅ 증명 생성 (bb prove): 성공"
echo "✅ 검증키 생성 (bb write_vk): 성공"
echo "✅ Solidity Verifier 생성 (bb write_solidity_verifier): 성공"
echo "✅ 증명 검증 (bb verify): 성공"
echo ""
echo -e "${BLUE}💡 사용 결과:${NC}"
echo "• ${final_age}세 사용자가 ${final_min_age}세 이상임을 증명"
echo "• Private inputs: age=${final_age}, nonce=${final_nonce}"
echo "• Public inputs: commitment=${final_commitment}, min_age=${final_min_age}"
echo "• 결과: Pass (${final_min_age}세 이상)"
echo ""
echo -e "${PURPLE}📁 생성된 파일들:${NC}"
echo "• ./target/circuit.json - 회로 파일"
echo "• ./target/circuit.gz - Witness 파일"
echo "• ./target/proof - 증명 파일"
echo "• ./target/public_inputs - Public Inputs 파일"
echo "• ./target/vk - 검증키 파일"
echo "• ./target/Verifier.sol - Solidity Verifier 컨트랙트"
echo ""
echo -e "${GREEN}🔐 Zero-Knowledge 증명이 성공적으로 생성되고 검증되었습니다!${NC}"
echo ""
echo -e "${BLUE}📋 Solidity Verifier 사용 안내:${NC}"
echo "• ./target/Verifier.sol을 RemixIDE에서 컴파일 가능"
echo "• 이더리움 테스트넷에 배포하여 온체인 검증 가능"
echo "• 생성된 proof와 public_inputs를 사용하여 검증 함수 호출"
echo "• 자세한 내용은 Noir 공식 문서를 참고하세요" 