use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Claims {
    pub sub: JwtPayload,
    pub exp: usize,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct JwtPayload {
    pub email: String,
    pub user_id: Uuid,
}

pub fn sign(data: JwtPayload) -> Result<String, String> {
    let expiration = Utc::now()
        .checked_add_signed(Duration::days(30))
        .expect("valid timestamp")
        .timestamp() as usize;

    let claims = Claims {
        sub: data,
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

pub fn verify(token: &str) -> Result<JwtPayload, String> {
    let secret_key = std::env::var("JWT_SECRET").expect("JWT_SECRET is not found in env");

    let validation = Validation::default();
    let decoded = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret_key.as_ref()),
        &validation,
    );

    match decoded {
        Ok(data) => Ok(data.claims.sub),
        Err(err) => Err(err.to_string()),
    }
}
