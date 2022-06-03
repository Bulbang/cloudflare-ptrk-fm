use serde_json::json;
use worker::*;

mod Resizer;
mod utils;

fn log_request(req: &Request) {
    console_log!(
        "{} - [{}], located at: {:?}, within: {}",
        Date::now().to_string(),
        req.path(),
        req.cf().coordinates().unwrap_or_default(),
        req.cf().region().unwrap_or("unknown region".into())
    );
}

#[event(fetch)]
pub async fn main(mut req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    log_request(&req);

    utils::set_panic_hook();

    let form = req.form_data().await?;
    let w;
    let h;

    match form.get("width") {
        Some(FormEntry::Field(val)) => {
            w = val.parse::<u32>().unwrap();
        }
        Some(FormEntry::File(_)) => {
            return Response::error("`width` param in form shouldn't be a File", 422)
        }
        None => return Response::error("Bad Request", 400),
    };
    match form.get("height") {
        Some(FormEntry::Field(val)) => {
            h = val.parse::<u32>().unwrap();
        }
        Some(FormEntry::File(_)) => {
            return Response::error("`height` param in form shouldn't be a File", 422)
        }
        None => return Response::error("Bad Request", 400),
    };

    match form.get("image") {
        Some(FormEntry::Field(_)) => {
            return Response::error("`image` param in form shouldn't be a String", 422);
        }
        Some(FormEntry::File(file)) => {
            let img_bytes = file.bytes().await?;
            let resized = Resizer::resize(img_bytes, w, h)?;
            return Response::from_bytes(resized);
        }
        None => return Response::error("Bad Request", 400),
    };
}
