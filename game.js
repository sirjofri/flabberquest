var game = {}; //initialize empty game object

game.field = []; // game field
game.msg;
game.recent; //= (function() { return document.getElementsByClassName("standing")[0]; })();
game.fx =  {};
game.board = {};
game.turn;
game.old;
game.roll;

game.stage = "loading";

/*
the initialize(field, msg, scoreboard) expects a table object like with getElementByTagName("table")[id]. It should be like:

<table>
<tr><td></td></tr>
</table>

very important: No spaces/newlines/tabs inside this section! Technically: No text nodes!

the other argument msg is an html element which will contain game messages.

the argument scoreboard is an html element. please look into index.html for reference.
*/

game.initialize = function(table, msg, scoreboard) {
	var rows = table.getElementsByTagName("tr");

	for(var i=0; i<rows.length; i++)
	{
		game.field[i] = rows[i].getElementsByTagName("td");
		for(var j=0; j<game.field[i].length; j++)
		{
			game.field[i][j].onclick = game.fieldclick;
			game.field[i][j].onmouseenter = game.fx.fieldhoveron;
		}
	}
	console.log("game: Field initialized");

	game.msg = msg;

	game.scoreboard = scoreboard;
};

game.fieldclick = function(ev) {
	game.fx.clearhover();
	game.loop(ev.target);
};

game.fx.fieldhoveron = function(ev) {
	game.fx.clearhover();

	if(game.recent !== undefined && game.board.validTurn(game.recent, ev.target))
	{
		var path = game.board.getPathFields(game.recent, ev.target);
		for(var i=0; i<path.length; i++)
		{
			if(path[i] !== game.recent)
			{
				path[i].classList.add("hover");
			}
		}
	}
};

game.fx.clearhover = function() {
	for(var i=0; i<game.field.length; i++)
	{
		for(var j=0; j<game.field[i].length; j++)
		{
			game.field[i][j].classList.remove("hover");
		}
	}
};

game.dice = function() {
	return Math.floor(Math.random() * 6) + 1;
};

game.score = {};

game.score.getPlayerName = function(player) {
	return game.scoreboard.getElementsByTagName("tr")[player].firstChild.innerHTML;
};

game.score.addPoints = function(player, p) {
	console.log("game: Spieler "+player+" bekommt "+p+" Punkte");
	var conbuf = document.createElement("td");
	conbuf.innerHTML = p;
	game.scoreboard.getElementsByTagName("tr")[player].appendChild(conbuf);
	if(game.scoreboard.getElementsByTagName("tr")[player].childNodes.length > game.scoreboard.getElementsByTagName("tr")[0].childNodes.length)
	{
		var label = document.createElement("th");
		label.innerHTML = (game.scoreboard.getElementsByTagName("tr")[0].lastChild.innerHTML.length > 3 ? "1" : +game.scoreboard.getElementsByTagName("tr")[0].lastChild.innerHTML + 1);
		game.scoreboard.getElementsByTagName("tr")[0].appendChild(label);
	}
	game.score.recalculate();
};

game.score.recalculate = function() {
	var calc = function(el) {
		var sum = 0;
		for(var i=2; i<el.childNodes.length; i++)
		{
			sum += +el.childNodes[i].innerHTML;
		}
		return sum;
	};

	game.scoreboard.getElementsByTagName("tr")[1].childNodes[1].innerHTML = calc(game.scoreboard.getElementsByTagName("tr")[1]);
	game.scoreboard.getElementsByTagName("tr")[2].childNodes[1].innerHTML = calc(game.scoreboard.getElementsByTagName("tr")[2]);
};

game.toggleTurn = function() {
	game.turn = (game.turn == 1 ? 2 : 1);
};

game.board.whichX = function(el) {
	var par = el.parentNode;
	for(var i=0; i<par.childNodes.length; i++)
	{
		if(par.childNodes[i] === el)
		{
			return i;
		}
	}
};

game.board.whichY = function(el) {
	var parel = el.parentNode;
	var par = parel.parentNode;
	for(var i=0; i<par.childNodes.length; i++)
	{
		if(par.childNodes[i] === parel)
		{
			return i;
		}
	}
};

game.board.whichDiff = function(one, two) {
	var onex = game.board.whichX(one);
	var oney = game.board.whichY(one);
	var twox = game.board.whichX(two);
	var twoy = game.board.whichY(two);

	var diffx = Math.abs(twox - onex);
	var diffy = Math.abs(twoy - oney);

	return (diffx > diffy ? diffx : diffy);
};

game.board.validNoWall = function(one, two) {
	var path = game.board.getPathFields(one, two);
	var valid = true;

	path.forEach((el)=>{
		if(el.classList.contains("dead") && valid)
		{
			valid = false;
		}
	});

	return valid;
};

game.board.validDirection = function(one, two) {
	var onex = game.board.whichX(one);
	var oney = game.board.whichY(one);
	var twox = game.board.whichX(two);
	var twoy = game.board.whichY(two);

	var diffx = Math.abs(twox - onex);
	var diffy = Math.abs(twoy - oney);

	var valid = ( ( diffx == 0 || diffy == 0) || diffx == diffy );

	return valid;
};

game.board.validLength = function(one, two) {
	var onex = game.board.whichX(one);
	var oney = game.board.whichY(one);
	var twox = game.board.whichX(two);
	var twoy = game.board.whichY(two);

	var diffx = Math.abs(twox - onex);
	var diffy = Math.abs(twoy - oney);

	var total = diffx > diffy ? diffx : diffy;

	return (total <= game.roll);
};

