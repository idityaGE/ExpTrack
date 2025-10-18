use sqlx::{Pool, Postgres};

pub mod handlers;
pub mod model;
pub mod middleware;
pub mod routes;
pub mod schema;
pub mod models;

pub struct AppState {
    pub db: Pool<Postgres>,
}