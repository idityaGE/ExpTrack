use regex::Regex;

pub fn is_valid_email(email: &str) -> Result<bool, String> {
    let email_regex = Regex::new(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
        .expect("Failed to initalize the email regex expression");

    Ok(email_regex.is_match(email))
}
