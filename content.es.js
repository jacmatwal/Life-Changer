/*
 * Español (Latinoamérica). Misma estructura que content.en.js: las claves y los id no se traducen.
 *
 * Las ideas vienen del ensayo de Dan Koe "How to fix your entire life in 1 day".
 * El texto es una paráfrasis simplificada y traducida, no una copia del ensayo.
 */
(window.LC_CONTENT = window.LC_CONTENT || {}).es = {
  // Texto de la interfaz. {nombre} se reemplaza al mostrarlo; ".one" y ".other" son singular y plural.
  ui: {
    'nav.label': 'Secciones',
    'nav.start': 'Inicio',
    'nav.ideas': 'Ideas',
    'nav.morning': 'Mañana',
    'nav.day': 'Día',
    'nav.evening': 'Noche',
    'nav.game': 'Juego',
    'lang.label': 'Idioma',
    'foot.source': 'Un complemento no oficial del ensayo de Dan Koe {link}. Las ideas son suyas. El texto de esta app es una paráfrasis simplificada y traducida, así que lee el original, en inglés, para ver el argumento completo.',
    'foot.privacy': 'Tus respuestas se guardan solo en este navegador y nunca se envían a ningún lado. Este es un ejercicio de reflexión, no atención de salud mental.',
    'notice.storage': 'Este navegador está bloqueando el almacenamiento, así que tus respuestas se perderán al cerrar la página. Cópialas desde la pestaña Juego antes de salir.',

    'common.nOfM': '{n} de {m}',
    'common.range': '{a} al {b}',
    'common.blank': '(en blanco)',
    'common.cancel': 'Cancelar',
    'unit.day.one': 'día',
    'unit.day.other': 'días',
    'unit.quest.one': 'misión',
    'unit.quest.other': 'misiones',
    'unit.answer.one': 'respuesta',
    'unit.answer.other': 'respuestas',

    'start.lede': 'Life Changer te guía por el protocolo del ensayo de {author}, <em>{title}</em>: una mañana de preguntas difíciles, seis pausas durante el día y una noche que convierte tus respuestas en un plan de juego de una página. {total} preguntas en total.',
    'start.begin': 'Empezar la sesión de la mañana',
    'start.open': 'Abrir tu tablero de juego',
    'start.continue.morning': 'Continuar con la sesión de la mañana',
    'start.continue.day': 'Continuar con las pausas del día',
    'start.continue.evening': 'Continuar con la sesión de la noche',
    'start.continue.game': 'Continuar con tu tablero de juego',
    'start.readIdea': 'Leer primero la idea',
    'start.yourDay': 'Tu día',
    'start.dayN': 'Día {n}',
    'start.know': 'Antes de empezar',

    'ideas.stepLabel': 'Paso {n}: {title}',
    'ideas.prev': 'Anterior',
    'ideas.next': 'Siguiente paso',
    'ideas.count': 'Idea {n} de {m}',
    'ideas.toMorning': 'Ir a la sesión de la mañana',

    'step.questions': 'Preguntas',
    'step.segLabel': '{group}, pregunta {n}',
    'step.answer': 'Tu respuesta',
    'step.placeholder': 'Escríbelo completo. Nadie más lo va a leer.',
    'step.back': 'Atrás',
    'step.next': 'Siguiente',
    'step.saved': 'Se guarda mientras escribes',
    'step.reread': 'Releer lo que escribiste hoy ({n})',

    'day.state.done': 'Respondida',
    'day.state.due': 'Lista',
    'day.state.later': 'Aún no',
    'day.goTo': 'Ir a la pausa de las {time}',
    'day.schedule': 'Horario',
    'day.now': 'Ahora',
    'day.copySchedule': 'Copiar el horario',
    'day.addCalToday': 'Agregar al calendario (hoy)',
    'day.addCalTomorrow': 'Agregar al calendario (mañana)',
    'day.resetTimes': 'Usar las horas sugeridas',
    'day.checkins': 'Pausas',
    'day.reminderTime': 'Hora del recordatorio',
    'day.placeholder': 'Con una o dos líneas basta.',
    'day.optional': 'Opcional.',
    'day.toEvening': 'Ir a la sesión de la noche',

    'ics.checkin': 'Pausa de Life Changer. Respóndela en la app.',
    'ics.dailySummary': 'Life Changer: las misiones de hoy',
    'ics.dailyDesc': 'Marca tus misiones diarias.',
    'ics.monthlySummary': 'Life Changer: revisa el mes y elige el siguiente proyecto',
    'ics.monthlyDesc': 'Cierra el mes.',

    'quests.title': 'Misiones de hoy',
    'quests.empty': 'Todavía no hay misiones. Escribe tus palancas diarias en la <a href="#evening">sesión de la noche</a>, o en la ficha Palancas diarias de abajo, una por línea. Aparecerán aquí como una lista para marcar.',
    'quests.weekLabel': 'Misiones cumplidas en los últimos siete días',
    'readout.some': '{date}: {done} de {quests} cumplidas',
    'readout.none': '{date}: sin misiones registradas',

    'status.label': 'En qué punto del año estás',
    'status.yearComplete': 'Año completo',
    'status.day': 'Día {n} de {m}',
    'status.month': 'Mes {n}',
    'status.reviewDue': 'toca revisión',
    'status.left.one': 'queda {n} día',
    'status.left.other': 'quedan {n} días',
    'status.yearUp': 'Ya pasó un año desde que hiciste el protocolo. Koe recomienda repetirlo cada año.',
    'status.monthUp': 'Terminó el mes {n}. Revísalo y elige la siguiente pelea con el jefe.',
    'status.reviewMonth': 'Revisar el mes {n}',

    'game.pieces': 'Las seis piezas',
    'game.monthDue': 'Mes {n} · toca revisión',
    'game.monthEnds': 'Mes {n} · termina el {date}',

    'year.title': 'Tu año',
    'year.summary': '{full} de {days} con todas las misiones cumplidas',
    'year.streak': ', {n} seguidos ahora mismo',
    'year.help': 'Cada fila es un mes y cada cuadro es un día. Toca un cuadro para leerlo.',
    'year.aria': 'Historial de misiones por día.',
    'year.legend.none': 'Ninguna misión',
    'year.legend.some': 'Algunas',
    'year.legend.full': 'Todas',

    'months.title': 'Meses',
    'months.current': 'El mes {n} va del {range}. Cuando termine, lo revisas y eliges el siguiente proyecto. <a href="#review">Cerrarlo antes</a>',
    'months.summary': 'Mes {n} · {range} · {full}/{days} días completos',
    'months.project': 'El proyecto',
    'months.result': 'Lo que construiste o aprendiste',
    'months.compare': 'Frente a la meta a un año',
    'months.adjust': 'Lo que cambiaste',

    'stay.title': 'Mantén el ritmo',
    'stay.intro': 'Esta página no puede recordártelo por sí sola. Elige una hora y agrega dos recordatorios repetidos a tu calendario: uno diario para las misiones y uno mensual para la revisión.',
    'stay.time': 'Hora del recordatorio diario',
    'stay.add': 'Agregar recordatorios al calendario',
    'stay.embed': 'Esta página no puede recordártelo por sí sola. Pon una alarma diaria en tu celular y ponle el nombre de tu primera misión.',
    'stay.install': 'Agrega esta página a tu pantalla de inicio para que se abra como una app y sea menos probable que se borren tus respuestas. En iPhone: Compartir y luego Agregar a inicio. En Android: el menú del navegador y luego Instalar app o Agregar a la pantalla principal.',

    'keep.title': 'Guárdalo bien',
    'keep.intro': 'Todo vive en este navegador, en este dispositivo. Un respaldo te permite recuperarlo si se borran los datos del navegador, o pasarlo a un celular nuevo.',
    'keep.download': 'Descargar un respaldo',
    'keep.copy': 'Copiar un código de respaldo',
    'keep.restore': 'Restaurar desde un respaldo',
    'keep.paste': 'Pega un código de respaldo o elige un archivo de respaldo.',
    'keep.file': 'Archivo de respaldo',
    'keep.check': 'Revisar este respaldo',
    'keep.replace': 'Reemplazar lo que hay en este dispositivo',
    'keep.plain': 'Para leer o compartir tus respuestas como texto:',
    'keep.copyBoard': 'Copiar el tablero',
    'keep.copyAll': 'Copiar todas las respuestas',
    'keep.downloadText': 'Descargar como texto',
    'backup.never': 'Todavía no has hecho un respaldo.',
    'backup.today': 'Último respaldo: hoy.',
    'backup.ago': 'Último respaldo: hace {days}.',
    'restore.summary': 'Este respaldo ({when}) contiene {answers}. Al restaurarlo se reemplaza todo lo que hay en este dispositivo.',
    'restore.unknownDate': 'fecha desconocida',

    'again.title': 'Repetirlo',
    'again.intro': 'Koe sugiere repetir el protocolo cada año. Al empezar una nueva ronda, esta se archiva en rondas anteriores y se borran las preguntas, el tablero y el historial de misiones.',
    'again.newRun': 'Empezar una nueva ronda',
    'again.erase': 'Borrar todo',
    'again.confirmNew': '¿Archivar esta ronda en rondas anteriores y empezar de nuevo desde las preguntas de la mañana?',
    'again.yesNew': 'Sí, empezar una nueva ronda',
    'again.notNow': 'Ahora no',
    'again.confirmErase': '¿Borrar de este dispositivo todas las respuestas, el historial de misiones y todas las rondas anteriores? Esto no se puede deshacer.',
    'again.yesErase': 'Sí, borrar todo',
    'again.keep': 'Conservar todo',
    'past.title': 'Rondas anteriores',
    'past.copy': 'Copiar esta ronda',

    'review.noneTitle': 'Todavía no hay un mes que revisar',
    'review.noneLede': 'Primero escribe un proyecto del mes, en la sesión de la noche o en el tablero.',
    'review.back': 'Volver al tablero',
    'review.eyebrow': 'Revisión del mes {n}',
    'review.title': 'Cerrar el mes {n}',
    'review.lede': 'El ciclo de dirección del ensayo, aplicado a tu mes: percibe dónde estás, compáralo con la meta, ajusta. Las tres preguntas de revisión son un agregado de esta app, no de Koe.',
    'review.thisMonth': 'Este mes',
    'review.stats': 'Cumpliste todas las misiones en {full} de {days}.',
    'review.early.one': 'Al mes le queda {n} día. Si lo cierras ahora, el siguiente empieza hoy.',
    'review.early.other': 'Al mes le quedan {n} días. Si lo cierras ahora, el siguiente empieza hoy.',
    'review.section': 'Revisión',
    'review.q1': '¿Qué construiste o aprendiste este mes?',
    'review.q2': 'Compáralo con tu meta a un año. ¿Estás más cerca?',
    'review.yearGoal': 'Tu meta a un año',
    'review.q3': '¿Qué harás distinto el próximo mes?',
    'review.nextProject': 'El siguiente proyecto del mes',
    'review.nextProjectHint': '¿Qué necesitas aprender o construir ahora para seguir en camino a la meta a un año?',
    'review.levers': 'Palancas diarias',
    'review.leversHint': 'Una por línea. Consérvalas o cámbialas para que encajen con el nuevo proyecto.',
    'review.start': 'Empezar el mes {n}',
    'review.notYet': 'Todavía no',
    'review.needProject': 'Primero escribe el siguiente proyecto del mes.',
    'review.started': 'Empezó el mes {n}.',

    'export.board': 'MI TABLERO DE JUEGO',
    'export.months': 'MESES',
    'export.monthLine': 'Mes {n} ({start} al {end}, {full}/{days} días completos)',
    'export.project': 'Proyecto: ',
    'export.result': 'Construido o aprendido: ',
    'export.compare': 'Frente a la meta a un año: ',
    'export.adjust': 'Cambios: ',
    'export.morning': 'Mañana: excavación',
    'export.day': 'Día: interrupciones de patrón',
    'export.evening': 'Noche: síntesis',
    'export.based': 'Basado en "{title}" de {author}: {url}',
    'copy.label': 'Texto para copiar',
    'copy.blocked': 'No se pudo copiar automáticamente. El texto está seleccionado abajo; cópialo a mano.',

    'toast.schedule': 'Horario copiado. Pégalo en tus alarmas o notas.',
    'toast.ics': 'Archivo de calendario guardado. Ábrelo para agregar los seis recordatorios.',
    'toast.yearIcs': 'Archivo de calendario guardado. Ábrelo para agregar los recordatorios.',
    'toast.board': 'Tablero copiado.',
    'toast.all': 'Todas las respuestas copiadas.',
    'toast.times': 'De vuelta a las horas sugeridas.',
    'toast.backupCopied': 'Código de respaldo copiado. Pégalo en un lugar seguro.',
    'toast.backupSaved': 'Respaldo guardado.',
    'toast.badBackup': 'Eso no es un respaldo de Life Changer. Pega el código completo o elige el archivo de respaldo.',
    'toast.restored': 'Respaldo restaurado.',
    'toast.runCopied': 'Ronda copiada.',
    'toast.newRun': 'Nueva ronda iniciada. La anterior está en rondas anteriores.',
    'toast.erased': 'Todo borrado.'
  },

  source: {
    title: 'How to fix your entire life in 1 day',
    author: 'Dan Koe',
    url: 'https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1'
  },

  start: {
    eyebrow: 'Un protocolo de un día',
    title: 'Primero conviértete en la persona. Los hábitos llegan después.',
    plan: [
      { route: 'morning', name: 'Mañana', kind: 'Excavación', text: 'De 15 a 30 minutos. Catorce preguntas sobre el dolor que toleras, la vida que no quieres y la que sí.' },
      { route: 'day', name: 'Día', kind: 'Interrupciones de patrón', text: 'Seis preguntas con hora fija que te sacan del piloto automático. Programa los recordatorios antes de empezar.' },
      { route: 'evening', name: 'Noche', kind: 'Síntesis', text: 'Nombra al verdadero enemigo y luego define un lente a un año, un lente a un mes y las acciones de mañana.' },
      { route: 'game', name: 'Tablero de juego', kind: 'Tu plan en una página', text: 'Seis piezas: lo que está en juego, cómo ganas, la misión, la pelea con el jefe, las misiones diarias y las reglas.' },
      { route: 'game', year: true, name: 'El año', kind: 'Sigue jugando', text: 'Marca las misiones cada día, revisa y cambia el proyecto cada mes y repite el protocolo después de doce meses.' }
    ],
    notes: [
      { title: 'Un día y luego un año', text: 'Las preguntas toman un solo día: una sesión en la mañana, seis interrupciones y una sesión en la noche. El tablero de juego es lo que sigues usando después, y Koe sugiere repetir el día una vez al año.' },
      { title: 'Piensa por tu cuenta', text: 'Koe es explícito: no le pases estas preguntas a una IA. Cuestionarte es pensar, y la idea es ir más allá de tus propios límites.' },
      { title: 'También sirve lápiz y papel', text: 'El ensayo pide lápiz y papel. Escribir aquí está bien si escribes oraciones de verdad. Si con el teclado respondes a la ligera, escribe a mano y usa esto para las preguntas y las pausas.' },
      { title: 'Primero viene la tensión', text: 'Quienes cambian rápido pasan por tres fases: disonancia, incertidumbre y luego descubrimiento. Espera que la mañana sea incómoda.' },
      { title: 'El momento importa', text: 'Koe no promete que esto le funcione a todo el mundo. Funciona cuando estás en el capítulo correcto de tu vida, casi siempre cuando ya te hartaste del anterior.' },
      { title: 'Tus metas deciden lo que ves', text: 'Una meta funciona como un lente: decide qué notas y qué cuenta como éxito. Por eso la noche termina en metas.' }
    ]
  },

  ideas: {
    eyebrow: 'La idea · lectura de 5 minutos',
    title: 'Por qué forzar hábitos nuevos no funciona',
    intro: 'El ensayo plantea cinco argumentos antes de llegar al protocolo. Aquí están, reducidos a lo que necesitas antes de empezar.',
    sections: [
      {
        title: 'No estás ahí porque todavía no eres la persona que estaría ahí',
        blocks: [
          { p: 'Una meta grande te pide dos cosas: cambiar lo que haces y cambiar quién eres para que hacerlo te salga natural. La mayoría solo trabaja en lo primero. Aguantan con disciplina un par de semanas y luego vuelven a lo de antes.' },
          { p: 'La prueba de Koe es el fisicoculturista, que no tiene que esforzarse para comer bien. Lo que le costaría trabajo es comer mal. El estilo de vida que produce un resultado tiene que estar instalado mucho antes de que el resultado llegue, y tiene que quedarse después.' },
          { p: 'Cuando el cambio es real, los hábitos que van contra la meta te empiezan a dar asco, porque ves con claridad en qué terminan.' }
        ]
      },
      {
        title: 'No estás ahí porque una parte de ti quiere otra cosa',
        blocks: [
          { p: 'Toda conducta apunta a una meta, y la mayoría de esas metas son inconscientes. Algunas te hacen daño, y las cubres con una explicación que suena aceptable.' },
          {
            table: {
              head: ['La historia que te cuentas', 'La meta de fondo'],
              rows: [
                ['“Sigo postergando porque me falta disciplina.”', 'Evitar el juicio que llega cuando terminas tu trabajo y lo muestras.'],
                ['“Sigo en este trabajo porque no soy de tomar riesgos.”', 'Seguridad, previsibilidad y no quedar como un fracaso ante quienes creen que ese trabajo es un éxito.']
              ]
            }
          },
          { p: 'Entonces, cambiar de verdad significa cambiar la meta. Koe define una meta como un punto de vista: una proyección hacia el futuro que funciona como un lente y decide qué información, ideas y recursos notas.' }
        ]
      },
      {
        title: 'No estás ahí porque te da miedo estar ahí',
        blocks: [
          { p: 'Koe describe la identidad como un ciclo que se repite hasta que se siente como “así soy yo”. Recórrelo paso a paso.' },
          { loop: true },
          { callout: 'Koe dice que el ciclo hay que romperlo entre los pasos 6 y 7 (el corte en el anillo): después de que un patrón se volvió “quien soy” y antes de que corras a defenderlo.' },
          { p: 'El ciclo empieza en la infancia. Dependías de tus padres para sobrevivir, así que adoptaste sus creencias, que ellos adoptaron de sus propios padres. Una vez resuelta la supervivencia física, lo que defiendes son tus ideas sobre ti. Una amenaza a tu identidad dispara la misma respuesta de lucha o huida que una amenaza a tu cuerpo.' }
        ]
      },
      {
        title: 'La vida que quieres está en cierto nivel de la mente',
        blocks: [
          { p: 'La mente se desarrolla en etapas predecibles. En la infancia absorbes las creencias que te mantienen a salvo, y si nunca las cuestionas, se endurecen. Koe usa nueve etapas del desarrollo del ego y calcula que la mayoría de sus lectores está entre la 4 y la 8: más cerca de la 4 si buscas un cambio, más cerca de la 8 si lees por curiosidad.' },
          { stages: true },
          { p: 'Importa menos de lo que parece en qué etapa estás, porque para avanzar desde cualquiera se sigue el mismo patrón.' }
        ]
      },
      {
        title: 'Inteligencia es conseguir lo que quieres de la vida',
        blocks: [
          { p: 'La fórmula del éxito de Koe tiene tres ingredientes: agencia (tu capacidad de actuar), oportunidad e inteligencia. Toma la definición de inteligencia de Naval Ravikant, conseguir lo que quieres de la vida, y la explica con la cibernética, el estudio de cómo se dirigen los sistemas.' },
          { chain: ['Ten una meta', 'Actúa hacia ella', 'Percibe dónde estás', 'Compara con la meta', 'Actúa de nuevo'] },
          { p: 'Con esta medida, la inteligencia es la capacidad de iterar, persistir y no perder de vista el panorama completo. Poca inteligencia es no aprender de los errores: chocar con un obstáculo y rendirse. Con suficiente tiempo, cualquier problema tiene solución.' },
          { p: 'La mayoría funciona con metas que le asignaron: escuela, trabajo, jubilarse a los 65. La secuencia de Koe para salir de ahí:' },
          { list: ['Rechaza el camino conocido', 'Entra en lo desconocido', 'Ponte metas nuevas y más altas', 'Acepta el caos que trae el crecimiento', 'Estudia los principios generales de la naturaleza', 'Vuélvete generalista a fondo'] }
        ]
      }
    ],
    loop: {
      breakAfter: 6,
      steps: [
        { title: 'Quieres una meta', text: 'Quieres lograr algo. En la infancia la meta es sobrevivir, y eso significa adaptarte a quienes te crían.' },
        { title: 'Ves a través de ella', text: 'La meta se vuelve un lente. Lees la realidad según ayude o amenace esa meta.' },
        { title: 'Notas lo que encaja', text: 'Solo registras la información y las ideas que el lente marca como importantes. Esto es aprendizaje.' },
        { title: 'Actúas y recibes señal', text: 'Actúas hacia la meta y recibes señales de que estás avanzando.' },
        { title: 'Repites', text: 'Repites la conducta hasta que se vuelve automática e inconsciente. Esto es condicionamiento.' },
        { title: 'Se vuelve tú', text: 'La conducta pasa a ser parte de quien crees que eres: “Soy el tipo de persona que…”' },
        { title: 'La defiendes', text: 'Defiendes esa identidad para mantener tu coherencia psicológica. Cuando alguien la cuestiona, lo sientes como un ataque.' },
        { title: 'Eliges de nuevo', text: 'La identidad da forma a tus siguientes metas y el ciclo vuelve a empezar. Si esa identidad va en contra de una buena vida, todo empeora rápido.' }
      ]
    },
    stages: {
      range: [4, 8],
      note: 'Con borde: etapas 4 a 8. Toca una etapa para leerla. El modelo son las etapas del desarrollo del ego de Cook-Greuter, uno de varios que cita el ensayo.',
      items: [
        { name: 'Impulsivo', text: 'Sentir y actuar son lo mismo, y todo es blanco o negro. Un niño pequeño que pega cuando se enoja.' },
        { name: 'Autoprotector', text: 'El mundo parece peligroso, así que aprendes a cuidarte por tu cuenta. Un niño que esconde la boleta de calificaciones y averigua qué quieren oír los adultos.' },
        { name: 'Conformista', text: 'Eres tu grupo, y sus reglas se sienten como la realidad. No te cabe en la cabeza que alguien vote distinto a tu familia.' },
        { name: 'Autoconsciente', text: 'Notas una vida interior que no coincide con lo de afuera. Estar en la iglesia sin saber si crees lo que todos parecen creer, y todavía sin saber qué hacer con eso.' },
        { name: 'Concienzudo', text: 'Construyes tus propios principios y te exiges cumplirlos. Un plan de carrera con metas claras, porque el esfuerzo correcto debería dar el resultado correcto.' },
        { name: 'Individualista', text: 'Ves que tus principios dependen de dónde vienes, y los sostienes con menos rigidez. Darte cuenta de que tu ambición en realidad buscaba la aprobación de tu papá o tu mamá.' },
        { name: 'Estratega', text: 'Trabajas con sistemas sin perder de vista tu propio papel en ellos. Dirigir un equipo mientras cuestionas tus puntos ciegos.' },
        { name: 'Consciente de constructos', text: 'Ves todo marco de ideas, incluida tu identidad, como una ficción útil. Verte actuar el papel de “fundador” con cierta gracia.' },
        { name: 'Unitivo', text: 'La línea entre tú y la vida se disuelve. Trabajar, descansar y jugar se sienten como lo mismo.' }
      ]
    }
  },

  morning: {
    eyebrow: 'Mañana · Excavación · 15–30 min',
    title: 'Saca a la luz lo que has estado evitando',
    groups: [
      {
        name: 'Dolor',
        intro: 'Las primeras cuatro preguntas son sobre lo que te duele de tu vida tal como está. Si no puedes responder alguna de inmediato, sáltala y vuelve después.',
        questions: [
          { id: 'a1', prompt: '¿Qué insatisfacción sorda y constante aprendiste a soportar?', hint: 'No el sufrimiento profundo. Lo que toleras. Lo que no odias, lo aguantas.' },
          { id: 'a2', prompt: '¿De qué te quejas una y otra vez sin cambiarlo nunca?', hint: 'Anota las tres quejas que más repetiste en el último año.' },
          { id: 'a2b', prompt: 'Para cada queja: a juzgar por tu conducta y no por tus palabras, ¿qué concluiría un observador que quieres en realidad?', recall: { key: 'a2', label: 'Tus quejas' } },
          { id: 'a3', prompt: '¿Qué verdad sobre tu vida actual te resultaría insoportable admitir ante alguien a quien respetas profundamente?' }
        ]
      },
      {
        name: 'Anti-visión',
        intro: 'Ahora convierte ese dolor en una anti-visión: una imagen brutalmente clara de la vida que no quieres. Te da algo de lo cual alejarte.',
        questions: [
          { id: 'a4', prompt: 'Nada cambia en cinco años. Describe un martes cualquiera.', hint: '¿Dónde despiertas y cómo se siente tu cuerpo? ¿Qué es lo primero que piensas? ¿Quién está contigo? ¿Qué haces de 9 a 6? ¿Cómo te sientes a las 10 de la noche?' },
          { id: 'a5', prompt: 'Ahora que sean diez años. ¿Qué puertas se cerraron?', hint: '¿Qué te perdiste? ¿Quién se cansó de esperarte? ¿Qué dice la gente de ti cuando no estás?' },
          { id: 'a6', prompt: 'Estás al final de tu vida. Viviste la versión segura y nunca rompiste el patrón. ¿Cuánto te costó?', hint: '¿Qué no te permitiste sentir, intentar o llegar a ser?' },
          { id: 'a6b', prompt: '¿A quién conoces que ya esté viviendo ese futuro?', hint: 'Alguien que va cinco, diez o veinte años más adelante por el mismo camino. ¿Qué sientes al imaginar que te conviertes en esa persona?' },
          { id: 'a7', prompt: '¿A qué identidad tendrías que renunciar para cambiar?', hint: 'Escríbela así: “Soy el tipo de persona que…”. ¿Qué te costaría socialmente dejar de ser esa persona?' },
          { id: 'a8', prompt: '¿Cuál es la razón más vergonzosa por la que no has cambiado?', hint: 'La que te hace sonar débil, con miedo o con flojera, no la que suena razonable.' },
          { id: 'a8b', prompt: 'Si tu conducta actual es una forma de protegerte, ¿qué está protegiendo exactamente?', hint: '¿Y cuánto te está costando esa protección?' }
        ]
      },
      {
        name: 'Visión',
        intro: 'Esa incomodidad es energía, así que dale una dirección. Esta es una visión mínima viable. Como la primera versión de un producto, empieza tosca y se afina con el uso.',
        questions: [
          { id: 'v1', prompt: 'Olvida lo realista. Si pudieras chasquear los dedos y estar viviendo otra vida en tres años, ¿cómo sería un martes cualquiera?', hint: 'Lo que de verdad quieres, con el mismo detalle que tu martes de aquí a cinco años.' },
          { id: 'v2', prompt: '¿Qué tendrías que creer sobre ti para que esa vida se sienta natural y no forzada?', hint: 'Escribe la declaración de identidad: “Soy el tipo de persona que…”' },
          { id: 'v3', prompt: '¿Qué cosa harías esta semana si ya fueras esa persona?' }
        ]
      }
    ],
    done: { label: 'Terminar la mañana', route: 'day' }
  },

  day: {
    eyebrow: 'Día · Interrupciones de patrón',
    title: 'Sorpréndete en piloto automático',
    intro: 'Escribir en un diario no basta para cambiarte. El trabajo del día es romper los patrones inconscientes que te mantienen igual, así que seis preguntas te interrumpen a horas fijas. Entre una y otra, sigue dándole vueltas a lo que escribiste en la mañana.',
    remind: 'Esta página no puede hacer sonar tu celular. Antes de la sesión de la mañana, pon cada pregunta en un recordatorio o evento de calendario para empezar a pensarla en cuanto suene. Las horas son las que sugiere Koe. Cambia las que choquen con tu día: funcionan mejor las horas raras que no se cruzan con tu agenda.',
    // "at" son minutos después de la medianoche. Cada persona puede cambiar la hora en la app.
    checkins: [
      { id: 't1', at: 11 * 60, prompt: '¿Qué estoy evitando ahora mismo al hacer lo que estoy haciendo?' },
      { id: 't2', at: 13 * 60 + 30, prompt: 'Si alguien hubiera grabado mis últimas dos horas, ¿qué concluiría que quiero de mi vida?' },
      { id: 't3', at: 15 * 60 + 15, prompt: '¿Me estoy acercando a la vida que odio o a la vida que quiero?' },
      { id: 't4', at: 17 * 60, prompt: '¿Qué es lo más importante que estoy fingiendo que no importa?' },
      { id: 't5', at: 19 * 60 + 30, prompt: '¿Qué hice hoy para proteger mi identidad y no por un deseo real?', hint: 'La pista de Koe: casi todo lo que haces.' },
      { id: 't6', at: 21 * 60, prompt: '¿En qué momento de hoy me sentí con más vida? ¿En qué momento me sentí sin vida?' }
    ],
    extraTitle: 'Para los ratos libres',
    extraIntro: 'Piensa en estas mientras vas en camino, caminas o descansas.',
    extras: [
      { id: 'c1', prompt: '¿Qué cambiaría si dejara de necesitar que la gente me vea como la identidad que nombré en la mañana?', recall: { key: 'a7', label: 'La identidad a la que renunciarías' } },
      { id: 'c2', prompt: '¿En qué parte de mi vida estoy cambiando vitalidad por seguridad?' },
      { id: 'c3', prompt: '¿Cuál es la versión más pequeña de la persona que quiero ser que podría ser mañana?' }
    ]
  },

  evening: {
    eyebrow: 'Noche · Síntesis',
    title: 'Convierte el día en una dirección',
    groups: [
      {
        name: 'Integración',
        intro: 'A esta altura deberías tener al menos una idea capaz de cambiar tu rumbo. Escríbela para que no se pierda.',
        questions: [
          { id: 'e1', prompt: 'Después de hoy, ¿qué te parece más cierto sobre por qué llevas tanto tiempo sin avanzar?' },
          { id: 'e2', prompt: '¿Cuál es el verdadero enemigo?', hint: 'Nómbralo con claridad. No son las circunstancias ni otras personas: es el patrón interno o la creencia que ha estado al mando.' },
          { id: 'antiVision', prompt: 'En una frase: ¿en qué te niegas a dejar que se convierta tu vida?', hint: 'Tu anti-visión, comprimida. Deberías sentir algo al leerla.' },
          { id: 'vision', prompt: 'En una frase: ¿hacia dónde estás construyendo?', hint: 'La primera versión de tu visión. Va a evolucionar.' }
        ]
      },
      {
        name: 'Metas como lentes',
        intro: 'Koe no habla de metas como líneas de llegada. Una meta es un lente por el que miras para ver la siguiente acción correcta. No te preocupes por llegar: el disfrute está en avanzar.',
        questions: [
          { id: 'year', prompt: 'De aquí a un año, ¿qué tendría que ser cierto para saber que rompiste el viejo patrón?', hint: 'Una sola cosa concreta.' },
          { id: 'month', prompt: 'De aquí a un mes, ¿qué tendría que ser cierto para que ese lente a un año siga siendo posible?' },
          { id: 'daily', prompt: '¿Qué dos o tres acciones puedes agendar para mañana que la persona en la que te estás convirtiendo simplemente haría?', hint: 'Una por línea. Se convierten en tus misiones diarias en el tablero.', placeholder: 'Una acción por línea' }
        ]
      },
      {
        name: 'Reglas',
        intro: 'Una última pieza antes del tablero. Todo juego necesita reglas.',
        questions: [
          { id: 'constraints', prompt: '¿Qué te niegas a sacrificar para alcanzar tu visión?', hint: 'Los límites descartan los caminos fáciles y te empujan hacia los creativos.' }
        ]
      }
    ],
    done: { label: 'Ver tu tablero de juego', route: 'game' }
  },

  game: {
    eyebrow: 'Tablero de juego',
    title: 'Tu vida, armada como un juego',
    intro: 'Los juegos están hechos para enfocar: una forma de ganar, algo en juego, una misión, reglas. El último paso de Koe es ordenar lo que encontraste hoy en esas mismas seis piezas, para que rodeen tu atención como los anillos de un campo de fuerza y dejen afuera las distracciones. Puedes editar cualquiera aquí.',
    tiles: [
      { key: 'antiVision', name: 'Anti-visión', mechanic: 'Lo que está en juego', prompt: 'La vida que no quieres volver a vivir nunca. Lo que pasa si pierdes o te rindes.' },
      { key: 'vision', name: 'Visión', mechanic: 'Cómo ganas', prompt: 'La vida ideal que crees querer. Mejora a medida que avanzas hacia ella.' },
      { key: 'year', name: 'Meta a un año', mechanic: 'La misión', prompt: 'Cómo se ve tu vida en un año. Tu única prioridad hasta entonces.' },
      { key: 'month', name: 'Proyecto del mes', mechanic: 'La pelea con el jefe', prompt: 'Lo que necesitas aprender o construir este mes. Aquí ganas experiencia y botín.' },
      { key: 'daily', name: 'Palancas diarias', mechanic: 'Misiones diarias', prompt: 'Las tareas prioritarias que hacen avanzar el proyecto. Una por línea.' },
      { key: 'constraints', name: 'Restricciones', mechanic: 'Las reglas', prompt: 'Lo que no vas a sacrificar. Los límites fomentan la creatividad.' }
    ]
  }
};
