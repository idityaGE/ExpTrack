use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateBudgetSchema {
    pub name: String,
    pub amount: f32,
    pub start_date: chrono::NaiveDate,
    pub end_date: chrono::NaiveDate,
}
