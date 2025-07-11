# 나이 인증 ZK 회로 (Age Verification ZK Circuit)

## 📋 프로젝트 개요

이 프로젝트는 Noir를 사용하여 구현된 나이 인증 Zero-Knowledge 증명 회로입니다. 사용자가 실제 나이를 공개하지 않고도 최소 나이 요구사항(20세)을 만족함을 증명할 수 있습니다.

## 🔧 요구사항

-   [Noir](https://noir-lang.org/) (nargo)
-   [Barretenberg](https://github.com/AztecProtocol/barretenberg) (bb CLI)

## 🏗️ 회로 설계

### Public Inputs (공개 입력)

-   `commitment`: 나이 정보의 커밋먼트 (Hash(age || nonce))
-   `min_age`: 최소 나이 요구사항 (20세)

### Private Inputs (비공개 입력)

-   `age`: 실제 나이
-   `nonce`: 커밋먼트 생성용 임의 값 (솔트)

### 검증 로직

1. **커밋먼트 검증**: `commitment = pedersen_hash([age, nonce])`
2. **나이 조건 검증**: `age >= min_age`

## 🚀 사용 방법

### 1. 자동 테스트 실행 (권장)

```bash
# 간단한 실행 (commitment 자동 계산)
./run_test.sh

# 또는 직접 실행
chmod +x test_circuit.sh
./test_circuit.sh
```

### 2. 나이 변경하여 테스트

단순히 `Prover.toml`의 `age` 값만 변경하면 됩니다:

```toml
# Prover.toml
age = "30"  # 원하는 나이로 변경
nonce = "12345"  # 원하는 nonce 값으로 변경

# commitment는 자동으로 계산됩니다!
commitment = "0x0000000000000000000000000000000000000000000000000000000000000000"
min_age = "20"
```

### 3. 수동 실행 (고급 사용자)

```bash
# 1. 회로 빌드
nargo build

# 2. 단위 테스트
nargo test

# 3. 회로 실행 (witness 생성)
nargo execute

# 4. 증명 생성 (Barretenberg 사용)
bb prove -b ./target/circuit.json -w ./target/circuit.gz -o ./target

# 5. 검증키 생성
bb write_vk -b ./target/circuit.json -o ./target

# 6. 증명 검증
bb verify -k ./target/vk -p ./target/proof -i ./target/public_inputs
```

## 🔄 자동 Commitment 계산 시스템

### 특징

-   **자동 계산**: `age`와 `nonce` 값을 기반으로 commitment 자동 계산
-   **동적 업데이트**: `Prover.toml`의 commitment 값 자동 업데이트
-   **오류 방지**: 수동 계산으로 인한 실수 방지

### 작동 원리

1. 스크립트가 `Prover.toml`에서 `age`와 `nonce` 값을 읽음
2. `pedersen_hash([age, nonce])` 계산
3. 계산된 값으로 `Prover.toml`의 `commitment` 필드 자동 업데이트
4. 업데이트된 값으로 ZK 증명 생성 및 검증

## 📁 파일 구조

```
circuit/
├── src/
│   └── main.nr              # 메인 회로 코드
├── Nargo.toml               # Noir 프로젝트 설정
├── Prover.toml              # 증명자 입력 데이터 (age, nonce만 설정)
├── test_circuit.sh          # 자동 테스트 스크립트
├── run_test.sh              # 간단한 실행 스크립트
├── README.md                # 이 파일
└── target/                  # 빌드 결과 및 증명 파일들
    ├── circuit.json         # 회로 파일
    ├── circuit.gz           # Witness 파일
    ├── proof                # 증명 파일
    ├── public_inputs        # Public Inputs 파일
    └── vk                   # 검증키 파일
```

## 💡 예제 사용 시나리오

### 시나리오 1: 21세 사용자의 성인 인증

**입력 데이터** (`Prover.toml`):

```toml
# Private inputs (witness)
age = "21"
nonce = "12345"

# Public inputs (commitment는 자동 계산됨)
commitment = "0x0000000000000000000000000000000000000000000000000000000000000000"
min_age = "20"
```

**결과**: ✅ Pass (20세 이상)

### 시나리오 2: 30세 사용자 테스트

**입력 데이터** (`Prover.toml`):

```toml
age = "30"
nonce = "54321"
commitment = "0x0000000000000000000000000000000000000000000000000000000000000000"
min_age = "20"
```

**결과**: ✅ Pass (20세 이상)

### 시나리오 3: 19세 사용자 (실패 케이스)

**입력 데이터** (`Prover.toml`):

```toml
age = "19"
nonce = "99999"
commitment = "0x0000000000000000000000000000000000000000000000000000000000000000"
min_age = "20"
```

**결과**: ❌ Fail (20세 미만)

## 🔐 Zero-Knowledge 증명의 특징

-   **프라이버시**: 실제 나이를 공개하지 않음
-   **검증 가능**: 최소 나이 요구사항 만족 여부를 수학적으로 증명
-   **신뢰성**: 위조 불가능한 암호학적 증명
-   **자동화**: Commitment 값 자동 계산으로 사용자 편의성 향상

## 🧪 테스트 케이스

-   `test_valid_age`: 25세 → 20세 이상 (성공)
-   `test_exact_min_age`: 20세 → 20세 이상 (성공)
-   `test_invalid_age_should_fail`: 19세 → 20세 미만 (실패)
-   `test_invalid_commitment_should_fail`: 잘못된 커밋먼트 (실패)
-   `test_calculate_commitment_from_prover_toml`: 자동 commitment 계산 (스크립트 전용)

## 🔧 문제 해결

### 일반적인 문제들

1. **bb 명령어를 찾을 수 없음**

    - Barretenberg 설치 확인
    - PATH 환경변수 확인

2. **파일 권한 오류**

    - `chmod +x *.sh`로 실행 권한 부여

3. **Commitment 계산 오류**

    - 자동 계산 시스템 사용 (더 이상 수동 계산 불필요)
    - `Prover.toml`의 age, nonce 값 확인

4. **macOS/Linux 호환성**
    - 스크립트가 자동으로 OS 감지하여 적절한 명령어 사용

## 📚 추가 자료

-   [Noir 공식 문서](https://noir-lang.org/docs)
-   [Barretenberg 문서](https://github.com/AztecProtocol/barretenberg)
-   [Zero-Knowledge 증명 소개](https://blog.ethereum.org/2016/12/05/zksnarks-in-a-nutshell)
