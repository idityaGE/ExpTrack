use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub fn sign(data: &String) -> Result<String, String> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(30))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: data.clone(), // Convert UUID to string for standard 'sub' claim
        exp: expiration,
    };

    let secret_key = std::env::var("JWT_SECRET").expect("JWT_SECRET is not found in env");

    let token = match encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret_key.as_ref()),
    ) {
        Ok(t) => t,
        Err(_) => return Err("Error encoding jwt token".to_string()),
    };

    Ok(token)
}

pub fn verify(token: &String) -> Result<Uuid, String> {
    let secret_key = std::env::var("JWT_SECRET").expect("JWT_SECRET is not found in env");

    let validation = Validation::default();
    let decoded = decode::<Claims>(
        token.clone(),
        &DecodingKey::from_secret(secret_key.as_ref()),
        &validation,
    );

    match decoded {
        Ok(data) => Uuid::parse_str(&data.claims.sub).map_err(|e| e.to_string()),
        Err(err) => Err(err.to_string()),
    }
}
