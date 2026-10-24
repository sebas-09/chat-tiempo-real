# Chat grupal en tiempo real

Proyecto individual de **Sebastian Monga**, según confirmación del autor.
Mensajería grupal con React y Spring Boot mediante WebSockets/STOMP.

## Funciones

- Acceso con un alias de hasta 16 caracteres.
- Mensajes grupales y listado de usuarios conectados.
- Rechazo de alias duplicados, incluso con diferencias de mayúsculas.
- Liberación del alias al cerrar o perder la conexión.
- Estado de error de conexión visible en el cliente.

El alias no constituye autenticación. No hay cuentas, historial persistente ni salas privadas.
El broker y la presencia funcionan en memoria de una instancia.

## Organización

`backend/`: Spring Boot 3.3.4, Java 21, broker STOMP y Maven.
`frontend/`: React 19, Bootstrap, SockJS y @stomp/stompjs.

Se eligieron `chatback` y `chatfront/chat-app` del original, evitando la carpeta
histórica que mezclaba fuentes Java y React. Los originales se conservaron intactos.

## Arranque local

Requisitos: JDK 21, Node.js 22 y npm. Comprobar `java -version` antes de construir.

En una terminal PowerShell:

```powershell
cd backend
.\mvnw.cmd -B -ntp verify
.\mvnw.cmd spring-boot:run
```

El backend escucha en http://127.0.0.1:8089.
En otra terminal:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm start
```

Abrir http://localhost:3000. La copia de `.env.example` solo es necesaria la primera
vez; conservar cualquier configuración local existente.

## Configuración

| Variable | Componente | Valor por defecto |
|---|---|---|
| REACT_APP_WEBSOCKET_URL | Frontend, durante build/arranque | http://localhost:8089/ws |
| SERVER_PORT | Backend | 8089 |
| SERVER_ADDRESS | Backend | 127.0.0.1 |
| CHAT_ALLOWED_ORIGINS | Backend | http://localhost:3000,http://127.0.0.1:3000 |

Para cambiar puertos, ajustar también el cliente y el origen permitido.
La configuración de CORS pertenece al endpoint WebSocket; se retiraron propiedades
de WebFlux que no configuraban este endpoint.

## Comprobaciones

```powershell
cd backend
.\mvnw.cmd verify
```

```powershell
cd frontend
npm test -- --watchAll=false --runInBand
npm run build
```

Tres pruebas backend y tres regresiones del cliente pasaron durante la preparación.
El test genérico de Create React App se sustituyó por regresiones del ciclo WebSocket.
Se conserva Create React App para esta preparación; su actualización es trabajo posterior.

[Arquitectura y cambios](docs/ARQUITECTURA.md) · [Ficha del proyecto](docs/FICHA_PROYECTO.md)

Código del proyecto personal. La aplicación no cuenta con un despliegue público.
