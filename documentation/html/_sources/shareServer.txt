==============================================
**Shared Server**
==============================================

*Tecnologías principales*
======================================

FrontEnd
--------------------------

- HTML para definición de vistas.
- Javascript: Lenguaje principal.
- Boostrap: Definición de estilos.
- AngularJS: Estructurar la aplicación web como Single Page Applicatión.


Backend
--------------------------
- Javascript: Lenguaje base.
- Node JS: Web Server basado en Chrome V8.
- Express JS: Framework para enrutamiento.
- Postgres DB: Base de Datos Postgresql.
- pg: Connector de base de datos nodejs-postgres.
- Heroku: Hosting gratuito utilizado para ambiente de desarrollo.


*Descripción de solución implementada*
======================================

FrontEnd
--------------------------------------------------
#. Dentro de la carpeta “views” se encuentran los .html que contienen toda la estructura de la aplicación web (inputs, formularios, botones, labels, etc). El objetivo de estos archivos es que el usuario pueda ir navegando a través de la página web y realizar las consultas que él considere necesarias y a medida que lo hace pueda hacer cambios sobre la base de datos.
#. Dentro de la carpeta “views” se encuentra el controller.js que es un archivo de JavaScript que contiene la lógica de cómo extraer/agregar/consultar información de los datos y que maneja el flujo e intercambio de estos con la base de datos. También encontramos jquery.js que contiene toda la librería para poder utilizar las funciones que nos provee Jquery.


Backend
---------------------------------------
Estructura general
~~~~~~~~~~~~~~~~~~~
La arquitectura del Shared Server es bastante simple. A continuación se detalla cada componente de la arquitectura y su función.

.. figure:: images/taller2sharedserver.png
   :align:   center

| 

Express JS
~~~~~~~~~~~~~~~~~~~
Los usuarios se comunican con el servidor usando la API RESTful proporcionada, el ruteador, que utiliza el framework Express JS, se encarga de manejar y derivar la ruta que fue proporcionada. Utilizando Express se facilita el manejo de rutas dado que resulta muy simple e intuitivo.

| 

Service Layer
~~~~~~~~~~~~~~~~~~~
Se creó una capa de servicios la cual es utilizada en los pedidos de la API dependiendo del pedido solicitado. Contiene métodos y validaciones necesarias. Se conecta con la base de datos utilizando un conector.
Existen 2 servicios principales:

- User Service: se encarga de los pedidos relacionados con usuarios. (crear, borrar, consultar, editar)
- Interest Service: se encarga de los intereses. (crear, consultar)

| 

Models
~~~~~~~~~~~~~~~~~~~
Se utilizan modelos simples para representar las entidades y tablas de la base SQL. La comunicación con la base de datos se hace mediante un conector (SQLize) el cual se conecta e interactúa con la base de datos utilizando el módulo ‘pg’.
Una vez que se procesa el pedido se devuelve en formato json siguiendo la API Restful especificada.

| 

Workflow
~~~~~~~~~~~~~~~~~~~
.. figure:: images/workflow.png
   :align:   center

Utilizando el ruteador de Express JS, se accede a la ruta (pedido http) solicitada. En esa ruta se parsean los datos enviados y se los delega al Service indicado (userService o interestService).

El Service, se encarga de procesar los datos que han sido enviados y de hacer los llamados correspondientes al conector de la base de datos.

Una vez que los datos han sido impactados/obtenidos (crear, modificar, borrar, consultar), se devuelve al usuario el resultado correspondiente.
El resultado puede ser el esperado, como también puede ser un código de error, si se produce alguna eventualidad en el proceso.


*Manual de usuario*
===================

Web de administración
---------------------
Para poder administrar los datos almacenados en el servidor se proporciona una página web con las operaciones básicas sobre intereses y usuarios.

URL:  http://tinder-shared.herokuapp.com

Home
~~~~~~~~~~~~~~~~~~~
- URL: http://tinder-shared.herokuapp.com/#/users
- Navegación: “”

.. figure:: images/index.png
   :align:   center

   En esta sección es posible listar todos los usuarios y filtrarlos por id.


Creación de usuario
~~~~~~~~~~~~~~~~~~~
- URL: http://tinder-shared.herokuapp.com/#/users/add
- Navegación: “Usuarios/Crear”

.. figure:: images/usuario_crear.png
   :align:   center

   En esta sección es posible crear un usuario completando el formulario y seleccionando los intereses.


Edición de foto de usuario
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- URL: http://tinder-shared.herokuapp.com/#/user/edit/photo
- Navegación: “Usuarios/Editar Foto”

.. figure:: images/usuario_fotoperfil.png
   :align:   center

   En esta sección es posible editar la foto de un usuario como una url (actualmente la misma no se encuentra reflejada en el usuario, más adelante funcionará para subir la foto de un usuario, aunque es posible que esto se fusione con la edición de usuario.

Edición de usuario
~~~~~~~~~~~~~~~~~~~
- URL: http://tinder-shared.herokuapp.com/#/users/edit
- Navegación: “Usuarios/Modificar”

.. figure:: images/usuario_modificar.png
   :align:   center

   Allí podemos ingresar el ID del y presionando el botón se cargan los datos del usuario.. Una vez completo el formulario, con el botón “Modificar usuario” se confirman los datos, obteniendo el correspondiente mensaje del estado de la operación.


Visualización de usuario
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- URL: http://tinder-shared.herokuapp.com/#/user/8 (8 es el id del usuario)
- Navegación: Desde el listado de usuarios, clickear en el botón “Ver” de un usuario.

.. figure:: images/usuario_planilla.png
   :align:   center

   Aquí se puede tener una vista más detallada de los usuarios.



Creación de intereses
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
- URL: http://tinder-shared.herokuapp.com/#/interests/add
- Navegación: “Intereses/Crear”


.. figure:: images/intereses_crear.png
   :align:   center

   Allí podemos ingresar los datos del interés a registrar. Finalmente haciendo clic en el botón “Agregar Interés” se agregara a la base de datos ese interés. Ya sea que la operación haya sido exitosa o no, se informará con un mensaje del estado final.




Listar intereses
~~~~~~~~~~~~~~~~~~~
- URL: http://tinder-shared.herokuapp.com/#/interests
- Navegación: “Intereses/Listar”

.. figure:: images/intereses_listar.png
   :align:   center

   En esta sección es posible listar todos los intereses agrupados por categorías.


Manual técnico
======================================
Para poder ejecutar el servidor de forma local es necesario tener instaladas las siguientes dependencias:
- NodeJs
- Npm for NodeJs

Una vez instaladas las dependencias es necesario pararse en el directorio raíz de la aplicación y ejecutar el comando

``$ npm start``

Al finalizar el startup de la aplicación el servidor quedará escuchando peticiones en la siguiente url:

http://localhost:3000

