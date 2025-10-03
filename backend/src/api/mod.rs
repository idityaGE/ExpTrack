use axum::{Json, response::IntoResponse};

pub mod router;

pub async fn health_check() -> impl IntoResponse {
    const MESSAGE: &str = "Server is running!";

    let json_response = serde_json::json!({ "message": MESSAGE, "status": "ok" });

    Json(json_response)
}
