'use client';

import { useZKProof } from '@/hooks/useZKProof';
import {
    ProofForm,
    ProofResults,
    NetworkInfo,
    Instructions,
    TroubleshootingGuide,
} from '@/components';

export default function Home() {
    const {
        isProving,
        isVerifying,
        proof,
        publicInputs,
        commitment,
        localVerificationResult,
        verificationResult,
        error,
        logs,
        generateProof,
        verifyProof,
        loadTestProofFromFile,
    } = useZKProof();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        ZK Age Proof System
                    </h1>
                    <p className="text-lg text-gray-600">
                        나이를 공개하지 않고 최소 나이
                        조건을 만족함을 증명하세요
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ProofForm
                        onSubmit={generateProof}
                        isLoading={isProving}
                    />

                    <ProofResults
                        commitment={commitment}
                        proof={proof}
                        publicInputs={publicInputs}
                        localVerificationResult={
                            localVerificationResult
                        }
                        verificationResult={
                            verificationResult
                        }
                        error={error}
                        logs={logs}
                        isVerifying={isVerifying}
                        onVerify={verifyProof}
                        onLoadTestProof={
                            loadTestProofFromFile
                        }
                    />
                </div>

                <div className="mt-8 space-y-8">
                    {error && <TroubleshootingGuide />}
                    <NetworkInfo />
                    <Instructions />
                </div>
            </div>
        </div>
    );
}
