use chrono::{NaiveDate, NaiveTime};
use sqlx::postgres::PgPoolOptions;
use sqlx::{Pool, Postgres, Row};
use tauri::State;

struct AppState {
    pool: Pool<Postgres>,
}

#[derive(serde::Serialize)]
struct User {
    id: i32,
    name: String,
    surname: String,
    age: i32,
    phone: String,
    user_type: String,
    card: i32,
    specialization: String,
}

#[derive(serde::Serialize)]
struct Card {
    id: i32,
    name: String,
    discount: i32,
}

#[derive(serde::Serialize)]
struct Inventory {
    id: i32,
    description: String,
    categoryid: i32,
    roomid: i32,
}

#[derive(serde::Serialize)]
struct Room {
    id: i32,
    capacity: i32,
    name: String,
}

#[derive(serde::Serialize)]
struct Category {
    id: i32,
    name: String,
}

#[derive(serde::Serialize)]
struct Lesson {
    id: i32,
    date: String,
    time: String,
    pay: bool,
    typeid: i32,
    room: i32,
    trainer: i32,
    comment: String,
}

#[derive(serde::Serialize)]
struct Type {
    id: i32,
    name: String,
}

#[derive(serde::Serialize)]
struct LessonNoTime {
    id: i32,
    pay: bool,
    typeid: i32,
    room: i32,
    trainer: i32,
    comment: String,
}

