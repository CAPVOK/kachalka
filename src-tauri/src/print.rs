use printpdf::*;
use printpdf::{PdfDocument, PdfLayer, PdfLayerReference, PdfPage};
use std::fs::File;
use std::io::BufWriter;

fn num_pair() -> (String, String) {
    ("1".to_string(), "2".to_string())
}

pub fn pdf(file_path: &str, content: Vec<&str>) {
    const WIDTH: f64 = 210.0;
    const HEIGHT: f64 = 297.0;
    const COL1_X: f64 = 10.0;
    const ROW1_Y: f64 = 287.0;

    let (doc, page1, layer1) =
        PdfDocument::new("PDF_Document_title", Mm(WIDTH), Mm(HEIGHT), "Layer 1");
    let font = doc.add_builtin_font(BuiltinFont::Helvetica).unwrap();

    let current_layer = doc.get_page(page1).get_layer(layer1);

    current_layer.begin_text_section();

    current_layer.set_font(&font, 16.0);
    current_layer.set_text_cursor(Mm(COL1_X), Mm(ROW1_Y));
    current_layer.set_line_height(26.0);

    let rows = ["Мага Искандеров 30 +79990000000 Боевые искусства",
    "Сергей Бегунов 28 +78881231231 Бег",
    "Елена Ходько 32 +78888888888 Бег",
    "Мария Чиллова 35 +77771231231 Йога",
    "Ольга Растяжко 31 +77770000000 Йога",
    "Петр Гантелич 30 +71231231231 Фитнес-тренер",
    "Дмитрий Жимов 29 +79991234572 Фитнес-тренер",
    "Кирилл Штангович 33 +79991234576 Фитнес-тренер",
    "Талантбек Азимов 18 +79997777777 Боевые искусства"];

    for row in rows {
        current_layer.write_text(format!("{}", row), &font);
        current_layer.add_line_break();
    }

    current_layer.end_text_section();

    doc.save(&mut BufWriter::new(File::create(file_path).unwrap()))
        .unwrap();
}
