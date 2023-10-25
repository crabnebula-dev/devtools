#![no_std]

use fst::Map;
use lazy_static::lazy_static;
use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

lazy_static! {
    static ref FILENAME_ICONS: Map<&'static [u8]> = {
        const FILENAME_ICONS_BYTES: &[u8] =
            include_bytes!(concat!(env!("OUT_DIR"), "/filename_icons.bin"));

        Map::new(FILENAME_ICONS_BYTES).unwrap()
    };
    static ref EXT_ICONS: Map<&'static [u8]> = {
        const EXT_ICONS_BYTES: &[u8] = include_bytes!(concat!(env!("OUT_DIR"), "/ext_icons.bin"));

        Map::new(EXT_ICONS_BYTES).unwrap()
    };
}

#[wasm_bindgen]
pub fn get_icon(path: &str) -> Option<u64> {
    let icon = FILENAME_ICONS.get(path.as_bytes()).or_else(|| {
        let ext = path.rsplit_once('.')?.1;

        EXT_ICONS.get(ext.as_bytes())
    });

    icon
}
