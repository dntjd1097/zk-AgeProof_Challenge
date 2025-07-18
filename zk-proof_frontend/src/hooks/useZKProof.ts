import { useState } from 'react';
import {
    formatProofForContract,
    formatPublicInputsForContract,
    generateZKProofWithGuide,
} from '@/lib/zkProof';
import { FormData, ZKProofResult } from '@/types';
import { UltraHonkBackend } from '@aztec/bb.js';
import { CompiledCircuit } from '@noir-lang/types';

export const useZKProof = () => {
    const [isProving, setIsProving] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isLocalVerifying, setIsLocalVerifying] =
        useState(false);
    const [proof, setProof] = useState<string>('');
    const [publicInputs, setPublicInputs] = useState<
        string[]
    >([]);
    const [commitment, setCommitment] =
        useState<string>('');
    const [
        localVerificationResult,
        setLocalVerificationResult,
    ] = useState<boolean | null>(null);
    const [verificationResult, setVerificationResult] =
        useState<boolean | null>(null);
    const [error, setError] = useState<string>('');
    const [logs, setLogs] = useState<string[]>([]);

    // 백엔드 인스턴스와 원본 데이터를 저장하기 위한 상태
    const [backend, setBackend] =
        useState<UltraHonkBackend | null>(null);
    const [rawProof, setRawProof] =
        useState<Uint8Array | null>(null);
    const [rawPublicInputs, setRawPublicInputs] = useState<
        any[] | null
    >(null);

    const addLog = (message: string) => {
        setLogs((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()}: ${message}`,
        ]);
        console.log(message);
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const generateProof = async (data: FormData) => {
        setIsProving(true);
        setError('');
        setVerificationResult(null);
        setLocalVerificationResult(null);
        clearLogs();

        try {
            addLog('🔍 Generating witness... ⏳');
            console.log(
                'Generating proof with data:',
                data
            );

            const result = await generateZKProofWithGuide(
                BigInt(data.age),
                BigInt(data.nonce),
                data.minAge
            );

            // 백엔드 인스턴스 생성 및 저장 (검증용)
            const response = await fetch('/circuit.json');
            const circuit =
                (await response.json()) as CompiledCircuit;
            const backendInstance = new UltraHonkBackend(
                circuit.bytecode,
                {
                    threads: Math.min(
                        8,
                        navigator.hardwareConcurrency || 4
                    ),
                }
            );
            setBackend(backendInstance);

            const formattedProof = formatProofForContract(
                result.proof
            );
            const formattedPublicInputs =
                formatPublicInputsForContract(
                    result.publicInputs
                );

            setProof(formattedProof);
            setPublicInputs(formattedPublicInputs);
            setCommitment(result.commitment);
            setRawProof(result.proof);
            setRawPublicInputs(result.publicInputs);

            addLog('✅ Generated witness... ✅');
            addLog('🔍 Generating proof... ⏳');
            addLog('✅ Generated proof... ✅');
            addLog('🔍 Verifying proof locally... ⌛');

            // 로컬 검증은 이미 generateZKProofWithGuide 내부에서 수행됨
            // 여기서는 결과만 표시
            setLocalVerificationResult(true);
            addLog(
                '✅ Local proof verification: valid... ✅'
            );

            console.log('Proof generated successfully');
            console.log('Proof:', formattedProof);
            console.log(
                'Public inputs:',
                formattedPublicInputs
            );
            console.log(
                'Proof length:',
                formattedProof.length
            );
            console.log(
                'Expected proof length:',
                440 * 32 * 2 + 2
            ); // 440 fields * 32 bytes * 2 (hex) + 0x prefix
        } catch (err) {
            console.error('Error generating proof:', err);
            addLog('❌ Proof generation failed');
            setError(
                '증명 생성에 실패했습니다: ' +
                    (err as Error).message
            );
            setLocalVerificationResult(false);
        } finally {
            setIsProving(false);
        }
    };

    const verifyProof = async () => {
        if (!rawProof || !rawPublicInputs || !backend) {
            setError('먼저 증명을 생성해주세요.');
            return;
        }

        if (localVerificationResult !== true) {
            setError(
                '로컬 검증이 성공하지 않았습니다. 먼저 유효한 증명을 생성해주세요.'
            );
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            addLog('🔍 Verifying proof with backend... ⌛');

            console.log('Verifying proof with backend...');
            console.log(
                'Raw proof length:',
                rawProof.length
            );
            console.log(
                'Raw public inputs:',
                rawPublicInputs
            );

            const result = await backend.verifyProof({
                proof: rawProof,
                publicInputs: rawPublicInputs,
            });

            setVerificationResult(result);

            addLog(
                `✅ Backend verification: ${
                    result ? 'valid' : 'invalid'
                }... ✅`
            );
            console.log(
                'Backend verification result:',
                result
            );

            if (!result) {
                setError(
                    '백엔드 검증에 실패했습니다. 증명이 유효하지 않습니다.'
                );
            }
        } catch (err) {
            console.error('Error verifying proof:', err);
            addLog('❌ Backend verification failed');
            setError(
                `백엔드 검증에 실패했습니다: ${
                    (err as Error).message
                }`
            );
        } finally {
            setIsVerifying(false);
        }
    };

    const resetState = () => {
        setProof('');
        setPublicInputs([]);
        setCommitment('');
        setLocalVerificationResult(null);
        setVerificationResult(null);
        setError('');
        setBackend(null);
        setRawProof(null);
        setRawPublicInputs(null);
        clearLogs();
    };

    const setTestProof = (
        testProof: string,
        testPublicInputs: string[]
    ) => {
        setProof(testProof);
        setPublicInputs(testPublicInputs);
        setLocalVerificationResult(true); // 테스트용으로 로컬 검증 성공으로 설정
        setCommitment(testPublicInputs[0] || ''); // 첫 번째 public input을 commitment로 설정
        setVerificationResult(null);
        setError('');
        clearLogs();

        addLog('🧪 Test proof loaded');
        addLog('✅ Ready for backend verification');
    };

    return {
        isProving,
        isVerifying,
        isLocalVerifying,
        proof,
        publicInputs,
        commitment,
        localVerificationResult,
        verificationResult,
        error,
        logs,
        generateProof,
        verifyProof,
        resetState,
        setTestProof,
    };
};
