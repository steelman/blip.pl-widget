/*
 * $Id$
 *
 *
 *  Skrypt wstawia na stronie listę ostatnich wpisów w serwisie blip.pl
 *  Copyright (C) 2009  ^steelman
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *  Proszę nie usuwać powyższej informacji!
 */

/*
 * Sposób użycia:
 *
 * W wybranym miejscu na stronie, w którym ma się pojawić wklejka
 * należy wstawić następujący kod:
 *

 <script type="text/javascript">
 //<![CDATA[
 var blip_widget = {
   'username' : 'nick',
   'entries'  : 5,
   'heading'  : 'na blipie',
   'bullet'   : '#' //znaczek wyświetlany jako link. domyślnie brak.
   'icons'    : {   // domyślnie puste
     film       : 'film.png',
     muzyka     : 'muzyka.png',
     obraz      : 'obraz.png'
   },
   date       : true //lub funkcja formatująca datę. domyślnie false.
   // ZAWANSOWANE. Wstaw tylko jeżeli wiesz co to oznacza 
   'parent_disp' : 'block'
 };
 //]]>
 </script>
 <script type="text/javascript" src="http://twoj.adres/blip.js"></script>

 *
 * Parametry:
 * username - twoja nazwa użytkownika w serwisie Blip
 * entries  - liczba wpisów pobieranych z serwisu Blip.
 *            domyślnie 5
 * heading  - nagłówek wstawiony tuż przed listą wpisów.
 *            może zawierać kod HTML.
 *
 * Parametr parent_disp odpowiedzialny jest za manipulację
 * właściwością display w stylu elementu nadrzędnego nad wklejką.
 * Na przykład jeżeli chcemy umieścić wklejkę jako element listy
 *

 <ul id="sidebar">
 <li>Kategorie
   <ul>
   <li>kategoria1</li>
   <li>kategoria2</li>
   </ul>
 </li>
 <li style="display: none"><!-- wklejka Blip --></li>
 <li>Archiwum
   <ul>
   <li>2008</li>
   <li>2009</li>
   </ul>
 </li>

 *
 * to w przypadku przeglądarki z wyłączoną obsługą skryptów
 * element ten pozostanie ukryty nie zaburzając tym samym
 * wyglądu strony. Gdy obsługa skryptów zostanie włączona
 * wybrany element zostanie wyświetlony.
 *
 */

/* http://blog.versed.se/2008/07/transliterate-in-javascript.html */
String.prototype.tr = function(from, to) {
	var fromChars = from.split("");
	var toChars = to.split("");

	var mapTable = {};

	for(i = 0; i < fromChars.length; i++) {
		var c = i < toChars.length ? toChars[i] : "";
		mapTable[fromChars[i]] = c;
	}

	var str = this;

	var re = new RegExp("[" + fromChars.join("") + "]", "g");
	str = str.replace(re, function(c) {
		return mapTable[c];
	});

	return str;
};

var blip_load_data = function(src) {
	var s = t = null;

	if (document.getElementById('blip') == null) {
		alert("Wklejka blip nie została skonfigurowana. Brak elementu docelowego z atrybutem id=\"blip\".");
		return false;
	}

	if ((t = document.getElementById('blip-data')) != null)
		t.parentNode.removeChild(t)

	s=doc_create_element('script');
	s.setAttribute('src', src);
	s.setAttribute('type', 'text/javascript');
	s.setAttribute('id', 'blip-data');

	document.getElementsByTagName('head')[0].appendChild(s);
}

var create_icon = function(type,text) {
	var blip_links = {
		blip : '[blip]',
		link : '[link]',
		muzyka : '[muzyka]',
		image : '[obraz]',
		film  : '[film]'
	};

	var icon=null;
	if (typeof blip_widget.icons[type] != "undefined") {

		icon = doc_create_element('img');
		icon.setAttribute('src', blip_widget.icons[type])
		icon.setAttribute('alt', blip_links[type] +': '+ text)

	} else if (typeof blip_links[type] != "undefined") {

		icon = document.createTextNode(blip_links[type]);

	} else 
		icon = document.createTextNode(text);
	return icon;
};

var create_link = function(uri, title, type, i) {
	var icon=(i || create_icon(type, title));
	var link=doc_create_element('a');
	link.setAttribute('title', type +': '+ title);
	link.setAttribute('href', uri);
	link.setAttribute('class', 'blip-link');
	link.appendChild(icon)
	return link;
};

var parse_date = function(d) {
	var da=d.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
	return new Date(da[1], da[2]-1, da[3], da[4], da[5], da[6]);
}

var format_date = function(d) {
	var a = b = null;

	if (typeof blip_widget.date == 'function') {
		a = blip_widget.date(d);
	} else if (typeof blip_widget.date == 'boolean' && blip_widget.date) {
		a = doc_create_element('span');
		b = document.createTextNode(
			d.getDate() +'.'+
			(d.getMonth() + 1) +'\u00a0'+
			d.getHours() +':'+
			d.getMinutes()
		);
		a.appendChild(b);
	}
	if (a != null)
		a.setAttribute('class', 'blip-date');

	return a;
}

