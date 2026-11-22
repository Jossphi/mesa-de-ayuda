---
name: informe-mesa-de-ayuda
description: Analiza un archivo Excel de tickets de la mesa de ayuda de una universidad y genera un informe en español para el coordinador. Resume cuántos tickets hay, su distribución por categoría y estado, qué categoría acumula más pendientes y qué problemas pueden convertirse en preguntas frecuentes para estudiantes. Úsala cuando pidan «Informe de mesa de ayuda», un resumen de tickets o un análisis del archivo Mesa_de_Ayuda.
---

# Informe de mesa de ayuda

## Fuente de datos

- Busca en Google Drive la carpeta **maestria** (sin distinguir mayúsculas ni tildes) y, dentro de ella, el Excel **Mesa_de_Ayuda** (acepta variantes como «Mesa de ayuda»). Si el usuario adjunta un Excel, usa ese archivo en su lugar.
- Lee **todas** las filas y hojas del archivo antes de calcular nada.
- Si no encuentras la carpeta, el archivo o la hoja de tickets, solicita el archivo o la hoja correspondiente. No inventes datos.

## Tono institucional

Los tickets muestran una universidad que recibe solicitudes por varios canales (Formulario, Correo, Teléfono) y las registra en un mismo archivo. Redacta como lo haría la propia institución:

- Español neutro, formal pero cercano; frases cortas y claras, sin tecnicismos innecesarios ni jerga informal.
- Informe dirigido al coordinador: objetivo, sobrio, orientado a decisiones. Usa la tercera persona o el plural institucional («se registraron», «recomendamos»).
- Preguntas frecuentes: formuladas en primera persona como las escribiría un estudiante («No puedo…», «¿Por qué…?»), con respuestas amables y respetuosas que no culpen al usuario.
- Nombra los servicios como aparecen en los datos (aula virtual, correo institucional, matrícula, biblioteca digital).
- Excluye nombres, correos y otros datos personales.

## Instrucciones

### 1. Identifica los datos del Excel

- Identifica la hoja con el registro de tickets. Si hay varias candidatas y no queda claro cuál es, pregunta cuál usar.
- Usa **TicketID** para identificar los casos y respaldar el hallazgo, **Categoría** para agrupar, **Estado** para determinar la situación y **Asunto** o **Descripción** para entender el problema. Acepta encabezados equivalentes cuando su significado sea claro (p. ej. «Categoria», «Descripcion»).
- Excluye filas vacías y filas de totales. Si un TicketID aparece repetido, cuéntalo una sola vez. Si sus registros se contradicen y el archivo no permite saber cuál es el vigente, señala la discrepancia y no asignes categoría ni estado sin respaldo.

### 2. Calcula los indicadores

- Presenta el total de tickets y dos tablas: distribución por categoría y distribución por estado, ambas con cantidad y porcentaje sobre el total.
- Identifica la categoría con más tickets y la categoría con más tickets pendientes. Indica la cantidad y enumera **todas** las categorías empatadas, si las hay.
- Usa los estados tal como figuran en el Excel. Indica explícitamente cuáles contaste como pendientes. Si un estado es ambiguo, pide aclaración para clasificarlo y entrega los resultados que sí puedas calcular.
- Si no hay tickets pendientes, indícalo.

### 3. Redacta un hallazgo para el coordinador

- Elige un patrón observado que ayude a decidir qué problema atender o qué proceso mejorar.
- Formato: **Hallazgo → Evidencia → Acción sugerida**.
- En la evidencia incluye los TicketID que respaldan el hallazgo y la cantidad de casos. Propón una acción concreta vinculada con esa evidencia.

### 4. Redacta tres preguntas frecuentes para estudiantes

- Formula tres preguntas claras y distintas, en el lenguaje de un estudiante, a partir de problemas observados en los tickets.
- Prioriza los problemas recurrentes cuando haya evidencia suficiente. Si solo puedes sustentar una o dos, preséntalas e indica que faltan datos para completar las tres.

### 5. Maneja la información faltante

- Celdas vacías en Categoría o Estado: muéstralas como «Sin categoría» o «Sin estado» en la distribución y exclúyelas de los rankings que dependan del dato faltante.
- Columna completa ausente: explica qué cálculo o sección queda limitado y completa las demás con los datos disponibles.
- Falta TicketID: indica si el total corresponde a filas de tickets y aclara que no se pudo verificar duplicados ni citar identificadores en el hallazgo.
- Usa únicamente información del archivo. Omite nombres, correos y otros datos personales.

## Formato del informe

1. Total de tickets y tablas de distribución
2. Categoría con más tickets y categoría con más pendientes
3. Hallazgo → Evidencia → Acción sugerida
4. Preguntas frecuentes para estudiantes
5. Observaciones sobre los datos (cuando corresponda)
