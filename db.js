import Database from 'better-sqlite3';

const db = new Database('notes.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT,
    tags TEXT NOT NULL DEFAULT '[]'
    )
`);

export function getAllNotes() {
    const rows = db.prepare('SELECT * FROM notes ORDER BY id').all();
    return rows.map(row => ({ ...row, tags: JSON.parse(row.tags) }));
}

export function getNotesByTag(tag) {
    const rows = db
    .prepare('SELECT * FROM notes ORDER BY id')
    .all(`%"${tag}"%`);
    return rows.map(row => ({ ...row, tags: JSON.parse(row.tags) }));
}

export function getNoteById(id) {
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!row) return null;
    return { ...row, tags: JSON.parse(row.tags) };
}

export function createNote({ title, body = '', tags = [] }) {
    const stmt = db.prepare(
        'INSERT INTO notes (title, body, tags) VALUES (?, ?, ?)'
    )
    const info = stmt.run(title, body, JSON.stringify(tags));
    return getNoteById(info.lastInsertRowid);
}

export function updateNote(id, { title, body, tags }) {
    const existing = getNoteById(id);
    if (!existing) return null;

    const newTitle = title !== undefined ? title : existing.title;
    const newBody = body !== undefined ? body : existing.body;
    const newTags = tags !== undefined ? tags : existing.tags;

    db.prepare(
        'UPDATE notes SET title = ?, body = ?, tags = ? WHERE id = ?'
    ).run(newTitle, newBody, JSON.stringify(newTags), id);

    return getNoteById(id);
}

export function deleteNote(id) {
    const info = db.prepare('DELETE FROM notes WHERE id = ?').run(id);
    return info.changes > 0;
}