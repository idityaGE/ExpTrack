use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct CreateUserSchema {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginUserSchema {
    pub password: String,
}
