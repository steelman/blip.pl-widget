/*
 * $Id$
 */

function showBlip(b) {
	var linkre=/(http:\/\/rdir.pl.[A-Za-z0-9]+)/g;
	var i;
	for (i=0; i < b.length; i++) {
		/*
		 * b[i].body - tekst wpisu
		 * b[i].id - identyfikator do zastosowania w linkach
		 */
		var body=b[i].body;
		body=body.replace(linkre, '<a href="$1">[link]</a>');
		$('blipentries').insert("<li>" + body + "</li>");
	}
	$('blip').show();
}

showBlip(Blip);
