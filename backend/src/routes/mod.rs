use crate::{
    AppState,
    models::NotificationModel,
    schema::{ApiResponse, ApiResult},
};
use axum::{Extension, Json, extract::State, response::IntoResponse};
use serde_json::json;
use std::sync::Arc;
use uuid::Uuid;

pub mod budget;
pub mod category;
pub mod expense;
pub mod router;
pub mod user;

pub use budget::get_budget_routes;
pub use category::get_category_routes;
pub use expense::get_expense_routes;
pub use router::create_router;
pub use user::get_user_routes;

pub async fn health_check() -> impl IntoResponse {
    const MESSAGE: &str = "Server is Working fine!";

    let json_response = serde_json::json!({
        "status": "success",
        "message": MESSAGE
    });

    Json(json_response)
}

pub async fn get_notifications(
    Extension(user_id): Extension<Uuid>,
    State(state): State<Arc<AppState>>,
) -> ApiResult<serde_json::Value> {
    let all_notifications = sqlx::query_as::<_, NotificationModel>(
        "SELECT * FROM notifications WHERE user_id = $1 AND is_sent = $2 ORDER BY created_at DESC",
    )
    .bind(user_id)
    .bind(false)
    .fetch_all(&state.db)
    .await?;

    if !all_notifications.is_empty() {
        let notification_ids: Vec<Uuid> = all_notifications
            .iter()
            .map(|n| n.notification_id)
            .collect();

        let _ =
            sqlx::query("UPDATE notifications SET is_sent = $1 WHERE notification_id = ANY($2)")
                .bind(true)
                .bind(&notification_ids)
                .execute(&state.db)
                .await;
    }

    Ok(ApiResponse::success(json!({
        "notifications": all_notifications,
        "count": all_notifications.len()
    })))
}
