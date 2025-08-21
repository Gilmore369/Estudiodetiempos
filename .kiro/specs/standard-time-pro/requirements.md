# Requirements Document

## Introduction

Standard Time Pro es una aplicación web progresiva (PWA) diseñada para guiar a analistas de ingeniería industrial a través del proceso completo de estudios de tiempos. La aplicación se integra con Google Sheets para almacenar y sincronizar todos los datos en tiempo real, permitiendo acceso desde cualquier dispositivo (desktop, tablet, móvil) y facilitando el análisis de procesos industriales con metodología Westinghouse y tolerancias OIT.

## Requirements

### Requirement 1: Autenticación y Configuración Inicial

**User Story:** Como analista de ingeniería industrial, quiero autenticarme con mi cuenta de Google y configurar mi hoja de cálculo de trabajo, para que la aplicación pueda almacenar y sincronizar todos mis datos de estudios de tiempos.

#### Acceptance Criteria

1. WHEN el usuario accede por primera vez THEN el sistema SHALL mostrar una pantalla de autenticación con Google OAuth
2. WHEN el usuario se autentica exitosamente THEN el sistema SHALL solicitar la URL del Google Sheet o ofrecer crear uno nuevo
3. WHEN el usuario proporciona una URL de Google Sheet THEN el sistema SHALL verificar el acceso y validar la estructura
4. IF el Google Sheet no contiene las pestañas requeridas THEN el sistema SHALL crear automáticamente las pestañas: Config_Estudios, DB_Colaboradores, DB_Procesos, Tiempos_Observados, Calculo_y_Resultados, DAP_Data
5. WHEN la configuración inicial se completa THEN el sistema SHALL guardar la configuración y permitir acceso a la aplicación

### Requirement 2: Gestión de Datos Maestros

**User Story:** Como analista de ingeniería industrial, quiero gestionar la información de colaboradores y procesos de mi planta, para que pueda seleccionarlos durante mis estudios de tiempos.

#### Acceptance Criteria

1. WHEN accedo al módulo de datos maestros THEN el sistema SHALL mostrar opciones para gestionar colaboradores y procesos
2. WHEN agrego un nuevo colaborador THEN el sistema SHALL escribir inmediatamente los datos en la pestaña DB_Colaboradores del Google Sheet
3. WHEN agrego un nuevo proceso THEN el sistema SHALL escribir los datos del proceso y recursos necesarios en la pestaña DB_Procesos
4. WHEN edito información existente THEN el sistema SHALL actualizar la fila correspondiente en el Google Sheet
5. WHEN elimino un registro THEN el sistema SHALL remover la fila del Google Sheet y validar que no esté siendo usado en estudios activos

### Requirement 3: Inicio de Nuevo Estudio

**User Story:** Como analista de ingeniería industrial, quiero iniciar un nuevo estudio de tiempos seleccionando el proceso y colaborador, para que el sistema registre la información básica del estudio.

#### Acceptance Criteria

1. WHEN inicio un nuevo estudio THEN el sistema SHALL mostrar un formulario con campos para proceso, colaborador y analista
2. WHEN selecciono un proceso THEN el sistema SHALL cargar la información desde DB_Procesos
3. WHEN selecciono un colaborador THEN el sistema SHALL cargar la información desde DB_Colaboradores
4. WHEN completo el formulario THEN el sistema SHALL generar un ID único de estudio y crear una nueva fila en Config_Estudios
5. WHEN el estudio se crea exitosamente THEN el sistema SHALL navegar al módulo de cronometraje

### Requirement 4: Cronometraje en Vivo

**User Story:** Como analista de ingeniería industrial, quiero cronometrar elementos de operación en tiempo real, para que cada tiempo registrado se guarde inmediatamente en Google Sheets.

#### Acceptance Criteria

1. WHEN accedo al cronometraje THEN el sistema SHALL mostrar un cronómetro digital y campos para definir elementos de operación
2. WHEN defino un nuevo elemento THEN el sistema SHALL agregarlo a la lista de elementos del ciclo actual
3. WHEN inicio el cronómetro para un elemento THEN el sistema SHALL comenzar a contar el tiempo
4. WHEN detengo el cronómetro THEN el sistema SHALL registrar el tiempo y escribir inmediatamente una fila en Tiempos_Observados con ID_Estudio, Nombre_Elemento, Numero_Ciclo, Tiempo_Registrado
5. WHEN completo un ciclo THEN el sistema SHALL incrementar automáticamente el número de ciclo
6. WHEN registro múltiples ciclos THEN el sistema SHALL mantener un historial visible de todos los tiempos registrados

### Requirement 5: Evaluación de Desempeño Westinghouse

**User Story:** Como analista de ingeniería industrial, quiero evaluar el desempeño del colaborador usando la metodología Westinghouse, para que los factores se apliquen correctamente en el cálculo del tiempo estándar.

#### Acceptance Criteria

1. WHEN accedo a la evaluación de desempeño THEN el sistema SHALL mostrar las cuatro categorías Westinghouse: Habilidad, Esfuerzo, Condiciones, Consistencia
2. WHEN selecciono una calificación para cada categoría THEN el sistema SHALL mostrar el factor numérico correspondiente
3. WHEN completo todas las evaluaciones THEN el sistema SHALL calcular el factor Westinghouse total
4. WHEN guardo la evaluación THEN el sistema SHALL actualizar la fila del estudio en Config_Estudios con los factores seleccionados
5. IF modifico una evaluación existente THEN el sistema SHALL actualizar inmediatamente los datos en Google Sheets

