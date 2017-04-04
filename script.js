var table = function(g, t){
	this.t = t;
	this.game = g;
	this.createTable();
	this.styles = {"nothing":"default","standing":"standing","dead":"dead"};
	console.log("table: initialized");
};

table.prototype.setField = function(x,y,type, old) {
	console.log("table: "+x+" "+y+" "+type);
	if(old !== undefined)
		this.resetField(old.x,old.y);
	this.t.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].classList.add(this.styles[type]);
};

table.prototype.resetField = function(x,y) {
	this.t.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].classList.remove(this.styles["nothing"]);
	this.t.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].classList.remove(this.styles["standing"]);
	this.t.getElementsByTagName("tr")[y].getElementsByTagName("td")[x].classList.remove(this.styles["dead"]);
};

table.prototype.clearhover = function() {
	this.t.getElementsByClassName("hover").foreach((el)=>{ el.classList.remove("hover"); });
	console.log("table: clearhover");
};

table.prototype.createTable = function() {
	this.t.innerHTML = "";
	for(var i=0; i<5; i++)
	{
		var row = this.t.appendChild(document.createElement("tr"));
		for(var j=0; j<5; j++)
		{
			var thisbuf = this;
			var col = row.appendChild(document.createElement("td"));
			col.onclick = function(ev) {
				thisbuf.clearhover();
				if(thisbuf.game !== undefined)
				{
					var posx;
					var poxy;
					thisbuf.t.getElementsByTagName("tr").foreach((row,yid)=>{
						if(row === ev.target.parentNode)
						{
							row.getElementsByTagName("td").foreach((col,xid)=>{
								if(col === ev.target)
								{
									posx = xid;
									posy = yid;
									return;
								}
							});
						}
					});

					thisbuf.game.loop(posx, posy);
				}
			};

			col.onmouseenter = function(ev) { //TODO some bug somewhere
				if(thisbuf.game.stage == "running")
				{
					thisbuf.clearhover();
					if(thisbuf.game !== undefined && thisbuf.game.recent.x !== undefined)
					{
						var posx;
						var posy;
						thisbuf.t.getElementsByTagName("tr").foreach((row,yid)=>{
							if(row === ev.target.parentNode)
							{
								row.getElementsByTagName("td").foreach((col,xid)=>{
									if(col === ev.target)
									{
										posx = xid;
										posy = yid;
										return;
									}
								});
							}
						});

						if(thisbuf.game.board.validTurn(thisbuf.game.recent, {x:posx,y:posy}))
						{
							var path = thisbuf.game.board.getPathFields(thisbuf.game.recent, {x:posx,y:posy});
							path.forEach((el)=>{
								if(el != thisbuf.game.recent)
								thisbuf.t.getElementsByTagName("tr")[el.y].getElementsByTagName("td")[el.x].classList.add("hover");
							});
						}
					}
				}
			};
		}
	}
};

window.onload = function() {
	if(typeof game !== undefined && typeof Msgboard !== undefined)
	{
		var mymsg = new Msgboard(document.getElementById("msg"));
		game.initialize(
			mymsg,
			document.getElementById("points")
		);
		var mytable = new table(game, document.getElementById("field"));
		game.register(mytable);
		
		game.loop();
	}
};
