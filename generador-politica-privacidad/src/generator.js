/*
 * generator.js — Núcleo de generación de documentos legales.
 *
 * Este archivo es el corazón del proyecto y está escrito como módulo UMD casero:
 * funciona igual en el navegador (window.LegalGen) y en Node.js (module.exports),
 * para que los mismos datos que ve el usuario sean los que valida el autotest.
 *
 * No depende de nada externo: sin npm, sin CDNs.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.LegalGen = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ------------------------------------------------------------------
   * Jurisdicciones soportadas
   * Cada una define la ley aplicable, la autoridad de control ante la que
   * el usuario puede reclamar y el nombre corto que se cita en el texto.
   * ------------------------------------------------------------------ */
  var JURISDICCIONES = {
    ue: {
      nombre: 'Unión Europea',
      ley: 'Reglamento (UE) 2016/679, General de Protección de Datos (RGPD)',
      leyCorta: 'RGPD',
      autoridad: 'la autoridad de control de protección de datos de su país',
      edadMinima: 16
    },
    es: {
      nombre: 'España',
      ley: 'Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD)',
      leyCorta: 'RGPD y LOPDGDD',
      autoridad: 'la Agencia Española de Protección de Datos (www.aepd.es)',
      edadMinima: 14
    },
    mx: {
      nombre: 'México',
      ley: 'Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)',
      leyCorta: 'LFPDPPP',
      autoridad: 'el INAI (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales)',
      edadMinima: 18
    },
    ar: {
      nombre: 'Argentina',
      ley: 'Ley 25.326 de Protección de los Datos Personales',
      leyCorta: 'Ley 25.326',
      autoridad: 'la Agencia de Acceso a la Información Pública (AAIP)',
      edadMinima: 18
    },
    co: {
      nombre: 'Colombia',
      ley: 'Ley 1581 de 2012 y el Decreto 1377 de 2013',
      leyCorta: 'Ley 1581 de 2012',
      autoridad: 'la Superintendencia de Industria y Comercio (SIC)',
      edadMinima: 18
    },
    cl: {
      nombre: 'Chile',
      ley: 'Ley 19.628 sobre Protección de la Vida Privada',
      leyCorta: 'Ley 19.628',
      autoridad: 'la autoridad competente en materia de protección de datos',
      edadMinima: 18
    },
    pe: {
      nombre: 'Perú',
      ley: 'Ley 29733 de Protección de Datos Personales',
      leyCorta: 'Ley 29733',
      autoridad: 'la Autoridad Nacional de Protección de Datos Personales',
      edadMinima: 18
    },
    us: {
      nombre: 'Estados Unidos (California)',
      ley: 'California Consumer Privacy Act (CCPA/CPRA)',
      leyCorta: 'CCPA',
      autoridad: 'la California Privacy Protection Agency (CPPA)',
      edadMinima: 13
    }
  };

  /* Catálogo de datos personales que un sitio puede recoger. */
  var TIPOS_DATOS = {
    nombre: { etiqueta: 'Nombre y apellidos', finalidad: 'identificarle y dirigirnos a usted de forma personalizada' },
    email: { etiqueta: 'Correo electrónico', finalidad: 'responder a sus consultas y enviarle comunicaciones del servicio' },
    telefono: { etiqueta: 'Teléfono', finalidad: 'contactarle en relación con su solicitud' },
    direccion: { etiqueta: 'Dirección postal', finalidad: 'gestionar envíos y facturación' },
    pago: { etiqueta: 'Datos de facturación y pago', finalidad: 'procesar pagos y cumplir obligaciones fiscales' },
    ip: { etiqueta: 'Dirección IP y datos de navegación', finalidad: 'garantizar la seguridad del sitio y elaborar estadísticas de uso' },
    ubicacion: { etiqueta: 'Ubicación aproximada', finalidad: 'adaptar el contenido a su región' },
    cv: { etiqueta: 'Currículum y datos profesionales', finalidad: 'gestionar procesos de selección' },
    usuario: { etiqueta: 'Nombre de usuario y contraseña', finalidad: 'permitirle acceder a su cuenta de forma segura' }
  };

  /* Servicios de terceros habituales, con su rol y enlace a su propia política. */
  var TERCEROS = {
    analytics: { etiqueta: 'Google Analytics', rol: 'analítica de tráfico', politica: 'https://policies.google.com/privacy' },
    ads: { etiqueta: 'Google Ads / Meta Ads', rol: 'publicidad y remarketing', politica: 'https://policies.google.com/technologies/ads' },
    stripe: { etiqueta: 'Stripe', rol: 'procesamiento de pagos', politica: 'https://stripe.com/privacy' },
    paypal: { etiqueta: 'PayPal', rol: 'procesamiento de pagos', politica: 'https://www.paypal.com/webapps/mpp/ua/privacy-full' },
    mailchimp: { etiqueta: 'Mailchimp', rol: 'envío de boletines', politica: 'https://www.intuit.com/privacy/statement/' },
    hosting: { etiqueta: 'Proveedor de alojamiento web', rol: 'hospedaje de la web y copias de seguridad', politica: '' },
    redes: { etiqueta: 'Redes sociales (Meta, X, LinkedIn)', rol: 'botones sociales e integraciones', politica: '' }
  };

  /* Datos de ejemplo: sirven de demo en la UI y de base para los tests. */
  function datosEjemplo() {
    return {
      empresa: 'Estudio Nova S.L.',
      titular: 'Estudio Nova S.L.',
      identificacion: 'B-12345678',
      sitio: 'https://estudionova.com',
      email: 'privacidad@estudionova.com',
      direccion: 'Calle Mayor 10, 28013 Madrid, España',
      jurisdiccion: 'es',
      idioma: 'es',
      datos: ['nombre', 'email', 'ip'],
      terceros: ['analytics', 'hosting'],
      cookiesAnaliticas: true,
      cookiesMarketing: false,
      retencion: 24,
      edadMinima: 14,
      transferencias: true,
      newsletter: true,
      fecha: '2026-08-03'
    };
  }

  /* ------------------------------------------------------------------
   * Utilidades
   * ------------------------------------------------------------------ */

  /** Escapa caracteres peligrosos para insertar texto del usuario en HTML. */
  function escaparHtml(texto) {
    return String(texto == null ? '' : texto)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Convierte 2026-08-03 en "3 de agosto de 2026" (o la deja tal cual si no encaja). */
  function fechaLarga(iso) {
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return String(iso || '');
    return parseInt(m[3], 10) + ' de ' + meses[parseInt(m[2], 10) - 1] + ' de ' + m[1];
  }

  /** Une una lista en lenguaje natural: "a, b y c". */
  function unir(lista) {
    var arr = (lista || []).filter(Boolean);
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' y ' + arr[arr.length - 1];
  }

  /** Normaliza los datos de entrada rellenando valores por defecto sensatos. */
  function normalizar(d) {
    var base = d || {};
    var jur = JURISDICCIONES[base.jurisdiccion] ? base.jurisdiccion : 'es';
    return {
      empresa: String(base.empresa || '').trim(),
      titular: String(base.titular || base.empresa || '').trim(),
      identificacion: String(base.identificacion || '').trim(),
      sitio: String(base.sitio || '').trim(),
      email: String(base.email || '').trim(),
      direccion: String(base.direccion || '').trim(),
      jurisdiccion: jur,
      datos: Array.isArray(base.datos) ? base.datos.filter(function (k) { return !!TIPOS_DATOS[k]; }) : [],
      terceros: Array.isArray(base.terceros) ? base.terceros.filter(function (k) { return !!TERCEROS[k]; }) : [],
      cookiesAnaliticas: !!base.cookiesAnaliticas,
      cookiesMarketing: !!base.cookiesMarketing,
      retencion: Number(base.retencion) > 0 ? Math.round(Number(base.retencion)) : 24,
      edadMinima: Number(base.edadMinima) > 0 ? Math.round(Number(base.edadMinima)) : JURISDICCIONES[jur].edadMinima,
      transferencias: !!base.transferencias,
      newsletter: !!base.newsletter,
      fecha: String(base.fecha || '').trim()
    };
  }

  /* ------------------------------------------------------------------
   * Validación
   * Devuelve { ok, errores: [{campo, mensaje}] }. La UI la usa para marcar
   * los campos en rojo; el autotest la usa para comprobar los límites.
   * ------------------------------------------------------------------ */
  function validar(datosCrudos) {
    var d = normalizar(datosCrudos);
    var errores = [];

    if (!d.empresa) {
      errores.push({ campo: 'empresa', mensaje: 'Indique el nombre de la empresa o del responsable.' });
    }
    if (!d.sitio) {
      errores.push({ campo: 'sitio', mensaje: 'Indique la dirección del sitio web.' });
    } else if (!/^https?:\/\/[^\s.]+\.[^\s]{2,}$/i.test(d.sitio)) {
      errores.push({ campo: 'sitio', mensaje: 'La dirección debe empezar por http:// o https:// e incluir un dominio válido.' });
    }
    if (!d.email) {
      errores.push({ campo: 'email', mensaje: 'Indique un correo de contacto para ejercer derechos.' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) {
      errores.push({ campo: 'email', mensaje: 'El correo de contacto no tiene un formato válido.' });
    }
    if (d.datos.length === 0) {
      errores.push({ campo: 'datos', mensaje: 'Seleccione al menos un tipo de dato que recoja el sitio.' });
    }
    if (d.retencion < 1 || d.retencion > 240) {
      errores.push({ campo: 'retencion', mensaje: 'El plazo de conservación debe estar entre 1 y 240 meses.' });
    }
    if (d.edadMinima < 13 || d.edadMinima > 21) {
      errores.push({ campo: 'edadMinima', mensaje: 'La edad mínima debe estar entre 13 y 21 años.' });
    }

    return { ok: errores.length === 0, errores: errores };
  }

  /* ------------------------------------------------------------------
   * Bloques reutilizables
   * ------------------------------------------------------------------ */

  /** Bloque "Responsable del tratamiento", común a los tres documentos. */
  function bloqueResponsable(d) {
    var lineas = [
      '- **Titular:** ' + (d.titular || d.empresa),
      '- **Sitio web:** ' + d.sitio,
      '- **Correo de contacto:** ' + d.email
    ];
    if (d.identificacion) lineas.splice(1, 0, '- **Identificación fiscal:** ' + d.identificacion);
    if (d.direccion) lineas.push('- **Dirección:** ' + d.direccion);
    return lineas.join('\n');
  }

  /** Lista de derechos ARCO/RGPD según la jurisdicción elegida. */
  function listaDerechos(jur) {
    if (jur === 'mx' || jur === 'ar' || jur === 'co' || jur === 'cl' || jur === 'pe') {
      return [
        '**Acceso:** saber qué datos suyos tratamos.',
        '**Rectificación:** corregir datos inexactos o incompletos.',
        '**Cancelación o supresión:** solicitar que eliminemos sus datos.',
        '**Oposición:** oponerse a un tratamiento concreto.',
        '**Revocación del consentimiento:** retirar en cualquier momento el consentimiento prestado.'
      ];
    }
    if (jur === 'us') {
      return [
        '**Saber (right to know):** qué categorías de datos recogemos y con qué fin.',
        '**Supresión (right to delete):** solicitar el borrado de sus datos.',
        '**Corrección:** rectificar información inexacta.',
        '**Exclusión de venta o cesión (opt-out):** no vendemos sus datos personales.',
        '**No discriminación:** no le trataremos peor por ejercer sus derechos.'
      ];
    }
    return [
      '**Acceso:** obtener confirmación de si tratamos sus datos y una copia de ellos.',
      '**Rectificación:** corregir datos inexactos o incompletos.',
      '**Supresión ("derecho al olvido"):** solicitar el borrado cuando ya no sean necesarios.',
      '**Limitación del tratamiento:** pedir que suspendamos el uso de sus datos.',
      '**Portabilidad:** recibir sus datos en un formato estructurado y de uso común.',
      '**Oposición:** oponerse al tratamiento por motivos relacionados con su situación particular.',
      '**Retirada del consentimiento:** en cualquier momento, sin efectos retroactivos.'
    ];
  }

  /* ------------------------------------------------------------------
   * Documento 1 — Política de Privacidad
   * ------------------------------------------------------------------ */
  function generarPrivacidad(datosCrudos) {
    var d = normalizar(datosCrudos);
    var j = JURISDICCIONES[d.jurisdiccion];
    var out = [];

    out.push('# Política de Privacidad');
    out.push('');
    out.push('_Última actualización: ' + fechaLarga(d.fecha) + '_');
    out.push('');
    out.push('En **' + d.empresa + '** tratamos su información personal con transparencia. ' +
      'Esta política explica qué datos recogemos a través de ' + d.sitio + ', para qué los usamos y qué derechos le asisten, ' +
      'conforme a ' + j.ley + '.');
    out.push('');

    out.push('## 1. Responsable del tratamiento');
    out.push('');
    out.push(bloqueResponsable(d));
    out.push('');

    out.push('## 2. Qué datos recogemos y para qué');
    out.push('');
    out.push('| Dato | Finalidad | Base legal |');
    out.push('|------|-----------|------------|');
    d.datos.forEach(function (clave) {
      var t = TIPOS_DATOS[clave];
      var base = (clave === 'pago') ? 'Ejecución de un contrato y obligación legal'
        : (clave === 'ip') ? 'Interés legítimo en la seguridad del servicio'
          : 'Consentimiento del interesado';
      out.push('| ' + t.etiqueta + ' | ' + t.finalidad.charAt(0).toUpperCase() + t.finalidad.slice(1) + ' | ' + base + ' |');
    });
    out.push('');
    out.push('No recogemos categorías especiales de datos (salud, ideología, origen étnico, biometría) ' +
      'ni tomamos decisiones automatizadas con efectos jurídicos sobre usted.');
    out.push('');

    if (d.newsletter) {
      out.push('### 2.1. Comunicaciones comerciales');
      out.push('');
      out.push('Si se suscribe a nuestro boletín, usaremos su correo para enviarle novedades y contenidos. ' +
        'Puede darse de baja con un clic desde el enlace incluido en cada envío o escribiendo a ' + d.email + '.');
      out.push('');
    }

    out.push('## 3. Cuánto tiempo conservamos sus datos');
    out.push('');
    out.push('Conservamos sus datos personales durante un máximo de **' + d.retencion + ' meses** desde el último contacto, ' +
      'salvo que una obligación legal (por ejemplo, fiscal o contable) exija un plazo mayor. ' +
      'Transcurrido ese plazo, los datos se eliminan o se anonimizan de forma irreversible.');
    out.push('');

    out.push('## 4. Con quién compartimos sus datos');
    out.push('');
    if (d.terceros.length === 0) {
      out.push('No cedemos sus datos personales a terceros, salvo obligación legal o requerimiento de una autoridad competente.');
    } else {
      out.push('Trabajamos con proveedores que actúan como encargados del tratamiento y que solo acceden a los datos ' +
        'estrictamente necesarios para prestar su servicio:');
      out.push('');
      d.terceros.forEach(function (clave) {
        var p = TERCEROS[clave];
        out.push('- **' + p.etiqueta + '** — ' + p.rol + (p.politica ? ' ([política de privacidad](' + p.politica + '))' : '') + '.');
      });
      out.push('');
      out.push('Fuera de estos casos, no vendemos ni cedemos su información personal.');
    }
    out.push('');

    if (d.transferencias) {
      out.push('### 4.1. Transferencias internacionales');
      out.push('');
      out.push('Algunos de nuestros proveedores están ubicados fuera del ' + j.nombre + '. En esos casos la transferencia ' +
        'se ampara en las Cláusulas Contractuales Tipo aprobadas por la Comisión Europea o en decisiones de adecuación ' +
        'equivalentes, de forma que sus datos siguen protegidos por garantías comparables.');
      out.push('');
    }

    out.push('## 5. Sus derechos');
    out.push('');
    out.push('Usted puede ejercer en cualquier momento los siguientes derechos:');
    out.push('');
    listaDerechos(d.jurisdiccion).forEach(function (linea) { out.push('- ' + linea); });
    out.push('');
    out.push('Para ejercerlos, escriba a **' + d.email + '** indicando el derecho que desea ejercer. ' +
      'Le responderemos en el plazo legalmente previsto. Si considera que no hemos atendido correctamente su solicitud, ' +
      'puede presentar una reclamación ante ' + j.autoridad + '.');
    out.push('');

    out.push('## 6. Seguridad de la información');
    out.push('');
    out.push('Aplicamos medidas técnicas y organizativas apropiadas para proteger sus datos: cifrado del tráfico mediante HTTPS, ' +
      'control de acceso por roles, copias de seguridad periódicas y revisión de los permisos de nuestros proveedores. ' +
      'Ningún sistema es infalible, pero nos comprometemos a notificarle cualquier brecha de seguridad que afecte a sus datos ' +
      'en cuanto tengamos conocimiento de ella.');
    out.push('');

    out.push('## 7. Menores de edad');
    out.push('');
    out.push('Este sitio no está dirigido a menores de **' + d.edadMinima + ' años**. Si detectamos que hemos recogido datos ' +
      'de un menor sin el consentimiento de sus tutores, los eliminaremos de inmediato.');
    out.push('');

    out.push('## 8. Cookies');
    out.push('');
    out.push('El uso de cookies y tecnologías similares se detalla en nuestra Política de Cookies, disponible en ' +
      d.sitio + '/cookies.');
    out.push('');

    out.push('## 9. Cambios en esta política');
    out.push('');
    out.push('Podemos actualizar esta política para reflejar cambios legales o en nuestros servicios. ' +
      'Publicaremos siempre la versión vigente en esta misma dirección, indicando la fecha de la última actualización.');
    out.push('');

    return out.join('\n');
  }

  /* ------------------------------------------------------------------
   * Documento 2 — Política de Cookies
   * ------------------------------------------------------------------ */
  function generarCookies(datosCrudos) {
    var d = normalizar(datosCrudos);
    var j = JURISDICCIONES[d.jurisdiccion];
    var out = [];

    out.push('# Política de Cookies');
    out.push('');
    out.push('_Última actualización: ' + fechaLarga(d.fecha) + '_');
    out.push('');
    out.push('Una cookie es un pequeño archivo que ' + d.sitio + ' guarda en su navegador para recordar información ' +
      'entre visitas. A continuación le explicamos cuáles usamos y cómo puede controlarlas.');
    out.push('');

    out.push('## 1. Responsable');
    out.push('');
    out.push(bloqueResponsable(d));
    out.push('');

    out.push('## 2. Tipos de cookies que utilizamos');
    out.push('');
    out.push('| Categoría | ¿La usamos? | Finalidad | Consentimiento |');
    out.push('|-----------|-------------|-----------|----------------|');
    out.push('| Técnicas o necesarias | Sí | Mantener la sesión, recordar sus preferencias y garantizar la seguridad | No requiere |');
    out.push('| Analíticas | ' + (d.cookiesAnaliticas ? 'Sí' : 'No') + ' | Medir de forma agregada cómo se usa el sitio para mejorarlo | ' +
      (d.cookiesAnaliticas ? 'Requiere su consentimiento' : '—') + ' |');
    out.push('| Publicitarias o de marketing | ' + (d.cookiesMarketing ? 'Sí' : 'No') + ' | Mostrar anuncios relevantes y medir campañas | ' +
      (d.cookiesMarketing ? 'Requiere su consentimiento' : '—') + ' |');
    out.push('');

    if (!d.cookiesAnaliticas && !d.cookiesMarketing) {
      out.push('**Solo usamos cookies técnicas imprescindibles.** No le rastreamos, no elaboramos perfiles ' +
        'y no compartimos su navegación con terceros con fines publicitarios.');
      out.push('');
    }

    var cookieTerceros = d.terceros.filter(function (k) { return k === 'analytics' || k === 'ads' || k === 'redes'; });
    if (cookieTerceros.length > 0) {
      out.push('## 3. Cookies de terceros');
      out.push('');
      out.push('Los siguientes servicios pueden instalar sus propias cookies cuando usted acepta su categoría:');
      out.push('');
      cookieTerceros.forEach(function (clave) {
        var p = TERCEROS[clave];
        out.push('- **' + p.etiqueta + '** — ' + p.rol + (p.politica ? ' ([más información](' + p.politica + '))' : '') + '.');
      });
      out.push('');
    }

    out.push('## ' + (cookieTerceros.length > 0 ? '4' : '3') + '. Cómo gestionar o eliminar las cookies');
    out.push('');
    out.push('Puede aceptar, rechazar o retirar su consentimiento en cualquier momento desde el panel de configuración ' +
      'de cookies del sitio. Además, todos los navegadores permiten borrarlas o bloquearlas:');
    out.push('');
    out.push('- **Chrome:** Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.');
    out.push('- **Firefox:** Ajustes → Privacidad & Seguridad → Cookies y datos del sitio.');
    out.push('- **Safari:** Preferencias → Privacidad → Gestionar datos de sitios web.');
    out.push('- **Edge:** Configuración → Cookies y permisos del sitio.');
    out.push('');
    out.push('Tenga en cuenta que si bloquea las cookies técnicas es posible que algunas funciones del sitio dejen de funcionar.');
    out.push('');

    out.push('## ' + (cookieTerceros.length > 0 ? '5' : '4') + '. Normativa aplicable');
    out.push('');
    out.push('Esta política se rige por ' + j.ley + '. Para cualquier duda puede escribirnos a ' + d.email +
      ' o reclamar ante ' + j.autoridad + '.');
    out.push('');

    return out.join('\n');
  }

  /* ------------------------------------------------------------------
   * Documento 3 — Aviso Legal y Términos de Uso
   * ------------------------------------------------------------------ */
  function generarTerminos(datosCrudos) {
    var d = normalizar(datosCrudos);
    var j = JURISDICCIONES[d.jurisdiccion];
    var out = [];

    out.push('# Aviso Legal y Términos de Uso');
    out.push('');
    out.push('_Última actualización: ' + fechaLarga(d.fecha) + '_');
    out.push('');

    out.push('## 1. Datos identificativos');
    out.push('');
    out.push(bloqueResponsable(d));
    out.push('');

    out.push('## 2. Objeto');
    out.push('');
    out.push('Estos términos regulan el acceso y uso del sitio web ' + d.sitio + ' (en adelante, "el Sitio"), ' +
      'titularidad de ' + d.empresa + '. El acceso al Sitio implica la aceptación plena de estas condiciones.');
    out.push('');

    out.push('## 3. Condiciones de uso');
    out.push('');
    out.push('El usuario se compromete a:');
    out.push('');
    out.push('- Hacer un uso lícito del Sitio y no vulnerar derechos de terceros.');
    out.push('- No introducir código malicioso ni intentar acceder a áreas restringidas.');
    out.push('- Facilitar información veraz en los formularios que complete.');
    out.push('- No reproducir, copiar ni distribuir los contenidos sin autorización previa por escrito.');
    out.push('');

    out.push('## 4. Propiedad intelectual e industrial');
    out.push('');
    out.push('Todos los contenidos del Sitio (textos, imágenes, marcas, código fuente y diseño) son propiedad de ' +
      d.empresa + ' o de terceros que han autorizado su uso, y están protegidos por la normativa de propiedad ' +
      'intelectual e industrial. Queda prohibida su explotación sin consentimiento expreso.');
    out.push('');

    out.push('## 5. Exclusión de responsabilidad');
    out.push('');
    out.push(d.empresa + ' hace todo lo razonable por mantener el Sitio disponible y su información actualizada, ' +
      'pero no garantiza la ausencia de interrupciones, errores u omisiones. El contenido del Sitio tiene carácter ' +
      'informativo y no constituye asesoramiento profesional. No nos responsabilizamos del contenido de sitios de ' +
      'terceros enlazados desde el Sitio.');
    out.push('');

    out.push('## 6. Enlaces');
    out.push('');
    out.push('El Sitio puede incluir enlaces a páginas de terceros. Su inclusión no implica aprobación de su contenido; ' +
      'el usuario accede a ellas bajo su propia responsabilidad y sujeto a sus respectivas condiciones.');
    out.push('');

    out.push('## 7. Protección de datos');
    out.push('');
    out.push('El tratamiento de los datos personales recogidos a través del Sitio se describe en la Política de Privacidad, ' +
      'disponible en ' + d.sitio + '/privacidad. Para cualquier consulta puede escribir a ' + d.email + '.');
    out.push('');

    out.push('## 8. Modificaciones');
    out.push('');
    out.push(d.empresa + ' se reserva el derecho de modificar en cualquier momento la presentación, configuración ' +
      'y contenidos del Sitio, así como estas condiciones. Las modificaciones entrarán en vigor desde su publicación.');
    out.push('');

    out.push('## 9. Legislación aplicable y jurisdicción');
    out.push('');
    out.push('Estas condiciones se rigen por la legislación de ' + j.nombre + ', incluida ' + j.ley + '. ' +
      'Para la resolución de cualquier controversia, las partes se someten a los juzgados y tribunales competentes ' +
      'del domicilio del titular, salvo que la normativa de consumo disponga otro fuero.');
    out.push('');

    return out.join('\n');
  }

  /** Genera los tres documentos de una vez. */
  function generarTodo(datos) {
    return {
      privacidad: generarPrivacidad(datos),
      cookies: generarCookies(datos),
      terminos: generarTerminos(datos)
    };
  }

  /* ------------------------------------------------------------------
   * Conversor Markdown → HTML
   * Mini-parser suficiente para lo que generamos: títulos, párrafos,
   * listas, tablas, negritas, cursivas y enlaces. Sin dependencias.
   * ------------------------------------------------------------------ */
  function inline(texto) {
    return escaparHtml(texto)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])_([^_]+)_(?=$|[\s.,;:)])/g, '$1<em>$2</em>');
  }

  function markdownAHtml(md) {
    var lineas = String(md || '').split('\n');
    var html = [];
    var enLista = false;
    var filasTabla = null;

    function cerrarLista() {
      if (enLista) { html.push('</ul>'); enLista = false; }
    }
    function cerrarTabla() {
      if (!filasTabla) return;
      var t = ['<table>'];
      filasTabla.forEach(function (fila, i) {
        var celda = i === 0 ? 'th' : 'td';
        t.push('<tr>' + fila.map(function (c) {
          return '<' + celda + '>' + inline(c) + '</' + celda + '>';
        }).join('') + '</tr>');
      });
      t.push('</table>');
      html.push(t.join(''));
      filasTabla = null;
    }

    lineas.forEach(function (linea) {
      var l = linea.trim();

      // Fila de tabla
      if (/^\|.*\|$/.test(l)) {
        var celdas = l.slice(1, -1).split('|').map(function (c) { return c.trim(); });
        if (celdas.every(function (c) { return /^:?-{2,}:?$/.test(c); })) return; // separador
        cerrarLista();
        if (!filasTabla) filasTabla = [];
        filasTabla.push(celdas);
        return;
      }
      cerrarTabla();

      if (l === '') { cerrarLista(); return; }

      var h = /^(#{1,4})\s+(.*)$/.exec(l);
      if (h) {
        cerrarLista();
        var nivel = h[1].length;
        html.push('<h' + nivel + '>' + inline(h[2]) + '</h' + nivel + '>');
        return;
      }

      if (/^[-*]\s+/.test(l)) {
        if (!enLista) { html.push('<ul>'); enLista = true; }
        html.push('<li>' + inline(l.replace(/^[-*]\s+/, '')) + '</li>');
        return;
      }

      cerrarLista();
      html.push('<p>' + inline(l) + '</p>');
    });

    cerrarLista();
    cerrarTabla();
    return html.join('\n');
  }

  /** Envuelve el HTML de un documento en una página completa lista para publicar. */
  function documentoHtmlCompleto(titulo, md) {
    return '<!DOCTYPE html>\n<html lang="es">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>' + escaparHtml(titulo) + '</title>\n<style>\n' +
      'body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.7;' +
      'max-width:800px;margin:0 auto;padding:2.5rem 1.25rem;color:#1f2933;background:#fff}\n' +
      'h1{font-size:2rem;border-bottom:2px solid #e4e7eb;padding-bottom:.5rem}\n' +
      'h2{font-size:1.35rem;margin-top:2.25rem}\nh3{font-size:1.1rem}\n' +
      'table{border-collapse:collapse;width:100%;margin:1rem 0;font-size:.95rem}\n' +
      'th,td{border:1px solid #d4d9e0;padding:.55rem .7rem;text-align:left;vertical-align:top}\n' +
      'th{background:#f5f7fa}\na{color:#1c64f2}\n' +
      '</style>\n</head>\n<body>\n' + markdownAHtml(md) + '\n</body>\n</html>';
  }

  return {
    JURISDICCIONES: JURISDICCIONES,
    TIPOS_DATOS: TIPOS_DATOS,
    TERCEROS: TERCEROS,
    datosEjemplo: datosEjemplo,
    normalizar: normalizar,
    validar: validar,
    escaparHtml: escaparHtml,
    fechaLarga: fechaLarga,
    unir: unir,
    generarPrivacidad: generarPrivacidad,
    generarCookies: generarCookies,
    generarTerminos: generarTerminos,
    generarTodo: generarTodo,
    markdownAHtml: markdownAHtml,
    documentoHtmlCompleto: documentoHtmlCompleto
  };
});
