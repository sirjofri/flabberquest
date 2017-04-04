window.onload = function() {
	if(typeof game !== undefined)
	{
		var mymsg = new Msgboard(document.getElementById("msg"));
		game.initialize(
			document.getElementById("field"),
			mymsg,
			document.getElementById("points")
		);
		
		game.loop();
	}
};
