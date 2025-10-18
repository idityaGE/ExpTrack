use axum::{Extension, Json, response::IntoResponse};
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

pub async fn health_check(Extension(user_email): Extension<String>) -> impl IntoResponse {
    const MESSAGE: &str = "Server is Working fine!";

    let json_response = serde_json::json!({
        "status": "success",
        "message": user_email
    });

    Json(json_response)
}
