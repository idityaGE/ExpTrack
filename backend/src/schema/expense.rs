use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateExpenseSchema {
    pub name: String,
    pub amount: i64,
    pub date: chrono::NaiveDate,
    pub description: Option<String>,
    pub category_id: Option<i32>,
}