var show_blip = function(b) {
	if (typeof blip_widget.username == "undefined") {
		alert("Wklejka Blip nie została skonfigurowana."+
		    " Brak nazwy użytkownika.");
		return;
	}

	var linkre  = /http:\/\/[\S_]+(?:\b|$)|\^:[A-Za-z0-9]+|#[A-Za-z0-9ĘÓĄŚŁŻŹĆŃęóąśłżźćń_\-]{2,50}/im;
	var filmre  = /^http:\/\/(?:www\.)?(?:(?:[.\S]+.)?youtube.com\/watch\?v=|video.google.com\/videoplay\?docid=[0-9\-]*|vimeo.com\/\d+)/im;
	var musicre = /^http:\/\/(?:www\.)?jamendo.com\/(?:[a-z][a-z]\/)?(?:album|track|playlist)\/(?:\d+)(?:\/.*)?/im;
	var blipre  = /^http:\/\/(?:www\.)?blip.pl\/(?:dm|s)\/\d+/im;

	var blipblock=document.getElementById('blip');
	var blipentries=doc_create_element('ul');

	for (var i=0; i < b.length; i++) {
		/*
		 * b[i].body - tekst wpisu
		 * b[i].id - identyfikator do zastosowania w linkach
		 */
		var node = null;
		var message=b[i].body;
		var mid=b[i].id;
		var mtype=b[i].type.match(/[DPMS]/g).join("").toLowerCase();
		var mlink = 'http://blip.pl/'+ mtype +'/'+ mid; 
		var mdate = parse_date(b[i].created_at);

		var li = doc_create_element('li');
		li.setAttribute('id', 'blip-status-' + mid);

	
		if ((node = format_date(mdate)) != null)
			li.appendChild(node);

		while( linkre.exec(message) != null) {
			var left=RegExp.leftContext;
			var match=RegExp.lastMatch;
			var right=RegExp.rightContext;

			node = document.createTextNode(left);
			li.appendChild(node);

			if (match.substring(0,1) == '#') {
				node = create_link('http://blip.pl/tags/' + match.substring(1), match, 'tag')

			} else if (match.substring(0,1) == '^') {
				node = create_link('http://'+ match.substring(1) +'.blip.pl/', match, 'użytkownik')

			} else if (match.search(blipre) != -1) {
				node = create_link(match, match, 'blip')

			} else if (match.search(filmre) == 0) {
				node = create_link(match, match, 'film')

			} else if (match.search(musicre) != -1) {
				node = create_link(match, match, 'muzyka')

			} else if (match.substring(0,7) == "http://") {
				node = create_link(match, match, 'link')

			} else {
				node = document.createTextNode(match);

			}
			li.appendChild(node);
			message=right;
		}
		if (message != null) {
			node = document.createTextNode(message);
			li.appendChild(node);
		}
			
		if (typeof b[i].pictures_path != "undefined") {
			node = create_link(mlink, mlink, 'obraz');
			li.appendChild(node);
		}
		if (typeof blip_widget.bullet == "string") {
			node = document.createTextNode(blip_widget.bullet);
			li.appendChild(create_link(mlink, mlink, 'blip', node));
		}

		blipentries.appendChild(li);
	}

	blipblock.innerHTML = blip_widget.heading;
	blipblock.appendChild(blipentries);
	if (typeof blip_widget.parent_disp == "string")
		blipblock.parentNode.style.display = blip_widget.parent_disp;
};

var doc_create_element = null;
(function(){
var ns=null;

//TODO blog
if (document.createElementNS &&
    (ns = document.getElementsByTagName('html')[0].getAttribute('xmlns')) != null)
	doc_create_element = function(e) {
		return document.createElementNS(ns,e);
	};
else
	doc_create_element = function(e) {
		return document.createElement(e);
	};

if (typeof blip_widget == "undefined") {
	alert("Wklejka blip nie została skonfigurowana.");
} else {
	if (typeof blip_widget.heading == "undefined")
		blip_widget.heading = "na blipie";
	if (typeof blip_widget.entries == "undefined")
		blip_widget.entries = 5;
	if (typeof blip_widget.icons == "undefined")
		blip_widget.icons = {};
	
	var data_src = 'http://api.blip.pl/users/'+ blip_widget.username +
			'/statuses.json?callback=show_blip&limit='+ blip_widget.entries;

	if (document.write && (document.getElementById('blip') == null)) try {
			document.write('<div id="blip"></div>');
	} catch(e) { }
	if (window.attachEvent) 
		window.attachEvent('onload', function(ev) {
			blip_load_data(data_src);
		});
	else
		window.addEventListener('load', function(ev) {
			blip_load_data(data_src);
		}, false);
}})();
