#!/usr/bin/env node

class RealTimeFrontend {

	constructor(){

		this.fs = require('fs');
		this.util = require('util');
		this.promisifyFunctions();
		this.path = require('path');

		this.initSocket();

		this.filesToWatch = [];

	}

	initSocket(){

		this.express = require('express')();
		this.http = require('http').createServer(this.express);
		this.io = require('socket.io')(this.http);

		this.io.on('connection', socket=>{

			this.socket = socket;

			this.socket.on('document-loaded', documentPath=>{

				this.documentPath = documentPath.replace("file:///", "");
				this.documentPath = this.path.resolve(this.documentPath);

				this.watchFiles();

			});

		});

		this.http.listen(9000, ()=>{
			console.log('Socket iniciado!');
		});

	}

	promisifyFunctions(){

		this.fs.readdir = this.util.promisify(this.fs.readdir);
		this.fs.readFile = this.util.promisify(this.fs.readFile);

	}

	getStyleSheetPath(){

		return new Promise((resolve, reject)=>{

			this.jsdom = require("jsdom");
			const { JSDOM } = this.jsdom;

			this.styleSheetsPaths = [];

			this.fs.readFile(this.documentPath).then(data=>{

				let content = data.toString();
				this.dom = new JSDOM(content);

				this.dom.window.document.querySelectorAll('[rel="stylesheet"]').forEach(el=>{

					let filePath = this.path.resolve(this.path.join(this.path.dirname(this.documentPath), el.href));

					this.styleSheetsPaths.push({
						filePath,
						id: el.href
					});

				});

				if (this.styleSheetsPaths.length > 0) resolve();

			}).catch(err=>{
				reject(err);
			});

		});

	}

	watchFiles(){

		this.updateStyleSheets();

		this.fs.watchFile(this.documentPath, (current, previous)=>{

			let fileData = {
				filename: this.path.basename(this.documentPath),
				file: this.documentPath,
				ext: this.path.extname(this.documentPath)
			}

			this.updateStyleSheets();

			this.changesListener(fileData, current, previous);

		});

	}

	updateStyleSheets(){

		this.getStyleSheetPath().then(()=>{

			this.styleSheetsPaths.forEach(cssFile=>{

				this.fs.watchFile(cssFile.filePath, (current, previous)=>{

					let fileData = {
						filename: this.path.basename(cssFile.filePath),
						file: cssFile.filePath,
						ext: this.path.extname(cssFile.filePath),
						fileHref: cssFile.id
					}

					this.changesListener(fileData, current, previous);

				});

			});


		}).catch(err=>{
			console.log(err);
		});

	}

	changesListener(fileData, current, previous){

		if (current.mtime != previous.mtime) {
			
			this.fs.readFile(fileData.file).then(data=>{

				fileData.data = data.toString();
				this.socket.emit('file-change', fileData);

			}).catch(err=>{
				console.log(err);
			});

		}	

	}

}

module.exports = RealTimeFrontend;