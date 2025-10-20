use std::sync::Arc;

use axum::{
    Extension,
    extract::{Path, State},
    http::StatusCode,
};
use serde_json::json;
use uuid::Uuid;

use crate::{
    AppState,
    schema::{ApiResponse, ApiResult},
};

/// Common delete function for UUID-based resources
///
/// # Arguments
/// * `state` - Application state containing database pool
/// * `table_name` - Name of the table to delete from
/// * `id_column` - Name of the ID column (e.g., "expense_id", "budget_id")
/// * `id` - UUID string to parse and use for deletion
/// * `user_id` - User ID to ensure ownership
/// * `resource_name` - Human-readable resource name for error messages
async fn delete_resource_by_uuid(
    state: &Arc<AppState>,
    table_name: &str,
    id_column: &str,
    id: &str,
    user_id: Uuid,
    resource_name: &str,
) -> ApiResult<serde_json::Value> {
    // Parse the UUID
    let resource_id = Uuid::parse_str(id).map_err(|_| {
        ApiResponse::error(
            &format!("Invalid {} ID format", resource_name),
            StatusCode::BAD_REQUEST,
        )
    })?;

    // Execute the delete query
    let query = format!(
        "DELETE FROM {} WHERE {} = $1 AND user_id = $2 RETURNING {}",
        table_name, id_column, id_column
    );

    let result = sqlx::query(&query)
        .bind(resource_id)
        .bind(user_id)
        .fetch_optional(&state.db)
        .await?;

    match result {
        Some(_) => Ok(ApiResponse::success(json!({
            "message": format!("{} deleted successfully", resource_name)
        }))),
        None => Err(ApiResponse::error(
            &format!(
                "{} not found or you don't have permission to delete it",
                resource_name
            ),
            StatusCode::NOT_FOUND,
        )),
    }
}

pub async fn delete_expense(
    Path(id): Path<String>,
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    delete_resource_by_uuid(&state, "expenses", "expense_id", &id, user_id, "Expense").await
}

pub async fn delete_budget(
    Path(id): Path<String>,
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    delete_resource_by_uuid(&state, "budgets", "budget_id", &id, user_id, "Budget").await
}

pub async fn delete_category(
    Path(id): Path<String>,
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    let resource_id: i32 = id
        .parse()
        .map_err(|_| ApiResponse::error("Invalid category ID format", StatusCode::BAD_REQUEST))?;

    let result = sqlx::query("DELETE FROM categories WHERE category_id = $1 AND user_id = $2")
        .bind(resource_id)
        .bind(user_id)
        .fetch_optional(&state.db)
        .await?;

    match result {
        Some(_) => Ok(ApiResponse::success(json!({
            "message": "category deleted successfully"
        }))),
        None => Err(ApiResponse::error(
            "category not found or you don't have permission to delete it",
            StatusCode::NOT_FOUND,
        )),
    }
}
