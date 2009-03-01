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
   'heading   : 'na blipie',
   // ZAWANSOWANE. Wstaw tylko jeżeli wiesz co to oznacza 
   'parent_disp : 'block'
 };
 //]]>
 </script>
 <script type="text/javascript" src="http://twoj.adres/blip.js">

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

var show_blip = function(b) {
	if (typeof blip_widget.username == "undefined") {
		alert("Wklejka Blip nie została skonfigurowana."+
		    " Brak nazwy użytkownika.");
		return;
	}

	var blipre=new RegExp("(http://blip.pl/s/\\d+)", "g");
	var linkre=new RegExp("(http://rdir.pl/[A-Za-z0-9]+)", "g");
	var tagre=new RegExp("#[a-z0-9ąćęłńóśźż]+", "gi");
	var nickre=new RegExp("\\^([a-z0-9]+)", "gi");

	var blipblock=document.getElementById('blip');
	var blipentries=document.createElement('ul');

	for (var i=0; i < b.length; i++) {
		/*
		 * b[i].body - tekst wpisu
		 * b[i].id - identyfikator do zastosowania w linkach
		 */
		var body=b[i].body;
		body=body.replace(tagre, function(t) {
			t=t.substr(1);
			var plt = t.tr("ąćęłńóśźż", "acelnoszz");
			return '<a href="http://blip.pl/tags/'+ plt +'">#'+ t +'</a>';
		});

		body=body.replace(nickre, '<a href="http://$1.blip.pl">^$1</a>');
		body=body.replace(blipre, '<a href="$1">[blip]</a>');
		body=body.replace(linkre, '<a href="$1">[link]</a>');

		var li = document.createElement('li');
		li.setAttribute('id', 'blip-status-' + b[i].id);
		li.innerHTML = body;
		blipentries.appendChild(li);
	}

	blipblock.innerHTML = blip_widget.heading;
	blipblock.appendChild(blipentries);
	if (typeof blip_widget.parent_disp != "undefined")
		blipblock.parentNode.style.display = blip_widget.parent_disp;
};

if (typeof blip_widget == "undefined") {
	alert("Wklejka blip nie została skonfigurowana.");
} else {
	if (typeof blip_widget.heading == "undefined")
		blip_widget.heading = "na blipie";
	if (typeof blip_widget.entries == "undefined")
		blip_widget.entries = 5;

	document.write('<div id="blip" style="padding: 0; margin: 0; border: 0;"/>');
	document.write('<script id="blip-data" type="text/javascript" ' +
		'src="http://api.blip.pl/users/'+ blip_widget.username +
		'/statuses.json?callback=show_blip&limit='+ blip_widget.entries + '"></script>');
}
