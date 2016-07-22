function heightMid() {
	var wrap_top = document.getElementsByClassName("wraper-top")[0];
	var wrap_mid = document.getElementsByClassName("wraper-mid")[0];
    
    if (getComputedStyle(wrap_mid).display != "flex" || is.firefox()) {
	    wrap_mid.style.height = document.documentElement.clientHeight - 
	    wrap_top.offsetHeight + "px";
	    if (is.firefox()) {
	    	var m_box = document.getElementsByClassName("m-box")[0];
	    	m_box.style.overflow = "hidden";
            m_box.addEventListener("MozMousePixelScroll", onWheel);

            var textarea = document.getElementsByClassName("t-field")[0];
            textarea.style.overflow = "hidden";
            textarea.addEventListener("MozMousePixelScroll", onWheel);
	    }
    } 
}

function onWheel(e) {
	e = e || window.event;

	var delta = e.deltaY || e.detail;
    
    this.scrollTop += delta;
}

heightMid();

if (window.addEventListener)
	window.addEventListener("resize", heightMid, false);
else if (window.attachEvent)
	window.attachEvent("onresize", heightMid);