### Requirement 6: Asignación de Tolerancias OIT

**User Story:** Como analista de ingeniería industrial, quiero asignar suplementos de tolerancia según metodología OIT, para que se incluyan en el cálculo del tiempo estándar.

#### Acceptance Criteria

1. WHEN accedo a tolerancias THEN el sistema SHALL mostrar categorías de suplementos: Necesidades Personales, Fatiga, y otros suplementos variables
2. WHEN selecciono porcentajes de tolerancia THEN el sistema SHALL validar que estén dentro de rangos aceptables
3. WHEN confirmo las tolerancias THEN el sistema SHALL guardar los porcentajes en la fila del estudio en Config_Estudios
4. WHEN calculo tolerancias totales THEN el sistema SHALL sumar todos los porcentajes aplicables
5. IF las tolerancias exceden límites recomendados THEN el sistema SHALL mostrar una advertencia

### Requirement 7: Cálculos Automatizados

**User Story:** Como analista de ingeniería industrial, quiero que el sistema calcule automáticamente los tiempos normal y estándar, para que obtenga resultados precisos basados en mis observaciones.

#### Acceptance Criteria

1. WHEN solicito cálculos THEN el sistema SHALL leer todos los tiempos observados de la pestaña Tiempos_Observados para el ID_Estudio
2. WHEN procesa los datos THEN el sistema SHALL calcular el Tiempo Observado Promedio por cada elemento
3. WHEN aplica factores Westinghouse THEN el sistema SHALL calcular el Tiempo Normal multiplicando TO por el factor de desempeño
4. WHEN aplica tolerancias THEN el sistema SHALL calcular el Tiempo Estándar aplicando los suplementos al Tiempo Normal
5. WHEN completa los cálculos THEN el sistema SHALL escribir los resultados en Calculo_y_Resultados con TO Promedio, TN, TE por elemento y TE Total

### Requirement 8: Dashboard de Resultados

**User Story:** Como analista de ingeniería industrial, quiero visualizar los resultados finales del estudio de tiempos, para que pueda revisar y validar los tiempos estándar calculados.

#### Acceptance Criteria

1. WHEN accedo al dashboard THEN el sistema SHALL leer los datos de Calculo_y_Resultados para mostrar resultados del estudio actual
2. WHEN visualizo resultados THEN el sistema SHALL mostrar TO Promedio, TN, TE por elemento y TE Total de forma clara
3. WHEN reviso el resumen THEN el sistema SHALL mostrar información del estudio: proceso, colaborador, analista, fecha
4. WHEN exporto resultados THEN el sistema SHALL generar un reporte en formato PDF o imagen
5. IF no existen resultados calculados THEN el sistema SHALL mostrar un mensaje indicando que se deben completar los cálculos

### Requirement 9: Diagrama de Análisis de Proceso (DAP)

**User Story:** Como analista de ingeniería industrial, quiero crear un Diagrama de Análisis de Proceso, para que pueda documentar y visualizar el flujo completo del proceso analizado.

#### Acceptance Criteria

1. WHEN accedo al módulo DAP THEN el sistema SHALL mostrar herramientas para construir el diagrama con símbolos estándar
2. WHEN selecciono un tipo de actividad THEN el sistema SHALL permitir agregar operaciones, transportes, demoras, inspecciones y almacenamientos
3. WHEN registro una actividad THEN el sistema SHALL solicitar distancia y tiempo cuando sea aplicable
4. WHEN guardo actividades del DAP THEN el sistema SHALL escribir los datos en la pestaña DAP_Data
5. WHEN genero el diagrama final THEN el sistema SHALL crear una visualización gráfica con líneas y flechas representando recorridos
6. WHEN exporto el DAP THEN el sistema SHALL generar el diagrama como imagen o PDF

### Requirement 10: Funcionalidad PWA y Responsividad

**User Story:** Como analista de ingeniería industrial, quiero acceder a la aplicación desde cualquier dispositivo, para que pueda realizar estudios de tiempos tanto en escritorio como en dispositivos móviles.

#### Acceptance Criteria

1. WHEN accedo desde cualquier dispositivo THEN la aplicación SHALL adaptarse automáticamente al tamaño de pantalla
2. WHEN instalo la PWA THEN el sistema SHALL funcionar como aplicación nativa en el dispositivo
3. WHEN uso la aplicación en móvil THEN todos los controles SHALL ser accesibles y fáciles de usar con touch
4. WHEN cambio orientación del dispositivo THEN la interfaz SHALL reorganizarse apropiadamente
5. IF pierdo conexión a internet THEN la aplicación SHALL mostrar el estado offline y permitir continuar con funciones básicas

### Requirement 11: Sincronización en Tiempo Real

**User Story:** Como analista de ingeniería industrial, quiero que todos mis datos se sincronicen automáticamente con Google Sheets, para que no pierda información y pueda acceder desde múltiples dispositivos.

#### Acceptance Criteria

1. WHEN registro cualquier dato THEN el sistema SHALL escribir inmediatamente en Google Sheets
2. WHEN múltiples usuarios acceden al mismo Sheet THEN el sistema SHALL manejar conflictos de escritura apropiadamente
3. WHEN se restaura la conexión después de estar offline THEN el sistema SHALL sincronizar todos los cambios pendientes
4. WHEN ocurre un error de sincronización THEN el sistema SHALL mostrar notificación y reintentar automáticamente
5. IF la sincronización falla repetidamente THEN el sistema SHALL permitir sincronización manual y mostrar datos no sincronizados