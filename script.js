window.onload = function() {
	if(typeof game !== undefined)
	{
		game.initialize(
			document.getElementById("field"),
			document.getElementById("msg"),
			document.getElementById("points")
		);
		
		game.loop();
	}
};
