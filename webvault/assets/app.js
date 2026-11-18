/* ============================================================
   Infraestructura S2 · Aplicación
   Depende de data/course.js (generado por tools/build.py).
   ============================================================ */
(function () {
  "use strict";

  var CURSO = window.CURSO;
  if (!CURSO || !Array.isArray(CURSO.lecciones)) {
    document.body.innerHTML = '<p style="padding:40px;font-family:sans-serif;color:#eee">Falta <code>data/course.js</code>. Ejecuta <code>python3 tools/build.py</code>.</p>';
    return;
  }

  /* ---------------- Estado y utilidades ---------------- */

  var MODULOS = {};
  CURSO.modulos.forEach(function (m) { MODULOS[m.id] = m; });

  var LECCIONES = CURSO.lecciones;
  var POR_SLUG = {};
  LECCIONES.forEach(function (l) { POR_SLUG[l.slug] = l; });

  var GUIA = LECCIONES[0] && LECCIONES[0].modulo === "inicio" ? LECCIONES[0] : LECCIONES[0];
  var TOTAL = LECCIONES.filter(function (l) { return l.modulo !== "inicio"; }).length;
  var CLAVE = "curso:" + CURSO.id + ":completadas";

  var COLORES = {
    m1: "#ef4444", m2: "#f59e0b", m3: "#10b981", m4: "#06b6d4",
    m5: "#3b82f6", m6: "#a855f7", m7: "#ec4899", m8: "#84cc16",
    inicio: "#8b8b9c"
  };

  var completadas = cargarProgreso();
  var leccionActual = null;
  var modoActual = "notas";

  var $ = function (id) { return document.getElementById(id); };

  function normalizar(texto) {
    return (texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[_\-]+/g, " ")
      .replace(/[^a-z0-9ñü ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugify(texto) {
    return normalizar(texto).replace(/ /g, "-");
  }

  function escapar(texto) {
    return String(texto)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function cargarProgreso() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      return new Set(Array.isArray(datos) ? datos : []);
    } catch (e) { return new Set(); }
  }

  function guardarProgreso() {
    try { localStorage.setItem(CLAVE, JSON.stringify(Array.from(completadas))); } catch (e) { /* modo privado */ }
  }

  var indiceBusqueda = {};
  LECCIONES.forEach(function (l) {
    indiceBusqueda[l.slug] = normalizar(l.titulo + " " + (l.tags || []).join(" ") + " " + l.md);
  });

  /* ============================================================
     Renderizador Markdown (subconjunto de Obsidian/GFM)
     ============================================================ */

  var TIPOS_CALLOUT = {
    note: "Nota", info: "Información", tip: "Consejo", success: "Correcto",
    warning: "Atención", danger: "Peligro", question: "Pregunta",
    example: "Ejemplo", quote: "Cita", abstract: "Resumen", todo: "Pendiente",
    bug: "Fallo", failure: "Error"
  };

  function renderMarkdown(markdown) {
    var bloques = [];
    var texto = markdown.replace(/\r\n?/g, "\n");

    texto = texto.replace(/```([\w+-]*)\n([\s\S]*?)```/g, function (_, lenguaje, codigo) {
      bloques.push({ lenguaje: lenguaje || "", codigo: codigo.replace(/\n$/, "") });
      return "\n\u0000B" + (bloques.length - 1) + "\u0000\n";
    });

    var lineas = texto.split("\n");
    var usados = {};
    var html = renderBloques(lineas, usados);

    html = html.replace(/\u0000B(\d+)\u0000/g, function (_, i) {
      var b = bloques[Number(i)];
      var clase = b.lenguaje ? ' class="language-' + escapar(b.lenguaje) + '"' : "";
      return "<pre><code" + clase + ">" + escapar(b.codigo) + "</code></pre>";
    });

    return html;
  }

  function esInicioDeBloque(linea) {
    return /^\s*$/.test(linea) ||
      /^#{1,6}\s+/.test(linea) ||
      /^\s*([-*_])\s*(?:\1\s*){2,}$/.test(linea) ||
      /^\s*>\s?/.test(linea) ||
      /^(\s*)([-*+]|\d+\.)\s+/.test(linea) ||
      /^\u0000B\d+\u0000$/.test(linea.trim());
  }

  function renderBloques(lineas, usados) {
    var html = "";
    var i = 0;

    while (i < lineas.length) {
      var linea = lineas[i];

      if (/^\s*$/.test(linea)) { i++; continue; }

      var codigo = linea.trim().match(/^\u0000B(\d+)\u0000$/);
      if (codigo) { html += linea.trim(); i++; continue; }

      var encabezado = linea.match(/^(#{1,6})\s+(.*)$/);
      if (encabezado) {
        var nivel = encabezado[1].length;
        var titulo = encabezado[2].replace(/\s+#+\s*$/, "").trim();
        var id = idUnico(slugify(titulo), usados);
        html += "<h" + nivel + ' id="' + id + '">' + inline(titulo) + "</h" + nivel + ">";
        i++; continue;
      }

      if (/^\s*([-*_])\s*(?:\1\s*){2,}$/.test(linea)) { html += "<hr>"; i++; continue; }

      if (/^\s*>/.test(linea)) {
        var cita = [];
        while (i < lineas.length && /^\s*>/.test(lineas[i])) {
          cita.push(lineas[i].replace(/^\s*>\s?/, ""));
          i++;
        }
        html += renderCita(cita, usados);
        continue;
      }

      if (linea.indexOf("|") !== -1 && i + 1 < lineas.length && esSeparadorTabla(lineas[i + 1])) {
        var resultado = renderTabla(lineas, i, usados);
        html += resultado.html;
        i = resultado.fin;
        continue;
      }

      if (/^(\s*)([-*+]|\d+\.)\s+/.test(linea)) {
        var lista = renderLista(lineas, i, usados);
        html += lista.html;
        i = lista.fin;
        continue;
      }

      var parrafo = [];
      while (i < lineas.length && !esInicioDeBloque(lineas[i])) {
        parrafo.push(lineas[i]);
        i++;
      }
      if (!parrafo.length) { i++; continue; }

      var partes = parrafo.map(function (l) {
        var salto = / {2,}$/.test(l);
        return inline(l.replace(/\s+$/, "")) + (salto ? "<br>" : "");
      });
      html += "<p>" + partes.join(" ") + "</p>";
    }

    return html;
  }

  function idUnico(base, usados) {
    if (!base) base = "seccion";
    if (!usados[base]) { usados[base] = 1; return base; }
    usados[base]++;
    return base + "-" + usados[base];
  }

  function renderCita(lineas, usados) {
    var primera = lineas[0] || "";
    var aviso = primera.match(/^\[!([\w-]+)\][+-]?\s*(.*)$/);
    if (aviso && TIPOS_CALLOUT[aviso[1].toLowerCase()]) {
      var tipo = aviso[1].toLowerCase();
      var titulo = aviso[2].trim() || TIPOS_CALLOUT[tipo];
      return '<div class="callout callout-' + tipo + '">' +
        '<div class="callout-titulo">' + inline(titulo) + "</div>" +
        '<div class="callout-cuerpo">' + renderBloques(lineas.slice(1), usados) + "</div></div>";
    }
    return "<blockquote>" + renderBloques(lineas, usados) + "</blockquote>";
  }

  function esSeparadorTabla(linea) {
    return /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(linea) && /-/.test(linea);
  }

  function dividirFila(linea) {
    var s = linea.trim();
    if (s.charAt(0) === "|") s = s.slice(1);
    if (s.charAt(s.length - 1) === "|") s = s.slice(0, -1);
    var celdas = [];
    var actual = "";
    for (var k = 0; k < s.length; k++) {
      var c = s.charAt(k);
      if (c === "\\" && s.charAt(k + 1) === "|") { actual += "|"; k++; }
      else if (c === "|") { celdas.push(actual.trim()); actual = ""; }
      else actual += c;
    }
    celdas.push(actual.trim());
    return celdas;
  }

  function renderTabla(lineas, inicio, usados) {
    var cabecera = dividirFila(lineas[inicio]);
    var alineaciones = dividirFila(lineas[inicio + 1]).map(function (c) {
      var izq = c.charAt(0) === ":";
      var der = c.charAt(c.length - 1) === ":";
      return izq && der ? "center" : der ? "right" : izq ? "left" : "";
    });

    var filas = [];
    var i = inicio + 2;
    while (i < lineas.length && lineas[i].indexOf("|") !== -1 && !/^\s*$/.test(lineas[i])) {
      filas.push(dividirFila(lineas[i]));
      i++;
    }

    var html = '<div class="tabla-scroll"><table><thead><tr>';
    cabecera.forEach(function (celda, idx) {
      html += "<th" + (alineaciones[idx] ? ' style="text-align:' + alineaciones[idx] + '"' : "") + ">" + inline(celda) + "</th>";
    });
    html += "</tr></thead><tbody>";
    filas.forEach(function (fila) {
      html += "<tr>";
      cabecera.forEach(function (_, idx) {
        html += "<td" + (alineaciones[idx] ? ' style="text-align:' + alineaciones[idx] + '"' : "") + ">" + inline(fila[idx] || "") + "</td>";
      });
      html += "</tr>";
    });
    html += "</tbody></table></div>";

    return { html: html, fin: i };
  }

  function renderLista(lineas, inicio, usados) {
    var items = [];
    var i = inicio;

    while (i < lineas.length) {
      var m = lineas[i].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
      if (m) {
        items.push({
          sangria: m[1].replace(/\t/g, "  ").length,
          ordenada: /\d/.test(m[2]),
          texto: m[3]
        });
        i++;
        continue;
      }
      if (items.length && /^\s{2,}\S/.test(lineas[i])) {
        items[items.length - 1].texto += " " + lineas[i].trim();
        i++;
        continue;
      }
      break;
    }

    var idx = 0;

    function construir(sangria) {
      var ordenada = items[idx].ordenada;
      var salida = ordenada ? "<ol>" : "<ul>";
      while (idx < items.length && items[idx].sangria >= sangria) {
        if (items[idx].sangria > sangria) break;
        if (items[idx].ordenada !== ordenada) break;
        var item = items[idx];
        idx++;
        var sub = "";
        if (idx < items.length && items[idx].sangria > sangria) {
          sub = construir(items[idx].sangria);
        }
        salida += "<li>" + inline(item.texto) + sub + "</li>";
      }
      salida += ordenada ? "</ol>" : "</ul>";
      return salida;
    }

    var html = "";
    while (idx < items.length) {
      var antes = idx;
      html += construir(items[idx].sangria);
      if (idx === antes) break;
    }

    return { html: html, fin: i };
  }

  function inline(texto) {
    var codigos = [];
    var t = escapar(texto);

    t = t.replace(/`([^`]+)`/g, function (_, codigo) {
      codigos.push(codigo);
      return "\u0000C" + (codigos.length - 1) + "\u0000";
    });

    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, function (_, alt, src) {
      return '<img src="' + src + '" alt="' + alt + '" loading="lazy">';
    });

    t = t.replace(/\[\[([^\]]+)\]\]/g, function (_, interior) { return wikilink(interior); });

    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;[^&]*&quot;)?\)/g, function (_, txt, href) {
      var seguro = /^(https?:|mailto:|#|\/|\.)/i.test(href) ? href : "#";
      var externo = /^https?:/i.test(seguro) ? ' target="_blank" rel="noopener"' : "";
      return '<a href="' + seguro + '"' + externo + ">" + txt + "</a>";
    });

    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    t = t.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
    t = t.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    t = t.replace(/\u0000C(\d+)\u0000/g, function (_, i) {
      return "<code>" + codigos[Number(i)] + "</code>";
    });

    return t;
  }

  function wikilink(interior) {
    var partes = interior.split("|");
    var destinoCompleto = partes[0];
    var alias = partes[1];
    var trozos = destinoCompleto.split("#");
    var destino = trozos[0].trim();
    var ancla = trozos[1] ? trozos[1].trim() : "";

    if (/\.(html?|png|jpe?g|svg|pdf)$/i.test(destino)) {
      return '<span class="embed-pendiente">🧪 Laboratorio interactivo (pendiente)</span>';
    }

    var texto = (alias || (ancla ? destino + " › " + ancla : destino)).trim();
    var slug = CURSO.indice[normalizar(destino)];

    if (!slug || !POR_SLUG[slug]) {
      return '<span class="wikilink ghost" title="Nota no incluida en este curso">' + escapar(texto) + "</span>";
    }

    return '<a class="wikilink" data-slug="' + slug + '"' +
      (ancla ? ' data-ancla="' + slugify(ancla) + '"' : "") +
      ' href="#/leccion/' + slug + '">' + escapar(texto) + "</a>";
  }

  /* ============================================================
     Barra lateral
     ============================================================ */

  function coincide(leccion, consulta) {
    if (!consulta) return true;
    return (indiceBusqueda[leccion.slug] || "").indexOf(consulta) !== -1;
  }

  function renderSidebar() {
    var contenedor = $("lista");
    var consulta = normalizar($("buscar").value);
    contenedor.innerHTML = "";
    var visibles = 0;

    CURSO.modulos.forEach(function (modulo) {
      var lecciones = LECCIONES.filter(function (l) {
        return l.modulo === modulo.id && coincide(l, consulta);
      });
      if (!lecciones.length) return;

      var bloque = document.createElement("div");
      bloque.className = "modulo";

      var cabecera = document.createElement("div");
      cabecera.className = "modulo-cab";
      cabecera.innerHTML = '<span class="modulo-punto" style="background:' +
        (COLORES[modulo.id] || COLORES.inicio) + '"></span>' +
        "<span>" + escapar(modulo.titulo) + "</span>" +
        '<span class="modulo-cuenta">' + lecciones.length + "</span>";
      bloque.appendChild(cabecera);

      lecciones.forEach(function (leccion) {
        visibles++;
        var boton = document.createElement("button");
        boton.type = "button";
        boton.className = "leccion-btn" + (completadas.has(leccion.slug) ? " completa" : "");
        boton.dataset.slug = leccion.slug;
        boton.setAttribute("aria-current", leccionActual === leccion.slug ? "true" : "false");

        var etiqueta = (leccion.tags || []).filter(function (t) { return t !== "Infraestructura"; })[0];
        boton.innerHTML = '<span class="leccion-check" aria-hidden="true">✓</span>' +
          '<span class="leccion-texto">' + escapar(leccion.titulo) +
          (etiqueta ? '<span class="leccion-tag">#' + escapar(etiqueta) + "</span>" : "") +
          "</span>";

        boton.addEventListener("click", function () {
          abrirLeccion(leccion.slug);
          cerrarSidebar();
        });

        bloque.appendChild(boton);
      });

      contenedor.appendChild(bloque);
    });

    if (!visibles) {
      contenedor.innerHTML = '<div class="nav-vacio">Sin resultados para “' + escapar($("buscar").value) + '”.</div>';
    }
  }

  function actualizarProgreso() {
    var hechas = LECCIONES.filter(function (l) {
      return l.modulo !== "inicio" && completadas.has(l.slug);
    }).length;
    var pct = TOTAL ? Math.round((hechas / TOTAL) * 100) : 0;

    $("prog-texto").textContent = hechas + "/" + TOTAL;
    $("prog-barra").style.width = pct + "%";
    $("prog-barra-caja").setAttribute("aria-valuenow", String(pct));
  }

  /* ============================================================
     Lección
     ============================================================ */

  function abrirLeccion(slug, ancla) {
    if (!POR_SLUG[slug]) slug = GUIA.slug;
    var destino = "#/leccion/" + slug;
    if (location.hash !== destino) {
      location.hash = destino;
      // hashchange dispara la renderización; el ancla se aplica después.
      setTimeout(function () { irAncla(ancla); }, 60);
    } else {
      renderLeccion(slug);
      irAncla(ancla);
    }
  }

  function irAncla(ancla) {
    if (!ancla) return;
    var objetivo = document.getElementById(ancla);
    if (objetivo) objetivo.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderLeccion(slug) {
    var leccion = POR_SLUG[slug] || GUIA;
    leccionActual = leccion.slug;

    var modulo = MODULOS[leccion.modulo] || { titulo: "" };
    var color = COLORES[leccion.modulo] || COLORES.inicio;

    $("nota-eyebrow").innerHTML = '<span class="punto" style="background:' + color + '"></span>' +
      escapar(modulo.titulo);

    $("nota-titulo").textContent = leccion.titulo;

    var chips = [];
    chips.push('<span class="chip">📅 ' + escapar(leccion.fecha) + "</span>");
    if (leccion.estado === "pendiente_revision") {
      chips.push('<span class="chip estado">Pendiente de revisión</span>');
    }
    (leccion.tags || []).forEach(function (tag) {
      chips.push('<span class="chip tag" data-tag="' + escapar(tag) + '">#' + escapar(tag) + "</span>");
    });
    if (leccion.palabras) chips.push('<span class="chip">' + leccion.palabras.toLocaleString("es-ES") + " palabras</span>");
    $("nota-meta").innerHTML = chips.join("");

    $("nota-contenido").innerHTML = renderMarkdown(leccion.md.replace(/^#\s+.*\n/, ""));

    // Backlinks
    var enlaces = (CURSO.backlinks && CURSO.backlinks[leccion.slug]) || [];
    var seccion = $("backlinks");
    var rejilla = $("backlinks-grid");
    if (enlaces.length) {
      seccion.hidden = false;
      rejilla.innerHTML = "";
      enlaces.forEach(function (destino) {
        var otra = POR_SLUG[destino];
        if (!otra) return;
        var boton = document.createElement("button");
        boton.type = "button";
        boton.className = "backlink";
        boton.innerHTML = '<span class="flecha">←</span><span>' + escapar(otra.titulo) + "</span>";
        boton.addEventListener("click", function () { abrirLeccion(destino); });
        rejilla.appendChild(boton);
      });
    } else {
      seccion.hidden = true;
    }

    // Anterior / siguiente
    var indice = LECCIONES.findIndex(function (l) { return l.slug === leccion.slug; });
    var anterior = indice > 0 ? LECCIONES[indice - 1] : null;
    var siguiente = indice < LECCIONES.length - 1 ? LECCIONES[indice + 1] : null;
    var nav = $("navegacion");
    nav.innerHTML = "";

    var btnAnterior = document.createElement("button");
    btnAnterior.type = "button";
    btnAnterior.className = "nav-prev";
    btnAnterior.disabled = !anterior;
    if (anterior) {
      btnAnterior.innerHTML = '<span>←</span><span><span class="nav-micro">Anterior</span>' + escapar(anterior.titulo) + "</span>";
      btnAnterior.addEventListener("click", function () { abrirLeccion(anterior.slug); });
    }
    nav.appendChild(btnAnterior);

    var btnSiguiente = document.createElement("button");
    btnSiguiente.type = "button";
    btnSiguiente.className = "nav-next";
    btnSiguiente.disabled = !siguiente;
    if (siguiente) {
      btnSiguiente.innerHTML = '<span><span class="nav-micro">Siguiente</span>' + escapar(siguiente.titulo) + '</span><span>→</span>';
      btnSiguiente.addEventListener("click", function () { abrirLeccion(siguiente.slug); });
    }
    nav.appendChild(btnSiguiente);

    actualizarMigas(modulo, leccion);
    actualizarBotonCompletar(leccion);
    actualizarSidebarActiva();
    $("vista-nota").scrollTop = 0;
  }

  function actualizarMigas(modulo, leccion) {
    $("migas").innerHTML = '<span class="modulo-nombre">' + escapar(modulo.titulo) + "</span>" +
      '<span class="sep">/</span>' +
      '<span class="actual">' + escapar(leccion.titulo) + "</span>";
  }

  function actualizarBotonCompletar(leccion) {
    var boton = $("btn-completar");
    if (leccion.modulo === "inicio") {
      boton.style.visibility = "hidden";
      return;
    }
    boton.style.visibility = "visible";
    var hecha = completadas.has(leccion.slug);
    boton.classList.toggle("hecha", hecha);
    boton.querySelector(".check").textContent = hecha ? "✓" : "○";
    boton.querySelector(".texto").textContent = hecha ? "Completada" : "Completar";
    boton.title = hecha ? "Quitar marca de completada" : "Marcar como completada";
  }

  function actualizarSidebarActiva() {
    Array.prototype.forEach.call(document.querySelectorAll(".leccion-btn"), function (boton) {
      var activa = boton.dataset.slug === leccionActual;
      boton.setAttribute("aria-current", activa ? "true" : "false");
      boton.classList.toggle("completa", completadas.has(boton.dataset.slug));
    });
  }

  function alternarCompletada() {
    if (!leccionActual || !POR_SLUG[leccionActual] || POR_SLUG[leccionActual].modulo === "inicio") return;
    if (completadas.has(leccionActual)) completadas.delete(leccionActual);
    else completadas.add(leccionActual);
    guardarProgreso();
    actualizarProgreso();
    actualizarBotonCompletar(POR_SLUG[leccionActual]);
    actualizarSidebarActiva();
    mostrarToast(completadas.has(leccionActual) ? "Lección completada" : "Marca quitada");
  }

  /* ============================================================
     Grafo (modo Ruta)
     ============================================================ */

  var SVG_NS = "http://www.w3.org/2000/svg";
  var grafo = {
    construido: false,
    ancho: 0,
    alto: 0,
    nodos: {},
    aristas: [],
    vista: { x: 0, y: 0, k: 1 },
    ruta: "integral",
    manual: false
  };

  var COL_W = 196;
  var NODO_W = 168;
  var NODO_H = 46;
  var HUECO_Y = 12;
  var MARGEN_X = 34;
  var TOP_NODOS = 116;
  var SPINE_Y = 92;

  function crearSVG(tag, attrs) {
    var el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    }
    return el;
  }

  function envolver(texto, maximo) {
    var palabras = texto.split(" ");
    var lineas = [];
    var actual = "";
    palabras.forEach(function (palabra) {
      if (!actual) { actual = palabra; return; }
      if ((actual + " " + palabra).length <= maximo) actual += " " + palabra;
      else { lineas.push(actual); actual = palabra; }
    });
    if (actual) lineas.push(actual);
    return lineas;
  }

  function construirGrafo() {
    if (grafo.construido) return;
    var capa = $("grafo-zoom");
    capa.innerHTML = "";

    var etapas = CURSO.modulos.filter(function (m) { return m.id !== "inicio"; });
    var porEtapa = {};
    etapas.forEach(function (m) { porEtapa[m.id] = []; });
    LECCIONES.forEach(function (l) {
      if (l.modulo !== "inicio" && porEtapa[l.modulo]) porEtapa[l.modulo].push(l);
    });

    var maxFilas = 0;
    etapas.forEach(function (m) { maxFilas = Math.max(maxFilas, porEtapa[m.id].length); });

    grafo.ancho = MARGEN_X * 2 + etapas.length * COL_W;
    grafo.alto = TOP_NODOS + maxFilas * (NODO_H + HUECO_Y) + 30;

    // Bandas y cabeceras de etapa
    etapas.forEach(function (modulo, idx) {
      var x = MARGEN_X + idx * COL_W;
      var color = COLORES[modulo.id] || COLORES.inicio;

      capa.appendChild(crearSVG("rect", {
        x: x + 3, y: 18, width: COL_W - 6, height: grafo.alto - 30,
        rx: 12, class: "grafo-etapa-banda"
      }));

      var titulo = crearSVG("text", {
        x: x + COL_W / 2, y: 36, "text-anchor": "middle",
        class: "grafo-etapa-titulo", fill: color
      });
      envolver(modulo.titulo, 27).slice(0, 2).forEach(function (linea, n) {
        var tspan = crearSVG("tspan", { x: x + COL_W / 2, dy: n === 0 ? 0 : 14 });
        tspan.textContent = linea;
        titulo.appendChild(tspan);
      });
      capa.appendChild(titulo);

      var cuenta = crearSVG("text", {
        x: x + COL_W / 2, y: 70, "text-anchor": "middle", class: "grafo-etapa-cuenta"
      });
      cuenta.textContent = porEtapa[modulo.id].length + " notas";
      capa.appendChild(cuenta);

      capa.appendChild(crearSVG("circle", {
        cx: x + COL_W / 2, cy: SPINE_Y, r: 4, fill: color
      }));

      if (idx > 0) {
        capa.appendChild(crearSVG("line", {
          x1: x - COL_W + COL_W / 2, y1: SPINE_Y,
          x2: x + COL_W / 2, y2: SPINE_Y, class: "grafo-etapa-linea"
        }));
      }
    });

    // Aristas
    var capaAristas = crearSVG("g", { id: "grafo-aristas" });
    capa.appendChild(capaAristas);

    var vistas = {};
    var aristas = [];
    LECCIONES.forEach(function (leccion) {
      (leccion.enlaces || []).forEach(function (destino) {
        var clave = [leccion.slug, destino].sort().join("→");
        if (vistas[clave]) return;
        vistas[clave] = true;
        if (!POR_SLUG[destino]) return;
        aristas.push({ origen: leccion.slug, destino: destino });
      });
    });

    // Nodos
    var capaNodos = crearSVG("g", { id: "grafo-nodos" });
    capa.appendChild(capaNodos);

    etapas.forEach(function (modulo, idx) {
      var color = COLORES[modulo.id] || COLORES.inicio;
      porEtapa[modulo.id].forEach(function (leccion, fila) {
        var x = MARGEN_X + idx * COL_W + (COL_W - NODO_W) / 2;
        var y = TOP_NODOS + fila * (NODO_H + HUECO_Y);

        var grupo = crearSVG("g", {
          class: "grafo-nodo",
          "data-slug": leccion.slug,
          transform: "translate(" + x + "," + y + ")"
        });
        grupo.style.setProperty("--color", color);

        grupo.appendChild(crearSVG("rect", {
          width: NODO_W, height: NODO_H, rx: 9,
          fill: color, "fill-opacity": "0.13",
          stroke: color, "stroke-opacity": "0.65", "stroke-width": "1.2"
        }));

        var texto = crearSVG("text", { x: 11, y: 19 });
        var lineas = envolver(leccion.titulo, 27);
        lineas.slice(0, 2).forEach(function (linea, n) {
          var tspan = crearSVG("tspan", { x: 11, dy: n === 0 ? 0 : 15 });
          tspan.textContent = n === 1 && lineas.length > 2 ? linea.slice(0, 24) + "…" : linea;
          texto.appendChild(tspan);
        });
        if (lineas.length === 1) texto.setAttribute("y", "27");
        grupo.appendChild(texto);

        grupo.addEventListener("mouseenter", function () { resaltar(leccion.slug); });
        grupo.addEventListener("mouseleave", limpiarResaltado);
        grupo.addEventListener("click", function () { abrirLeccion(leccion.slug); });

        capaNodos.appendChild(grupo);
        grafo.nodos[leccion.slug] = { x: x, y: y, grupo: grupo, modulo: modulo.id };
      });
    });

    aristas.forEach(function (arista) {
      var a = grafo.nodos[arista.origen];
      var b = grafo.nodos[arista.destino];
      if (!a || !b) return;

      var x1 = a.x + (b.x >= a.x ? NODO_W : 0);
      var y1 = a.y + NODO_H / 2;
      var x2 = b.x + (b.x >= a.x ? 0 : NODO_W);
      var y2 = b.y + NODO_H / 2;
      var curva = Math.max(28, Math.abs(x2 - x1) * 0.38);
      var signo = x2 >= x1 ? 1 : -1;

      var camino = crearSVG("path", {
        class: "grafo-arista",
        d: "M " + x1 + " " + y1 +
           " C " + (x1 + curva * signo) + " " + y1 +
           ", " + (x2 - curva * signo) + " " + y2 +
           ", " + x2 + " " + y2
      });
      camino.dataset.a = arista.origen;
      camino.dataset.b = arista.destino;
      capaAristas.appendChild(camino);
      grafo.aristas.push(camino);
    });

    // Selector de rutas
    var contenedorRutas = $("rutas");
    contenedorRutas.innerHTML = "";
    CURSO.rutas.forEach(function (ruta) {
      var boton = document.createElement("button");
      boton.type = "button";
      boton.className = "ruta-btn";
      boton.textContent = ruta.titulo;
      boton.dataset.ruta = ruta.id;
      boton.title = ruta.descripcion || "";
      boton.setAttribute("aria-pressed", ruta.id === grafo.ruta ? "true" : "false");
      boton.addEventListener("click", function () { aplicarRuta(ruta.id); });
      contenedorRutas.appendChild(boton);
    });

    grafo.construido = true;
    ajustarVista(true);
    aplicarRuta(grafo.ruta);
  }

  function resaltar(slug) {
    var vecinos = {};
    vecinos[slug] = true;
    (POR_SLUG[slug].enlaces || []).forEach(function (d) { vecinos[d] = true; });
    var enlaces = (CURSO.backlinks && CURSO.backlinks[slug]) || [];
    enlaces.forEach(function (d) { vecinos[d] = true; });

    Object.keys(grafo.nodos).forEach(function (id) {
      var nodo = grafo.nodos[id];
      nodo.grupo.classList.toggle("atenuado", !vecinos[id]);
      nodo.grupo.classList.toggle("activo", id === slug);
    });

    grafo.aristas.forEach(function (arista) {
      var toca = arista.dataset.a === slug || arista.dataset.b === slug;
      arista.classList.toggle("activa", toca);
      arista.classList.toggle("atenuado", !toca);
    });
  }

  function limpiarResaltado() {
    Object.keys(grafo.nodos).forEach(function (id) {
      grafo.nodos[id].grupo.classList.remove("atenuado", "activo");
    });
    grafo.aristas.forEach(function (arista) {
      arista.classList.remove("atenuado", "activa");
    });
    aplicarRuta(grafo.ruta);
  }

  function aplicarRuta(id) {
    grafo.ruta = id;
    var ruta = CURSO.rutas.filter(function (r) { return r.id === id; })[0];
    var incluidas = {};
    if (ruta) ruta.lecciones.forEach(function (slug) { incluidas[slug] = true; });

    Object.keys(grafo.nodos).forEach(function (slug) {
      grafo.nodos[slug].grupo.classList.toggle("atenuado", !incluidas[slug]);
    });

    grafo.aristas.forEach(function (arista) {
      var dentro = incluidas[arista.dataset.a] && incluidas[arista.dataset.b];
      arista.classList.toggle("atenuado", !dentro);
    });

    Array.prototype.forEach.call(document.querySelectorAll(".ruta-btn"), function (boton) {
      boton.setAttribute("aria-pressed", boton.dataset.ruta === id ? "true" : "false");
    });
  }

  function ajustarVista(forzar) {
    var svg = $("grafo-svg");
    if (!svg) return;
    if (!forzar && grafo.manual) return;
    var anchoCaja = svg.clientWidth || svg.parentElement.clientWidth;
    var altoCaja = svg.clientHeight || svg.parentElement.clientHeight;
    var k = Math.min(1, (anchoCaja - 32) / grafo.ancho, (altoCaja - 40) / grafo.alto);
    k = Math.max(0.32, k);
    grafo.vista.k = k;
    grafo.vista.x = (anchoCaja - grafo.ancho * k) / 2;
    grafo.vista.y = Math.max(14, (altoCaja - grafo.alto * k) / 2);
    aplicarVista();
  }

  function aplicarVista() {
    $("grafo-zoom").setAttribute(
      "transform",
      "translate(" + grafo.vista.x + " " + grafo.vista.y + ") scale(" + grafo.vista.k + ")"
    );
  }

  function zoomCentro(factor) {
    var svg = $("grafo-svg");
    var rect = svg.getBoundingClientRect();
    var mx = rect.width / 2;
    var my = rect.height / 2;
    var k2 = clamp(grafo.vista.k * factor, 0.28, 2.6);
    grafo.vista.x = mx - (mx - grafo.vista.x) * (k2 / grafo.vista.k);
    grafo.vista.y = my - (my - grafo.vista.y) * (k2 / grafo.vista.k);
    grafo.vista.k = k2;
    grafo.manual = true;
    aplicarVista();
  }

  function conectarGrafo() {
    var svg = $("grafo-svg");
    var arrastrando = false;
    var inicio = null;

    svg.addEventListener("wheel", function (e) {
      e.preventDefault();
      var rect = svg.getBoundingClientRect();
      var mx = e.clientX - rect.left;
      var my = e.clientY - rect.top;
      var factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      var k2 = clamp(grafo.vista.k * factor, 0.28, 2.6);
      grafo.vista.x = mx - (mx - grafo.vista.x) * (k2 / grafo.vista.k);
      grafo.vista.y = my - (my - grafo.vista.y) * (k2 / grafo.vista.k);
      grafo.vista.k = k2;
      grafo.manual = true;
      aplicarVista();
    }, { passive: false });

    svg.addEventListener("pointerdown", function (e) {
      if (e.target.closest(".grafo-nodo")) return;
      arrastrando = true;
      inicio = { x: e.clientX, y: e.clientY, vx: grafo.vista.x, vy: grafo.vista.y };
      svg.classList.add("arrastrando");
      svg.setPointerCapture(e.pointerId);
    });

    svg.addEventListener("pointermove", function (e) {
      if (!arrastrando || !inicio) return;
      grafo.vista.x = inicio.vx + (e.clientX - inicio.x);
      grafo.vista.y = inicio.vy + (e.clientY - inicio.y);
      aplicarVista();
    });

    function soltar(e) {
      if (!arrastrando) return;
      arrastrando = false;
      inicio = null;
      grafo.manual = true;
      svg.classList.remove("arrastrando");
      try { svg.releasePointerCapture(e.pointerId); } catch (err) { /* ya liberado */ }
    }

    svg.addEventListener("pointerup", soltar);
    svg.addEventListener("pointercancel", soltar);

    $("zoom-mas").addEventListener("click", function () { zoomCentro(1.18); });
    $("zoom-menos").addEventListener("click", function () { zoomCentro(1 / 1.18); });
    $("zoom-reset").addEventListener("click", function () {
      grafo.manual = false;
      ajustarVista(true);
    });

    window.addEventListener("resize", function () {
      if (grafo.construido) ajustarVista(false);
    });
  }

  /* ============================================================
     Navegación y vistas
     ============================================================ */

  function mostrarVista(nombre) {
    $("vista-nota").hidden = nombre !== "nota";
    $("vista-lab").hidden = nombre !== "lab";
    $("vista-grafo").hidden = nombre !== "grafo";
  }

  function cambiarWorkspace(workspace) {
    var enGrafo = workspace === "grafo";

    Array.prototype.forEach.call(document.querySelectorAll(".workspace-tab"), function (b) {
      b.setAttribute("aria-selected", b.dataset.workspace === workspace ? "true" : "false");
    });

    $("btn-completar").style.display = enGrafo ? "none" : "";
    document.querySelector(".modo-switch").style.display = enGrafo ? "none" : "";

    if (enGrafo) {
      $("migas").innerHTML = '<span class="actual">Grafo del curso</span>';
      mostrarVista("grafo");
      construirGrafo();
      requestAnimationFrame(function () { ajustarVista(false); });
    } else {
      mostrarVista(modoActual === "lab" ? "lab" : "nota");
    }
  }

  function cambiarModo(modo) {
    if (modo === "lab" && !(CURSO.labs && CURSO.labs.disponible)) {
      mostrarToast("Los laboratorios estarán disponibles más adelante");
      return;
    }
    modoActual = modo;
    $("tab-notas").setAttribute("aria-selected", modo === "notas" ? "true" : "false");
    $("tab-lab").setAttribute("aria-selected", modo === "lab" ? "true" : "false");
    mostrarVista(modo === "lab" ? "lab" : "nota");
    if (modo === "lab" && typeof window.CURSO_LABS === "object" && typeof window.CURSO_LABS.mount === "function") {
      window.CURSO_LABS.mount(leccionActual, $("vista-lab"));
    }
  }

  function aplicarRutaURL() {
    var hash = location.hash.replace(/^#/, "");
    var leccion = hash.match(/^\/leccion\/([\w-]+)/);
    var grafoUrl = hash.indexOf("/grafo") === 0;

    if (grafoUrl) {
      cambiarWorkspace("grafo");
      return;
    }

    cambiarWorkspace("curso");
    if (modoActual === "lab") cambiarModo("notas");

    var slug = leccion ? leccion[1] : GUIA.slug;
    if (!POR_SLUG[slug]) slug = GUIA.slug;

    if (leccionActual === slug) actualizarSidebarActiva();
    renderLeccion(slug);
  }

  /* ============================================================
     Varios
     ============================================================ */

  var temporizadorToast = null;

  function mostrarToast(mensaje) {
    var toast = $("toast");
    toast.textContent = mensaje;
    toast.classList.add("visible");
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(function () { toast.classList.remove("visible"); }, 2200);
  }

  function abrirSidebar() {
    if (!window.matchMedia("(max-width: 860px)").matches) return;
    $("sidebar").classList.add("abierta");
    $("overlay").classList.add("visible");
  }

  function cerrarSidebar() {
    $("sidebar").classList.remove("abierta");
    $("overlay").classList.remove("visible");
  }

  function iniciar() {
    $("pie-build").textContent = "Generado " + CURSO.generado;
    $("tab-lab").disabled = !(CURSO.labs && CURSO.labs.disponible);
    $("tab-lab").title = CURSO.labs && CURSO.labs.disponible
      ? "Abrir laboratorio"
      : "Los laboratorios se integrarán más adelante";

    renderSidebar();
    actualizarProgreso();

    var temporizadorBusqueda = null;
    $("buscar").addEventListener("input", function () {
      clearTimeout(temporizadorBusqueda);
      temporizadorBusqueda = setTimeout(renderSidebar, 90);
    });

    $("btn-completar").addEventListener("click", alternarCompletada);
    $("btn-reset").addEventListener("click", function () {
      if (!completadas.size) { mostrarToast("No hay progreso guardado"); return; }
      completadas.clear();
      guardarProgreso();
      actualizarProgreso();
      actualizarSidebarActiva();
      if (leccionActual) actualizarBotonCompletar(POR_SLUG[leccionActual]);
      mostrarToast("Progreso reiniciado");
    });

    $("btn-menu").addEventListener("click", abrirSidebar);
    $("overlay").addEventListener("click", cerrarSidebar);

    Array.prototype.forEach.call(document.querySelectorAll(".workspace-tab"), function (boton) {
      boton.addEventListener("click", function () {
        var workspace = boton.dataset.workspace;
        if (workspace === "grafo") location.hash = "#/grafo";
        else location.hash = "#/leccion/" + (leccionActual || GUIA.slug);
        cambiarWorkspace(workspace);
      });
    });

    $("tab-notas").addEventListener("click", function () { cambiarModo("notas"); });
    $("tab-lab").addEventListener("click", function () { cambiarModo("lab"); });

    // Delegación: wikilinks y chips de tag
    document.addEventListener("click", function (e) {
      var enlace = e.target.closest("a.wikilink");
      if (enlace && enlace.dataset.slug) {
        e.preventDefault();
        abrirLeccion(enlace.dataset.slug, enlace.dataset.ancla || "");
        return;
      }
      var chip = e.target.closest(".chip.tag");
      if (chip && chip.dataset.tag) {
        $("buscar").value = chip.dataset.tag;
        renderSidebar();
        abrirSidebar();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") cerrarSidebar();
      if (e.key === "/" && document.activeElement !== $("buscar")) {
        e.preventDefault();
        $("buscar").focus();
      }
    });

    conectarGrafo();
    window.addEventListener("hashchange", aplicarRutaURL);
    aplicarRutaURL();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
