export interface FormData {
    age: number;
    nonce: number;
    minAge: number;
}

export interface ZKProofResult {
    proof: string;
    publicInputs: string[];
    commitment: string;
}
