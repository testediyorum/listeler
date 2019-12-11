﻿(function (window, undefined) {'use strict';var AudioPlayer = function () {var docTitle = document.title,player = document.getElementById('ap'),playBtn,playSvg,playSvgPath,prevBtn,nextBtn,plBtn,repeatBtn,volumeBtn,progressBar,preloadBar,curTime,durTime,trackTitle,audio,index = 0,playList,volumeBar,wheelVolumeValue = 0,volumeLength,repeating = !1,seeking = !1,rightClick = !1,apActive = !1,pl,plUl,plLi,tplList = '<li class="pl-list" data-track="{count}">' + '<div class="pl-list__track">' + '<div class="pl-list__icon"></div>' + '<div class="pl-list__eq">' + '<div class="eq">' + '<div class="eq__bar"></div>' + '<div class="eq__bar"></div>' + '<div class="eq__bar"></div>' + '<div class="eq__bar"></div>' + '</div>' + '</div>' + '</div>' + '<div class="pl-list__title">{title}</div>' + '</li>',settings = { volume: .7, changeDocTitle: !0, confirmClose: !0, autoPlay: !1, buffered: !0, playList: [] };function init(options) {if (!('classList' in document.documentElement)) {return !1;}if (apActive || player === null) {return 'Player already init';}settings = extend(settings, options);playBtn = player.querySelector('.ap__controls--toggle');playSvg = playBtn.querySelector('.icon-play');playSvgPath = playSvg.querySelector('path');prevBtn = player.querySelector('.ap__controls--prev');nextBtn = player.querySelector('.ap__controls--next');repeatBtn = player.querySelector('.ap__controls--repeat');volumeBtn = player.querySelector('.volume-btn');plBtn = player.querySelector('.ap__controls--playlist');curTime = player.querySelector('.track__time--current');durTime = player.querySelector('.track__time--duration');trackTitle = player.querySelector('.track__title');progressBar = player.querySelector('.progress__bar');preloadBar = player.querySelector('.progress__preload');volumeBar = player.querySelector('.volume__bar');playList = settings.playList;playBtn.addEventListener('click', playToggle, !1);volumeBtn.addEventListener('click', volumeToggle, !1);repeatBtn.addEventListener('click', repeatToggle, !1);progressBar.closest('.progress-container').addEventListener('mousedown', handlerBar, !1);progressBar.closest('.progress-container').addEventListener('mousemove', seek, !1);document.documentElement.addEventListener('mouseup', seekingFalse, !1);volumeBar.closest('.volume').addEventListener('mousedown', handlerVol, !1);volumeBar.closest('.volume').addEventListener('mousemove', setVolume);volumeBar.closest('.volume').addEventListener(wheel(), setVolume, !1);document.documentElement.addEventListener('mouseup', seekingFalse, !1);prevBtn.addEventListener('click', prev, !1);nextBtn.addEventListener('click', next, !1);apActive = !0;renderPL();plBtn.addEventListener('click', plToggle, !1);audio = new Audio();audio.volume = settings.volume;audio.preload = 'none';audio.addEventListener('error', errorHandler, !1);audio.addEventListener('timeupdate', timeUpdate, !1);audio.addEventListener('ended', doEnd, !1);volumeBar.style.height = audio.volume * 100 + '%';volumeLength = volumeBar.css('height');if (settings.confirmClose) if (isEmptyList()) {return !1;}audio.src = playList[index].file;trackTitle.innerHTML = playList[index].title;if (settings.autoPlay) {audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-pause'));plLi[index].classList.add('pl-list--current');}}function changeDocumentTitle(title) {if (settings.changeDocTitle) {if (title) {document.title = title;} else {document.title = docTitle;}}}function beforeUnload(evt) {if (!audio.paused) {var message = 'Music still playing';evt.returnValue = message;return message;}}function errorHandler(evt) {if (isEmptyList()) {return;}var mediaError = { '1': 'MEDIA_ERR_ABORTED', '2': 'MEDIA_ERR_NETWORK', '3': 'MEDIA_ERR_DECODE', '4': 'MEDIA_ERR_SRC_NOT_SUPPORTED' };audio.pause();curTime.innerHTML = '--';durTime.innerHTML = '--';progressBar.style.width = 0;preloadBar.style.width = 0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-play'));plLi[index] && plLi[index].classList.remove('pl-list--current');changeDocumentTitle();throw new Error('Houston we have a problem: ' + mediaError[evt.target.error.code]);}function updatePL(addList) {if (!apActive) {return 'Player is not yet initialized';}if (!Array.isArray(addList)) {return;}if (addList.length === 0) {return;}var count = playList.length;var html = [];playList.push.apply(playList, addList);addList.forEach(function (item) {html.push(tplList.replace('{count}', count++).replace('{title}', item.title));});if (plUl.querySelector('.pl-list--empty')) {plUl.removeChild(pl.querySelector('.pl-list--empty'));audio.src = playList[index].file;trackTitle.innerHTML = playList[index].title;}plUl.insertAdjacentHTML('beforeEnd', html.join(''));plLi = pl.querySelectorAll('li');}function renderPL() {var html = [];playList.forEach(function (item, i) {html.push(tplList.replace('{count}', i).replace('{title}', item.title));});pl = create('div', { 'className': 'pl-container', 'id': 'pl', 'innerHTML': '<ul class="pl-ul">' + (!isEmptyList() ? html.join('') : '<li class="pl-list--empty">PlayList is empty</li>') + '</ul>' });player.parentNode.insertBefore(pl, player.nextSibling);plUl = pl.querySelector('.pl-ul');plLi = plUl.querySelectorAll('li');pl.addEventListener('click', listHandler, !1);}function listHandler(evt) {evt.preventDefault();if (evt.target.matches('.pl-list__title') || evt.target.matches('.pl-list__track') || evt.target.matches('.pl-list__icon') || evt.target.matches('.pl-list__eq') || evt.target.matches('.eq')) {var current = parseInt(evt.target.closest('.pl-list').getAttribute('data-track'), 10);if (index !== current) {index = current;play(current);} else {playToggle();}} else {if (!!evt.target.closest('.pl-list__remove')) {var parentEl = evt.target.closest('.pl-list');var isDel = parseInt(parentEl.getAttribute('data-track'), 10);playList.splice(isDel, 1);parentEl.closest('.pl-ul').removeChild(parentEl);plLi = pl.querySelectorAll('li');[].forEach.call(plLi, function (el, i) {el.setAttribute('data-track', i);});if (!audio.paused) {if (isDel === index) {play(index);}} else {if (isEmptyList()) {clearAll();} else {if (isDel === index) {if (isDel > playList.length - 1) {index -= 1;}audio.src = playList[index].file;trackTitle.innerHTML = playList[index].title;progressBar.style.width = 0;}}}if (isDel < index) {index--;}}}}function plActive() {if (audio.paused) {plLi[index].classList.remove('pl-list--current');return;}var current = index;for (var i = 0, len = plLi.length; len > i; i++) {if (window.CP.shouldStopExecution(0)) break;plLi[i].classList.remove('pl-list--current');}window.CP.exitedLoop(0);plLi[current].classList.add('pl-list--current');}function play(currentIndex) {if (isEmptyList()) {return clearAll();}index = (currentIndex + playList.length) % playList.length;audio.src = playList[index].file;trackTitle.innerHTML = playList[index].title;changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-pause'));plActive();}function prev() {play(index - 1);}function next() {play(index + 1);}function isEmptyList() {return playList.length === 0;}function clearAll() {audio.pause();audio.src = '';trackTitle.innerHTML = 'queue is empty';curTime.innerHTML = '--';durTime.innerHTML = '--';progressBar.style.width = 0;preloadBar.style.width = 0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-play'));if (!plUl.querySelector('.pl-list--empty')) {plUl.innerHTML = '<li class="pl-list--empty">PlayList is empty</li>';}changeDocumentTitle();}function playToggle() {if (isEmptyList()) {return;}if (audio.paused) {if (audio.currentTime === 0){notify(playList[index].title, { icon: playList[index].icon, body: 'Now playing' });}changeDocumentTitle(playList[index].title);audio.play();playBtn.classList.add('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-pause'));} else {changeDocumentTitle();audio.pause();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-play'));}plActive();}function volumeToggle() {if (audio.muted) {if (parseInt(volumeLength, 10) === 0) {volumeBar.style.height = settings.volume * 100 + '%';audio.volume = settings.volume;} else {volumeBar.style.height = volumeLength;}audio.muted = !1;volumeBtn.classList.remove('has-muted');} else {audio.muted = !0;volumeBar.style.height = 0;volumeBtn.classList.add('has-muted');}}function repeatToggle() {if (repeatBtn.classList.contains('is-active')) {repeating = !1;repeatBtn.classList.remove('is-active');} else {repeating = !0;repeatBtn.classList.add('is-active');}}function plToggle() {plBtn.classList.toggle('is-active');pl.classList.toggle('h-show');}function timeUpdate() {if (audio.readyState === 0) return;var barlength = Math.round(audio.currentTime * (100 / audio.duration));progressBar.style.width = barlength + '%';var curMins = Math.floor(audio.currentTime / 60),curSecs = Math.floor(audio.currentTime - curMins * 60),mins = Math.floor(audio.duration / 60),secs = Math.floor(audio.duration - mins * 60);curSecs < 10 && (curSecs = '0' + curSecs);secs < 10 && (secs = '0' + secs);curTime.innerHTML = curMins + ':' + curSecs;durTime.innerHTML = mins + ':' + secs;if (settings.buffered) {var buffered = audio.buffered;if (buffered.length) {var loaded = Math.round(100 * buffered.end(0) / audio.duration);preloadBar.style.width = loaded + '%';}}}function shuffle() {if (shuffle) {index = Math.round(Math.random() * playList.length);}}function doEnd() {if (index === playList.length - 1) {if (!repeating) {audio.pause();plActive();playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-play'));return;} else {play(0);}} else {play(index + 1);}}function moveBar(evt, el, dir) {var value;if (dir === 'horizontal') {value = Math.round((evt.clientX - el.offset().left + window.pageXOffset) * 100 / el.parentNode.offsetWidth);el.style.width = value + '%';return value;} else {if (evt.type === wheel()) {value = parseInt(volumeLength, 10);var delta = evt.deltaY || evt.detail || -evt.wheelDelta;value = delta > 0 ? value - 10 : value + 10;} else {var offset = el.offset().top + el.offsetHeight - window.pageYOffset;value = Math.round(offset - evt.clientY);}if (value > 100) value = wheelVolumeValue = 100;if (value < 0) value = wheelVolumeValue = 0;volumeBar.style.height = value + '%';return value;}}function handlerBar(evt) {rightClick = evt.which === 3 ? !0 : !1;seeking = !0;seek(evt);}function handlerVol(evt) {rightClick = evt.which === 3 ? !0 : !1;seeking = !0;setVolume(evt);}function seek(evt) {if (seeking && rightClick === !1 && audio.readyState !== 0) {var value = moveBar(evt, progressBar, 'horizontal');audio.currentTime = audio.duration * (value / 100);}}function seekingFalse() {seeking = !1;}function setVolume(evt) {evt.preventDefault();volumeLength = volumeBar.css('height');if (seeking && rightClick === !1 || evt.type === wheel()) {var value = moveBar(evt, volumeBar.parentNode, 'vertical') / 100;if (value <= 0) {audio.volume = 0;audio.muted = !0;volumeBtn.classList.add('has-muted');} else {if (audio.muted) audio.muted = !1;audio.volume = value;volumeBtn.classList.remove('has-muted');}}}function notify(title, attr) {if (!settings.notification) {return;}if (window.Notification === undefined) {return;}attr.tag = 'AP music player';window.Notification.requestPermission(function (access) {if (access === 'granted') {var notice = new Notification(title.substr(0, 110), attr);setTimeout(notice.close.bind(notice), 5000);}});}function destroy() {if (!apActive) return;if (settings.confirmClose) {window.removeEventListener('beforeunload', beforeUnload, !1);}playBtn.removeEventListener('click', playToggle, !1);volumeBtn.removeEventListener('click', volumeToggle, !1);repeatBtn.removeEventListener('click', repeatToggle, !1);plBtn.removeEventListener('click', plToggle, !1);progressBar.closest('.progress-container').removeEventListener('mousedown', handlerBar, !1);progressBar.closest('.progress-container').removeEventListener('mousemove', seek, !1);document.documentElement.removeEventListener('mouseup', seekingFalse, !1);volumeBar.closest('.volume').removeEventListener('mousedown', handlerVol, !1);volumeBar.closest('.volume').removeEventListener('mousemove', setVolume);volumeBar.closest('.volume').removeEventListener(wheel(), setVolume);document.documentElement.removeEventListener('mouseup', seekingFalse, !1);prevBtn.removeEventListener('click', prev, !1);nextBtn.removeEventListener('click', next, !1);audio.removeEventListener('error', errorHandler, !1);audio.removeEventListener('timeupdate', timeUpdate, !1);audio.removeEventListener('ended', doEnd, !1);pl.removeEventListener('click', listHandler, !1);pl.parentNode.removeChild(pl);audio.pause();apActive = !1;index = 0;playBtn.classList.remove('is-playing');playSvgPath.setAttribute('d', playSvg.getAttribute('data-play'));volumeBtn.classList.remove('has-muted');plBtn.classList.remove('is-active');repeatBtn.classList.remove('is-active');}function wheel() {var wheel;if ('onwheel' in document) {wheel = 'wheel';} else if ('onmousewheel' in document) {wheel = 'mousewheel';} else {wheel = 'MozMousePixelScroll';}return wheel;}function extend(defaults, options) {for (var name in options) {if (defaults.hasOwnProperty(name)) {defaults[name] = options[name];}}return defaults;}function create(el, attr) {var element = document.createElement(el);if (attr) {for (var name in attr) {if (element[name] !== undefined) {element[name] = attr[name];}}}return element;}function getTrack(index) {return playList[index];}Element.prototype.offset = function () {var el = this.getBoundingClientRect(),scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,scrollTop = window.pageYOffset || document.documentElement.scrollTop;return { top: el.top + scrollTop, left: el.left + scrollLeft };};Element.prototype.css = function (attr) {if (typeof attr === 'string') {return getComputedStyle(this, '')[attr];} else if (typeof attr === 'object') {for (var name in attr) {if (this.style[name] !== undefined) {this.style[name] = attr[name];}}}};window.Element && function (ElementPrototype) {ElementPrototype.matches = ElementPrototype.matches || ElementPrototype.matchesSelector || ElementPrototype.webkitMatchesSelector || ElementPrototype.msMatchesSelector || function (selector) {var node = this,nodes = (node.parentNode || node.document).querySelectorAll(selector),i = -1;while (nodes[++i] && nodes[i] != node) {if (window.CP.shouldStopExecution(1)) break;;}window.CP.exitedLoop(1);return !!nodes[i];};}(Element.prototype);window.Element && function (ElementPrototype) {ElementPrototype.closest = ElementPrototype.closest || function (selector) {var el = this;while (el.matches && !el.matches(selector)) {if (window.CP.shouldStopExecution(2)) break;el = el.parentNode;}window.CP.exitedLoop(2);return el.matches ? el : null;};}(Element.prototype);return { init: init, update: updatePL, destroy: destroy, getTrack: getTrack };}();window.AP = AudioPlayer;})(window);
AP.init({
  playList: [
    {'title': 'Candan Erçetin - Yalan', 'file': 'http://awscdn.podcasts.com/yalan-fb50.mp3'},
    {'title': 'Cem Karaca - Üryan Geldim', 'file': 'http://awscdn.podcasts.com/uryangeldim-ead9.mp3'},
    {'title': 'Fikret Kızılok - Gönül', 'file': 'http://awscdn.podcasts.com/gonul-1dd3.mp3'},
    {'title': 'Zeki Müren - Ah Bu Şarkıların Gözü Kör Olsun', 'file': 'http://awscdn.podcasts.com/ahbusarkilarin-90f7.mp3'},
    {'title': 'Yeliz - Bu Ne Dünya Kardeşim', 'file': 'http://awscdn.podcasts.com/bunedunya-6126.mp3'},
    {'title': 'Sezen Aksu - Vazgeçtim', 'file': 'http://awscdn.podcasts.com/vazgectim-6f09.mp3'},
    {'title': 'Gökhan Kırdar - Yerine Sevemem', 'file': 'http://awscdn.podcasts.com/yerinesevemem-6c5d.mp3'},
    {'title': 'Barış Manço - Unutamadım', 'file': 'http://awscdn.podcasts.com/unutamadim-983d.mp3'},
    {'title': 'Beş Yıl Önce On Yıl Sonra - Ya Sonra', 'file': 'http://awscdn.podcasts.com/yasonra-441b.mp3'},
    {'title': 'Tülay Özer - İkimiz Bir Fidanız', 'file': 'http://awscdn.podcasts.com/ikimizbir-9349.mp3'},
    {'title': 'Barış Manço - Dağlar Dağlar', 'file': 'http://awscdn.podcasts.com/daglardaglar-2e41.mp3'},
    {'title': 'Fikret Kızılok - Zaman Zaman', 'file': 'http://awscdn.podcasts.com/zamanzaman-c33b.mp3'},
    {'title': 'Sertab Erener - Gel Barışalım Artık', 'file': 'http://awscdn.podcasts.com/gelbarisalim-0ccb.mp3'},
    {'title': 'Zerrin Özer - Seninle Başım Dertte', 'file': 'http://awscdn.podcasts.com/seninlebasim-cc74.mp3'},
    {'title': 'Leman Sam - Rüzgar', 'file': 'http://awscdn.podcasts.com/ruzgar-392b.mp3'},
    {'title': 'Fikret Kızılok - Bu Kalp Seni Unutur Mu', 'file': 'http://awscdn.podcasts.com/bukalpseni-39e9.mp3'},
    {'title': 'Gülistan Okan - Kanım Kaynadı Sana', 'file': 'http://awscdn.podcasts.com/kanimkaynadi-f72d.mp3'},
    {'title': 'Ayla Dikmen - Zehir Gibi Aşkın Var', 'file': 'http://awscdn.podcasts.com/zehirgibiaskin-0894.mp3'},
    {'title': 'İlhan İrem - Tören', 'file': 'http://awscdn.podcasts.com/toren-1c86.mp3'},
    {'title': 'Erol Evgin - Rüya', 'file': 'http://awscdn.podcasts.com/ruya-a209.mp3'},
    {'title': 'Sibel Egemen - Dönmeyecek', 'file': 'http://awscdn.podcasts.com/donmeyecek-5590.mp3'},
    {'title': 'Zerrin Özer - Söyleyemem', 'file': 'http://awscdn.podcasts.com/soyleyemem-baf6.mp3'},
    {'title': 'Erol Evgin - Söyle Canım', 'file': 'http://awscdn.podcasts.com/soylecanim-3e20.mp3'},
    {'title': 'Tanju Okan - Sevince', 'file': 'http://awscdn.podcasts.com/sevince-f70d.mp3'},
    {'title': 'Barış Manço - Dönence', 'file': 'http://awscdn.podcasts.com/donence-dbc4.mp3'},
    {'title': 'Cem Karaca - Kara Üzüm', 'file': 'http://awscdn.podcasts.com/karauzum-1c7e.mp3'},
    {'title': 'Kamuran Akkor - Tövbeler Olsun', 'file': 'http://awscdn.podcasts.com/tovbelerolsun-513f.mp3'},
    {'title': 'Hümeyra - Sevdim Seni Bir Kere', 'file': 'http://awscdn.podcasts.com/sevdimsenivir-f79c.mp3'},
    {'title': 'Coşkun Demir - Sevgiye Tutsak', 'file': 'http://awscdn.podcasts.com/sevgiyetutsak-eacc.mp3'},
    {'title': 'Sezen Aksu - Minik Serçe', 'file': 'http://awscdn.podcasts.com/minikserce-e985.mp3'},
    {'title': 'Neşe Karaböcek - Deli Gibi Sevdim', 'file': 'http://awscdn.podcasts.com/deligibisevdim-03b9.mp3'},
    {'title': 'Fikret Kızılok - Serserinim', 'file': 'http://awscdn.podcasts.com/serserinim-3f16.mp3'},
    {'title': 'Grup Gündoğarken - Bir Yaz Daha Bitiyor', 'file': 'http://awscdn.podcasts.com/biryazdaha-0f3b.mp3'},
    {'title': 'Şehrazat - İki Gölge', 'file': 'http://awscdn.podcasts.com/ikigolge-25fb.mp3'},
    {'title': 'Nükhet Duru - Ben Sana Vurgunum', 'file': 'http://awscdn.podcasts.com/bensanavurgunum-bbc5.mp3'},
    {'title': 'Nilüfer - Seni Beklerim Öptüğüm Yerde', 'file': 'http://awscdn.podcasts.com/senibeklerim-bd6e.mp3'},
    {'title': 'Erol Evgin - Neydi O Yıllar', 'file': 'http://awscdn.podcasts.com/neydioyillar-d61f.mp3'},
    {'title': 'Füsun Önal - Bunlar da Geçer', 'file': 'http://awscdn.podcasts.com/bunlardagecer-1ba5.mp3'},
    {'title': 'Ayla Algan - Selvi Boylum', 'file': 'http://awscdn.podcasts.com/selviboylum-e9ca.mp3'},
    {'title': 'Barış Manço - İşte Hendek İşte Deve', 'file': 'http://awscdn.podcasts.com/istehendek-df8f.mp3'},
  ]
});

$(document).ready(function(){
  $(".pl-list__download").on("click", function(){
    var trackPlaying = $(this).closest(".pl-list");
    console.log(AP.getTrack(trackPlaying.attr("data-track")));
  });
});