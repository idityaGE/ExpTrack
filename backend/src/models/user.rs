use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;


#[derive(Serialize, Deserialize, FromRow, Debug)]
#[allow(non_snake_case)]
pub struct UserModel {
  pub user_id: Uuid,
  pub name: String,
  pub email: String,
  pub password_hash: String,
  #[serde(rename = "createdAt")]
  pub created_at: Option<chrono::DateTime<chrono::Utc>>,
  #[serde(rename = "updatedAt")]
  pub updated_at: Option<chrono::DateTime<chrono::Utc>>
} 
