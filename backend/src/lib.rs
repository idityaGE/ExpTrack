use sqlx::{Pool, Postgres};

pub mod api;
pub mod application;
pub mod domain;
pub mod infra;

pub struct AppState {
    pub db: Pool<Postgres>,
}
