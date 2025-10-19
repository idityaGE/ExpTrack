use crate::schema::ApiResponse;
use axum::http::StatusCode;

pub fn validate_name(name: &str) -> Result<(), ApiResponse<serde_json::Value>> {
    if name.len() < 2 {
        return Err(ApiResponse::error(
            "name min length 2",
            StatusCode::BAD_REQUEST,
        ));
    }
    Ok(())
}

pub fn validate_password(password: &str) -> Result<(), ApiResponse<serde_json::Value>> {
    if password.len() < 8 {
        return Err(ApiResponse::error(
            "password min length 8",
            StatusCode::BAD_REQUEST,
        ));
    }
    Ok(())
}

pub fn validate_email(email: &str) -> Result<(), ApiResponse<serde_json::Value>> {
    match crate::utils::is_valid_email(email) {
        Ok(valid) if !valid => Err(ApiResponse::error(
            "Not a valid email",
            StatusCode::BAD_REQUEST,
        )),
        Err(err) => Err(ApiResponse::error(&err, StatusCode::INTERNAL_SERVER_ERROR)),
        Ok(_) => Ok(()),
    }
}

// Database helpers
pub async fn user_exists(
    db: &sqlx::PgPool,
    email: &str,
) -> Result<bool, ApiResponse<serde_json::Value>> {
    sqlx::query_as::<_, crate::models::UserModel>("SELECT * FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(db)
        .await
        .map(|u| u.is_some())
        .map_err(|_| ApiResponse::error("Database error", StatusCode::INTERNAL_SERVER_ERROR))
}

#[macro_export]
macro_rules! ok_or_err {
    ($result:expr, $err_msg:expr, $status:expr) => {
        match $result {
            Ok(val) => val,
            Err(e) => {
                return Err(ApiResponse::error(
                    &format!("{:?}: {:?}", $err_msg, e),
                    $status,
                ))
            }
        }
    };
}