game.board.validTurn = function(one, two) {
	return (game.board.validDirection(one, two) && game.board.validLength(one, two) && game.board.validNoWall(one, two));
};

game.board.getPathFields = function(one, two) {
	var result = [];
	var x1 = game.board.whichX(one);
	var y1 = game.board.whichY(one);
	var x2 = game.board.whichX(two);
	var y2 = game.board.whichY(two);

	var diffx = Math.abs(x2 - x1);
	var diffy = Math.abs(y2 - y1);

	if(diffx == 0) // if vertical
	{
		for(var i= (y1>y2?y1:y2); i>= (y1>y2?y2:y1); i--)
		{
			result.push(game.field[i][x1]);
		}
	} else if(diffy == 0) // if horizontal
	{
		for(var i= (x1>x2?x1:x2); i>= (x1>x2?x2:x1); i--)
		{
			result.push(game.field[y1][i]);
		}
	} else { // if diagonal
		if(x2 >= x1)
		{
			if(y2 >= y1)
			{
				var curry = y1;
				var currx = x1;
				var pointer = game.field[curry][currx];
				result.push(pointer);
				while(pointer !== game.field[y2][x2])
				{
					pointer = game.field[++curry][++currx];
					result.push(pointer);
				}
			} else {
				var curry = y1;
				var currx = x1;
				var pointer = game.field[curry][currx];
				result.push(pointer);
				while(pointer !== game.field[y2][x2])
				{
					pointer = game.field[--curry][++currx];
					result.push(pointer);
				}
			}
		} else {
			if(y2 >= y1)
			{
				var curry = y1;
				var currx = x1;
				var pointer = game.field[curry][currx];
				result.push(pointer);
				while(pointer !== game.field[y2][x2])
				{
					pointer = game.field[++curry][--currx];
					result.push(pointer);
				}
			} else {
				var curry = y1;
				var currx = x1;
				var pointer = game.field[curry][currx];
				result.push(pointer);
				while(pointer !== game.field[y2][x2])
				{
					pointer = game.field[--curry][--currx];
					result.push(pointer);
				}
			}
		}
	}
	return result;
};

game.loop = function(el) {
	switch(game.stage)
	{
	case "loading":
		console.log("game: Spiel wurde geladen und startet");
		var p1 = 0;
		var p2 = 0;
		while(p1 == p2)
		{
			p1 = game.dice();
			p2 = game.dice();
			
			if(p1 < p2)
			{
				game.turn = 1;
			}
			if(p2 < p1)
			{
				game.turn = 2;
			}
		}
		game.msg.innerHTML = game.score.getPlayerName(game.turn) + ": Wähle ein Feld aus, das zur Wand werden soll";
		game.stage = "dead0";
		break;
	case "dead0":
		el.classList.add("dead");
		game.toggleTurn();
		game.msg.innerHTML = game.score.getPlayerName(game.turn) + ": Wähle ein Feld aus, das zur Wand werden soll";
		game.stage = "dead1";
		break;
	case "dead1":
		if(!el.classList.contains("dead"))
		{
			el.classList.add("dead");
			game.toggleTurn();
			game.msg.innerHTML = game.score.getPlayerName(game.turn) + ": Wähle ein Feld aus, das zur Wand werden soll";
			game.stage = "dead2";
		}
		break;
	case "dead2":
		if(!el.classList.contains("dead"))
		{
			el.classList.add("dead");
			game.toggleTurn();
			game.msg.innerHTML = game.score.getPlayerName(game.turn) + ": Wähle das Startfeld aus";
			game.stage = "start";
		}
		break;
	case "start":
		if(!el.classList.contains("dead"))
		{
			el.classList.add("standing");
			game.recent = el;
			game.toggleTurn();
			game.roll = game.dice();
			game.msg.innerHTML = game.score.getPlayerName(game.turn) + ": Ziehe " + game.roll + " Felder";
			game.stage = "running";
		}
		break;
	case "running":
		if(!el.classList.contains("dead") && game.board.validTurn(game.recent, el))
		{
			if(
				+game.scoreboard.getElementsByTagName("tr")[1].childNodes[1].innerHTML < 10 &&
				+game.scoreboard.getElementsByTagName("tr")[2].childNodes[1].innerHTML < 10 )
			{
				game.recent.classList.remove("standing");
				el.classList.add("standing");
				game.old = game.recent;
				game.recent = el;
				var diff = game.board.whichDiff(game.old, game.recent);
				var pt = (game.roll - diff > 0 ? game.roll - diff : 0);
				game.score.addPoints(game.turn, pt);
				if(
					+game.scoreboard.getElementsByTagName("tr")[1].childNodes[1].innerHTML >= 10 ||
					+game.scoreboard.getElementsByTagName("tr")[2].childNodes[1].innerHTML >= 10 )
				{
					game.msg.innerHTML = "Das Spiel ist gewonnen! Siehe unten für die Ergebnisse";
					game.stage = "stopped";
					break;
				}
				game.toggleTurn();
				game.roll = game.dice();
				game.msg.innerHTML = game.score.getPlayerName(game.turn) + ": Ziehe "+game.roll+" Felder";
				break;
			} else {
				game.msg.innerHTML = "Das Spiel ist gewonnen! Siehe unten für die Ergebnisse";
				game.stage = "stopped";
				break;
			}
		} else {
			game.msg.innerHTML = "Ungültiger Zug!<br>"+game.msg.innerHTML;
		}
		break;
	case "stopped":
		game.msg.innerHTML = "Das Spiel ist gewonnen! Siehe unten für die Ergebnisse<br>Zum erneuten Spielen die Seite aktualisieren";
		break;
	}
};
