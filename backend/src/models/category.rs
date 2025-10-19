use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[allow(non_snake_case)]
pub struct CategoryModel {
    pub category_id: u64,
    pub user_id: Option<Uuid>,
    #[serde(rename = "categoryName")]
    pub category_name: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}
