use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[allow(non_snake_case)]
pub struct ExpenseModel {
    pub expense_id: Uuid,
    pub name: String,
    pub amount: i64,
    pub date: chrono::NaiveDate,
    pub description: Option<String>,
    pub category_id: Option<i32>,
    pub user_id: Uuid,
    #[serde(rename = "createdAt")]
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}
