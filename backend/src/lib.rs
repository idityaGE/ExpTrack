use sqlx::{Pool, Postgres};

#[macro_use]
pub mod handlers;
pub mod middleware;
pub mod models;
pub mod routes;
pub mod schema;
pub mod utils;

#[derive(Clone)]
pub struct AppState {
    pub db: Pool<Postgres>,
}
