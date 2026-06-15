# Food Store - Sistema de Gestión de Pedidos de Comida

Proyecto frontend desarrollado para el Trabajo Práctico Integrador de Programación III.

La aplicación simula un sistema de gestión de pedidos de comida. Permite iniciar sesión, navegar un catálogo de productos, filtrar y buscar comidas, administrar un carrito de compras, confirmar pedidos y consultar los pedidos realizados por cada usuario. También incluye un panel administrador con estadísticas, gestión de productos, categorías y pedidos.

El proyecto funciona de forma local, utilizando archivos JSON como datos iniciales y `localStorage` para persistir los cambios realizados durante el uso de la aplicación.

## Tecnologías utilizadas

* HTML5
* CSS3
* TypeScript
* Vite
* SweetAlert2
* pnpm
* JSON local
* localStorage

## Instalación

Este proyecto utiliza `pnpm` como gestor de paquetes.

Para instalar las dependencias, ejecutar:

```bash
pnpm install
```

## Ejecución en desarrollo

Para levantar el proyecto en modo desarrollo:

```bash
pnpm dev
```

Luego abrir la URL informada por Vite. Normalmente:

```text
http://localhost:5173
```

## Generar build de producción

Para compilar el proyecto:

```bash
pnpm build
```

## Vista previa del build

Para ejecutar una vista previa luego de compilar:

```bash
pnpm preview
```

## Usuarios de prueba

### Administrador

* Email: `admin@foodstore.com`
* Password: `admin123`
* Rol: `ADMIN`

### Usuario

* Email: `usuario@foodstore.com`
* Password: `usuario123`
* Rol: `USUARIO`

## Funcionalidades implementadas

* Login educativo con usuarios precargados.
* Registro público de nuevos usuarios.
* Registro siempre asignado con rol `USUARIO`.
* Usuario administrador reservado para datos precargados.
* Sesión persistida en `localStorage`.
* Redirección según rol:

  * `ADMIN` al panel administrador.
  * `USUARIO` al catálogo de productos.
* Protección de rutas para usuarios no logueados.
* Protección de rutas administrativas.
* Catálogo de productos.
* Categorías de productos.
* Búsqueda de productos en tiempo real.
* Filtro de productos por categoría.
* Ordenamiento de productos por nombre y precio.
* Detalle de producto por id.
* Validación de disponibilidad antes de agregar productos al carrito.
* Validación de stock antes de agregar productos al carrito.
* Carrito persistente en `localStorage`.
* Carrito separado por usuario logueado.
* Sumar y restar cantidades en el carrito.
* Eliminar productos del carrito.
* Vaciar carrito.
* Cálculo de total del pedido.
* Confirmación de pedido con forma de pago.
* Formas de pago disponibles:

  * Efectivo
  * Transferencia
  * Tarjeta
* Limpieza automática del carrito luego de confirmar un pedido.
* Descuento de stock luego de confirmar un pedido.
* Pedidos iniciales cargados desde datos locales.
* Nuevos pedidos persistidos en `localStorage`.
* Pantalla "Mis pedidos" filtrada por usuario logueado.
* Panel administrador con estadísticas generales.
* Resumen rápido en panel administrador.
* CRUD de categorías.
* CRUD de productos.
* Gestión de pedidos desde el panel administrador.
* Edición del estado de pedidos.
* Filtro de pedidos por estado en el panel administrador.
* Baja lógica de productos y categorías.
* Cambios de productos y categorías persistidos en `localStorage`.
* Visualización de cambios en el catálogo luego de modificar datos desde el panel administrador.

## Validaciones implementadas

* Validación de email.
* Validación de celular.
* Validación de contraseña.
* Validación de campos obligatorios.
* Validación de productos sin stock.
* Validación de productos no disponibles.
* Validación de URL de imagen.
* Validación de categorías duplicadas.
* Validación de productos duplicados.
* Validación de cantidades en carrito.
* Validación de usuario logueado para operaciones privadas.

## Datos locales

Los datos base del proyecto se encuentran en:

```text
src/data/usuarios.json
src/data/categorias.json
src/data/productos.json
src/data/pedidos.json
```

Estos archivos funcionan como datos iniciales de la aplicación.

Durante la ejecución, los cambios realizados por el usuario se guardan en `localStorage`, por ejemplo:

* usuarios registrados;
* sesión activa;
* productos modificados;
* categorías modificadas;
* carrito por usuario;
* pedidos confirmados.

## Persistencia

El proyecto no utiliza base de datos ni backend real.

La persistencia se realiza de la siguiente manera:

* Los datos iniciales se cargan desde archivos JSON locales.
* Los cambios realizados en la aplicación se guardan en `localStorage`.
* El carrito se guarda de forma independiente para cada usuario.
* Los pedidos nuevos se agregan al almacenamiento local.
* Las modificaciones del panel administrador impactan en los datos visibles del catálogo.

## Alcance del proyecto

Este proyecto corresponde únicamente al frontend del TPI.

No utiliza:

* Backend real.
* API externa.
* Spring Boot.
* Base de datos.
* Autenticación real con servidor.

El login implementado es educativo y funciona con datos locales simulados.

## Estructura general

```text
src/
├── data/
├── pages/
├── sections/
├── types/
├── utils/
├── main.ts
└── style.css
```

## Aclaración sobre la entrega

No se incluye la carpeta `node_modules`, ya que las dependencias deben instalarse mediante `pnpm install`.

Tampoco es necesario incluir la carpeta `dist`, porque puede generarse nuevamente ejecutando:

```bash
pnpm build
```

## Comandos principales

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Autor

Andrés Piuzzi

Programación III
Tecnicatura Universitaria en Programación
