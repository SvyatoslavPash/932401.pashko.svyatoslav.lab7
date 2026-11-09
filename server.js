import express from 'express';
import {
    getAllNotes,
    getNotesByTag,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
} from './db.js';

const app = express();
app.use(express.json());

function validateNoteInput({ title, tags }) {
    if (typeof title !== 'string' || title.trim() === '') {
        return 'Поле title обязательно и не может быть пустым';
    }

    if (tags !== undefined) {
        if (!Array.isArray(tags) || !tags.every(t => typeof t === 'string')) {
            return 'Поле tags должно быть массивом строк';
        }
    }

    return null;
}

app.get('/api/notes', (req, res) => {
    const { tag } = req.query;

    if (tag) {
        const notes = getNotesByTag(tag);
        return res.json(notes);
    }

    res.json(getAllNotes());
});

app.get('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Некорректный id' });
    }

    const note = getNoteById(id);
    if (!note) {
        return res.status(404).json({ error: 'Заметка не найдена' });
    }

    res.json(note);
});

app.post('/api/notes', (req, res) => {
    console.log('--- Тело запроса ---', req.body);
    const { title, body, tags } = req.body;

    const validationError = validateNoteInput({ title, tags });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const note = createNote({ title: title.trim(), body, tags });
    res.status(201).json(note);
});

app.put('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Некорректный id' });
    }

    const { title, body, tags } = req.body;

    const validationError = validateNoteInput({
        title: title !== undefined ? title : 'dummy', tags,
    });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    const updated = updateNote(id, {
        title: title !== undefined ? title.trim() : undefined,
        body,
        tags,
    });

    if (!updated) {
        return res.status(404).json({ error: 'Заметка не найдена' });
    }

    res.json(updated);
});

app.delete('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Некорректный id' });
    }

    const deleted = deleteNote(id);
    if (!deleted) {
        return res.status(404).json({ error: 'Заметка не найдена' });
    }

    res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});