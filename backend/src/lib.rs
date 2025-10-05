use sqlx::{Pool, Postgres};

pub mod handlers;
pub mod model;
pub mod middleware;
pub mod routes;

pub struct AppState {
    pub db: Pool<Postgres>,
}
