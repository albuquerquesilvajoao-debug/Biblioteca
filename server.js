// API de Livros com SQlite (better-sqlite3)
const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static("public"));

// 1) Conecta no arquivo do banco (cria se não existir)
const db = new Database("biblioteca.db");

// 2) Criar a tabela (só se ainda não existir)

db.exec(`
    CREATE TABLE IF NOT EXISTS livros (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo  TEXT NOT NULL,
    autor   TEXT NOT NULL,
    ano     INTEGER,
    editora TEXT NOT NULL,
    paginas INTEGER
    )
    `);

// 3) Listar todos

app.get("/livros", (req, res) => {
    const livro = db.prepare("SELECT * FROM livros").all();
    res.status(200).json(livro);
});

// 4) Buscar por Id

app.get("/livros/:id", (req, res) => {
    const livro = db.prepare("SELECT * FROM livros WHERE id = ?").get(req.params.id);
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado"});
    res.status(200).json(livro);
});

// 5) CADASTRAR VALIDAÇÃO SIMPLES
app.post("/livros", (req, res) => {
  const { titulo, autor, ano, editora, paginas } = req.body;
  if (!titulo || !autor) return res.status(400).json({ erro: "Informe titulo e autor" });
  if (paginas && Number.isNaN(Number(paginas))) {
    return res.status(400).json({ erro: "Páginas deve ser um número válido" });
  }

  const info = db
    .prepare("INSERT INTO livros (titulo, autor, ano, editora, paginas) VALUES (?, ?, ?, ?, ?)")
    .run(titulo, autor, Number(ano), editora || "", Number(paginas));

  res.status(201).json({ id: info.lastInsertRowid, titulo, autor,
    editora: editora || "",
    paginas: Number(paginas),
    ano: Number(ano) });
});

// 6) APAGAR
app.delete("/livros/:id", (req, res) => {
    const info = db.prepare("DELETE FROM livros WHERE id = ?").run(req.params.id);
    if (info.changes === 0) return res.status(404).json({erro: "Livro não encontrado"});
    res.status(204).end();
});

app.listen(PORT, () => {
    console.log(`API Livros no ar: http://localhost:${PORT}`);
});