#[tauri::command(rename_all = "snake_case")]
async fn get_user_by_phone(
    state: State<'_, AppState>,
    phone: &str,
    password: &str,
    user_type: &str,
) -> Result<Option<User>, String> {
    let table_name = match user_type {
        "clients" => "clients",
        "trainers" => "trainers",
        "admins" => "admins",
        _ => return Ok(None), // если user не соответствует ни одной таблице, возвращаем None
    };

    let row = sqlx::query(&format!(
        "SELECT id, name, surname, phone, password FROM {} WHERE phone = $1 AND password = $2",
        table_name
    ))
    .bind(phone)
    .bind(password)
    .fetch_one(&state.pool)
    .await
    .map_err(|e| format!("Такого пользователя не существует"))?;

    let user = User {
        id: row.get("id"),
        name: row.get("name"),
        surname: row.get("surname"),
        age: 0,
        phone: row.get("phone"),
        user_type: String::from(table_name),
        card: 0,
        specialization: String::from(""),
    };

    Ok(Some(user))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_all_users(
    state: State<'_, AppState>,
    user_type: &str,
    condition: &str,
) -> Result<Option<Vec<User>>, String> {
    let query = match user_type {
        "clients" => format!(
            "SELECT id, name, surname, phone, age, card FROM clients {}",
            condition
        ),
        "trainers" => {
            format!(
                "SELECT id, name, surname, phone, age, specialization FROM trainers {}",
                condition
            )
        }
        _ => return Ok(None),
    };

    let rows = sqlx::query(&query)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut clients = vec![];

    for row in rows {
        let mut user = User {
            id: 0,
            name: String::new(),
            surname: String::new(),
            age: 0,
            phone: String::new(),
            user_type: String::new(),
            card: 0,
            specialization: String::new(),
        };

        if user_type == "clients" {
            user = User {
                id: row.get("id"),
                name: row.get("name"),
                surname: row.get("surname"),
                age: row.get("age"),
                phone: row.get("phone"),
                user_type: String::from(user_type),
                card: row.get("card"),
                specialization: String::new(),
            };
        } else {
            user = User {
                id: row.get("id"),
                name: row.get("name"),
                surname: row.get("surname"),
                age: row.get("age"),
                phone: row.get("phone"),
                user_type: String::from(user_type),
                card: 0,
                specialization: row.get("specialization"),
            };
        }

        clients.push(user);
    }

    Ok(Some(clients))
}

#[tauri::command(rename_all = "snake_case")]
async fn delete_anything(
    state: State<'_, AppState>,
    table: &str,
    condition: &str, /* where id = '1' */
) -> Result<Option<String>, String> {
    sqlx::query(&format!("DELETE FROM {} {}", table, condition))
        .execute(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    Ok(Some("Удаление прошло успешно.".to_string()))
}

#[tauri::command(rename_all = "snake_case")]
async fn edit_anything(
    state: State<'_, AppState>,
    table: &str,
    data: &str,      /* name = $1, surname = $2, age = $3, phone = $4 */
    condition: &str, /* where id = '1' */
) -> Result<Option<String>, String> {
    sqlx::query(&format!("UPDATE {} SET {} {}", table, data, condition))
        .execute(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    Ok(Some("Вы успешно изменили данные!".to_string()))
}

#[tauri::command(rename_all = "snake_case")]
async fn new_anything(state: State<'_, AppState>, data: &str) -> Result<Option<String>, String> {
    sqlx::query(&format!("INSERT INTO {} ", data))
        .execute(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    Ok(Some("Вы успешно добавили данные!".to_string()))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_cards(state: State<'_, AppState>) -> Result<Option<Vec<Card>>, String> {
    let rows = sqlx::query("Select * from cards ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut cards = vec![];

    for row in rows {
        let card = Card {
            id: row.get("id"),
            name: row.get("name"),
            discount: row.get("discount"),
        };
        cards.push(card);
    }

    Ok(Some(cards))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_rooms(state: State<'_, AppState>) -> Result<Option<Vec<Room>>, String> {
    let rows = sqlx::query("Select * from rooms ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut rooms = vec![];

    for row in rows {
        let room = Room {
            id: row.get("id"),
            name: row.get("name"),
            capacity: row.get("capacity"),
        };
        rooms.push(room);
    }

    Ok(Some(rooms))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_categories(state: State<'_, AppState>) -> Result<Option<Vec<Category>>, String> {
    let rows = sqlx::query("Select * from categories ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut categories = vec![];

    for row in rows {
        let category = Category {
            id: row.get("id"),
            name: row.get("name"),
        };
        categories.push(category);
    }

    Ok(Some(categories))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_inventory(state: State<'_, AppState>) -> Result<Option<Vec<Inventory>>, String> {
    let rows = sqlx::query("Select * from inventory ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut inventories = vec![];

    for row in rows {
        let inventory = Inventory {
            id: row.get("id"),
            description: row.get("description"),
            categoryid: row.get("categoryid"),
            roomid: row.get("roomid"),
        };
        inventories.push(inventory);
    }

    Ok(Some(inventories))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_lessons(
    state: State<'_, AppState>,
    condition: &str,
) -> Result<Option<Vec<Lesson>>, String> {
    let rows = sqlx::query(&format!("SELECT id, date::text, time::text, pay, typeid, room, trainer, comment FROM lessons {} ORDER BY date, time", condition))
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("{}", e))?;

    let mut lessons = vec![];

    for row in rows {
        let lesson = Lesson {
            id: row.get("id"),
            date: row.get("date"),
            time: row.get("time"),
            pay: row.try_get("pay").unwrap_or(false),
            typeid: row.get("typeid"),
            room: row.get("room"),
            trainer: row.get("trainer"),
            comment: row.try_get("comment").unwrap_or("".to_string()),
        };
        lessons.push(lesson);
    }

    Ok(Some(lessons))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_types(state: State<'_, AppState>) -> Result<Option<Vec<Type>>, String> {
    let rows = sqlx::query("Select * from types")
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut types = vec![];

    for row in rows {
        let typer = Type {
            id: row.get("id"),
            name: row.get("name"),
        };
        types.push(typer);
    }

    Ok(Some(types))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_lesson_clients(
    state: State<'_, AppState>,
    id: &str,
) -> Result<Option<Vec<User>>, String> {
    let rows = sqlx::query(&format!(
        "SELECT clients.id, clients.name, clients.surname
    FROM clients
    INNER JOIN lesson_clients ON clients.id = lesson_clients.clientid
    WHERE lesson_clients.lessonid = {}",
        id
    ))
    .fetch_all(&state.pool)
    .await
    .map_err(|e| format!("{}", e))?;

    let mut clients = vec![];

    for row in rows {
        let client = User {
            id: row.get("id"),
            name: row.get("name"),
            surname: row.get("surname"),
            age: 0,
            phone: String::new(),
            user_type: String::new(),
            card: 0,
            specialization: String::new(),
        };
        clients.push(client);
    }

    Ok(Some(clients))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_lessons_with_client(
    state: State<'_, AppState>,
    id: i32,
) -> Result<Option<Vec<Lesson>>, String> {
    let rows = sqlx::query("SELECT lessons.id, lessons.date::text, lessons.time::text, lessons.pay, lessons.typeid, lessons.room, lessons.trainer, lessons.comment
        FROM lessons
        JOIN lesson_clients ON lessons.id = lesson_clients.lessonid
        WHERE lesson_clients.clientid = $1
        ORDER BY date, time")
        .bind(id)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut lessons = vec![];

    for row in rows {
        let lesson = Lesson {
            id: row.get("id"),
            date: row.get("date"),
            time: row.get("time"),
            pay: row.try_get("pay").unwrap_or(false),
            typeid: row.get("typeid"),
            room: row.get("room"),
            trainer: row.get("trainer"),
            comment: row.try_get("comment").unwrap_or("".to_string()),
        };
        lessons.push(lesson);
    }

    Ok(Some(lessons))
}

#[tauri::command(rename_all = "snake_case")]
async fn get_lessons_without_client(
    state: State<'_, AppState>,
    id: i32,
) -> Result<Option<Vec<Lesson>>, String> {
    let rows = sqlx::query("SELECT lessons.id, lessons.date::text, lessons.time::text, lessons.pay, lessons.typeid, lessons.room, lessons.trainer, lessons.comment
        FROM lessons
        LEFT JOIN lesson_clients ON lessons.id = lesson_clients.lessonid AND lesson_clients.clientid = $1
        WHERE lesson_clients.clientid IS NULL AND lessons.typeid != 2
        ORDER BY date, time")
        .bind(id)
        .fetch_all(&state.pool)
        .await
        .map_err(|e| format!("{}", e))?;

    let mut lessons = vec![];

    for row in rows {
        let lesson = Lesson {
            id: row.get("id"),
            date: row.get("date"),
            time: row.get("time"),
            pay: row.try_get("pay").unwrap_or(false),
            typeid: row.get("typeid"),
            room: row.get("room"),
            trainer: row.get("trainer"),
            comment: row.try_get("comment").unwrap_or("".to_string()),
        };
        lessons.push(lesson);
    }

    Ok(Some(lessons))
}

#[tauri::command(rename_all = "snake_case")]
async fn add_lesson_with_client(
    state: State<'_, AppState>,
    data: &str,
    client_id: i32,
) -> Result<Option<String>, String> {
    let lesson_id: i32 = sqlx::query_scalar(&format!("INSERT INTO {} RETURNING id", data))
        .fetch_one(&state.pool)
        .await
        .map_err(|e| {
            format!("Failed to insert lesson: {}", e)
        })?;

    sqlx::query("INSERT INTO lesson_clients (clientid, lessonid) VALUES ($1, $2)")
        .bind(client_id)
        .bind(lesson_id)
        .execute(&state.pool)
        .await
        .map_err(|e| {
            format!("Failed to insert lesson-client relation: {}", e)
        })?;

    Ok(Some(String::from("Успех!")))
}

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect("postgres://postgres:1234@localhost/gym")
        .await?;

    let app_state = AppState { pool };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_user_by_phone,
            get_all_users,
            delete_anything,
            edit_anything,
            new_anything,
            get_cards,
            get_inventory,
            get_rooms,
            get_categories,
            get_lessons,
            get_types,
            get_lesson_clients,
            get_lessons_with_client,
            get_lessons_without_client,
            add_lesson_with_client,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
