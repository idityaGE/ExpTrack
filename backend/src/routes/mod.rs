use axum::{Json, response::IntoResponse};
pub mod router;

pub async fn health_check() -> impl IntoResponse {
    const MESSAGE: &str = "Server is Working fine!";

    let json_response = serde_json::json!({
        "status": "success",
        "message": MESSAGE
    });

    Json(json_response)
}
