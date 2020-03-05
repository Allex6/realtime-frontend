window.onload = ()=>{

	var socket = io('http://localhost:9000');

	//console.log(window.document.documentElement);

	socket.emit('document-loaded', window.document.location.href);

	socket.on('file-change', (data)=>{

		switch (data.ext) {

			case '.html':
				document.documentElement.innerHTML = data.data;
				break;

			case '.css':
				
				let link = document.createElement("link");
				link.rel = "stylesheet";
				link.type = "text/css";
				link.href = data.file;
				document.querySelector("head").appendChild(link);
				document.querySelector(`[href='${data.fileHref}']`).remove();

				break;
			
		}
		
	});

}

