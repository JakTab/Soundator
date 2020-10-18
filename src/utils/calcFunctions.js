export function calcTime(time) {
	var minutes = "0" + Math.floor(time / 60);
	var seconds = "0" + Math.floor(time - minutes * 60);
	return minutes.substr(-2) + ":" + seconds.substr(-2);
}

export function calcProgressBar(audio) {
	return "" + (audio.currentTime / audio.duration)*100 + "%";
}

export function calcDivFillPercentage(event, fillingElementId) {
    var rect =  document.getElementById("div" + fillingElementId).getBoundingClientRect();
    var startX = rect.x;
    var endX = startX + rect.width;
    var clickedX = event.clientX;
    return ((clickedX-startX)/(endX-startX))*100;
}