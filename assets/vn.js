/* Вечерний Нуржан — vnurzhan.com */
(function () {
  var EN = document.documentElement.lang === "en";
  var T = function (ru, en) { return EN ? en : ru; };

  /* loader: shown on every page, gone after load (at least 0.7 s, at most 4 s) */
  var t0 = Date.now(), ld = document.getElementById("vn-loader");
  function hide() { if (!ld) return; var w = Math.max(0, 1400 - (Date.now() - t0)); setTimeout(function () { ld.classList.add("done"); }, w); }
  window.addEventListener("load", hide);
  setTimeout(hide, 8000);

  /* Irad Time = UTC+6 */
  function iradNow() { var d = new Date(); return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 6 * 3600000); }
  var MON_RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
  var MON_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DOW_RU = ["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"];
  var DOW_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dateLine(d) { return EN ? DOW_EN[d.getDay()] + ", " + d.getDate() + " " + MON_EN[d.getMonth()] + " " + d.getFullYear() : DOW_RU[d.getDay()] + ", " + d.getDate() + " " + MON_RU[d.getMonth()] + " " + d.getFullYear(); }
  function clock() {
    var d = iradNow(), el = document.getElementById("vn-date");
    if (el) el.textContent = dateLine(d) + " · " + pad(d.getHours()) + ":" + pad(d.getMinutes());
  }
  clock(); setInterval(clock, 20000);

  /* visually impaired version */
  try { if (localStorage.getItem("vn-vi") === "1") document.body.classList.add("vi"); } catch (e) {}
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-vi]");
    if (!a) return; e.preventDefault();
    var on = document.body.classList.toggle("vi");
    try { localStorage.setItem("vn-vi", on ? "1" : "0"); } catch (x) {}
  });

  /* today's numbers: weather, air, official rates */
  var AQI_COL = { good: "#3a9d3a", moderate: "#d8a300", usg: "#e8771b", unhealthy: "#c4161c", very_unhealthy: "#7b2a8c", hazardous: "#6b1d1d" };
  function nm(o) { return o ? (EN ? o.en : o.ru) : ""; }
  function fmt(n, k) { return (+n).toFixed(k).replace(".", EN ? "." : ","); }
  fetch("https://iradone.com/data/today.json", { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (d) {
    var w = (d.weather && d.weather.places || []).filter(function (p) { return p.id === "nurzhan"; })[0];
    var a = (d.air && d.air.places || []).filter(function (p) { return p.id === "nurzhan"; })[0];
    var rows = d.rates && d.rates.official && d.rates.official.rows || [];
    var top = document.getElementById("vn-top-w");
    if (top && w) top.innerHTML = T("Нуржан", "Nurzhan") + " <b>" + (w.high > 0 ? "+" : "") + w.high + "°</b> " + nm(w.label).toLowerCase();
    var tr = document.getElementById("vn-top-r");
    if (tr) {
      var pick = { USD: 1, EUR: 1, RUB: 1 }, s = [];
      rows.forEach(function (r) { if (pick[r.code]) s.push(r.code + (r.units > 1 ? "×" + r.units : "") + " <b>" + fmt(r.som, 2) + "</b>"); });
      if (s.length) tr.innerHTML = "<i>" + T("Курс БИ:", "Bank of Irad:") + "</i> " + s.join(" &nbsp;");
    }
    var box = document.getElementById("vn-weather");
    if (box && w) {
      var h = '<div class="big"><span class="deg">' + (w.high > 0 ? "+" : "") + w.high + '°</span><span>' + nm(w.label) + "<br><span class=meta>" + T("ночью ", "night ") + (w.low > 0 ? "+" : "") + w.low + "°</span></span></div><table>";
      (w.forecast || []).slice(0, 3).forEach(function (f) {
        var dd = new Date(f.date + "T12:00:00");
        h += "<tr><td>" + (EN ? DOW_EN[dd.getDay()] : DOW_RU[dd.getDay()]) + "</td><td>" + nm(f.label) + "</td><td>" + (f.high > 0 ? "+" : "") + f.high + "° / " + (f.low > 0 ? "+" : "") + f.low + "°</td></tr>";
      });
      h += "</table>";
      if (a) h += '<p style="margin:10px 0 0;font-size:13.5px">' + T("Воздух", "Air") + ' (US AQI): <span class="aqi" style="background:' + (AQI_COL[a.category] || "#888") + '">' + a.aqi + "</span> " + nm(a.label) + ", PM2,5 " + fmt(a.pm25, 1) + "</p>";
      h += '<div class="small">' + T("По данным Ирадгидромета и постов ТалГУ.", "Irad Gidromet and TSU monitoring posts.") + "</div>";
      box.innerHTML = h;
    }
    var rb = document.getElementById("vn-rates");
    if (rb && rows.length) {
      var t = "<table>";
      rows.forEach(function (r) { if (["USD", "EUR", "RUB", "KZT", "CNY"].indexOf(r.code) >= 0) t += "<tr><td>" + (r.units > 1 ? r.units + " " : "") + r.code + "</td><td><b>" + fmt(r.som, r.som < 2 ? 4 : 2) + "</b></td></tr>"; });
      rb.innerHTML = t + "</table><div class=small>" + T("Официальный курс Банка Ирада на сегодня, сомов.", "Bank of Irad official rate today, som.") + "</div>";
    }
  }).catch(function () {
    var box = document.getElementById("vn-weather");
    if (box) box.innerHTML = '<div class="small">' + T("Данные временно недоступны.", "Data temporarily unavailable.") + "</div>";
  });

  /* TV guide: same for every visitor, built from the weekday and date */
  var CH = {
    odin: { ru: "ИрадОдин", en: "IradOdin" },
    one: { ru: "IradOne", en: "IradOne" },
    chu: { ru: "Радио «Чу FM» 104,5", en: "Radio Chu FM 104.5" }
  };
  var FILMS = [
    ["«Белое солнце пустыни» (1970)", "White Sun of the Desert (1970)"], ["«Афоня» (1975)", "Afonya (1975)"], ["«Служебный роман» (1977)", "Office Romance (1977)"],
    ["«Кавказская пленница» (1966)", "Kidnapping, Caucasian Style (1966)"], ["«Москва слезам не верит» (1979)", "Moscow Does Not Believe in Tears (1979)"],
    ["«Офицеры» (1971)", "Officers (1971)"], ["«Джентльмены удачи» (1971)", "Gentlemen of Fortune (1971)"], ["«Добро пожаловать, или Посторонним вход воспрещён» (1964)", "Welcome, or No Trespassing (1964)"],
    ["«Берегись автомобиля» (1966)", "Beware of the Car (1966)"], ["«Иван Васильевич меняет профессию» (1973)", "Ivan Vasilievich Changes Profession (1973)"]
  ];
  function dayIdx(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }
  function grid(ch, d) {
    var wd = d.getDay(), k = dayIdx(d), f1 = FILMS[k % FILMS.length], f2 = FILMS[(k + 4) % FILMS.length];
    var iso = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    var L = [];
    function add(t, ru, en, hl, sub) { L.push({ t: t, ru: ru, en: en, hl: hl, sub: sub }); }
    if (ch === "odin") {
      add("06:00", "Гимн. Новости", "Anthem. News");
      add("06:15", "«Доброе утро, Ирад» (утренний канал)", "Good Morning, Irad (breakfast programme)");
      add("09:00", "Новости", "News");
      add("09:20", "Х/ф " + f1[0], "Film: " + f1[1]);
      add("11:10", wd === 0 ? "«Час веры». Православная и сиро-ирадская служба" : "«Домашний доктор»", wd === 0 ? "Hour of Faith: Orthodox and Syro-Iradi service" : "The Family Doctor");
      add("12:00", "Новости", "News");
      add("12:30", "Сериал «Участок» ", "Series: The Precinct");
      add("14:00", wd === 6 ? "«Сад и огород»" : "«Земляки»: Нуржан и Чуйский район", wd === 6 ? "Garden and Allotment" : "Countrymen: Nurzhan and Chu District");
      add("15:00", "Новости", "News");
      add("15:20", "Мультфильмы", "Cartoons");
      add("16:00", "«Поле чудес по-ирадски»", "Field of Wonders, Iradi style");
      if (iso === "2026-10-31") {
        add("17:40", "Футбол. Чемпионат Ирада, 27-й тур. «Нефтчи» — «Тулпар». Прямая трансляция со стадиона «НурГаз»", "Football: Irad League round 27, Neftchi v Tulpar. Live from NurGaz Stadium", true, ["Русский комментарий", "Russian commentary"]);
        add("20:00", "Новости. После дерби", "News. After the derby");
      } else {
        add("18:00", "Сериал «Тайны следствия»", "Series: Secrets of the Investigation");
        add("20:00", "Новости ИрадОдин", "IradOdin News", true, ["Главная вечерняя программа на русском языке", "The main evening news in Russian"]);
      }
      add("20:40", wd === 5 ? "«Пятничный концерт». Эстрада 70-х" : "Х/ф " + f2[0], wd === 5 ? "Friday Concert: 1970s estrada" : "Film: " + f2[1]);
      add("22:30", "«Итоги дня»", "The Day's Summary");
      add("23:10", "Ночной эфир. Музыка", "Night music");
    } else if (ch === "one") {
      add("06:00", "Sign On. OneNews Morning", "Sign On. OneNews Morning");
      add("09:00", "Talas Today", "Talas Today");
      add("12:00", "OneNews Midday", "OneNews Midday");
      add("13:00", "Documentary", "Documentary");
      add("15:00", "OneNews Afternoon", "OneNews Afternoon");
      if (iso === "2026-10-31") add("17:45", "IradOne Sport: Neftchi — Tulpar (англ. комментарий)", "IradOne Sport: Neftchi v Tulpar, live", true);
      else add("17:00", "IradOne Sport", "IradOne Sport");
      add("20:00", "OneNews at Eight", "OneNews at Eight", true);
      add("20:40", "Kechki Jañylyktar (на ирадском)", "Kechki Jañylyktar (in Iradi)");
      add("21:15", "Evening Movie", "Evening Movie");
      add("23:30", "OneNews Late", "OneNews Late");
    } else {
      add("07:00", "«Утро на Чу»", "Morning on the Chu");
      add("10:00", "Хиты «Чу FM»", "Chu FM hits");
      add("13:00", "Новости города", "City news");
      add("17:00", "«Город». Прямой эфир, звонки слушателей", "Gorod (The City): live phone-in", true, wd === 4 ? ["Сегодня: болельщики перед дерби", "Today: fans before the derby"] : null);
      add("19:00", "«Вечерний Нуржан» в эфире: обзор номера", "Vecherniy Nurzhan on air: the paper's review", wd === 5);
      add("21:00", "Вечерний шансон", "Evening chanson");
      add("00:00", "Ночная волна", "Night wave");
    }
    return L;
  }
  function li(r, now) {
    return '<li class="' + (r.hl ? "hl " : "") + (now ? "now" : "") + '"><b>' + r.t + "</b><span>" + (EN ? r.en : r.ru) + (r.sub ? "<em>" + (EN ? r.sub[1] : r.sub[0]) + "</em>" : "") + "</span></li>";
  }
  var tvNow = document.getElementById("vn-tvnow");
  if (tvNow) {
    var d = iradNow(), L = grid("odin", d), hm = pad(d.getHours()) + ":" + pad(d.getMinutes()), cur = 0;
    L.forEach(function (r, i) { if (r.t <= hm) cur = i; });
    tvNow.innerHTML = L.slice(cur, cur + 5).map(function (r, i) { return li(r, i === 0); }).join("");
  }
  var tvPage = document.getElementById("vn-tv");
  if (tvPage) {
    var base = iradNow(), monday = new Date(base); monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    var tabs = document.getElementById("vn-tvtabs"), days = [];
    for (var i = 0; i < 7; i++) { var dd = new Date(monday); dd.setDate(monday.getDate() + i); days.push(dd); }
    function show(dd) {
      Array.prototype.forEach.call(tabs.children, function (b) { b.classList.toggle("on", b.getAttribute("data-k") === String(dayIdx(dd))); });
      tvPage.innerHTML = ["odin", "one", "chu"].map(function (c) { return "<div><h3>" + (EN ? CH[c].en : CH[c].ru) + '</h3><ul class="plain">' + grid(c, dd).map(function (r) { return li(r); }).join("") + "</ul></div>"; }).join("");
    }
    days.forEach(function (dd) {
      var b = document.createElement("button"); b.setAttribute("data-k", dayIdx(dd));
      b.textContent = (EN ? DOW_EN[dd.getDay()].slice(0, 3) : DOW_RU[dd.getDay()].slice(0, 2)) + ", " + dd.getDate();
      b.onclick = function () { show(dd); }; tabs.appendChild(b);
    });
    show(base);
  }

  /* search over the articles on the site */
  var sf = document.getElementById("vn-search");
  if (sf) sf.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = sf.q.value.trim(); if (!q) return;
    location.href = sf.getAttribute("action") + "?q=" + encodeURIComponent(q);
  });
  var res = document.getElementById("vn-results");
  if (res && window.VN_INDEX) {
    var q = decodeURIComponent((location.search.match(/[?&]q=([^&]*)/) || [, ""])[1].replace(/\+/g, " ")).toLowerCase();
    document.getElementById("vn-q").textContent = q;
    var hits = window.VN_INDEX.filter(function (a) { return (a.t + " " + a.l).toLowerCase().indexOf(q) >= 0; });
    res.innerHTML = hits.length ? hits.map(function (a) { return '<li><span class="meta">' + a.d + '</span><br><a class="serif" style="font-size:19px;font-weight:700" href="' + a.u + '">' + a.t + "</a><br>" + a.l + "</li>"; }).join("")
      : "<li>" + T("По вашему запросу ничего не найдено. Попробуйте изменить запрос или поищите в архиве номеров.", "Nothing found. Try another word or look in the issue archive.") + "</li>";
  }

  /* search toggle in the bar, live radio block */
  document.addEventListener("click", function (e) {
    var s = e.target.closest && e.target.closest("[data-search]");
    if (s) { var f = document.getElementById("vn-search"); f.classList.toggle("open"); if (f.classList.contains("open")) f.q.focus(); return; }
    var l = e.target.closest && e.target.closest("[data-live]");
    if (l) { document.getElementById("vn-live").classList.toggle("on"); }
  });

  /* share */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-copy]");
    if (!b) return;
    try { navigator.clipboard.writeText(location.href); b.textContent = T("Ссылка скопирована", "Link copied"); } catch (x) {}
  });
})();
