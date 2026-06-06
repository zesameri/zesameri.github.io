(function () {
  var SILVER_INDICES = new Set([0, 2, 4, 6, 8, 10, 13, 15, 17, 19, 21, 23]);
  var SILVER_HEX = '#c0c0c0';
  var BLACK_HEX = '#000000';
  var RAMP_STEPS = 5;
  var mode = 'brush';
  var rampStartTd = null;
  var currentColor = '#f58e84';
  var painting = false;
  var showBorders = false;
  var cells = [];
  var selectedBtn = null;
  var currentLabel = '';
  var colorNames = {};
  var recentColors = [];
  var MAX_RECENT = 10;
  var strokeColor = null;
  var silverColWeight = 1;
  var silverRowWeight = 1;

  function isSilverIndex(i) {
    return SILVER_INDICES.has(i);
  }

  function isSilverCell(r, c) {
    return isSilverIndex(r) || isSilverIndex(c);
  }

  function colWeight(c) {
    return isSilverIndex(c) ? silverColWeight : 1;
  }

  function rowWeight(r) {
    return isSilverIndex(r) ? silverRowWeight : 1;
  }

  function axisWeights(count, weightFn) {
    var weights = [];
    var total = 0;
    for (var i = 0; i < count; i++) {
      weights[i] = weightFn(i);
      total += weights[i];
    }
    return { weights: weights, total: total };
  }

  function applyGridSizing() {
    var table = document.getElementById('grid');
    var cols = axisWeights(24, colWeight);
    var rows = axisWeights(24, rowWeight);
    var colgroup = table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      for (var c = 0; c < 24; c++) {
        colgroup.appendChild(document.createElement('col'));
      }
      table.insertBefore(colgroup, table.firstChild);
    }
    colgroup.querySelectorAll('col').forEach(function (col, c) {
      col.style.width = (cols.weights[c] / cols.total * 100) + '%';
    });
    for (var r = 0; r < 24; r++) {
      table.rows[r].style.height = (rows.weights[r] / rows.total * 100) + '%';
    }
  }

  function axisPixelSizes(totalPx, count, weightFn) {
    var axis = axisWeights(count, weightFn);
    var sizes = [];
    var used = 0;
    for (var i = 0; i < count; i++) {
      if (i === count - 1) {
        sizes[i] = totalPx - used;
      } else {
        sizes[i] = Math.round(totalPx * axis.weights[i] / axis.total);
        used += sizes[i];
      }
    }
    return sizes;
  }

  function buildGrid() {
    var table = document.getElementById('grid');
    cells = [];
    for (var r = 0; r < 24; r++) {
      var tr = document.createElement('tr');
      var row = [];
      for (var c = 0; c < 24; c++) {
        var td = document.createElement('td');
        td.dataset.r = r;
        td.dataset.c = c;
        if (isSilverCell(r, c)) td.classList.add('silver');
        tr.appendChild(td);
        row.push(td);
      }
      table.appendChild(tr);
      cells.push(row);
    }
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(function (c) { return c + c; }).join('');
    }
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(function (x) {
      return clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0');
    }).join('');
  }

  function buildBlackRamp(hex, steps) {
    var start = hexToRgb(hex);
    var ramp = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      ramp.push(rgbToHex(
        start.r * (1 - t),
        start.g * (1 - t),
        start.b * (1 - t)
      ));
    }
    return ramp;
  }

  function renderToneRamp() {
    var container = document.getElementById('toneRamp');
    container.innerHTML = '';
    if (mode === 'eraser') return;
    var ramp = buildBlackRamp(currentColor, RAMP_STEPS);
    ramp.forEach(function (hex, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.background = hex;
      btn.title = hex;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', hex === currentColor && mode === 'brush' ? 'true' : 'false');
      btn.addEventListener('click', function () {
        selectColor(hex, null, hex);
      });
      container.appendChild(btn);
    });
  }

  function fillCell(td, hex) {
    if (td.classList.contains('silver')) return;
    td.style.background = hex;
    td.classList.add('filled');
  }

  function paintRampLine(fromTd, toTd) {
    if (!fromTd || !toTd) return;
    var r0 = +fromTd.dataset.r;
    var c0 = +fromTd.dataset.c;
    var r1 = +toTd.dataset.r;
    var c1 = +toTd.dataset.c;
    var ramp = buildBlackRamp(currentColor, RAMP_STEPS);
    var dr = r1 - r0;
    var dc = c1 - c0;

    if (Math.abs(dc) >= Math.abs(dr)) {
      var minC = Math.min(c0, c1);
      var maxC = Math.max(c0, c1);
      var span = maxC - minC;
      for (var c = minC; c <= maxC; c++) {
        var t = span === 0 ? 0 : (c - minC) / span;
        if (c0 > c1) t = 1 - t;
        fillCell(cells[r0][c], ramp[Math.round(t * RAMP_STEPS)]);
      }
      return;
    }

    var minR = Math.min(r0, r1);
    var maxR = Math.max(r0, r1);
    var rowSpan = maxR - minR;
    for (var r = minR; r <= maxR; r++) {
      var rowT = rowSpan === 0 ? 0 : (r - minR) / rowSpan;
      if (r0 > r1) rowT = 1 - rowT;
      fillCell(cells[r][c0], ramp[Math.round(rowT * RAMP_STEPS)]);
    }
  }

  function getCellFill(td) {
    if (td.classList.contains('filled') && td.style.background) {
      return td.style.background;
    }
    if (td.classList.contains('silver')) return SILVER_HEX;
    return '#ffffff';
  }

  function pushRecent(hex, name) {
    hex = hex.toLowerCase();
    recentColors = recentColors.filter(function (e) { return e.hex !== hex; });
    recentColors.unshift({ hex: hex, name: name || hex });
    if (recentColors.length > MAX_RECENT) recentColors.length = MAX_RECENT;
    renderRecent();
  }

  function renderRecent() {
    var container = document.getElementById('recentPalette');
    var empty = document.getElementById('recentEmpty');
    container.querySelectorAll('button').forEach(function (b) { b.remove(); });
    if (!recentColors.length) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    recentColors.forEach(function (entry) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.background = entry.hex;
      btn.title = entry.name + ' · ' + entry.hex;
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', entry.hex === currentColor && mode === 'brush' ? 'true' : 'false');
      btn.addEventListener('click', function () {
        selectColor(entry.hex, btn, entry.name);
      });
      container.appendChild(btn);
    });
  }

  function paintCell(td) {
    if (td.classList.contains('silver')) return;
    if (mode === 'eraser') {
      td.style.background = '';
      td.classList.remove('filled');
      return;
    }
    td.style.background = currentColor;
    td.classList.add('filled');
    if (strokeColor !== currentColor) {
      strokeColor = currentColor;
      pushRecent(currentColor, currentLabel);
    }
  }

  function cellFromEvent(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    return el && el.tagName === 'TD' ? el : null;
  }

  function onPointerDown(e) {
    if (e.button > 0) return;
    e.preventDefault();
    painting = true;
    strokeColor = null;
    var td = e.target.closest('td');
    if (!td) return;
    if (mode === 'ramp') {
      rampStartTd = td;
      paintRampLine(td, td);
      return;
    }
    paintCell(td);
  }

  function onPointerMove(e) {
    if (!painting) return;
    var td = cellFromEvent(e);
    if (!td) return;
    if (mode === 'ramp' && rampStartTd) {
      paintRampLine(rampStartTd, td);
      return;
    }
    paintCell(td);
  }

  function stopPainting() {
    painting = false;
    strokeColor = null;
    rampStartTd = null;
  }

  function slugify(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function suggestFilename() {
    var counts = {};
    cells.forEach(function (row) {
      row.forEach(function (td) {
        if (!td.classList.contains('filled')) return;
        var hex = (td.style.background || '').toLowerCase();
        if (!hex) return;
        counts[hex] = (counts[hex] || 0) + 1;
      });
    });
    var topHex = null;
    var topCount = 0;
    Object.keys(counts).forEach(function (h) {
      if (counts[h] > topCount) {
        topCount = counts[h];
        topHex = h;
      }
    });
    if (topHex && colorNames[topHex]) {
      return 'souvenir-' + slugify(colorNames[topHex]);
    }
    if (topHex) {
      return 'souvenir-' + topHex.replace('#', '');
    }
    return 'souvenir';
  }

  function sanitizeFilename(name) {
    var base = (name || '').trim().replace(/\.png$/i, '');
    base = base.replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    return (base || 'souvenir').toLowerCase();
  }

  function clearSwatchSelection() {
    document.querySelectorAll('.palette button, .recent button').forEach(function (b) {
      b.setAttribute('aria-selected', 'false');
    });
    selectedBtn = null;
  }

  function updateCurrentUI(label) {
    var sw = document.getElementById('currentSwatch');
    var lab = document.getElementById('currentLabel');
    if (mode === 'eraser') {
      sw.style.background = 'repeating-linear-gradient(45deg, #ccc, #ccc 4px, #fff 4px, #fff 8px)';
      lab.textContent = 'Eraser';
      renderToneRamp();
      return;
    }
    if (mode === 'ramp') {
      sw.style.background = 'linear-gradient(to right, ' + currentColor + ', ' + BLACK_HEX + ')';
      lab.textContent = 'Ramp';
      renderToneRamp();
      return;
    }
    sw.style.background = currentColor;
    lab.textContent = currentLabel || currentColor;
    renderToneRamp();
  }

  function applyPickedColor(hex) {
    clearSwatchSelection();
    currentColor = hex.toLowerCase();
    currentLabel = currentColor;
    mode = 'brush';
    document.getElementById('brushBtn').setAttribute('aria-pressed', 'true');
    document.getElementById('rampBtn').setAttribute('aria-pressed', 'false');
    document.getElementById('eraserBtn').setAttribute('aria-pressed', 'false');
    updateCurrentUI();
    renderRecent();
  }

  function selectColor(hex, btn, label) {
    currentColor = hex.toLowerCase();
    currentLabel = label || hex;
    mode = 'brush';
    document.getElementById('brushBtn').setAttribute('aria-pressed', 'true');
    document.getElementById('rampBtn').setAttribute('aria-pressed', 'false');
    document.getElementById('eraserBtn').setAttribute('aria-pressed', 'false');
    clearSwatchSelection();
    if (btn) {
      btn.setAttribute('aria-selected', 'true');
      selectedBtn = btn;
    }
    updateCurrentUI(currentLabel);
    renderRecent();
  }

  function makeSwatch(entry) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.style.background = entry.hex;
    btn.title = entry.name + ' · ' + entry.hex;
    btn.setAttribute('role', 'option');
    btn.setAttribute('aria-selected', 'false');
    btn.addEventListener('click', function () {
      selectColor(entry.hex, btn, entry.name);
    });
    return btn;
  }

  function renderGroupedPalette(data) {
    colorNames = {};
    data.groups.forEach(function (group) {
      (data.colors[group.id] || []).forEach(function (entry) {
        colorNames[entry.hex.toLowerCase()] = entry.name;
      });
    });
    var scroll = document.getElementById('paletteScroll');
    scroll.innerHTML = '';
    var firstBtn = null;
    data.groups.forEach(function (group) {
      var list = data.colors[group.id];
      if (!list || !list.length) return;
      var section = document.createElement('section');
      section.className = 'color-group';
      var heading = document.createElement('h2');
      heading.textContent = group.label;
      section.appendChild(heading);
      var grid = document.createElement('div');
      grid.className = 'palette';
      grid.setAttribute('role', 'group');
      grid.setAttribute('aria-label', group.label);
      list.forEach(function (entry) {
        var btn = makeSwatch(entry);
        if (!firstBtn) firstBtn = btn;
        grid.appendChild(btn);
      });
      section.appendChild(grid);
      scroll.appendChild(section);
    });
    if (firstBtn) {
      var first = data.colors[data.groups[0].id][0];
      selectColor(first.hex, firstBtn, first.name);
    }
  }

  function clearAll() {
    cells.forEach(function (row) {
      row.forEach(function (td) {
        td.style.background = '';
        td.classList.remove('filled');
      });
    });
  }

  function setMode(next) {
    mode = next;
    document.getElementById('brushBtn').setAttribute('aria-pressed', next === 'brush');
    document.getElementById('rampBtn').setAttribute('aria-pressed', next === 'ramp');
    document.getElementById('eraserBtn').setAttribute('aria-pressed', next === 'eraser');
    updateCurrentUI();
  }

  function setBorders(on) {
    showBorders = on;
    document.getElementById('bordersBtn').setAttribute('aria-pressed', on ? 'true' : 'false');
    document.querySelector('.grid-wrap').classList.toggle('no-borders', !on);
  }

  function saveImage() {
    var gridPx = 480;
    var colSizes = axisPixelSizes(gridPx, 24, colWeight);
    var rowSizes = axisPixelSizes(gridPx, 24, rowWeight);
    var borderPx = 32;
    var text = 'thanks for coming ❋ zesameri';
    var textGap = 36;
    var textSize = 16;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = gridPx + borderPx * 2;
    canvas.height = gridPx + borderPx * 2 + textGap + textSize + borderPx;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var rowY = borderPx;
    for (var r = 0; r < 24; r++) {
      var colX = borderPx;
      var cellH = rowSizes[r];
      for (var c = 0; c < 24; c++) {
        var cellW = colSizes[c];
        ctx.fillStyle = getCellFill(cells[r][c]);
        ctx.fillRect(colX, rowY, cellW, cellH);
        if (showBorders) {
          ctx.strokeStyle = '#bbbbbb';
          ctx.lineWidth = 1;
          ctx.strokeRect(colX + 0.5, rowY + 0.5, cellW - 1, cellH - 1);
        }
        colX += cellW;
      }
      rowY += cellH;
    }

    function finishSave() {
      ctx.fillStyle = '#333333';
      ctx.font = textSize + 'px "Roboto Slab", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        text,
        canvas.width / 2,
        borderPx + gridPx + borderPx + textGap / 2 + textSize / 2
      );

      var link = document.createElement('a');
      link.download = sanitizeFilename(suggestFilename()) + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    if (document.fonts && document.fonts.load) {
      document.fonts.load(textSize + 'px "Roboto Slab"').then(finishSave).catch(finishSave);
    } else {
      finishSave();
    }
  }

  var pickerHue = 0;
  var pickerSat = 100;
  var pickerVal = 100;
  var pickerSvDragging = false;
  var colorPickerPopover = document.getElementById('colorPickerPopover');
  var colorPickerBackdrop = document.getElementById('colorPickerBackdrop');
  var colorPickerSv = document.getElementById('colorPickerSv');
  var colorPickerSvCursor = document.getElementById('colorPickerSvCursor');
  var colorPickerHueInput = document.getElementById('colorPickerHue');
  var colorPickerSatInput = document.getElementById('colorPickerSat');
  var colorPickerValInput = document.getElementById('colorPickerVal');
  var colorPickerPreview = document.getElementById('colorPickerPreview');
  var colorPickerHexInput = document.getElementById('colorPickerHex');
  var dropperBtn = document.getElementById('dropperBtn');

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function hsvToHex(h, s, v) {
    s /= 100;
    v /= 100;
    var f = function (n) {
      var k = (n + h / 60) % 6;
      return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    };
    var r = Math.round(f(5) * 255);
    var g = Math.round(f(3) * 255);
    var b = Math.round(f(1) * 255);
    return '#' + [r, g, b].map(function (x) {
      return x.toString(16).padStart(2, '0');
    }).join('');
  }

  function hexToHsv(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(function (c) { return c + c; }).join('');
    }
    var r = parseInt(hex.slice(0, 2), 16) / 255;
    var g = parseInt(hex.slice(2, 4), 16) / 255;
    var b = parseInt(hex.slice(4, 6), 16) / 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = max === 0 ? 0 : (max - min) / max * 100;
    var v = max * 100;
    var d = max - min;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      else if (max === g) h = ((b - r) / d + 2) * 60;
      else h = ((r - g) / d + 4) * 60;
    }
    return { h: h, s: s, v: v };
  }

  function normalizeHex(value) {
    var hex = (value || '').trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(hex)) {
      hex = hex.split('').map(function (c) { return c + c; }).join('');
    }
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return '#' + hex.toLowerCase();
  }

  function updatePickerVisuals() {
    var hex = hsvToHex(pickerHue, pickerSat, pickerVal);
    colorPickerSv.style.backgroundColor = hsvToHex(pickerHue, 100, 100);
    colorPickerSvCursor.style.left = pickerSat + '%';
    colorPickerSvCursor.style.top = (100 - pickerVal) + '%';
    colorPickerHueInput.value = String(Math.round(pickerHue));
    colorPickerSatInput.value = String(Math.round(pickerSat));
    colorPickerValInput.value = String(Math.round(pickerVal));
    colorPickerHexInput.value = hex;
    colorPickerPreview.style.backgroundColor = hex;
    colorPickerHueInput.style.setProperty('--picker-thumb', 'hsl(' + Math.round(pickerHue) + ', 100%, 50%)');
    colorPickerSatInput.style.setProperty('--picker-sat-start', hsvToHex(pickerHue, 0, pickerVal));
    colorPickerSatInput.style.setProperty('--picker-sat-end', hsvToHex(pickerHue, 100, pickerVal));
    colorPickerSatInput.style.setProperty('--picker-thumb', hex);
    colorPickerValInput.style.setProperty('--picker-val-start', hsvToHex(pickerHue, pickerSat, 0));
    colorPickerValInput.style.setProperty('--picker-val-end', hsvToHex(pickerHue, pickerSat, 100));
    colorPickerValInput.style.setProperty('--picker-thumb', hex);
  }

  function setPickerFromHex(hex) {
    var hsv = hexToHsv(hex);
    pickerHue = hsv.h;
    pickerSat = hsv.s;
    pickerVal = hsv.v;
    updatePickerVisuals();
  }

  function commitPickerColor() {
    applyPickedColor(hsvToHex(pickerHue, pickerSat, pickerVal));
  }

  function positionColorPicker() {
    var mobile = window.matchMedia('(max-width: 720px)').matches;
    colorPickerPopover.classList.toggle('is-mobile', mobile);
    if (mobile) {
      colorPickerPopover.style.left = '';
      colorPickerPopover.style.top = '';
      colorPickerPopover.style.right = '';
      colorPickerPopover.style.bottom = '';
      return;
    }
    var btnRect = dropperBtn.getBoundingClientRect();
    var popRect = colorPickerPopover.getBoundingClientRect();
    var margin = 8;
    var left = btnRect.left + btnRect.width / 2 - popRect.width / 2;
    var top = btnRect.bottom + margin;
    left = clamp(left, margin, window.innerWidth - popRect.width - margin);
    if (top + popRect.height > window.innerHeight - margin) {
      top = btnRect.top - popRect.height - margin;
    }
    top = clamp(top, margin, window.innerHeight - popRect.height - margin);
    colorPickerPopover.style.left = left + 'px';
    colorPickerPopover.style.top = top + 'px';
  }

  function openColorPicker() {
    setPickerFromHex(currentColor);
    colorPickerBackdrop.hidden = false;
    colorPickerPopover.hidden = false;
    dropperBtn.setAttribute('aria-expanded', 'true');
    positionColorPicker();
    commitPickerColor();
  }

  function closeColorPicker() {
    colorPickerBackdrop.hidden = true;
    colorPickerPopover.hidden = true;
    dropperBtn.setAttribute('aria-expanded', 'false');
    pickerSvDragging = false;
  }

  function setPickerFromSvEvent(e) {
    var rect = colorPickerSv.getBoundingClientRect();
    var x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    var y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    pickerSat = x * 100;
    pickerVal = (1 - y) * 100;
    updatePickerVisuals();
    commitPickerColor();
  }

  document.getElementById('brushBtn').addEventListener('click', function () { setMode('brush'); });
  document.getElementById('rampBtn').addEventListener('click', function () { setMode('ramp'); });
  dropperBtn.addEventListener('click', function () {
    if (colorPickerPopover.hidden) openColorPicker();
    else closeColorPicker();
  });
  colorPickerBackdrop.addEventListener('click', closeColorPicker);
  document.addEventListener('pointerdown', function (e) {
    if (colorPickerPopover.hidden) return;
    if (colorPickerPopover.contains(e.target) || dropperBtn.contains(e.target)) return;
    closeColorPicker();
  }, true);
  colorPickerHueInput.addEventListener('input', function (e) {
    pickerHue = Number(e.target.value);
    updatePickerVisuals();
    commitPickerColor();
  });
  colorPickerSatInput.addEventListener('input', function (e) {
    pickerSat = Number(e.target.value);
    updatePickerVisuals();
    commitPickerColor();
  });
  colorPickerValInput.addEventListener('input', function (e) {
    pickerVal = Number(e.target.value);
    updatePickerVisuals();
    commitPickerColor();
  });
  colorPickerHexInput.addEventListener('change', function (e) {
    var hex = normalizeHex(e.target.value);
    if (!hex) {
      colorPickerHexInput.value = hsvToHex(pickerHue, pickerSat, pickerVal);
      return;
    }
    setPickerFromHex(hex);
    commitPickerColor();
  });
  colorPickerSv.addEventListener('pointerdown', function (e) {
    pickerSvDragging = true;
    colorPickerSv.setPointerCapture(e.pointerId);
    setPickerFromSvEvent(e);
  });
  colorPickerSv.addEventListener('pointermove', function (e) {
    if (!pickerSvDragging) return;
    setPickerFromSvEvent(e);
  });
  colorPickerSv.addEventListener('pointerup', function (e) {
    pickerSvDragging = false;
    if (colorPickerSv.hasPointerCapture(e.pointerId)) {
      colorPickerSv.releasePointerCapture(e.pointerId);
    }
  });
  colorPickerSv.addEventListener('pointercancel', function () {
    pickerSvDragging = false;
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !colorPickerPopover.hidden) closeColorPicker();
  });
  window.addEventListener('resize', function () {
    if (!colorPickerPopover.hidden) positionColorPicker();
  });
  document.getElementById('eraserBtn').addEventListener('click', function () { setMode('eraser'); });
  document.getElementById('clearBtn').addEventListener('click', clearAll);
  document.getElementById('bordersBtn').addEventListener('click', function () {
    setBorders(!showBorders);
  });
  document.getElementById('saveBtn').addEventListener('click', saveImage);

  function setTheme(theme) {
    var isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('grid-theme', theme); } catch (e) {}
    var btn = document.getElementById('themeBtn');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = isDark ? 'Light mode' : 'Dark mode';
    var sun = btn.querySelector('.icon-sun');
    var moon = btn.querySelector('.icon-moon');
    if (isDark) {
      sun.setAttribute('hidden', '');
      moon.removeAttribute('hidden');
    } else {
      sun.removeAttribute('hidden');
      moon.setAttribute('hidden', '');
    }
  }

  document.getElementById('themeBtn').addEventListener('click', function () {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(isDark ? 'light' : 'dark');
  });

  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  var table = document.getElementById('grid');
  table.addEventListener('pointerdown', onPointerDown);
  table.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', stopPainting);
  window.addEventListener('pointercancel', stopPainting);

  function formatWeight(value) {
    return (Math.round(value * 100) / 100).toString().replace(/\.?0+$/, '') + '×';
  }

  function bindSilverSizing(inputId, outputId, onChange) {
    var input = document.getElementById(inputId);
    var output = document.getElementById(outputId);
    function update() {
      var value = Number(input.value);
      output.textContent = formatWeight(value);
      input.setAttribute('aria-valuenow', String(value));
      onChange(value);
      applyGridSizing();
    }
    input.addEventListener('input', update);
    update();
  }

  buildGrid();
  applyGridSizing();
  bindSilverSizing('silverColSize', 'silverColSizeVal', function (v) { silverColWeight = v; });
  bindSilverSizing('silverRowSize', 'silverRowSizeVal', function (v) { silverRowWeight = v; });
  setBorders(false);
  updateCurrentUI();

  function loadPalette() {
    if (window.PAINT_PALETTE) {
      renderGroupedPalette(window.PAINT_PALETTE);
      return;
    }
    fetch('./data/paint-palette.json')
      .then(function (r) {
        if (!r.ok) throw new Error('palette missing');
        return r.json();
      })
      .then(renderGroupedPalette)
      .catch(function () {
        document.getElementById('paletteLoading').textContent =
          'Palette not found. Run: python3 scripts/build_paint_palette.py';
      });
  }
  loadPalette();
})();
