var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-75483397-2']);
_gaq.push(['_trackPageview']);

(function () {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

document.getElementById('panel').addEventListener('click', el => {
	_gaq.push(['_trackEvent', el.target.textContent, 'clicked']);
});