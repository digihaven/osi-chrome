$(function(){
	function update(){
	
		$(".points").text(osi.localStorageGet("points","0"));
		$(".guid").text(osi.localStorageGet("guid",osi.guid()));
		
	}
	setInterval(update,1000);
	update();
});
