use dep::std::hash::poseidon2::Poseidon2;

// Age verification ZK circuit
// Public Input: commitment (hash of age and nonce), min_age (minimum age requirement)
// Private Input: age (actual age), nonce (random value for commitment generation)
fn main(
    // Private inputs (witness)
    age: Field,
    nonce: Field,
    // Public inputs
    commitment: pub Field,
    min_age: pub u8,
) {
    // 1. Commitment verification: commitment = Hash(age || nonce)
    let inputs = [age, nonce];
    //let computed_commitment = hash::pedersen_hash(inputs);
    let computed_commitment = Poseidon2::hash(inputs, 2);

    assert(commitment == computed_commitment);

    // 2. Age condition verification: age >= min_age
    // Convert Fields to u32 for comparison
    let age_u32 = age as u32;
    let min_age_u32 = min_age as u32;
    assert(age_u32 >= min_age_u32);
}

#[test]
fn test_calculate_commitment_from_prover_toml() {
    // This test calculates commitment from Prover.toml values
    // Script will use this test to auto-calculate commitment
    let age = 25; // This should match Prover.toml
    let nonce = 12345; // This should match Prover.toml
    let inputs = [age, nonce];
    //let commitment = hash::pedersen_hash(inputs);
    let commitment = Poseidon2::hash(inputs, 2);
    // Print in a format that script can parse
    std::println(f"input={inputs}");
    std::println(f"COMMITMENT_VALUE={commitment}");
}
