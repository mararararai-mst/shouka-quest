/* 消化クエスト UI部品
   原作の枠を測って、同じ役目の形をこちらで描いたもの。
   星バッジ・時計・ミニマップなど、中身のある部品だけ ここに置く。
   看板・羊皮紙のような「枠」は 生成した絵に 差しかえた（assets/ui/）。 */
(function (global) {
  'use strict';

  /* ---- 星形バッジ・丸時計 ----
     絵は生成したもの（assets/icon/）。数字は この上に CSS で のせる。 */
  function starBadge(size) {
    return '<img class="uibg" src="assets/icon/badge.png" srcset="assets/icon/badge@2x.png 2x" ' +
      'width="' + size + '" height="' + size + '" alt="">';
  }
  function clockFace(size) {
    return '<img class="uibg" src="assets/icon/clock.png" srcset="assets/icon/clock@2x.png 2x" ' +
      'width="' + size + '" height="' + size + '" alt="">';
  }

  /* ---- 砂時計（時計の右上） ---- */
  function hourglass(size) {
    var s = '';
    s += '<rect x="' + (size * 0.18) + '" y="2" width="' + (size * 0.64) + '" height="4" rx="2" fill="#8a5a2b"/>';
    s += '<rect x="' + (size * 0.18) + '" y="' + (size - 6) + '" width="' + (size * 0.64) +
         '" height="4" rx="2" fill="#8a5a2b"/>';
    s += '<path d="M' + (size * 0.24) + ' 6 L' + (size * 0.76) + ' 6 L' + (size * 0.54) + ' ' + (size * 0.5) +
         ' L' + (size * 0.76) + ' ' + (size - 6) + ' L' + (size * 0.24) + ' ' + (size - 6) +
         ' L' + (size * 0.46) + ' ' + (size * 0.5) + ' Z" fill="#f2e2c8"/>';
    s += '<path d="M' + (size * 0.3) + ' ' + (size * 0.62) + ' L' + (size * 0.7) + ' ' + (size * 0.62) +
         ' L' + (size * 0.7) + ' ' + (size - 8) + ' L' + (size * 0.3) + ' ' + (size - 8) + ' Z" fill="#e2a03c"/>';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size +
      '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }

  /* ---- ミニマップ ----
     土台の絵は生成したもの（assets/ui/minimap.png）。
     いまいる所の印だけ、ここで重ねる。位置は絵の上で実測した割合。 */
  var MM_STOPS = [
    [0.503, 0.225],   // 1 口
    [0.506, 0.352],   // 2 食道
    [0.545, 0.500],   // 3 胃
    [0.451, 0.586],   // 4 小腸の入口
    [0.493, 0.728],   // 5 小腸2（柔毛）
    [0.381, 0.684],   // 6 大腸
    [0.493, 0.894]    // 7 出口
  ];

  function minimap(size, stage) {
    var i = Math.max(0, Math.min(MM_STOPS.length - 1, (stage || 1) - 1));
    var sp = MM_STOPS[i];
    var r = size * 0.046;   // いまいる印。大きすぎると 地図が つぶれる
    return '<div style="position:relative;width:' + size + 'px;height:' + size + 'px">' +
      '<img src="assets/ui/minimap.png" srcset="assets/ui/minimap@2x.png 2x" ' +
      'width="' + size + '" height="' + size + '" alt="いまいる場所" ' +
      'style="display:block;width:100%;height:100%">' +
      '<span style="position:absolute;left:' + (sp[0] * size - r * 1.5) + 'px;top:' +
      (sp[1] * size - r * 1.5) + 'px;width:' + (r * 3) + 'px;height:' + (r * 3) +
      'px;border-radius:50%;background:#2b3a24"></span>' +
      '<span style="position:absolute;left:' + (sp[0] * size - r) + 'px;top:' +
      (sp[1] * size - r) + 'px;width:' + (r * 2) + 'px;height:' + (r * 2) +
      'px;border-radius:50%;background:#ffd84d"></span></div>';
  }

  global.UI = {
    starBadge: starBadge,
    clockFace: clockFace,
    hourglass: hourglass,
    minimap: minimap
  };
})(window);
