use axum::http::{
    HeaderValue, Method,
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
};

use backend::{AppState, routes::create_router};
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::{fs, sync::Arc};
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("info,tower_http=debug")),
        )
        .init();

    let db_connection_str =
        std::env::var("DATABASE_URL").expect("DATABASE_URL must be set in environment variables");

    let pool = PgPoolOptions::new()
        .max_connections(10)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&db_connection_str)
        .await
        .map_err(|err| {
            eprintln!("Failed to connect to the database: {}", err);
            err
        })?;

    match fs::read_to_string("db/init.sql") {
        Ok(content) => {
            sqlx::query(&content).execute(&pool).await?;
        }
        Err(err) => {
            eprintln!("Could not read init.sql file: {}", err);
            eprintln!("Continuing without schema initialization...");
        }
    }

    let cors = CorsLayer::new()
        .allow_origin(
            "http://localhost:3000"
                .parse::<HeaderValue>()
                .expect("Invalid CORS origin"),
        )
        .allow_headers([CONTENT_TYPE, AUTHORIZATION, ACCEPT])
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_credentials(true);

    let app = create_router(Arc::new(AppState { db: pool.clone() }))
        .layer(TraceLayer::new_for_http())
        .layer(cors);


    let bind_addr = "0.0.0.0:8080";
    let listener = tokio::net::TcpListener::bind(bind_addr)
        .await
        .map_err(|err| {
            eprintln!("Failed to bind to {}: {}", bind_addr, err);
            err
        })?;

    axum::serve(listener, app).await.map_err(|err| {
        eprintln!("Server error: {}", err);
        err
    })?;

    Ok(())
}
