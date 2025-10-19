use crate::{models::UserModel, schema::ApiResponse};
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

pub async fn get_user_by_email(
    db: &sqlx::PgPool,
    email: &str,
) -> Result<Option<UserModel>, ApiResponse<serde_json::Value>> {
    sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE email = $1")
        .bind(email)
        .fetch_optional(db)
        .await
        .map_err(|e| ApiResponse::error(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))
}

pub async fn get_user_by_id(
    db: &sqlx::PgPool,
    user_id: &uuid::Uuid,
) -> Result<Option<UserModel>, ApiResponse<serde_json::Value>> {
    sqlx::query_as::<_, UserModel>("SELECT * FROM users WHERE user_id = $1")
        .bind(user_id)
        .fetch_optional(db)
        .await
        .map_err(|e| ApiResponse::error(&e.to_string(), StatusCode::INTERNAL_SERVER_ERROR))
}

pub async fn user_exists(
    db: &sqlx::PgPool,
    email: &str,
) -> Result<bool, ApiResponse<serde_json::Value>> {
    get_user_by_email(db, email).await.map(|u| u.is_some())
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
