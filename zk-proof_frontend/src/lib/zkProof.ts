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
    try {
        const commitment = poseidon2Hash([age, nonce]);
        const result =
            '0x' +
            commitment.toString(16).padStart(64, '0');
        return result;
    } catch (error) {
        console.error('Poseidon2 해시 계산 실패:', error);
        throw new Error(`commitment 계산 실패: ${error}`);
    }
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

        // 2. UltraHonkBackend 사용 (NoirJS recursion 가이드 설정 적용)
        const backend = new UltraHonkBackend(
            circuit.bytecode,
            {
                threads: Math.min(
                    8,
                    navigator.hardwareConcurrency || 4
                ),
            }
        );
        const noir = new Noir(circuit);

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

        // 6. proof 생성 - 멀티스레드 설정으로 생성
        console.log('Proof 생성 중... ⏳');
        const { proof, publicInputs } =
            await backend.generateProof(witness);
        console.log('Proof 생성 완료... ✅');

        // 7. 검증
        console.log('Proof 검증 중... ⌛');
        const isValid = await backend.verifyProof({
            proof,
            publicInputs,
        });
        console.log(
            `Proof ${isValid ? '유효' : '무효'}... ✅`
        );

        if (!isValid) {
            throw new Error('생성된 proof가 유효하지 않음');
        }

        // 8. Public inputs 순서 확인 및 포맷팅
        // Circuit에서는 [commitment, min_age] 순서로 public inputs가 정의됨
        console.log(
            'Generated public inputs:',
            publicInputs
        );
        console.log('Expected: [commitment, min_age]');
        console.log('Commitment:', commitment);
        console.log('Min age:', minAge);

        // Public inputs가 올바른 순서인지 확인
        const expectedPublicInputs = [
            commitment,
            '0x' + minAge.toString(16).padStart(64, '0'),
        ];
        console.log(
            'Expected public inputs:',
            expectedPublicInputs
        );

        return {
            proof: proof,
            publicInputs:
                publicInputs || expectedPublicInputs,
            commitment: commitment,
        };
    } catch (error) {
        console.error('ZK Proof 생성 실패:', error);
        throw error;
    }
}
