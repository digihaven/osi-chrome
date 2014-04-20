$(function(){
	function update(){
	
		$(".points").text(localStorageGet("points","0"));
		$(".guid").text(localStorageGet("guid",guid()));
		
	}
	setInterval(update,1000);
	update();
});
