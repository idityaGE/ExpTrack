use axum::{Json, response::IntoResponse};
pub mod router;
pub mod user;
pub mod expense;
pub mod category;
pub mod budget;

pub use router::create_router;
pub use user::get_user_routes;
pub use expense::get_expense_routes;
pub use category::get_category_routes;
pub use budget::get_budget_routes;

pub async fn health_check() -> impl IntoResponse {
    const MESSAGE: &str = "Server is Working fine!";

    let json_response = serde_json::json!({
        "status": "success",
        "message": MESSAGE
    });

    Json(json_response)
}
