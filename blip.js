/*
 * $Id$
 */

document.getElementsByTagName('head')[0].appendChild((function() {
	var script = document.createElement('script');
	script.setAttribute('src', 'http://jogger.pl/t/js/jquery.js');
	script.setAttribute('type', 'text/javascript');
	return script;
})());

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


$(document).ready(function showBlip(e) {
	var b=Blip;
	var blipre=new RegExp("(http://blip.pl/s/\\d+)", "g");
	var linkre=new RegExp("(http://rdir.pl/[A-Za-z0-9]+)", "g");
	var tagre=new RegExp("#[a-z0-9ąćęłńóśźż]+", "gi");
	var nickre=new RegExp("\\^([a-z0-9]+)", "gi");
        var blipentries=document.getElementById('blipentries');

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
		li.innerHTML = body;
		blipentries.appendChild(li);
	}
	document.getElementById('blip').style.display = "block";
}, false);
