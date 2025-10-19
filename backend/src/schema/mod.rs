use serde::Serialize;

pub mod budget;
pub mod category;
pub mod expense;
pub mod user;

pub use budget::*;
pub use category::*;
pub use expense::*;
pub use user::*;

use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};

#[derive(Serialize, Debug)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    pub status: u16,
}

impl<T> ApiResponse<T>
where
    T: Serialize,
{
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            message: None,
            data: Some(data),
            status: StatusCode::OK.as_u16(),
        }
    }

    pub fn error(message: &str, status: StatusCode) -> Self {
        Self {
            success: false,
            message: Some(message.to_string()),
            data: None,
            status: status.as_u16(),
        }
    }

    pub fn created(data: T) -> Self {
        Self {
            success: true,
            message: None,
            data: Some(data),
            status: StatusCode::CREATED.as_u16(),
        }
    }

    pub fn with_status(data: T, status: StatusCode) -> Self {
        Self {
            success: true,
            message: None,
            data: Some(data),
            status: status.as_u16(),
        }
    }
}

impl<T: Serialize> IntoResponse for ApiResponse<T> {
    fn into_response(self) -> Response {
        let status = StatusCode::from_u16(self.status).unwrap_or(StatusCode::OK);
        let body = Json(self);
        (status, body).into_response()
    }
}

impl From<sqlx::Error> for ApiResponse<serde_json::Value> {
    fn from(err: sqlx::Error) -> Self {
        Self::error(&err.to_string(), StatusCode::INTERNAL_SERVER_ERROR)
    }
}

impl From<String> for ApiResponse<serde_json::Value> {
    fn from(err: String) -> Self {
        Self::error(&err, StatusCode::BAD_REQUEST)
    }
}

impl From<&str> for ApiResponse<serde_json::Value> {
    fn from(err: &str) -> Self {
        Self::error(err, StatusCode::BAD_REQUEST)
    }
}

pub type ApiResult<T> = Result<ApiResponse<T>, ApiResponse<serde_json::Value>>;
