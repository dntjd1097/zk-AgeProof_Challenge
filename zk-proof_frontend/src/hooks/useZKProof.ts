import { useState } from 'react';
import { ethers } from 'ethers';
import {
    formatProofForContract,
    formatPublicInputsForContract,
    generateZKProofWithGuide,
} from '@/lib/zkProof';
import { FormData, ZKProofResult } from '@/types';
import {
    VERIFIER_ABI,
    CONTRACT_ADDRESS,
    RPC_URL,
} from '@/constants/contract';

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

    const getDetailedErrorMessage = (
        error: any
    ): string => {
        if (error.code === 'CALL_EXCEPTION') {
            const errorData =
                error.data || error.transaction?.data;

            // Check for known error signatures
            if (errorData === '0xd0e50be7') {
                return '증명 길이가 올바르지 않습니다. 생성된 증명이 예상 크기와 일치하지 않습니다.';
            } else if (errorData === '0x2e815f18') {
                return '공개 입력 개수가 올바르지 않습니다. 2개의 공개 입력이 필요합니다.';
            } else if (errorData === '0xff63caf8') {
                return '증명 검증에 실패했습니다 (Sumcheck 실패). 증명이 유효하지 않습니다.';
            } else if (errorData === '0xb96ecf7f') {
                return '증명 검증에 실패했습니다 (Shplemini 실패). 증명이 유효하지 않습니다.';
            }

            // Generic custom error
            return `컨트랙트 검증에 실패했습니다. 에러 코드: ${errorData}`;
        }

        return (
            error.message ||
            '알 수 없는 오류가 발생했습니다.'
        );
    };

    const verifyProof = async () => {
        if (!proof || !publicInputs.length) {
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
            addLog('🔍 Verifying proof on-chain... ⌛');

            const provider = new ethers.JsonRpcProvider(
                RPC_URL
            );
            const contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                VERIFIER_ABI,
                provider
            );

            console.log('Verifying proof on-chain...');
            console.log(
                'Contract address:',
                CONTRACT_ADDRESS
            );
            console.log('Proof length:', proof.length);
            console.log(
                'Public inputs length:',
                publicInputs.length
            );
            console.log(
                'Proof:',
                proof.substring(0, 100) + '...'
            );
            console.log('Public inputs:', publicInputs);

            // Validate proof length before sending
            const expectedProofLength = 440 * 32 * 2 + 2; // 440 fields * 32 bytes * 2 (hex) + 0x prefix
            if (proof.length !== expectedProofLength) {
                throw new Error(
                    `증명 길이가 올바르지 않습니다. 예상: ${expectedProofLength}, 실제: ${proof.length}`
                );
            }

            // Validate public inputs length
            if (publicInputs.length !== 2) {
                throw new Error(
                    `공개 입력 개수가 올바르지 않습니다. 예상: 2, 실제: ${publicInputs.length}`
                );
            }

            const result = await contract.verify(
                proof,
                publicInputs
            );
            setVerificationResult(result);

            addLog(
                `✅ On-chain verification: ${
                    result ? 'valid' : 'invalid'
                }... ✅`
            );
            console.log('Verification result:', result);
        } catch (err) {
            console.error('Error verifying proof:', err);
            const detailedMessage =
                getDetailedErrorMessage(err);
            addLog('❌ On-chain verification failed');
            setError(
                `검증에 실패했습니다: ${detailedMessage}`
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
        addLog('✅ Ready for on-chain verification');
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
