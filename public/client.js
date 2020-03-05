window.onload = ()=>{

	var socket = io('http://localhost:9000');

	socket.emit('document-loaded', window.document.location.href);

	socket.on('file-change', (data)=>{

		switch (data.ext) {

			case '.ejs':
			case '.html':
				document.documentElement.innerHTML = data.data;
				break;

			case '.css':

				if (document.querySelector(`[href='${data.fileHref}']`)) {

					document.querySelector(`[href='${data.fileHref}']`).href = data.fileHref;

				}

				break;
			
		}
		
	});

}

