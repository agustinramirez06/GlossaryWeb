// backend/server.js
import http from "http";
import fs from "fs";
import path from "path";
import url from "url";
import { connectDB, DefinitionModel, disconnectDB } from "./db/connection.js";
import mongoose from 'mongoose';

const PORT = process.env.PORT || 3000;
const FRONT_DIR = path.resolve("frontend");

await connectDB();

// util: servir archivo estático
function serveStatic(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Recurso no encontrado");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const ct = ext === ".css" ? "text/css" :
               ext === ".js" ? "text/javascript" :
               ext === ".json" ? "application/json" : "text/html";
    res.writeHead(200, { "Content-Type": ct });
    res.end(data);
  });
}

// Utility: leer body JSON
function readJSONBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    // API: GET /api/definitions y opcional ?search=term
    if (pathname === "/api/definitions" && req.method === "GET") {
      const { search } = parsed.query;
      const q = search ? String(search).trim() : "";
      const filter = q
        ? { termino: { $regex: q, $options: "i" } }
        : {};
      const defs = await DefinitionModel.find(filter).lean();
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify(defs));
      return;
    }

    // POST /api/definitions -> crear
    if (pathname === '/api/definitions' && req.method === 'POST') {
      try {
        const body = await readJSONBody(req);
        const termino = body.termino?.trim();
        const definicion = body.definicion?.trim();
        
        if (!termino || !definicion) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'termino y definicion son requeridos' }));
          return;
        }
        
        const created = await DefinitionModel.create({ termino, definicion });
        res.writeHead(201, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(created));
      } catch (err) {
        console.error('POST /api/definitions error', err);
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'error del servidor', details: err.message }));
      }
      return;
    }

    // PUT /api/definitions/:id -> actualizar
    if (pathname.startsWith('/api/definitions/') && req.method === 'PUT') {
      try {
        const id = pathname.split('/').pop();
        
        // Validar que es un ID válido de MongoDB
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'ID inválido' }));
          return;
        }

        const body = await readJSONBody(req);
        const termino = body.termino?.trim();
        const definicion = body.definicion?.trim();
        
        if (!termino || !definicion) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'termino y definicion son requeridos' }));
          return;
        }
        
        const updated = await DefinitionModel.findByIdAndUpdate(
          id, 
          { termino, definicion }, 
          { new: true }
        );
        
        if (!updated) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Definición no encontrada' }));
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify(updated));
      } catch (err) {
        console.error('PUT /api/definitions/:id error', err);
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'error del servidor', details: err.message }));
      }
      return;
    }

    // DELETE /api/definitions/:id -> eliminar
    if (pathname.startsWith('/api/definitions/') && req.method === 'DELETE') {
      try {
        const id = pathname.split('/').pop();
        
        // Validar que es un ID válido de MongoDB
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'ID inválido' }));
          return;
        }

        const deleted = await DefinitionModel.findByIdAndDelete(id);
        
        if (!deleted) {
          res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'Definición no encontrada' }));
          return;
        }
        
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*' });
        res.end();
      } catch (err) {
        console.error('DELETE /api/definitions/:id error', err);
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'error del servidor', details: err.message }));
      }
      return;
    }

    // servir frontend estático (index.html por defecto)
    let filePath = path.join(FRONT_DIR, pathname === "/" ? "index.html" : pathname);
    // Normalizar: si no tiene extensión, asumir .html
    if (!path.extname(filePath)) filePath += ".html";

    // Previene traversal
    if (!filePath.startsWith(FRONT_DIR)) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    serveStatic(filePath, res);
  } catch (err) {
    console.error("Error en petición:", err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Error del servidor");
  }
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor escuchando en http://localhost:${PORT}`);
});

// manejo limpio al cerrar
process.on("SIGINT", async () => {
  console.log("\nDeteniendo servidor...");
  server.close(async () => {
    console.log("Servidor detenido.");
    try {
      if (disconnectDB) await disconnectDB();
      else await mongoose.disconnect();
    } catch (e) {
      console.error('Error al desconectar:', e);
    }
    process.exit(0);
  });
});