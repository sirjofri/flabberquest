var stage = "loading";
/* Stages: loading, dead0, dead1, dead2, start, running */

var field = [];
var points;
var msg;
var turn; // Which player's turn (starting with 1)
var recent; // recent active element (which has "standing" class enabled)
var old; // old active element
var roll; // recent roll

window.onload = function() {
	for(var i=0; i<5; i++)
	{
		field[i] = document.getElementById("field").getElementsByTagName("tr")[i].getElementsByTagName("td");
		for(var j=0; j<field[i].length; j++)
		{
			field[i][j].onclick = fieldclick;
			field[i][j].onmouseover = fieldhover;
		}
	}
	console.log("Field initialized");
	points = document.getElementById("points");

	msg = document.getElementById("msg");
	loop();
};

fieldclick = function(ev) {
	loop(ev.target);
};

fieldhover = function(ev) {
};

loop = function(el) {
	switch(stage)
	{
	case "loading":
		console.log("Spiel wurde geladen und startet");
		var p1 = 0;
		var p2 = 0;
		while(p1 == p2)
		{
			p1 = dice();
			p2 = dice();

			if(p1 < p2)
			{
				turn = 1;
				msg.innerHTML = getName(turn) + ": Wähle ein totes Feld aus";
			}
			if(p2 < p1)
			{
				turn = 2;
				msg.innerHTML = getName(turn) + ": Wähle ein totes Feld aus";
			}
		}
		stage = "dead0";
		break;
	case "dead0":
		el.classList.add("dead");
		toggleTurn();
		msg.innerHTML = getName(turn) + ": Wähle ein totes Feld aus";
		stage = "dead1";
		break;
	case "dead1":
		if(!el.classList.contains("dead"))
		{
			el.classList.add("dead");
			toggleTurn();
			msg.innerHTML = getName(turn) + ": Wähle ein totes Feld aus";
			stage = "dead2";
		}
		break;
	case "dead2":
		if(!el.classList.contains("dead"))
		{
			el.classList.add("dead");
			toggleTurn();
			msg.innerHTML = getName(turn) + ": Wähle das Startfeld aus";
			stage = "start";
		}
		break;
	case "start":
		if(!el.classList.contains("dead"))
		{
			el.classList.add("standing");
			recent = el;
			toggleTurn();
			roll = dice();
			msg.innerHTML = getName(turn) + ": Ziehe " + roll + " Felder";
			stage = "running";
		}
		break;
	case "running":
		if(!el.classList.contains("dead"))
		{
			if(
				+points.getElementsByTagName("tr")[1].childNodes[1].innerHTML < 10 &&
				+points.getElementsByTagName("tr")[2].childNodes[1].innerHTML < 10 )
			{
				recent.classList.remove("standing");
				el.classList.add("standing");
				old = recent;
				recent = el;
				var diff = whichDiff(old, recent);
				var pt = (roll - diff > 0 ? roll - diff : 0);
				addPoints(turn, pt);
				if(
					+points.getElementsByTagName("tr")[1].childNodes[1].innerHTML >= 10 ||
					+points.getElementsByTagName("tr")[2].childNodes[1].innerHTML >= 10 )
				{
					msg.innerHTML = "Das Spiel ist gewonnen! Siehe unten für die Ergebnisse";
					stage = "stopped";
					break;
				}
				toggleTurn();
				roll = dice();
				msg.innerHTML = getName(turn) + ": Ziehe " + roll + " Felder";
				break;
			} else {
				msg.innerHTML = "Das Spiel ist gewonnen! Siehe unten für die Ergebnisse";
				stage = "stopped";
				break;
			}
		}
		break;
	case "stopped":
		msg.innerHTML = "Das Spiel ist gewonnen! Siehe unten für die Ergebnisse<br>Zum erneuten Spielen die Seite aktualisieren";
		break;
	}
}

dice = function() {
	return Math.floor(Math.random() * 6) + 1;
}

getName = function(player) {
	return points.getElementsByTagName("tr")[player].firstChild.innerHTML;
};

toggleTurn = function() {
	turn = (turn == 1 ? 2 : 1);
};

whichX = function(el) {
	var par = el.parentNode;
	for(var i=0; i<par.childNodes.length; i++)
		if(par.childNodes[i] === el)
			return i;
};

whichY = function(el) {
	var parel = el.parentNode;
	var par = parel.parentNode;
	for(var i=0; i<par.childNodes.length; i++)
		if(par.childNodes[i] === parel)
			return i;
};

whichDiff = function(one, two) {
	var onex = whichX(one);
	var oney = whichY(one);
	var twox = whichX(two);
	var twoy = whichY(two);

	var diffx = Math.abs(twox - onex);
	var diffy = Math.abs(twoy - oney);

	return (diffx > diffy ? diffx : diffy); //return higher value
};

addPoints = function(player, p) {
	console.log("Spieler "+player+" bekommt "+p+" Punkte");
	var conbuf = document.createElement("td");
	conbuf.innerHTML = p;
	points.getElementsByTagName("tr")[player].appendChild(conbuf);
	if(points.getElementsByTagName("tr")[player].childNodes.length > points.getElementsByTagName("tr")[0].childNodes.length)
	{
		var label = document.createElement("th");
		label.innerHTML = (points.getElementsByTagName("tr")[0].lastChild.innerHTML.length > 3 ? "1" : +points.getElementsByTagName("tr")[0].lastChild.innerHTML +1 );
		points.getElementsByTagName("tr")[0].appendChild(label);
	}
	recalculate();
};

recalculate = function() {
	var calc = function(el) {
		var sum = 0;
		for(var i=2; i<el.childNodes.length; i++)
		{
			sum += +el.childNodes[i].innerHTML;
		}
		return sum;
	};

	points.getElementsByTagName("tr")[1].childNodes[1].innerHTML = calc(points.getElementsByTagName("tr")[1]);
	points.getElementsByTagName("tr")[2].childNodes[1].innerHTML = calc(points.getElementsByTagName("tr")[2]);
};
