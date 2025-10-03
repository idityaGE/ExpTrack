use axum::http::{
    HeaderValue, Method,
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
};

use backend::{AppState, routes::router::create_router};
use dotenv::dotenv;
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() {
    dotenv().ok();

    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .or_else(|_| EnvFilter::try_new("axum_tracing_example=info,tower_http=debug"))
                .unwrap(),
        )
        .init();

    let db_connection_str = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = match PgPoolOptions::new()
        .max_connections(10)
        .connect(&db_connection_str)
        .await
    {
        Ok(pool) => {
            println!("✅Connection to the database is successful!");
            pool
        }
        Err(err) => {
            println!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_headers([CONTENT_TYPE, AUTHORIZATION, ACCEPT])
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_credentials(true);

    let app = create_router(Arc::new(AppState { db: pool.clone() }))
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    println!("🚀 Server started successfully");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
