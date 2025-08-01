const socket = io();
let jugador = "";
let puntos = 0;
let tiempo = 30;
let temporizador;
let preguntaActual = 0;

const bancoPreguntas = [
  // Categoría: Milagros
  { categoria: "Milagros", pregunta: "¿Cuál fue el primer milagro de Jesús?", opciones: ["Sanar a un ciego", "Convertir agua en vino", "Multiplicar panes", "Resucitar a Lázaro"], correcta: 1 },
  // Categoría: Parábolas
  { categoria: "Parábolas", pregunta: "¿Qué enseña la parábola del hijo pródigo?", opciones: ["La obediencia", "El perdón y la misericordia", "El trabajo duro", "El diezmo"], correcta: 1 },
  // Categoría: Apóstoles
  { categoria: "Apóstoles", pregunta: "¿Quién negó a Jesús tres veces?", opciones: ["Pedro", "Juan", "Judas", "Santiago"], correcta: 0 },
  // Categoría: Antiguo Testamento
  { categoria: "Antiguo Testamento", pregunta: "¿Quién fue arrojado al foso de los leones?", opciones: ["Moisés", "Daniel", "José", "Ezequiel"], correcta: 1 }
];

document.getElementById("btnIniciar").addEventListener("click", () => {
  jugador = document.getElementById("nombreJugador").value.trim();
  if (!jugador) return alert("Ingresa tu nombre");
  document.getElementById("jugador").textContent = jugador;
  document.getElementById("registro").style.display = "none";
  document.getElementById("juego").style.display = "block";
  socket.emit("nuevoJugador", jugador);
  mostrarPregunta();
});

function mostrarPregunta() {
  if (preguntaActual >= bancoPreguntas.length) {
    alert("Juego terminado. Tu puntaje: " + puntos);
    return;
  }

  clearInterval(temporizador);
  tiempo = 30;
  document.getElementById("tiempo").textContent = tiempo;
  temporizador = setInterval(actualizarTiempo, 1000);

  const p = bancoPreguntas[preguntaActual];
  document.getElementById("texto-pregunta").textContent = `(${p.categoria}) ${p.pregunta}`;
  
  const opcionesDiv = document.getElementById("opciones");
  opcionesDiv.innerHTML = "";
  p.opciones.forEach((opcion, index) => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.onclick = () => verificarRespuesta(index, btn);
    opcionesDiv.appendChild(btn);
  });
}

function actualizarTiempo() {
  tiempo--;
  document.getElementById("tiempo").textContent = tiempo;
  if (tiempo <= 0) {
    clearInterval(temporizador);
    alert("⏰ Se acabó el tiempo");
    enviarPuntaje();
  }
}

function verificarRespuesta(indice, boton) {
  clearInterval(temporizador);
  const correcta = bancoPreguntas[preguntaActual].correcta;
  if (indice === correcta) {
    boton.classList.add("correcto");
    puntos += 100;
  } else {
    boton.classList.add("incorrecto");
  }
  document.getElementById("puntos").textContent = puntos;
  setTimeout(() => {
    preguntaActual++;
    mostrarPregunta();
  }, 1500);
  enviarPuntaje();
}

function enviarPuntaje() {
  socket.emit("actualizarPuntos", puntos);
}

socket.on("rankingActualizado", (ranking) => {
  const lista = document.getElementById("listaRanking");
  lista.innerHTML = "";
  ranking.forEach((j, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${j.nombre} - ${j.puntos} pts`;
    lista.appendChild(li);
  });
});
