// import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
// import { Noir } from '@noir-lang/noir_js';
import { UltraHonkBackend } from '@aztec/bb.js';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';
import { CompiledCircuit } from '@noir-lang/types';
import { poseidon2Hash } from '@zkpassport/poseidon2';
//import { poseidon2 } from 'poseidon-lite';

// ZK Proof utilities using Noir with Poseidon2 hash
// Using known values from circuit testing due to API compatibility issues

export function formatProofForContract(
    proof: Uint8Array
): string {
    if (!proof || proof.length === 0) {
        throw new Error('Invalid proof data');
    }

    return (
        '0x' +
        Array.from(proof)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
    );
}

// Convert public inputs to format expected by smart contract
export function formatPublicInputsForContract(
    publicInputs: any
): string[] {
    if (!publicInputs) {
        return [];
    }

    // Handle different input formats
    if (Array.isArray(publicInputs)) {
        return publicInputs.map((input) => {
            if (typeof input === 'string') {
                if (input.startsWith('0x')) {
                    return input;
                }
                // Convert string number to hex
                return (
                    '0x' +
                    BigInt(input)
                        .toString(16)
                        .padStart(64, '0')
                );
            }
            if (typeof input === 'number') {
                return (
                    '0x' +
                    BigInt(input)
                        .toString(16)
                        .padStart(64, '0')
                );
            }
            return (
                '0x' +
                BigInt(String(input))
                    .toString(16)
                    .padStart(64, '0')
            );
        });
    }

    // Handle object format
    if (typeof publicInputs === 'object') {
        return Object.values(publicInputs).map((value) => {
            if (typeof value === 'string') {
                if (value.startsWith('0x')) {
                    return value;
                }
                return (
                    '0x' +
                    BigInt(value)
                        .toString(16)
                        .padStart(64, '0')
                );
            }
            return (
                '0x' +
                BigInt(String(value))
                    .toString(16)
                    .padStart(64, '0')
            );
        });
    }

    return [];
}

// ZK Proof utilities using Noir with Poseidon2 hash
// Using known values from circuit testing due to API compatibility issues

// Circuit과 일치하는 정확한 Poseidon2 해시 계산
export async function calculatePoseidon2Hash(
    age: bigint,
    nonce: bigint
): Promise<string> {
    // Circuit의 테스트 결과에 따라 알려진 값들을 사용
    // age=25, nonce=12345 -> commitment=0x075c382f7808049aa9b0fcf5e6e5eec5bcb3e7b1be1f0c7496286264bda251fd

    // if (age === 25n && nonce === 12345n) {
    //     return '0x075c382f7808049aa9b0fcf5e6e5eec5bcb3e7b1be1f0c7496286264bda251fd';
    // }

    // 다른 일반적인 테스트 케이스들도 추가
    // if (age === 20n && nonce === 123n) {
    //     // 이 값은 실제 회로 테스트에서 확인된 값으로 교체해야 함
    //     console.warn(
    //         'age=20, nonce=123에 대한 정확한 commitment가 필요합니다.'
    //     );
    // }

    // 다른 값들에 대해서는 circuit 테스트를 통해 올바른 값을 계산해야 함
    // 임시로 poseidon2Hash 사용 (정확하지 않을 수 있음)
    const commitment = poseidon2Hash([age, nonce]);
    const result =
        '0x' + commitment.toString(16).padStart(64, '0');

    return result;
}

// 가이드에 따른 완전한 ZK Proof 생성
export async function generateZKProofWithGuide(
    age: bigint,
    nonce: bigint,
    minAge: number = 18
): Promise<{
    proof: Uint8Array;
    publicInputs: any[];
    commitment: string;
}> {
    try {
        console.log(
            `ZK Proof 생성 시작: age=${age}, nonce=${nonce}, minAge=${minAge}`
        );

        // 1. Circuit 로드
        const response = await fetch('/circuit.json');
        const circuit =
            (await response.json()) as CompiledCircuit;

        // 2. UltraHonkBackend 사용 (웹 환경에서 안정적)
        const noir = new Noir(circuit);
        const backend = new UltraHonkBackend(
            circuit.bytecode
        );

        // 3. 올바른 commitment 계산
        const commitment = await calculatePoseidon2Hash(
            age,
            nonce
        );

        // 4. 입력 준비 - circuit과 정확히 동일한 형태로
        const inputs = {
            age: age.toString(),
            nonce: nonce.toString(),
            commitment: commitment,
            min_age: minAge.toString(), // 문자열로 변환
        };

        console.log('입력 데이터:', inputs);

        // 5. witness 생성
        console.log('Witness 생성 중... ⏳');
        const { witness } = await noir.execute(inputs);
        console.log('Witness 생성 완료... ✅');

        // 6. proof 생성 - circuit과 동일한 옵션 시도
        console.log('Proof 생성 중... ⏳');
        const proof = await backend.generateProof(witness);
        console.log('Proof 생성 완료... ✅');

        // 7. 검증
        console.log('Proof 검증 중... ⌛');
        const isValid = await backend.verifyProof(proof);
        console.log(
            `Proof ${isValid ? '유효' : '무효'}... ✅`
        );

        if (!isValid) {
            throw new Error('생성된 proof가 유효하지 않음');
        }

        return {
            proof: proof.proof,
            publicInputs: proof.publicInputs || [],
            commitment: commitment,
        };
    } catch (error) {
        console.error('ZK Proof 생성 실패:', error);
        throw error;
    }
}
