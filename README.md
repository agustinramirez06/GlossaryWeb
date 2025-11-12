# 📚 GlossaryWeb

GlossaryWeb es una aplicación web simple pero completa que permite **gestionar un glosario técnico de términos en inglés con sus definiciones en español**.

Incluye funcionalidades para **listar, buscar, crear, editar y eliminar** términos almacenados en una base de datos **MongoDB**, utilizando un backend con **Node.js (sin Express)** y un frontend construido con **HTML, CSS y JavaScript puro**.

---

## 🚀 Funcionalidades principales

- **Listar términos** almacenados en la base de datos.
- **Buscar** de forma instantánea por palabra o parte de la definición.
- **Agregar** nuevos términos y definiciones desde un formulario modal.
- **Editar** términos existentes directamente desde la interfaz.
- **Eliminar** términos con confirmación de usuario.
- **Validación** para evitar duplicados (un término no puede repetirse).

---

## 🧩 Tecnologías utilizadas

| Componente | Tecnología / Librería |
|-------------|------------------------|
| **Base de datos** | MongoDB |
| **ORM / ODM** | Mongoose |
| **Servidor** | Node.js (módulo `http` nativo) |
| **Frontend** | HTML5, CSS3, JavaScript ES6 |
| **Monitor de desarrollo** | Nodemon |

---

## 🏗️ Arquitectura del proyecto

```bash
GlossaryWeb/
│
├── backend/
│   ├── db/
│   │   └── connection.js         # Conexión a MongoDB + definición del modelo
│   └── server.js                 # Servidor HTTP con API REST y servidor de archivos estáticos
│
├── frontend/
│   ├── index.html                # Página principal
│   ├── styles.css                # Estilos minimalistas
│   └── app.js                    # Lógica de frontend: CRUD + búsqueda + validaciones
│
├── package.json                  # Configuración del proyecto Node.js
└── README.md                     # Este archivo
⚙️ Instalación y ejecución
Clonar el repositorio

bash
Copiar código
git clone https://github.com/<tu-usuario>/GlossaryWeb.git
cd GlossaryWeb
Instalar dependencias

bash
Copiar código
npm install
Iniciar MongoDB
Asegúrate de tener MongoDB corriendo localmente en:

bash
Copiar código
mongodb://localhost:27017/glossaryWeb
Ejecutar el servidor

bash
Copiar código
npm run dev
Verás en consola:

less
Copiar código
✅ Conectado a MongoDB
🌐 Servidor escuchando en http://localhost:3000
Abrir el frontend

Si estás sirviendo desde el backend:
Abre en tu navegador: http://localhost:3000

O con Live Server (VSCode):
Asegúrate de que tu API_URL en app.js apunte a http://localhost:3000/api/definitions

🧠 Lógica general
El backend (Node.js) expone una API REST en /api/definitions que responde a:

GET → listar términos (opcionalmente con búsqueda)

POST → crear un nuevo término

PUT → actualizar un término existente

DELETE → eliminar un término

El frontend (app.js) usa fetch() para comunicarse con estas rutas.

Los términos se muestran dinámicamente en tarjetas.

Al editar o crear, se abre un modal con validación en tiempo real.

Todo se actualiza en el navegador sin recargar la página.

💡 Ejemplo de uso
Inicia el servidor (npm run dev).

Abre http://localhost:3000.

Crea un nuevo término, por ejemplo:

makefile
Copiar código
termino: variable
definicion: Espacio en memoria que almacena un valor.
Busca “var” en la barra superior — el resultado se filtra instantáneamente.

Edita o elimina cuando lo necesites.

👨‍💻 Created By
Agustín Ramírez
📧 agustin06ramirez@gmail.com
💬 Estudiante analista de sistemas
🧑‍💼 www.linkedin.com/in/agustinramirez06

