
    use image::{DynamicImage, ImageFormat};
    use wasm_bindgen::JsValue;
    use std::io::{Cursor, Read, Seek, SeekFrom};

    fn get_image_as_array(_img: DynamicImage) -> Vec<u8> {
        // Create fake "file"
        let mut c = Cursor::new(Vec::new());

        match _img.write_to(&mut c, ImageFormat::Png) {
            Ok(c) => c,
            Err(error) => {
                panic!(
                    "There was a problem writing the resulting buffer: {:?}",
                    error
                )
            }
        };
        c.seek(SeekFrom::Start(0)).unwrap();

        // Read the "file's" contents into a vector
        let mut out = Vec::new();
        c.read_to_end(&mut out).unwrap();

        return out;
    }

    pub fn resize(buffer: Vec<u8>, width: u32, height: u32) -> Result<Vec<u8>, JsValue> {
        let img = image::load_from_memory(&buffer).map_err(|e| e.to_string())?;
        let img = img.thumbnail(width, height);
        let bytes = get_image_as_array(img);

        Ok(bytes)
    }
