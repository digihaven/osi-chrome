

function localStorageGet(n,def)
{
	if (!$.localStorage.isSet(n))
		$.localStorage.set(n,def);

	return $.localStorage.get(n);
}


function guid() {
	  function s4() {
	    return Math.floor((1 + Math.random()) * 0x10000)
		       .toString(16)
		       .substring(1);
	  }
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		 s4() + '-' + s4() + s4() + s4();
}
