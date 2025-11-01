use crate::{
    AppState,
    models::{BudgetModel, CategoryModel, ExpenseModel, UserModel},
    schema::{
        ApiResponse, ApiResult, CreateBudgetSchema, CreateCategorySchema, CreateExpenseSchema,
        CreateUserSchema,
    },
    utils::{
        hash_password,
        helper::{user_exists, validate_email, validate_name, validate_password},
        sign,
    },
};
use axum::{Extension, Json, extract::State, http::StatusCode};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

pub async fn create_user(
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateUserSchema>,
) -> ApiResult<serde_json::Value> {
    validate_name(&body.name)?;
    validate_password(&body.password)?;
    validate_email(&body.email)?;

    if user_exists(&state.db, &body.email).await? {
        return Err(ApiResponse::error(
            "User already exists",
            StatusCode::CONFLICT,
        ));
    }

    let password_hash = hash_password(&body.password)
        .map_err(|e| ApiResponse::error(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;

    let new_user = sqlx::query_as::<_, UserModel>(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
    )
    .bind(body.name)
    .bind(body.email)
    .bind(password_hash)
    .fetch_one(&state.db)
    .await?;

    let token = sign(&new_user.user_id.to_string())
        .map_err(|e| ApiResponse::error(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))?;

    Ok(ApiResponse::success(
        json!({"user": new_user, "token": token}),
    ))
}

pub async fn create_expense(
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateExpenseSchema>,
) -> ApiResult<serde_json::Value> {
    validate_name(&body.name)?;
    if body.amount <= 0 {
        return Err(ApiResponse::error(
            "Amount can't be less than zero",
            StatusCode::BAD_REQUEST,
        ));
    }

    let budget_id = match &body.budget_id {
        Some(b) => Some(Uuid::parse_str(&b)?),
        None => None,
    };

    let new_expense = sqlx::query_as::<_, ExpenseModel>(
        "INSERT INTO expenses (name, amount, date, description, category_id, user_id, budget_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *"
    )
    .bind(body.name)
    .bind(body.amount)
    .bind(body.date)
    .bind(body.description)
    .bind(body.category_id)
    .bind(&user_id)
    .bind(&budget_id)
    .fetch_one(&state.db)
    .await?;

    if let Some(budget_id) = budget_id {
        let db_state = state.db.clone();
        tokio::spawn(async move {
            let budget_result = sqlx::query_as::<_, BudgetModel>(
                "SELECT * FROM budgets WHERE budget_id = $1 AND user_id = $2",
            )
            .bind(budget_id)
            .bind(user_id)
            .fetch_optional(&db_state)
            .await;

            if let Ok(Some(budget)) = budget_result {
                let total_spent_result: Result<Option<i64>, _> = sqlx::query_scalar(
                    "SELECT COALESCE(SUM(amount), 0)::BIGINT FROM expenses WHERE budget_id = $1",
                )
                .bind(budget_id)
                .fetch_one(&db_state)
                .await;

                if let Ok(Some(total_spent)) = total_spent_result {
                    let budget_amount = budget.amount;
                    let usage_percentage = (total_spent as f64 / budget_amount as f64) * 100.0;

                    let msg = if usage_percentage >= 100.0 {
                        Some(format!(
                            "🚨 BUDGET ALERT: Budget '{}' (ID: {}) has been EXCEEDED! \
                            Total spent: {} / Budget: {} ({:.1}%)",
                            budget.name, budget_id, total_spent, budget_amount, usage_percentage
                        ))
                    } else if usage_percentage >= 80.0 {
                        Some(format!(
                            "⚠️  BUDGET WARNING: Budget '{}' (ID: {}) is at {:.1}% usage. \
                            Total spent: {} / Budget: {}",
                            budget.name, budget_id, usage_percentage, total_spent, budget_amount
                        ))
                    } else {
                        None
                    };

                    if msg.is_some() {
                        let _ = sqlx::query(
                            "INSERT INTO notifications (user_id, category, message) VALUES ($1, $2, $3)"
                        )
                        .bind(&user_id)
                        .bind("BUDGET_ALERT")
                        .bind(msg)
                        .execute(&db_state)
                        .await;
                    }
                } else {
                    eprintln!("Failed to calculate total spent for budget {}", budget_id);
                }
            }
        });
    }

    Ok(ApiResponse::success(json!({
        "expense": new_expense
    })))
}

pub async fn create_budget(
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateBudgetSchema>,
) -> ApiResult<serde_json::Value> {
    validate_name(&body.name)?;

    if body.amount <= 0 {
        return Err(ApiResponse::error(
            "Amount can't be less than zero",
            StatusCode::BAD_REQUEST,
        ));
    }

    if body.end_date <= body.start_date {
        return Err(ApiResponse::error(
            "End date must be after start date",
            StatusCode::BAD_REQUEST,
        ));
    }

    let new_budget = sqlx::query_as::<_, BudgetModel>(
        "INSERT INTO budgets (name, amount, start_date, end_date, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *"
    )
    .bind(body.name)
    .bind(body.amount)
    .bind(body.start_date)
    .bind(body.end_date)
    .bind(user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(ApiResponse::success(json!({
        "budget": new_budget
    })))
}

pub async fn create_category(
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
    Json(body): Json<CreateCategorySchema>,
) -> ApiResult<serde_json::Value> {
    if body.category_name.trim().is_empty() {
        return Err(ApiResponse::error(
            "Category name cannot be empty",
            StatusCode::BAD_REQUEST,
        ));
    }

    let existing_category = sqlx::query_as::<_, CategoryModel>(
        "SELECT * FROM categories WHERE user_id = $1 AND category_name = $2",
    )
    .bind(user_id)
    .bind(&body.category_name)
    .fetch_optional(&state.db)
    .await?;

    if existing_category.is_some() {
        return Err(ApiResponse::error(
            "Category with this name already exists",
            StatusCode::CONFLICT,
        ));
    }

    let new_category = sqlx::query_as::<_, CategoryModel>(
        "INSERT INTO categories (category_name, user_id) VALUES ($1, $2) RETURNING *",
    )
    .bind(body.category_name)
    .bind(user_id)
    .fetch_one(&state.db)
    .await?;

    Ok(ApiResponse::success(json!({
        "category": new_category
    })))
}
