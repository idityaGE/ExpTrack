use bcrypt::{DEFAULT_COST, hash, verify};

pub fn hash_password(password: &str) -> Result<String, &str> {
    match hash(password, DEFAULT_COST) {
        Ok(h) => Ok(h),
        Err(_) => Err("Failed to hash password"),
    }
}

pub fn verify_hash_password<'a>(password: &'a str, hashed: &'a str) -> Result<bool, &'a str> {
    match verify(password, hashed) {
        Ok(res) => Ok(res),
        Err(_) => Err("Failed to verify hash_password"),
    }
}
