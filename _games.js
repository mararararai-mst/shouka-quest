/* 消化クエスト　ミニゲーム集
   どの章も同じ形をしている。
     pic()            … あそびかたの看板にのせる 操作の絵
     build(box, G)    … ゲーム画面の中身をつくる（カウントダウンの前）
     start(G)         … 「GO!」で よばれる
     stop()           … 時間切れ・中断で よばれる
   G は index.html がわたす道具箱（add / cheer / se / gauge / done / st）。 */
(function (global) {
  'use strict';

  var GAMES = {};
  var el = function (h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstElementChild; };
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  /* ゆびの絵（あそびかたの看板用。原作と同じ役目） */
  function hand(x, y, s) {
    s = s || 1;
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')">' +
      '<path d="M2 30 L2 14 Q2 8 7 8 Q12 8 12 14 L12 4 Q12 -2 17 -2 Q22 -2 22 4 L22 8 Q22 3 27 3 Q32 3 32 9 L32 13 Q37 12 39 16 L40 32 Q40 46 26 46 L16 46 Q4 46 2 34 Z" ' +
      'fill="#fff" stroke="#2b1b3d" stroke-width="3" stroke-linejoin="round"/></g>';
  }
  function sparkle(x, y) {
    return '<g stroke="#e0342c" stroke-width="3" stroke-linecap="round">' +
      '<line x1="' + x + '" y1="' + (y - 14) + '" x2="' + x + '" y2="' + (y - 4) + '"/>' +
      '<line x1="' + (x - 12) + '" y1="' + (y - 9) + '" x2="' + (x - 5) + '" y2="' + (y - 2) + '"/>' +
      '<line x1="' + (x + 12) + '" y1="' + (y - 9) + '" x2="' + (x + 5) + '" y2="' + (y - 2) + '"/></g>';
  }
  function picSvg(body, w, h) {
    return '<svg class="howpic" viewBox="0 0 ' + (w || 300) + ' ' + (h || 150) +
      '" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  }

  /* 養分のこま。絵は生成したもの（assets/icon/*.png）。
     大きさは 高さで そろえる（横はばは 絵によって ちがう）。
     SVGの中に置くときは <img> ではなく <image> を使う
     （<img> を書くと そこで svg が閉じ、絵が ばらばらに なる） */
  function tokenImg(kind, x, y, h) {
    return '<image href="assets/icon/' + kind + '.png" x="' + x + '" y="' + y +
      '" height="' + h + '"/>';
  }

  function tokenSvg(kind, s) {
    s = s || 40;
    return '<img class="tok" src="assets/icon/' + kind + '.png" srcset="assets/icon/' + kind +
      '@2x.png 2x" height="' + s + '" alt="">';
  }

  /* ============================================================
     第1章　口　── タップして かむ
     ============================================================ */
  GAMES.chew = (function () {
    var CHAIN_LEN = 9, chainEls = [], grains = [], G = null, live = false;

    function buildLump() {
      var lump = document.querySelector('#lump');
      lump.innerHTML = ''; grains = [];
      var pos = [[26, 30], [62, 22], [98, 28], [132, 34], [10, 54], [46, 48], [82, 46], [118, 52], [150, 58],
                 [28, 74], [64, 70], [100, 72], [136, 78], [48, 94], [84, 92], [120, 96], [66, 16], [104, 14]];
      pos.forEach(function (p) {
        var g = document.createElement('div');
        g.className = 'grain';
        g.style.left = p[0] + 'px'; g.style.top = p[1] + 'px';
        g.style.transform = 'rotate(' + (Math.random() * 50 - 25) + 'deg)';
        lump.appendChild(g); grains.push(g);
      });
    }
    function buildChain() {
      var c = document.querySelector('#chain');
      c.innerHTML = ''; chainEls = [];
      for (var i = 0; i < CHAIN_LEN; i++) {
        if (i > 0) { var b = document.createElement('div'); b.className = 'bond'; c.appendChild(b); }
        var w = document.createElement('div');
        w.className = 'hexw'; w.innerHTML = GLU();
        c.appendChild(w); chainEls.push(w);
      }
      c.style.left = '14px';
    }
    function dropSaliva() {
      var macro = document.querySelector('#macro');
      var d = document.createElement('div');
      d.className = 'drop';
      d.style.left = (120 + Math.random() * 260) + 'px';
      d.style.top = (40 + Math.random() * 20) + 'px';
      d.innerHTML = '<svg width="14" height="18" viewBox="0 0 14 18" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M7 0 C11 7 14 10 14 13 A7 7 0 0 1 0 13 C0 10 3 7 7 0 Z" fill="#7fd4f2"/>' +
        '<path d="M7 6 C9.5 10 11 11.5 11 13 A4 4 0 0 1 3 13 C3 11.5 4.5 10 7 6 Z" fill="#b9e9fa"/></svg>';
      d.style.transition = 'transform .5s ease-in, opacity .5s';
      macro.appendChild(d);
      requestAnimationFrame(function () {
        d.style.transform = 'translateY(' + (90 + Math.random() * 40) + 'px)';
        d.style.opacity = '0';
      });
      setTimeout(function () { d.remove(); }, 520);
    }
    function cutChain() {
      if (chainEls.length < 2) buildChain();
      var a = chainEls.pop(), b = chainEls.pop();
      if (!a || !b) return;
      var x = document.querySelector('#chain').offsetLeft + b.offsetLeft;
      var y = document.querySelector('#chainbox').offsetTop + document.querySelector('#chain').offsetTop;
      var fly = document.createElement('div');
      fly.className = 'fly';
      fly.style.left = x + 'px'; fly.style.top = y + 'px';
      fly.innerHTML = pair(34);
      document.querySelector('#micro').appendChild(fly);
      a.remove(); b.remove();
      var bonds = [].slice.call(document.querySelectorAll('#chain .bond'));
      bonds.slice(-2).forEach(function (e) { e.remove(); });

      var tw = document.querySelector('#traywrap'), slot = tw.childElementCount;
      var tx = 10 + (slot % 9) * 52 - x, ty = 128 + 26 + Math.floor(slot / 9) * 26 - y;
      requestAnimationFrame(function () {
        fly.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(.56)';
      });
      setTimeout(function () { fly.remove(); }, 460);
      setTimeout(function () {
        if (tw.childElementCount < 45) {
          var m = document.createElement('div');
          m.className = 'malt'; m.innerHTML = pair(19);
          tw.appendChild(m);
        }
      }, 400);

      G.add(1); G.se('cut');
      var p = document.createElement('div');
      p.className = 'pop'; p.textContent = 'あまい！';
      p.style.left = (26 + (G.score() % 7) * 58) + 'px';
      p.style.top = (44 + (G.score() % 3) * 16) + 'px';
      document.querySelector('#micro').appendChild(p);
      requestAnimationFrame(function () { p.style.transform = 'translateY(-26px)'; p.style.opacity = '0'; });
      setTimeout(function () { p.remove(); }, 580);
      if (chainEls.length < 2) setTimeout(buildChain, 220);
    }
    var chewN = 0;
    function chew() {
      if (!live) return;
      chewN++;
      document.querySelector('#tapme').style.display = 'none';
      G.se('chew');
      var lump = document.querySelector('#lump');
      lump.classList.remove('shake'); void lump.offsetWidth; lump.classList.add('shake');
      var spread = Math.min(1, chewN / 30);
      grains.forEach(function (g, i) {
        var dx = ((i % 5) - 2) * 11 * spread + (g._jx || 0);
        var dy = ((i % 3) - 1) * 9 * spread + (g._jy || 0);
        var sc = (g._sc0 || 1) * (1 - 0.46 * spread);
        g.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc.toFixed(2) +
          ') rotate(' + ((i * 37) % 50 - 25) + 'deg)';
      });
      if (chewN % 2 === 0 && grains.length < 36) {
        var src = grains[rnd(grains.length)], c = src.cloneNode(false);
        c._sc0 = (src._sc0 || 1) * 0.78;
        c._jx = (Math.random() - 0.5) * 34; c._jy = (Math.random() - 0.5) * 26;
        c.style.left = src.style.left; c.style.top = src.style.top;
        document.querySelector('#lump').appendChild(c); grains.push(c);
      }
      dropSaliva(); cutChain();
    }

    return {
      pic: function () {
        return picSvg(
          '<rect x="6" y="6" width="288" height="138" rx="8" fill="#fffdf5" stroke="#8a5a2b" stroke-width="3"/>' +
          /* ごはん茶わん */
          '<path d="M40 86 Q86 42 132 86 Z" fill="#fffaf0" stroke="#8a5a2b" stroke-width="3"/>' +
          '<path d="M60 74 L66 68 M80 66 L86 60 M100 70 L106 64" stroke="#d8c8ac" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M28 88 L144 88 Q138 128 86 128 Q34 128 28 88 Z" fill="#e8d3a6" stroke="#8a5a2b" stroke-width="3"/>' +
          '<rect x="68" y="126" width="36" height="9" rx="3" fill="#c9963c"/>' +
          /* → 麦芽糖 */
          '<text x="176" y="98" font-size="26" text-anchor="middle" fill="#8a2b3a">→</text>' +
          '<polygon points="220,66 234,74 234,89 220,97 206,89 206,74" fill="#4fae5a"/>' +
          '<rect x="233" y="76" width="14" height="11" fill="#2f7a3a"/>' +
          '<polygon points="260,66 274,74 274,89 260,97 246,89 246,74" fill="#4fae5a"/>' +
          '<text x="240" y="120" font-size="12" text-anchor="middle" fill="#2b1b3d">麦芽糖</text>' +
          sparkle(86, 50) + hand(76, 62, .95),
          300, 150);
      },
      build: function (box, api) {
        G = api; chewN = 0; live = false;
        box.innerHTML =
          '<div id="macro">' +
            '<div class="mouthbg" id="mouthbg"></div>' +
            '<div id="lump"></div>' +
            '<div class="label">口の中</div>' +
            '<div id="tapme" style="display:none">タップして かもう！</div>' +
          '</div>' +
          '<div id="micro">' +
            '<div class="cap">ミクロのようす　<b>デンプン</b>＝ブドウ糖がたくさんつながった物質</div>' +
            '<div id="chainbox"><div id="chain"></div></div>' +
            '<div id="tray">' +
              '<div class="tcap">できた<b>麦芽糖</b>（ブドウ糖が２つ）</div>' +
              '<div id="traywrap"></div>' +
            '</div>' +
          '</div>';
        buildLump(); buildChain();
        box.querySelector('#macro').addEventListener('pointerdown', chew);
      },
      start: function () {
        live = true;
        document.querySelector('#tapme').style.display = 'block';
      },
      stop: function () { live = false; }
    };
  })();

  /* ============================================================
     第2章　食道　── ○×クイズ
     ============================================================ */
  GAMES.quiz = (function () {
    var G = null, live = false, deck = [], di = 0, step = 0, locked = false;
    var STEP_MAX = 6;

    /* おくへ 進むほど 小さく・とおくに 見える */
    function esoPos(k) {
      return 'translate(-50%,-50%) translateY(' + (92 - k * 14) + 'px) scale(' +
        (1.35 - k * 0.15).toFixed(2) + ')';
    }

    function food(s) {
      return '<img class="tok" src="assets/icon/onigiri.png" srcset="assets/icon/onigiri@2x.png 2x" ' +
        'height="' + s + '" alt="おにぎり">';
    }
    function ask() {
      if (di >= deck.length) { deck = shuffle(deck); di = 0; }
      var q = deck[di++];
      document.querySelector('#qtext').innerHTML = q[0];
      document.querySelector('#qbox').dataset.a = q[1] ? '1' : '0';
      document.querySelector('#qbox').dataset.w = q[2];
      document.querySelector('#qbox').classList.remove('hide');
      locked = false;
    }
    function judge(mine) {
      if (!live || locked) return;
      locked = true;
      var qb = document.querySelector('#qbox');
      var ok = (qb.dataset.a === '1') === mine;
      var res = document.querySelector('#qres');
      res.className = 'on ' + (ok ? 'ok' : 'ng');
      res.innerHTML = '<div class="mark">' + (ok ? '○' : '×') + '</div><div class="wh">' + qb.dataset.w + '</div>';
      if (ok) {
        G.add(1); G.se('ok');
        step++;
        var f = document.querySelector('#esofood');
        f.style.transform = esoPos(step);
        if (step >= STEP_MAX) {
          step = 0;
          G.cheer('食道を ぬけた！');
          setTimeout(function () { f.style.transition = 'none'; f.style.transform = esoPos(0); }, 420);
          setTimeout(function () { f.style.transition = ''; }, 500);
        }
      } else {
        G.se('ng');
        document.querySelector('#eso').classList.add('ngshake');
        setTimeout(function () { document.querySelector('#eso').classList.remove('ngshake'); }, 300);
        // まちがえたときは 解説が 本体。読みおわるまで 時計を止めて、自分で「つぎへ」を押す
        G.pause();
        var nx = el('<div class="btn gold qnext">つぎへ</div>');
        nx.addEventListener('pointerdown', function () {
          res.className = '';
          G.resume();
          if (live) ask();
        });
        res.appendChild(nx);
        return;
      }
      setTimeout(function () {
        res.className = '';
        if (live) ask();
      }, 800);
    }

    return {
      pic: function () {
        return picSvg(
          '<rect x="6" y="6" width="288" height="138" rx="8" fill="#fffdf5" stroke="#8a5a2b" stroke-width="3"/>' +
          '<text x="150" y="36" font-size="16" text-anchor="middle" fill="#2b1b3d">食道からは 消化液が 出る？</text>' +
          '<rect x="58" y="56" width="78" height="52" rx="6" fill="#2b1b3d"/>' +
          '<text x="97" y="92" font-size="30" text-anchor="middle" fill="#fff">○</text>' +
          '<rect x="164" y="56" width="78" height="52" rx="6" fill="#2b1b3d"/>' +
          '<text x="203" y="92" font-size="30" text-anchor="middle" fill="#fff">×</text>' +
          sparkle(203, 62) + hand(196, 92, 1));
      },
      build: function (box, api) {
        G = api; live = false; step = 0; di = 0;
        deck = shuffle(QUIZ);
        box.innerHTML =
          '<div id="eso">' +
            '<div id="esofood" style="transform:' + esoPos(0) + '">' + food(150) + '</div>' +
            '<div id="qbox" class="hide"><div id="qtext"></div>' +
              '<div class="qbtns"><div class="qb" data-m="1">○</div><div class="qb" data-m="0">×</div></div>' +
            '</div>' +
            '<div id="qres"></div>' +
          '</div>';
        [].forEach.call(box.querySelectorAll('.qb'), function (b) {
          b.addEventListener('pointerdown', function () { judge(b.dataset.m === '1'); });
        });
      },
      start: function () { live = true; ask(); },
      stop: function () { live = false; }
    };
  })();

  /* ============================================================
     第3章　胃　── 左右にドラッグして シェイク
     ============================================================ */
  GAMES.shake = (function () {
    var G = null, live = false, dragging = false, lastX = 0, dir = 0, travel = 0, shakes = 0, lumps = [];
    /* 胃の絵（assets/organ/i.png）の 胃液がたまっている所に 食べものを おく。
       絵の中の 黄色い所は 左0.23 上0.69 右0.84 下0.89（_import_organ.py の実測） */
    var POS = [[90, 238, 38], [134, 244, 46], [186, 236, 36], [112, 258, 32], [160, 258, 32], [214, 248, 28]];

    function paint(l) {
      l.el.style.transform = 'translate(' + l.dx.toFixed(1) + 'px,' + l.dy.toFixed(1) +
        'px) scale(' + l.sc.toFixed(2) + ')';
    }
    function onMove(x) {
      if (!live || !dragging) return;
      var dx = x - lastX;
      if (Math.abs(dx) < 2) return;
      var nd = dx > 0 ? 1 : -1;
      if (dir === 0) dir = nd;
      if (nd === dir) { travel += Math.abs(dx); }
      else {
        if (travel > 48) count();
        dir = nd; travel = 0;
      }
      lastX = x;
      var t = Math.max(-1, Math.min(1, (travel / 90) * dir));
      var w = document.querySelector('#stwrap');
      if (w) w.style.transform = 'rotate(' + (t * 14).toFixed(1) + 'deg)';
      lumps.forEach(function (l, i) {
        l.dx = -t * (10 + i * 2);
        paint(l);
      });
    }
    function count() {
      shakes++; G.add(1); G.se('chew');
      var pop = el('<div class="pop2">バシャッ</div>');
      pop.style.left = (110 + rnd(180)) + 'px'; pop.style.top = (250 + rnd(70)) + 'px';
      document.querySelector('#gastro').appendChild(pop);
      requestAnimationFrame(function () { pop.style.transform = 'translateY(-24px)'; pop.style.opacity = '0'; });
      setTimeout(function () { pop.remove(); }, 600);
      if (shakes % 6 === 0) {
        var big = lumps.filter(function (l) { return l.sc > 0.34; });
        if (big.length) {
          var t = big[rnd(big.length)];
          t.sc *= 0.74;
          paint(t);
          G.cheer('ペプシンが はたらいた！');
          G.se('cut');
        }
      }
    }

    return {
      pic: function () {
        return '<div class="howpic2">' +
          '<img src="assets/organ/i.png" srcset="assets/organ/i@2x.png 2x" alt="胃" ' +
          'style="height:116px;left:50%;top:4px;transform:translateX(-50%)">' +
          '<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">' +
            '<text x="150" y="20" font-size="13" text-anchor="middle" fill="#2b1b3d">つかんで 左右に</text>' +
            '<path d="M60 132 Q94 118 122 128" stroke="#8a5a2b" stroke-width="4" fill="none"/>' +
            '<path d="M178 128 Q206 118 240 132" stroke="#8a5a2b" stroke-width="4" fill="none"/>' +
            '<circle cx="150" cy="128" r="13" fill="#fff" stroke="#8a5a2b" stroke-width="4"/>' +
            hand(128, 102, .68) + sparkle(62, 126) +
          '</svg></div>';
      },
      build: function (box, api) {
        G = api; live = false; shakes = 0; dir = 0; travel = 0;
        box.innerHTML =
          '<div id="gastro">' +
            '<div id="stwrap">' +
              '<img id="stmc" src="assets/organ/i.png" srcset="assets/organ/i@2x.png 2x" alt="胃">' +
              POS.map(function (p, i) {
                return '<div class="chunk" style="left:' + p[0] + 'px;top:' + p[1] +
                  'px;width:' + p[2] + 'px;height:' + p[2] + 'px"></div>';
              }).join('') +
            '</div>' +
            '<div id="knob"><span class="a l">←</span><span class="k"></span><span class="a r">→</span></div>' +
            '<div class="ghint">胃を 左右に ドラッグ！</div>' +
          '</div>';
        lumps = [].slice.call(box.querySelectorAll('.chunk')).map(function (e) {
          return { el: e, sc: 1, dx: 0, dy: 0 };
        });
        var area = box.querySelector('#gastro');
        area.addEventListener('pointerdown', function (e) {
          dragging = true; lastX = e.clientX; dir = 0; travel = 0;
          if (area.setPointerCapture) area.setPointerCapture(e.pointerId);
        });
        area.addEventListener('pointermove', function (e) { onMove(e.clientX); });
        area.addEventListener('pointerup', function () { dragging = false; });
        area.addEventListener('pointercancel', function () { dragging = false; });
      },
      start: function () { live = true; },
      stop: function () { live = false; dragging = false; }
    };
  })();

  /* ============================================================
     第4章　小腸の入口　── 数字のぶんだけ クリック
     ============================================================ */
  GAMES.count = (function () {
    var G = null, live = false, phase = 0, need = 0, got = 0, cleared = 0;
    var ORGAN = [
      { id: 'sui', name: 'すい臓', juice: 'すい液' },
      { id: 'tan', name: '胆のう', juice: '胆汁' },
      { id: 'juni', name: '小腸の入口', juice: '流しこむ' }
    ];
    /* 3つ そろうたびに 出す ひとこと。教科書 p.134 図2 と p.133 ★4 に合わせる：
       すい液は 3つの養分 すべてに、胆汁は 脂肪だけに はたらく（胆汁に消化酵素はない）。
       「→ブドウ糖」まで ここで進むとは 書いていない（最後は 小腸のかべ） */
    var BREAK = [
      ['すい液', 'デンプン', '#4fae5a'],
      ['すい液', 'タンパク質', '#7b7fb8'],
      ['すい液と 胆汁', '脂肪', '#e08a1e']
    ];
    /* assets/organ/duo.png（489x400）を 左6px 上150px に置いたときの、
       それぞれの 器官の場所。絵の上で 実測した。 */
    var ZONE = {
      tan:  { l: 10,  t: 160, w: 146, h: 168, bx: 170, by: 156 },
      juni: { l: 76,  t: 328, w: 182, h: 210, bx: 296, by: 204 },
      sui:  { l: 262, t: 384, w: 228, h: 140, bx: 316, by: 300 }
    };

    function next() {
      if (!live) return;
      var o = ORGAN[phase];
      need = 2 + rnd(4); got = 0;
      [].forEach.call(document.querySelectorAll('#duo .zone'), function (z) { z.classList.remove('lit'); });
      document.querySelector('#z-' + o.id).classList.add('lit');
      var z = ZONE[o.id];
      var b = document.querySelector('#numbub');
      b.className = 'on';
      b.style.left = z.bx + 'px'; b.style.top = z.by + 'px';
      b.innerHTML = '<span class="n">' + need + '</span><span class="c">0/' + need + '</span>';
      document.querySelector('#duocap').innerHTML =
        '<b>' + (phase + 1) + '</b> ' + o.name + '　<span>' + o.juice + '</span>';
    }
    function hit(id) {
      if (!live) return;
      var o = ORGAN[phase];
      if (id !== o.id) { G.se('ng'); G.cheer('じゅんばんが ちがう！'); return; }
      got++;
      G.se('cd');
      var b = document.querySelector('#numbub');
      b.querySelector('.c').textContent = got + '/' + need;
      var z = document.querySelector('#z-' + o.id);
      z.classList.remove('hit'); void z.offsetWidth; z.classList.add('hit');
      if (got > need) { G.se('ng'); G.cheer('おしすぎ！ もういちど'); next(); return; }
      if (got === need) {
        setTimeout(function () {
          phase++;
          if (phase >= ORGAN.length) {
            phase = 0; cleared++;
            G.add(1); G.se('lv');
            var br = BREAK[(cleared - 1) % BREAK.length];
            var pp = el('<div class="brk">' + br[0] + ' が <b style="color:' + br[2] + '">' + br[1] +
              '</b> に はたらいた！</div>');
            document.querySelector('#duo').appendChild(pp);
            requestAnimationFrame(function () { pp.style.opacity = '1'; pp.style.transform = 'translate(-50%,-30px)'; });
            setTimeout(function () { pp.remove(); }, 2000);   // 15字前後。読むのに2秒
          }
          next();
        }, 260);
      }
    }
    function zoneTag(id, label) {
      var z = ZONE[id];
      return '<div class="zone" id="z-' + id + '" style="left:' + z.l + 'px;top:' + z.t +
        'px;width:' + z.w + 'px;height:' + z.h + 'px"><span>' + label + '</span></div>';
    }

    return {
      pic: function () {
        return '<div class="howpic2">' +
          '<img src="assets/organ/duo.png" srcset="assets/organ/duo@2x.png 2x" alt="すい臓・胆のう・小腸の入口" ' +
          'style="height:134px;left:14px;top:8px">' +
          '<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">' +
            '<text x="226" y="22" font-size="12" text-anchor="middle" fill="#2b1b3d">光った器官を</text>' +
            '<text x="226" y="38" font-size="12" text-anchor="middle" fill="#2b1b3d">数字のぶん クリック</text>' +
            '<circle cx="226" cy="90" r="28" fill="#fff" stroke="#e0342c" stroke-width="3"/>' +
            '<text x="226" y="101" font-size="28" text-anchor="middle" fill="#e0342c">3</text>' +
            sparkle(42, 44) + hand(34, 42, .8) +
          '</svg></div>';
      },
      build: function (box, api) {
        G = api; live = false; phase = 0; cleared = 0;
        box.innerHTML =
          '<div id="duo">' +
            '<img id="duoimg" src="assets/organ/duo.png" srcset="assets/organ/duo@2x.png 2x" alt="すい臓・胆のう・小腸の入口">' +
            zoneTag('sui', 'すい臓') + zoneTag('tan', '胆のう') + zoneTag('juni', '小腸の入口') +
            '<div id="numbub"></div><div id="duocap"></div>' +
          '</div>';
        [].forEach.call(box.querySelectorAll('.zone'), function (z) {
          z.addEventListener('pointerdown', function () { hit(z.id.slice(2)); });
        });
      },
      start: function () { live = true; next(); },
      stop: function () { live = false; }
    };
  })();

  /* ============================================================
     第5章　柔毛　── 養分を 正しい管へ ドラッグ
     ============================================================ */
  GAMES.sort = (function () {
    var G = null, live = false, spawnT = null, drag = null, ox = 0, oy = 0;
    /* 形と色は 教科書 p.134 図2・p.135 図4 と同じ約束：
       ブドウ糖＝緑の六角形／アミノ酸＝紫がかった三角・四角・五角（図4も 形が混ざっている）／
       脂肪酸＝黄色い棒／モノグリセリド＝赤い台に棒1本 */
    var KIND = [
      { k: ['glu'], name: 'ブドウ糖', to: 'cap' },
      { k: ['ami', 'ami2', 'ami3'], name: 'アミノ酸', to: 'cap' },
      { k: ['fat'], name: '脂肪酸', to: 'lym' },
      { k: ['mono'], name: 'モノグリセリド', to: 'lym' }
    ];
    /* 柔毛の絵（assets/organ/villi.png 500x498）を #villi の下に置いたときの、
       赤い毛細血管の帯と まん中の黄色いリンパ管の帯の 位置。絵の上で 実測した。 */
    var BAND = { capL: [138, 228], lym: [228, 292], capR: [292, 384], top: 196 };

    function spawn() {
      /* カウントダウン中にも 3つ ならべておきたいので live は 見ない。
         わき出しは start/stop の タイマーで 止める。 */
      var box = document.querySelector('#villi');
      if (!box || box.querySelectorAll('.nutri').length >= 5) return;
      var d = KIND[rnd(KIND.length)];
      var n = el('<div class="nutri" data-to="' + d.to + '">' + tokenSvg(d.k[rnd(d.k.length)], 40) +
        '<span class="nm">' + d.name + '</span></div>');
      var pos = freeSpot(box);
      n.style.left = pos[0] + 'px';
      n.style.top = pos[1] + 'px';
      box.appendChild(n);
    }
    /* こまどうしが かさならない所を さがす（字が読めなくなるため） */
    function freeSpot(box, tries) {
      var used = [].slice.call(box.querySelectorAll('.nutri')).map(function (e) {
        return [parseFloat(e.style.left), parseFloat(e.style.top)];
      });
      var best = null, bestD = -1;
      for (var i = 0; i < (tries || 14); i++) {
        var x = 6 + rnd(392), y = 8 + rnd(104), d = 9999;
        used.forEach(function (u) {
          d = Math.min(d, Math.max(Math.abs(u[0] - x) / 104, Math.abs(u[1] - y) / 60));
        });
        if (d > bestD) { bestD = d; best = [x, y]; }
        if (d >= 1) break;
      }
      return best;
    }

    function down(e) {
      if (!live) return;
      var n = e.target.closest('.nutri');
      if (!n) return;
      drag = n; n.classList.add('grab');
      var r = n.getBoundingClientRect();
      var sc = document.querySelector('#app').getBoundingClientRect().width / 500;
      ox = (e.clientX - r.left) / sc; oy = (e.clientY - r.top) / sc;
      move(e);
    }
    function move(e) {
      if (!drag) return;
      var s = document.querySelector('#villi').getBoundingClientRect();
      var sc = document.querySelector('#app').getBoundingClientRect().width / 500;
      drag.style.left = ((e.clientX - s.left) / sc - ox) + 'px';
      drag.style.top = ((e.clientY - s.top) / sc - oy) + 'px';
    }
    /* 教科書 p.135 図4：脂肪酸と モノグリセリドは 柔毛で 再び 脂肪に なってから リンパ管へ。
       落とした所に 脂肪（赤い台＋棒3本）が あらわれ、黄色い管を 下っていく */
    function refat(x, y) {
      var box = document.querySelector('#villi');
      var f = el('<div class="refat">' + tokenSvg('shibou', 42) + '<span>脂肪に もどった</span></div>');
      f.style.left = (x - 48) + 'px';
      f.style.top = (y - 22) + 'px';
      box.appendChild(f);
      requestAnimationFrame(function () { f.classList.add('in'); });
      setTimeout(function () { f.classList.add('down'); }, 900);
      setTimeout(function () { f.remove(); }, 1900);
    }

    function flash(sel) {
      var t = document.querySelector(sel);
      if (!t) return;
      t.classList.add('hit');
      setTimeout(function () { t.classList.remove('hit'); }, 300);
    }
    function up() {
      if (!drag) return;
      var n = drag; drag = null;
      n.classList.remove('grab');
      var x = parseFloat(n.style.left) + 49, y = parseFloat(n.style.top) + 26;
      if (y < BAND.top) return;
      var hit = null;
      if (x >= BAND.capL[0] && x < BAND.capL[1]) hit = 'cap';
      else if (x >= BAND.lym[0] && x < BAND.lym[1]) hit = 'lym';
      else if (x >= BAND.capR[0] && x < BAND.capR[1]) hit = 'cap';
      if (!hit) return;
      var want = n.dataset.to;
      if (hit === want) {
        G.add(1); G.se('ok');
        flash(want === 'cap' ? '#t-cap' : '#t-lym');
        n.classList.add('suck');
        setTimeout(function () { n.remove(); }, 420);
        if (want === 'lym') refat(x, y);
      } else {
        G.se('ng');
        G.cheer(want === 'cap' ? 'それは 毛細血管（赤）へ！' : 'それは リンパ管（黄）へ！');
        var back = freeSpot(document.querySelector('#villi'));
        n.style.left = back[0] + 'px';
        n.style.top = back[1] + 'px';
      }
    }

    return {
      pic: function () {
        return '<div class="howpic2">' +
          '<img src="assets/organ/villi.png" srcset="assets/organ/villi@2x.png 2x" alt="柔毛の断面" ' +
          'style="height:136px;left:92px;top:5px">' +
          '<svg viewBox="0 0 300 150" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="6" y="30" width="86" height="22" rx="6" fill="#c2182c"/>' +
            '<text x="49" y="46" font-size="12" text-anchor="middle" fill="#fff">毛細血管</text>' +
            '<rect x="208" y="30" width="86" height="22" rx="6" fill="#c9a227"/>' +
            '<text x="251" y="46" font-size="12" text-anchor="middle" fill="#fff">リンパ管</text>' +
            '<path d="M92 42 L124 60" stroke="#c2182c" stroke-width="4" fill="none"/>' +
            '<path d="M208 42 L162 58" stroke="#c9a227" stroke-width="4" fill="none"/>' +
            tokenImg('glu', 18, 84, 30) + tokenImg('fat', 252, 90, 30) +
            hand(120, 82, .75) +
          '</svg></div>';
      },
      build: function (box, api) {
        G = api; live = false; drag = null;
        box.innerHTML = '<div id="villi">' +
          '<img id="villiimg" src="assets/organ/villi.png" srcset="assets/organ/villi@2x.png 2x" alt="柔毛の断面">' +
          '<div class="tgt cap" id="t-cap" style="left:' + BAND.capL[0] + 'px;width:' +
            (BAND.capL[1] - BAND.capL[0]) + 'px"><span>毛細血管</span></div>' +
          '<div class="tgt cap" style="left:' + BAND.capR[0] + 'px;width:' +
            (BAND.capR[1] - BAND.capR[0]) + 'px"></div>' +
          '<div class="tgt lym" id="t-lym" style="left:' + BAND.lym[0] + 'px;width:' +
            (BAND.lym[1] - BAND.lym[0]) + 'px"><span>リンパ管</span></div>' +
          '</div>';
        var v = box.querySelector('#villi');
        v.addEventListener('pointerdown', down);
        v.addEventListener('pointermove', move);
        v.addEventListener('pointerup', up);
        v.addEventListener('pointerleave', up);
        for (var i = 0; i < 3; i++) spawn();
      },
      start: function () { live = true; spawnT = setInterval(spawn, 900); },
      stop: function () { live = false; clearInterval(spawnT); drag = null; }
    };
  })();

  /* ============================================================
     第6章　大腸　── 水をクリックして 吸収（カスは さわらない）
     ============================================================ */
  GAMES.mogura = (function () {
    var G = null, live = false, t = null, holes = [], val = 0.28, cleared = false;
    var NEED = 0.72;

    function popOne() {
      if (!live) return;
      var free = holes.filter(function (h) { return !h.busy; });
      if (!free.length) return;
      var h = free[rnd(free.length)];
      var water = Math.random() < 0.68;
      h.busy = true;
      h.el.className = 'pup ' + (water ? 'w' : 'k');
      h.el.innerHTML = tokenSvg(water ? 'water' : 'kasu', 44);
      h.el.dataset.w = water ? '1' : '0';
      requestAnimationFrame(function () { h.el.classList.add('up'); });
      h.t = setTimeout(function () {
        h.el.classList.remove('up');
        setTimeout(function () { h.busy = false; h.el.innerHTML = ''; }, 200);
      }, 850 + rnd(500));
    }
    function tap(h) {
      if (!live || !h.busy || h.el.classList.contains('done')) return;
      var water = h.el.dataset.w === '1';
      h.el.classList.add('done');
      if (water) {
        G.add(1); G.se('cut');
        val = Math.min(1, val + 0.055);
        h.el.classList.add('gone');
      } else {
        G.se('ng'); G.cheer('カスは 吸収されない！');
        val = Math.max(0, val - 0.05);
      }
      G.gauge(val);
      clearTimeout(h.t);
      setTimeout(function () {
        h.el.className = 'pup'; h.el.innerHTML = ''; h.busy = false;
      }, 220);
      if (!cleared && val >= NEED) {
        cleared = true;
        document.querySelector('#gauge').classList.add('done');
        G.cheer('クリアの線を こえた！');
        G.se('lv');
      }
    }

    return {
      pic: function () {
        return picSvg(
          '<rect x="6" y="6" width="288" height="138" rx="8" fill="#a8222a" stroke="#8a5a2b" stroke-width="3"/>' +
          '<rect x="28" y="20" width="244" height="22" rx="11" fill="#cdbbe8" stroke="#fff" stroke-width="3"/>' +
          '<rect x="31" y="23" width="150" height="16" rx="8" fill="#8f6fd0"/>' +
          '<line x1="196" y1="16" x2="196" y2="48" stroke="#fff" stroke-width="3"/>' +
          '<text x="196" y="60" font-size="11" text-anchor="middle" fill="#fff">クリア</text>' +
          '<ellipse cx="96" cy="112" rx="34" ry="14" fill="#6b1016"/>' +
          '<ellipse cx="206" cy="112" rx="34" ry="14" fill="#6b1016"/>' +
          tokenImg('water', 82, 74, 42) + tokenImg('kasu', 188, 76, 42) +
          sparkle(96, 82) + hand(92, 108, .9),
          300, 150);
      },
      build: function (box, api) {
        G = api; live = false; val = 0.28; cleared = false; holes = [];
        document.querySelector('#gauge').classList.remove('done');
        var h = '';
        for (var i = 0; i < 6; i++) h += '<div class="hole"><div class="pup"></div></div>';
        box.innerHTML = '<div id="colon"><div class="cwall"></div><div class="grid">' + h + '</div></div>';
        [].forEach.call(box.querySelectorAll('.hole'), function (hl) {
          var o = { el: hl.querySelector('.pup'), busy: false, t: null };
          hl.addEventListener('pointerdown', function () { tap(o); });
          holes.push(o);
        });
        G.gauge(val);
      },
      start: function () {
        live = true;
        t = setInterval(popOne, 620);
        popOne(); popOne();
      },
      stop: function () {
        live = false; clearInterval(t);
        holes.forEach(function (h) { clearTimeout(h.t); });
      }
    };
  })();

  /* ============================================================
     最終章　たからばこ　── こすって けずり出す
     ============================================================ */
  GAMES.scratch = (function () {
    var G = null, live = false, cv = null, cx = null, done = false, last = null;
    var W = 340, H = 340;

    function pct() {
      var d = cx.getImageData(0, 0, W, H).data, clear = 0, n = 0;
      for (var i = 3; i < d.length; i += 4 * 40) { n++; if (d[i] < 40) clear++; }
      return clear / n;
    }
    function scratchAt(e) {
      if (!live || done) return;
      var r = cv.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      cx.globalCompositeOperation = 'destination-out';
      cx.beginPath();
      if (last) { cx.lineWidth = 56; cx.lineCap = 'round'; cx.moveTo(last[0], last[1]); cx.lineTo(x, y); cx.stroke(); }
      cx.arc(x, y, 28, 0, 7); cx.fill();
      last = [x, y];
      var p = pct();
      G.setScore(Math.round(p * 100));
      if (p > 0.84) {
        done = true; live = false;
        cv.style.pointerEvents = 'none';
        cv.style.transition = 'opacity .5s'; cv.style.opacity = '0';
        G.setScore(100);
        G.cheer('黄金のブドウ糖を 手に入れた！');
        G.se('lv');
        setTimeout(function () { G.done(); }, 1600);
      }
    }

    return {
      pic: function () {
        return picSvg(
          '<rect x="6" y="6" width="288" height="138" rx="8" fill="#fff6d8" stroke="#8a5a2b" stroke-width="3"/>' +
          '<rect x="60" y="30" width="180" height="96" rx="8" fill="#f2c33c" stroke="#8a5a2b" stroke-width="4"/>' +
          '<rect x="60" y="30" width="180" height="26" rx="8" fill="#e0342c"/>' +
          '<path d="M86 96 L112 74 L98 100 L128 76 L116 102 L146 80" stroke="#2b1b3d" stroke-width="8" fill="none" stroke-linecap="round"/>' +
          sparkle(180, 76) + hand(170, 92, 1),
          300, 150);
      },
      build: function (box, api) {
        G = api; live = false; done = false; last = null;
        box.innerHTML = '<div id="chest">' +
          '<div class="beam"></div>' +
          '<div class="boxframe">' +
            '<img class="prizeimg" src="assets/organ/gold.png" srcset="assets/organ/gold@2x.png 2x" ' +
            'alt="黄金のブドウ糖">' +
            '<div class="pn">黄金のブドウ糖</div>' +
            '<canvas id="scr" width="' + W + '" height="' + H + '"></canvas>' +
          '</div>' +
          '<svg class="rim" viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">' +
            '<rect x="34" y="26" width="432" height="124" rx="12" fill="#c9963c"/>' +
            '<rect x="34" y="26" width="432" height="26" rx="8" fill="#e0342c"/>' +
            '<rect x="34" y="60" width="432" height="18" fill="#f2c33c"/>' +
            '<rect x="228" y="52" width="44" height="60" rx="8" fill="#8a5a2b"/>' +
            '<circle cx="250" cy="76" r="10" fill="#ffe9a8"/>' +
            '<rect x="246" y="76" width="8" height="22" fill="#ffe9a8"/>' +
          '</svg>' +
          '<div class="shint">こすって けずり出せ！</div></div>';
        cv = box.querySelector('#scr'); cx = cv.getContext('2d');
        var g = cx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#c9963c'); g.addColorStop(.5, '#f2c33c'); g.addColorStop(1, '#a8763f');
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        cx.fillStyle = 'rgba(255,255,255,.35)';
        for (var i = 0; i < 40; i++) cx.fillRect(rnd(W), rnd(H), 3 + rnd(20), 3);
        cx.fillStyle = '#000';
        cv.addEventListener('pointerdown', function (e) { last = null; scratchAt(e); });
        cv.addEventListener('pointermove', function (e) { if (e.buttons) scratchAt(e); });
        cv.addEventListener('pointerup', function () { last = null; });
        cv.addEventListener('pointerleave', function () { last = null; });
        G.setScore(0);
      },
      start: function () { live = true; },
      stop: function () { live = false; }
    };
  })();

  global.GAMES = GAMES;
  global.tokenSvg = tokenSvg;
})(window);
