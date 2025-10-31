use axum::{Router, routing::get};
use serde::{Deserialize, Deserializer, de};
use std::{fmt, str::FromStr, sync::Arc};

use crate::{
    AppState,
    handlers::{
        create_expense, delete_expense, get_all_expenses, get_expense_by_id,
        get_expenses_by_budget_id, update_expense,
    },
};

#[derive(Debug, Deserialize)]
pub struct Params {
    #[serde(default, deserialize_with = "empty_string_as_none")]
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

fn empty_string_as_none<'de, D, T>(de: D) -> Result<Option<T>, D::Error>
where
    D: Deserializer<'de>,
    T: FromStr,
    T::Err: fmt::Display,
{
    let opt = Option::<String>::deserialize(de)?;
    match opt.as_deref() {
        None | Some("") => Ok(None),
        Some(s) => FromStr::from_str(s).map_err(de::Error::custom).map(Some),
    }
}

pub fn get_expense_routes() -> Router<Arc<AppState>> {
    Router::new()
        .route("/expense", get(get_all_expenses).post(create_expense))
        .route(
            "/expense/{id}",
            get(get_expense_by_id)
                .put(update_expense)
                .delete(delete_expense),
        )
        .route(
            "/expenses/budget/{budget_id}",
            get(get_expenses_by_budget_id),
        )
}
