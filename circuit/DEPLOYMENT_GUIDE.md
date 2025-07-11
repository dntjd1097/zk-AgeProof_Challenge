# 🚀 Base Sepolia ZK Age Verification 배포 가이드

## 📋 사전 준비사항

### 1. 환경 설정

```bash
# Node.js 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
PRIVATE_KEY=0x여러분의_프라이빗_키
BASE_SEPOLIA_RPC=https://sepolia.base.org
BASESCAN_API_KEY=여러분의_베이스스캔_API_키
```

### 2. Base Sepolia 테스트넷 설정

-   네트워크: Base Sepolia
-   Chain ID: 84532
-   RPC URL: https://sepolia.base.org
-   심볼: ETH
-   탐색기: https://sepolia.basescan.org

### 3. 테스트넷 ETH 획득

-   Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
-   또는 다른 Base Sepolia 테스트넷 faucet 사용

## 🔧 배포 과정

### 1단계: ZK 증명 생성 (이미 완료)

```bash
# 회로 빌드
nargo build

# 증명 생성
nargo execute
bb prove -b ./target/circuit.json -w ./target/circuit.gz -o ./target

# 검증
bb verify -k ./target/vk -p ./target/proof -i ./target/public_inputs

# Solidity 검증자 생성
bb write_solidity_verifier -k ./target/vk -o ./target/Verifier.sol
```

### 2단계: 스마트 컨트랙트 배포

```bash
# 컨트랙트 컴파일
npm run compile

# Base Sepolia에 배포
npm run deploy
```

### 3단계: 컨트랙트 검증 (옵션)

```bash
# 베이스스캔에서 컨트랙트 소스 코드 검증
npm run verify -- <컨트랙트_주소>
```

## 📄 배포된 컨트랙트 구조

### 1. UltraVerifier

-   **역할**: ZK 증명 검증
-   **생성**: Noir bb 도구로 자동 생성
-   **파일**: `target/Verifier.sol`

### 2. AgeVerificationSystem

-   **역할**: 나이 인증 시스템 메인 컨트랙트
-   **기능**:
    -   `verifyAge()`: ZK 증명으로 나이 인증
    -   `getVerificationStatus()`: 인증 상태 조회
    -   `isAdultVerified()`: 성인 인증 확인

### 3. AdultOnlyService

-   **역할**: 성인 전용 서비스 예제
-   **기능**:
    -   `accessAdultService()`: 성인 인증 후 서비스 이용
    -   `requireAdultVerification` modifier

## 🎯 사용 방법

### 1. 프론트엔드에서 ZK 증명 생성

```javascript
// 사용자 나이와 nonce로 commitment 생성
const age = 25;
const nonce = Math.floor(Math.random() * 1000000);
const commitment = pedersen_hash([age, nonce]);

// Noir 회로로 증명 생성
const proof = await generateProof({
    age,
    nonce,
    commitment,
    min_age: 20,
});
```

### 2. 블록체인에서 나이 인증

```javascript
// AgeVerificationSystem 컨트랙트와 상호작용
const publicInputs = [commitment, 20]; // [commitment, min_age]
await ageVerificationSystem.verifyAge(proof, publicInputs);
```

### 3. 성인 서비스 이용

```javascript
// 인증 후 성인 전용 서비스 이용
await adultOnlyService.accessAdultService();
```

## 🔍 현재 증명 데이터 정보

### 테스트 데이터 (Prover.toml)

```toml
age = "50"
nonce = "12345"
commitment = "0x25ea1eddc3c8c883c80e5e5cd735ccfb50d7d447513bf63fa86afab88c8c3b2d"
min_age = "20"
```

### 생성된 파일들

-   `target/proof`: ZK 증명 데이터
-   `target/public_inputs`: 공개 입력 데이터
-   `target/vk`: 검증키

## 🔐 보안 주의사항

1. **Private Key 보안**: 절대 프라이빗 키를 코드에 하드코딩하지 마세요
2. **환경 변수**: `.env` 파일은 `.gitignore`에 포함하세요
3. **테스트넷 전용**: 이 설정은 테스트넷 전용입니다
4. **nonce 관리**: 실제 운영에서는 nonce를 안전하게 관리하세요

## 🆘 문제 해결

### 컴파일 에러

```bash
# 캐시 정리
rm -rf cache artifacts
npm run compile
```

### 배포 실패

```bash
# 가스 가격 확인
# 계정 잔고 확인
# 네트워크 연결 확인
```

### 검증 실패

```bash
# 증명 데이터 재생성
bb prove -b ./target/circuit.json -w ./target/circuit.gz -o ./target
```

## 🌐 유용한 링크

-   [Base Sepolia 탐색기](https://sepolia.basescan.org)
-   [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
-   [Noir 공식 문서](https://noir-lang.org)
-   [Hardhat 문서](https://hardhat.org/docs)

## 📞 지원

문제가 발생하면 GitHub Issues에 문의하세요!
