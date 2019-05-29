"use strict";

(function() {
  let template = "";
  let tokens = [];
  let data = [];
  let generated = [];

  /**
   * Function from https://techoverflow.net/2018/03/30/copying-strings-to-the-clipboard-using-pure-javascript/
   * Credit goes to some anonymous guy because he didn't left a name. Sorry & thanks!
   * @param {*} what 
   */
  function copy(what) {
    if (what < 0 || what >= generated.length) {
      return;
    }

    let str = generated[what];
    while (true) {
      let tmp = str.replace('<br />', '\n');
      if (tmp == str) { break; }
      str = tmp;
    }
    // Create new element
    var el = document.createElement("textarea");
    // Set value (string to be copied)
    el.value = str;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute("readonly", "");
    el.style = { position: "absolute", left: "-9999px" };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand("copy");
    // Remove temporary element
    document.body.removeChild(el);
  }

  function analyze() {
    let templateArea = document.getElementById("template");
    template = templateArea.value;
    let selector = /\[(.+?)\]/gm;
    let token;
    tokens = [];
    while ((token = selector.exec(template))) {
      if (token.length == 2) {
        let existed = false;
        for (let i = 0; i < tokens.length; i++) {
          if (tokens[i] == token[1]) {
            existed = true;
            break;
          }
        }
        if (!existed) {
          tokens.push(token[1]);
        }
      }
    }

    // Then, generate the table
    let thead = document.getElementById("thead");
    let tbody = document.getElementById("tbody");

    let head = "<tr>";
    for (let i = 0; i < tokens.length; i++) {
      head += "<th>" + tokens[i] + "</th>";
    }
    head += "</tr>";
    thead.innerHTML = head;

    tbody.innerHTML = "";
    data = [];
    reformTable();
  }

  function reformTable() {
    let build = "";
    for (let i = 0; i <= data.length; i++) {
      build += "<tr>";
      for (let j = 0; j < tokens.length; j++) {
        if (i == data.length) {
          build +=
            '<td><input id="' +
            i +
            "," +
            j +
            '" class="hidden-input" row="' +
            i +
            '" col="' +
            j +
            '" placeholder="' +
            tokens[j] +
            ' here..." onkeyup="modified(this.id)" tabindex="0"></td>';
        } else {
          build +=
            '<td><input id="' +
            i +
            "," +
            j +
            '" class="hidden-input" row="' +
            i +
            '" col="' +
            j +
            '" placeholder="' +
            tokens[j] +
            ' here..." onkeyup="modified(this.id)" tabindex="0" value="' +
            data[i][tokens[j]] +
            '"></td>';
        }
      }
      build += "</tr>";
    }

    let tbody = document.getElementById("tbody");
    tbody.innerHTML = build;
  }

  function modified(id) {
    let input = document.getElementById(id);
    let row = input.getAttribute("row");

    let notEmpty = false;
    for (let i = 0; i < tokens.length; i++) {
      if (document.getElementById(row + "," + i).value != "") {
        notEmpty = true;
        break;
      }
    }
    if (!notEmpty) {
      data.splice(row, 1);
      reformTable();
      return;
    }

    let thisDat = {};
    for (let i = 0; i < tokens.length; i++) {
      thisDat[tokens[i]] = document.getElementById(row + "," + i).value;
    }
    if (row == data.length) {
      data.push(thisDat);
      reformTable();
      input = document.getElementById(id);
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    } else {
      data[row] = thisDat;
    }
  }

  function generate() {
    window.data = data;
    generated = [];
    for (let i = 0; i < data.length; i++) {
      let tmp = template;
      for (let j = 0; j < tokens.length; j++) {
        while (true) {
          let result = tmp.replace("[" + tokens[j] + "]", data[i][tokens[j]]);
          if (result == tmp) {
            break;
          }
          tmp = result;
        }
      }
      while (true) {
        let result = tmp.replace("\n", "<br />");
        if (result == tmp) {
          break;
        }
        tmp = result;
      }
      generated.push(tmp);
    }

    let cards = document.getElementById("cards");
    let build = "";
    for (let i = 0; i < generated.length; i++) {
      build +=
        '<div class="card"><div class="content">' +
        generated[i] +
        '</div><div class="ui bottom attached button" onclick="copy(' + i + ')"><i class="copy icon"></i>Copy</div></div>';
    }
    cards.innerHTML = build;
  }

  window.onload = function() {
    let analyzeBtn = document.getElementById("analyzeBtn");
    let generateBtn = document.getElementById("generate");
    analyzeBtn.onclick = analyze;
    generateBtn.onclick = generate;
    window.modified = modified;
    window.copy = copy;
  };
})();
