use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Serialize, Deserialize, FromRow, Debug)]
#[allow(non_snake_case)]
pub struct BudgetModel {
    pub budget_id: Uuid,
    pub name: String,
    pub amount: i64,
    #[serde(rename = "startDate")]
    pub start_date: chrono::NaiveDate,
    #[serde(rename = "endDate")]
    pub end_date: chrono::NaiveDate,
    pub user_id: Uuid,
    #[serde(rename = "createdAt")]
    pub created_at: Option<chrono::DateTime<chrono::Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<chrono::DateTime<chrono::Utc>>,
}
