# VetLink — Cloudflare Worker para Chatbot con Groq API

Backend seguro serverless en **Cloudflare Workers** para el chatbot de la aplicación móvil **VetLink**.

---

## 🔒 Arquitectura de Seguridad

1. **Autenticación Criptográfica:**
   - La aplicación móvil envía el ID token de Firebase en el encabezado `Authorization: Bearer <token>`.
   - El Worker valida la firma del token contra las claves públicas oficiales de Google (`Google JWKS`), verifica que el emisor sea `https://securetoken.google.com/vetlink-bc8e2`, que la audiencia sea el proyecto `vetlink-bc8e2` y que el token no haya expirado.
   - Peticiones sin token o con token inválido reciben **HTTP 401 Unauthorized**.

2. **Protección de la Clave de Groq:**
   - `GROQ_API_KEY` se almacena exclusivamente en Cloudflare como **Secret cifrado**.
   - No se incluye en el código móvil, ni en variables `EXPO_PUBLIC_`, ni en repositorios públicos.

3. **Prevención de Abusos y Aislamiento:**
   - Rate limiting por IP (máximo 25 peticiones por minuto) para proteger la cuota gratuita.
   - Restricción de longitud de mensajes (máximo 1000 caracteres) y profundidad de historial (máximo 10 turnos).
   - Inyección controlada de los datos verificados del usuario en el prompt del sistema.
   - El modelo Groq **no tiene acceso directo a la base de datos**; solo recibe el contexto preprocesado y verificado.

---

## 🚀 Despliegue en Cloudflare Workers

### Paso 1: Instalar dependencias del Worker (o utilizar npx)
Desde la carpeta raíz del proyecto o dentro de `cloudflare-worker`:
```bash
cd cloudflare-worker
npm install
```

### Paso 2: Iniciar sesión en Cloudflare
Si aún no has iniciado sesión en Cloudflare desde tu terminal:
```bash
npx wrangler login
```
Se abrirá el navegador para autorizar a Wrangler con tu cuenta gratuita de Cloudflare.

### Paso 3: Configurar el secreto `GROQ_API_KEY`
Como ya tienes tu API Key de Groq, configúrala como secreto en tu Worker ejecutando:
```bash
npx wrangler secret put GROQ_API_KEY
```
Te solicitará que pegues el valor de tu clave API de Groq obtenida desde console.groq.com.

### Paso 4: Desplegar el Worker
Ejecuta el comando de despliegue:
```bash
npx wrangler deploy
```

Al terminar, la terminal te mostrará la URL pública asignada, por ejemplo:
```text
Published vetlink-chat-worker (1.23 sec)
  https://vetlink-chat-worker.<tu-subdominio>.workers.dev
```

### Paso 5: Conectar la aplicación móvil Expo
Copia la URL obtenida en tu archivo `.env` de la aplicación móvil:
```env
EXPO_PUBLIC_CHAT_API_URL=https://vetlink-chat-worker.<tu-subdominio>.workers.dev
```

---

## 🛠️ Pruebas Locales (Opcional)
Para probar el Worker en tu máquina antes de desplegar:
```bash
cd cloudflare-worker
npx wrangler dev
```
Estará escuchando en `http://localhost:8787`. Puedes configurar en `.env`:
```env
EXPO_PUBLIC_CHAT_API_URL=http://localhost:8787
```

---

## 🔍 Endpoints del Worker

| Método | Ruta | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` o `/` | Comprueba el estado del servicio y el modelo activo. | No |
| `POST` | `/` o `/chat` | Envía la pregunta y el historial al modelo Groq. | **Sí** (`Authorization: Bearer <token>`) |
