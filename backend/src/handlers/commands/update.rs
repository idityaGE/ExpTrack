use std::sync::Arc;

use axum::{
    Extension, Json,
    extract::{Path, State},
    http::StatusCode,
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    AppState,
    models::{BudgetModel, ExpenseModel},
    schema::{ApiResponse, ApiResult, UpdateBudgetSchema, UpdateExpenseSchema},
    utils::helper::validate_name,
};

pub async fn update_expense(
    Path(id): Path<String>,
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
    Json(body): Json<UpdateExpenseSchema>,
) -> ApiResult<serde_json::Value> {
    let expense_id = Uuid::parse_str(&id)
        .map_err(|_| ApiResponse::error("Invalid expense ID format", StatusCode::BAD_REQUEST))?;

    let existing_expense = sqlx::query_as::<_, ExpenseModel>(
        "SELECT * FROM expenses WHERE expense_id = $1 AND user_id = $2",
    )
    .bind(expense_id)
    .bind(user_id)
    .fetch_optional(&state.db)
    .await?;

    if existing_expense.is_none() {
        return Err(ApiResponse::error(
            "Expense not found or you don't have permission to update it",
            StatusCode::NOT_FOUND,
        ));
    }

    let existing_expense = existing_expense.unwrap();

    if let Some(ref name) = body.name {
        validate_name(name)?;
    }

    if let Some(amount) = body.amount {
        if amount <= 0 {
            return Err(ApiResponse::error(
                "Amount can't be less than zero",
                StatusCode::BAD_REQUEST,
            ));
        }
    }

    let budget_id = match &body.budget_id {
        Some(b) => Some(Uuid::parse_str(&b)?),
        None => existing_expense.budget_id,
    };

    let name = body.name.unwrap_or(existing_expense.name);
    let amount = body.amount.unwrap_or(existing_expense.amount);
    let date = body.date.unwrap_or(existing_expense.date);
    let description = body.description.or(existing_expense.description);
    let category_id = body.category_id.or(existing_expense.category_id);

    let updated_expense = sqlx::query_as::<_, ExpenseModel>(
        "UPDATE expenses SET name = $1, amount = $2, date = $3, description = $4, category_id = $5, budget_id = $6
         WHERE expense_id = $7 AND user_id = $8 
         RETURNING *",
    )
    .bind(name)
    .bind(amount)
    .bind(date)
    .bind(description)
    .bind(category_id)
    .bind(budget_id)
    .bind(expense_id)
    .bind(user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(ApiResponse::success(json!({
        "expense": updated_expense
    })))
}

pub async fn update_budget(
    Path(id): Path<String>,
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
    Json(body): Json<UpdateBudgetSchema>,
) -> ApiResult<serde_json::Value> {
    let budget_id = Uuid::parse_str(&id)
        .map_err(|_| ApiResponse::error("Invalid budget ID format", StatusCode::BAD_REQUEST))?;

    let existing_budget = sqlx::query_as::<_, BudgetModel>(
        "SELECT * FROM budgets WHERE budget_id = $1 AND user_id = $2",
    )
    .bind(budget_id)
    .bind(user_id)
    .fetch_optional(&state.db)
    .await?;

    if existing_budget.is_none() {
        return Err(ApiResponse::error(
            "Budget not found or you don't have permission to update it",
            StatusCode::NOT_FOUND,
        ));
    }

    let existing_budget = existing_budget.unwrap();

    if let Some(ref name) = body.name {
        validate_name(name)?;
    }

    if let Some(amount) = body.amount {
        if amount <= 0 {
            return Err(ApiResponse::error(
                "Amount can't be less than zero",
                StatusCode::BAD_REQUEST,
            ));
        }
    }

    let name = body.name.unwrap_or(existing_budget.name);
    let amount = body.amount.unwrap_or(existing_budget.amount);
    let start_date = body.start_date.unwrap_or(existing_budget.start_date);
    let end_date = body.end_date.unwrap_or(existing_budget.end_date);

    if end_date <= start_date {
        return Err(ApiResponse::error(
            "End date must be after start date",
            StatusCode::BAD_REQUEST,
        ));
    }

    let updated_budget = sqlx::query_as::<_, BudgetModel>(
        "UPDATE budgets SET name = $1, amount = $2, start_date = $3, end_date = $4 
         WHERE budget_id = $5 AND user_id = $6 
         RETURNING *",
    )
    .bind(name)
    .bind(amount)
    .bind(start_date)
    .bind(end_date)
    .bind(budget_id)
    .bind(user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(ApiResponse::success(json!({
        "budget": updated_budget
    })))
}
