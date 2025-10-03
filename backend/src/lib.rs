use sqlx::{Pool, Postgres};

pub mod handlers;
pub mod model;
pub mod routes;
pub mod middleware;

pub struct AppState {
    pub db: Pool<Postgres>,
}
