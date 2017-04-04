var game = {}; //initialize empty game object

game.field = []; // game field
game.table;
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

the argument scoreboard is an html element. please look into index.html for reference.
*/

game.initialize = function(msg, scoreboard) {
	for(var i=0; i<5; i++)
	{
		game.field[i] = [];
		for(var j=0; j<5; j++)
		{
			game.field[i][j] = {type:"nothing"}; //introducing game types: nothing, standing, dead
		}
	}

	console.log("game: Field initialized");

	game.msg = msg;

	game.scoreboard = scoreboard;
};

game.register = function(t) {
	game.table = t;
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

game.board.whichDiff = function(one, two) {
	var diffx = Math.abs(two.x - one.x);
	var diffy = Math.abs(two.y - one.y);

	return (diffx > diffy ? diffx : diffy);
};

game.board.validNoWall = function(one, two) { //TODO: rewrite
	var path = game.board.getPathFields(one, two);
	var valid = true;

	path.forEach((el)=>{
		if(game.getField(el.x,el.y) == "dead" && valid)
		{
			valid = false;
		}
	});

	return valid;
};

game.board.validDirection = function(one, two) {
	var diffx = Math.abs(two.x - one.x);
	var diffy = Math.abs(two.y - one.y);

	var valid = ( ( diffx == 0 || diffy == 0) || diffx == diffy );

	return valid;
};

game.board.validLength = function(one, two) {
	var diffx = Math.abs(two.x - one.x);
	var diffy = Math.abs(two.y - one.y);

	var total = diffx > diffy ? diffx : diffy;

	return (total <= game.roll);
};

game.board.validTurn = function(one, two) {
	return (game.board.validDirection(one, two) && game.board.validLength(one, two) && game.board.validNoWall(one, two));
};

game.setField = function(x,y,type) {
	game.field[x][y] = {type:type};
	game.table.setField(x,y,type,game.recent);
}

game.getField = function(x,y) {
	return game.field[x][y].type;
}

game.board.getPathFields = function(one, two) {
	var result = [];
	var x1 = one.x;
	var y1 = one.y;
	var x2 = two.x;
	var y2 = two.y;

	var diffx = Math.abs(x2 - x1);
	var diffy = Math.abs(y2 - y1);

	if(diffx == 0) // if vertical
	{
		for(var i= (y1>y2?y1:y2); i>= (y1>y2?y2:y1); i--)
		{
			result.push({x:x1,y:i});
		}
	} else if(diffy == 0) // if horizontal
	{
		for(var i= (x1>x2?x1:x2); i>= (x1>x2?x2:x1); i--)
		{
			result.push({x:i,y:y1});
		}
	} else { // if diagonal
		if(x2 >= x1)
		{
			if(y2 >= y1)
			{
				var curry = y1;
				var currx = x1;
				result.push({x:currx,y:curry});
				while(currx != x2 && curry != y2)
				{
					result.push({x:++currx, y:++curry});
				}
			} else {
				var curry = y1;
				var currx = x1;
				result.push({x:currx,y:curry});
				while(currx != x2 && curry != y2)
				{
					result.push({x:++currx,y:--curry});
				}
			}
		} else {
			if(y2 >= y1)
			{
				var curry = y1;
				var currx = x1;
				result.push({x:currx,y:curry});
				while(currx != x2 && curry != y2)
				{
					result.push({x:--currx,y:++curry});
				}
			} else {
				var curry = y1;
				var currx = x1;
				result.push({x:currx,y:curry});
				while(currx != x2 && curry != y2)
				{
					result.push({x:--currx,y:--curry});
				}
			}
		}
	}
	return result;
};

game.loop = function(x,y) {
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
		game.msg.send({text:game.score.getPlayerName(game.turn) + ": Wähle ein Feld aus, das zur Wand werden soll"});
		game.stage = "dead0";
		break;
	case "dead0":
		game.setField(x,y,"dead");
		game.toggleTurn();
		game.msg.send({text:game.score.getPlayerName(game.turn) + ": Wähle ein Feld aus, das zur Wand werden soll"});
		game.stage = "dead1";
		break;
	case "dead1":
		if(game.getField(x,y) != "dead")
		{
			game.setField(x,y,"dead");
			game.toggleTurn();
			game.msg.send({text:game.score.getPlayerName(game.turn) + ": Wähle ein Feld aus, das zur Wand werden soll"});
			game.stage = "dead2";
		}
		break;
	case "dead2":
		if(game.getField(x,y) != "dead")
		{
			game.setField(x,y,"dead");
			game.toggleTurn();
			game.msg.send({text:game.score.getPlayerName(game.turn) + ": Wähle das Startfeld aus"});
			game.stage = "start";
		}
		break;
	case "start":
		if(game.getField(x,y) != "dead")
		{
			game.setField(x,y,"standing");
			game.recent = {x: x, y: y};
			game.toggleTurn();
			game.roll = game.dice();
			game.msg.send({text:game.score.getPlayerName(game.turn) + ": Ziehe " + game.roll + " Felder"});
			game.stage = "running";
		}
		break;
	case "running":
		if(game.getField(x,y) != "dead" && game.board.validTurn(game.recent, {x:x, y:y}))
		{
			if(
				+game.scoreboard.getElementsByTagName("tr")[1].childNodes[1].innerHTML < 10 &&
				+game.scoreboard.getElementsByTagName("tr")[2].childNodes[1].innerHTML < 10 )
			{
				game.setField(game.recent.x, game.recent.y, "nothing");
				game.setField(x,y,"standing");
				game.old = game.recent;
				game.recent = {x:x, y:y};
				var diff = game.board.whichDiff(game.old, game.recent);
				var pt = (game.roll - diff > 0 ? game.roll - diff : 0);
				game.score.addPoints(game.turn, pt);
				if(
					+game.scoreboard.getElementsByTagName("tr")[1].childNodes[1].innerHTML >= 10 ||
					+game.scoreboard.getElementsByTagName("tr")[2].childNodes[1].innerHTML >= 10 )
				{
					game.msg.send({text:"Das Spiel ist gewonnen! Siehe unten für die Ergebnisse"});
					game.stage = "stopped";
					break;
				}
				game.toggleTurn();
				game.roll = game.dice();
				game.msg.send({text:game.score.getPlayerName(game.turn) + ": Ziehe "+game.roll+" Felder"});
				break;
			} else {
				game.msg.send({text:"Das Spiel ist gewonnen! Siehe unten für die Ergebnisse",visibility:0});
				game.stage = "stopped";
				break;
			}
		} else {
			game.msg.send({text:"Ungültiger Zug!",nocount:true});
		}
		break;
	case "stopped":
		game.msg.send({text:"Zum erneuten Spielen die Seite aktualisieren"});
		break;
	}
};
