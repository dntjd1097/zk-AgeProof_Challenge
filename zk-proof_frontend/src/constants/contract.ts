// ABI for UltraVerifier contract (BaseHonkVerifier)
export const VERIFIER_ABI = [
    {
        inputs: [
            {
                internalType: 'bytes',
                name: 'proof',
                type: 'bytes',
            },
            {
                internalType: 'bytes32[]',
                name: 'publicInputs',
                type: 'bytes32[]',
            },
        ],
        name: 'verify',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    // Add error definitions for better error handling
    {
        inputs: [],
        name: 'ProofLengthWrong',
        type: 'error',
    },
    {
        inputs: [],
        name: 'PublicInputsLengthWrong',
        type: 'error',
    },
    {
        inputs: [],
        name: 'SumcheckFailed',
        type: 'error',
    },
    {
        inputs: [],
        name: 'ShpleminiFailed',
        type: 'error',
    },
];

export const CONTRACT_ADDRESS =
    '0x5b4a358ea1fef25e78ffdf0909a94f925b24d947';
export const RPC_URL =
    'https://sepolia.gateway.tenderly.co';
export const CHAIN_NAME = 'Sepolia';
export const CHAIN_ID = 11155111;
