use sqlx::{Pool, Postgres};

pub mod handlers;
pub mod middleware;
pub mod routes;
pub mod schema;
pub mod models;
pub mod utils;

#[derive(Clone)]
pub struct AppState {
    pub db: Pool<Postgres>,
}