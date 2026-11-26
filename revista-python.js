(function () {
  "use strict";

  var pages = Array.prototype.slice.call(document.querySelectorAll(".spread"));
  var contentsButtons = Array.prototype.slice.call(document.querySelectorAll(".toc-link"));
  var counter = document.getElementById("page-counter");
  var progress = document.getElementById("progress-bar");
  var liveStatus = document.getElementById("live-status");
  var previousButton = document.getElementById("previous-page");
  var nextButton = document.getElementById("next-page");
  var currentPage = 0;
  var soundOn = false;
  var audioContext = null;
  var voice = {
    Aldo: { skin: "#bd7958", hair: "#302823", shirt: "#e87355", pants: "#34404c", hairStyle: 0 },
    Emanuel: { skin: "#e2ad83", hair: "#322923", shirt: "#77a99a", pants: "#39434d", hairStyle: 1 },
    Matías: { skin: "#d2946d", hair: "#49332c", shirt: "#628cab", pants: "#303b47", hairStyle: 2 },
    Rubén: { skin: "#c98e68", hair: "#51443d", shirt: "#d5a840", pants: "#3d4953", hairStyle: 3, glasses: true }
  };

  function makeCharacter(name, index) {
    var person = voice[name];
    if (!person) return document.createTextNode("");
    var figure = document.createElement("figure");
    figure.className = "character";
    figure.style.animationDelay = (index * 0.13) + "s";
    var hair = person.hairStyle === 1
      ? "M48 73 Q39 24 78 21 Q119 21 112 74 L103 60 Q82 48 57 64Z"
      : person.hairStyle === 2
        ? "M47 70 Q42 29 78 22 Q115 23 113 69 L105 60 L97 49 L88 61 L78 48 L68 61 L57 59Z"
        : person.hairStyle === 3
          ? "M48 66 Q52 25 80 25 Q108 24 112 59 L104 54 Q82 43 54 61Z"
          : "M47 70 Q43 27 79 22 Q116 23 113 70 L103 61 Q80 48 56 64Z";
    var glasses = person.glasses
      ? '<g fill="none" stroke="#28323a" stroke-width="3"><rect x="57" y="65" width="19" height="13" rx="5"/><rect x="84" y="65" width="19" height="13" rx="5"/><path d="M76 70h8"/></g>'
      : "";
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 160 250");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Dibujo de cuerpo entero de " + name);
    svg.innerHTML =
      '<ellipse cx="80" cy="239" rx="42" ry="6" fill="#202a3222"/>' +
      '<g class="legs" stroke="#202a32" stroke-width="3" stroke-linejoin="round">' +
        '<path d="M59 172l-7 54q0 7 11 7h8l6-61z" fill="' + person.pants + '"/>' +
        '<path d="M84 172l7 61h14q9 0 7-8l-11-55z" fill="' + person.pants + '"/>' +
        '<path d="M53 230q-17 1-14 11 2 4 31 4l1-12zM95 233l1 12q27 2 31-3 3-10-18-12z" fill="#fffdf6"/>' +
      '</g>' +
      '<g class="body">' +
        '<path d="M58 103q22-13 44 0l17 67q-39 18-79 0z" fill="' + person.shirt + '" stroke="#202a32" stroke-width="3"/>' +
        '<path d="M63 106q-20 1-25 23l-9 28q-2 8 6 10 8 1 11-7l15-24M98 106q20 1 25 23l9 28q2 8-6 10-8 1-11-7l-15-24" fill="none" stroke="' + person.shirt + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M29 153q-1 10 8 12M131 153q1 10-8 12" fill="none" stroke="' + person.skin + '" stroke-width="9" stroke-linecap="round"/>' +
        '<path d="M66 107l14 17 14-17" fill="none" stroke="#202a32" stroke-width="2.5"/>' +
      '</g>' +
      '<path d="M68 93h24l3 15-15 12-15-12z" fill="' + person.skin + '" stroke="#202a32" stroke-width="2.5"/>' +
      '<g class="head">' +
        '<ellipse cx="80" cy="68" rx="34" ry="40" fill="' + person.skin + '" stroke="#202a32" stroke-width="3"/>' +
        '<path d="' + hair + '" fill="' + person.hair + '" stroke="#202a32" stroke-width="3" stroke-linejoin="round"/>' +
        '<path d="M47 72q-8 5-2 15M113 72q8 5 2 15" fill="none" stroke="' + person.skin + '" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="68" cy="75" r="2.7" fill="#202a32"/><circle cx="92" cy="75" r="2.7" fill="#202a32"/>' +
        glasses +
        '<path d="M78 77l-3 9 6 1" fill="none" stroke="#85533e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path class="mouth" d="M70 94q10 10 20 0" fill="none" stroke="#202a32" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M55 87q7 4 13 0M92 87q7 4 13 0" fill="none" stroke="#e78c79" stroke-width="3" stroke-linecap="round" opacity=".65"/>' +
      '</g>';
    var label = document.createElement("figcaption");
    label.className = "character-name";
    label.textContent = name === "Rubén" ? "Profe Rubén" : name;
    figure.appendChild(svg);
    figure.appendChild(label);
    return figure;
  }

  document.querySelectorAll("[data-cast]").forEach(function (stage) {
    var cast = document.createElement("div");
    cast.className = "cast";
    cast.setAttribute("aria-label", "Personajes de esta escena");
    stage.getAttribute("data-cast").split(",").forEach(function (name, index) {
      cast.appendChild(makeCharacter(name.trim(), index));
    });
    stage.appendChild(cast);
  });

  function reactToPage() {
    var active = pages[currentPage];
    var characters = active.querySelectorAll(".character");
    if (!characters.length) return;
    var character = characters[Math.floor(Math.random() * characters.length)];
    character.classList.remove("react");
    void character.offsetWidth;
    character.classList.add("react");
    window.setTimeout(function () { character.classList.remove("react"); }, 1200);
  }

  function playTick() {
    if (!soundOn) return;
    var Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (!audioContext) audioContext = new Audio();
    if (audioContext.state === "suspended") audioContext.resume();
    var oscillator = audioContext.createOscillator();
    var gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(640, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(420, audioContext.currentTime + 0.07);
    gain.gain.setValueAtTime(0.055, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.08);
  }

  function showPage(index) {
    if (index < 0 || index >= pages.length) return;
    currentPage = index;
    pages.forEach(function (page, pageIndex) {
      var isActive = pageIndex === currentPage;
      page.classList.toggle("is-active", isActive);
      page.setAttribute("aria-hidden", isActive ? "false" : "true");
    });
    contentsButtons.forEach(function (button, buttonIndex) {
      var isCurrent = buttonIndex === currentPage;
      button.classList.toggle("is-current", isCurrent);
      if (isCurrent) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    counter.textContent = (currentPage === 0 ? "PORTADA" : "PÁGINA") + " · " +
      String(currentPage + 1).padStart(2, "0") + " / " + String(pages.length).padStart(2, "0");
    progress.style.width = (((currentPage + 1) / pages.length) * 100) + "%";
    previousButton.disabled = currentPage === 0;
    nextButton.textContent = currentPage === pages.length - 1 ? "Volver al inicio ↑" : "Siguiente →";
    if (liveStatus) liveStatus.textContent = "Página " + (currentPage + 1) + " de " + pages.length;
    playTick();
    reactToPage();
    if (currentPage === 9) document.getElementById("cuestionario").scrollIntoView({ block: "nearest", behavior: "smooth" });
    else document.getElementById("magazine").scrollIntoView({ block: "start", behavior: "smooth" });
  }

  document.addEventListener("click", function (event) {
    var target = event.target.closest("button");
    if (!target) return;
    if (target.hasAttribute("data-go")) {
      showPage(Number(target.getAttribute("data-go")));
      return;
    }
    if (target.id === "previous-page") {
      showPage(Math.max(0, currentPage - 1));
      return;
    }
    if (target.id === "next-page") {
      showPage(currentPage === pages.length - 1 ? 0 : currentPage + 1);
      return;
    }
    if (target.id === "sound-toggle") {
      soundOn = !soundOn;
      target.setAttribute("aria-pressed", String(soundOn));
      target.textContent = soundOn ? "♫ Sonido: encendido" : "♫ Sonido: apagado";
      playTick();
      reactToPage();
      return;
    }
    if (target.hasAttribute("data-copy")) {
      var text = target.getAttribute("data-copy").replace(/&quot;/g, '"');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          target.textContent = "¡Copiado!";
          window.setTimeout(function () { target.textContent = "Copiar"; }, 1400);
          reactToPage();
        }).catch(function () {
          target.textContent = "Selecciona el código";
          window.setTimeout(function () { target.textContent = "Copiar"; }, 1800);
        });
      } else {
        target.textContent = "Selecciona el código";
        window.setTimeout(function () { target.textContent = "Copiar"; }, 1800);
      }
    }
  });

  document.addEventListener("keydown", function (event) {
    var tagName = event.target && event.target.tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "BUTTON") return;
    if (event.key === "ArrowRight") showPage(currentPage === pages.length - 1 ? 0 : currentPage + 1);
    if (event.key === "ArrowLeft") showPage(Math.max(0, currentPage - 1));
  });

  document.getElementById("quiz-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var answers = ["b", "a", "c", "b", "a", "c", "a", "b", "c", "a"];
    var score = 0;
    var unanswered = [];
    answers.forEach(function (answer, index) {
      var selected = this.querySelector('input[name="q' + (index + 1) + '"]:checked');
      if (!selected) unanswered.push(index + 1);
      else if (selected.value === answer) score++;
    }, this);
    var result = document.getElementById("quiz-result");
    result.classList.remove("good", "try-again");
    if (unanswered.length) {
      result.classList.add("try-again");
      result.textContent = "Te faltan las preguntas " + unanswered.join(", ") + ". Respóndelas y vuelve a revisar.";
      this.querySelector('input[name="q' + unanswered[0] + '"]').focus();
      return;
    }
    result.classList.add(score >= 7 ? "good" : "try-again");
    result.textContent = "Tu resultado: " + score + " de 10. " +
      (score === 10 ? "¡Excelente! Dominas los conceptos." :
        score >= 7 ? "¡Muy bien! Ya tienes una buena base." :
          "¡Buen comienzo! Puedes repasar las páginas y volver a intentarlo.");
    reactToPage();
  });

  document.getElementById("quiz-form").addEventListener("reset", function () {
    var result = document.getElementById("quiz-result");
    result.textContent = "";
    result.classList.remove("good", "try-again");
  });

  showPage(0);
}());
