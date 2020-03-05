#!/usr/bin/env node

class RealTimeFrontend {

	constructor(){

		this.fs = require('fs');
		this.util = require('util');
		this.promisifyFunctions();
		this.path = require('path');
		this.appRoot = require('app-root-path').toString();

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

				/*this.fs.readFile(documentPath).then(data=>{
					console.log(data.toString());
				}).catch(err=>{
					console.log(err);
				});*/

				//	COMPARA OS CAMINHOS
				//	VÊ SE É O MESMO ARQUIVO QUE TÁ SENDO ASSISTIDO

				//console.log(documentPath);

				//this.dom = new JSDOM(documentData);

				//console.log(this.dom.window.document.documentElement.innerHTML);

				//this.checkDirectories();
				//this.readDirectories();

			});

		});

		this.http.listen(9000, ()=>{
			console.log('Socket iniciado!');
		});

		//Temos o seguinte problema:

	}

	promisifyFunctions(){

		this.fs.readdir = this.util.promisify(this.fs.readdir);
		this.fs.readFile = this.util.promisify(this.fs.readFile);

	}

	checkDirectories(){

		if (this.fs.existsSync(this.path.join(this.appRoot, '/public'))) {

			this.publicDirectory = this.path.join(this.appRoot, '/public');

		}

		if (this.fs.existsSync(this.path.join(this.appRoot, '/views'))) {

			this.viewsDirectory = this.path.join(this.appRoot, '/views');

		}

	}

	readPublicDirectory(){

		return new Promise((resolve, reject)=>{

			if (this.publicDirectory) {

				this.fs.readdir(this.publicDirectory).then(files=>{

					files.forEach(file=>{

						switch (this.path.extname(file)) {

							case '.html':
								this.filesToWatch.push(this.path.join(this.publicDirectory, `/${file}`));
								break;

							case '.css':
								this.filesToWatch.push(this.path.join(this.publicDirectory, `/${file}`));
								break;
							
						}

					});

					resolve();

				}).catch(err=>{
					reject(err);
				});

			}

		});

	}

	readViewsDirectory(){

		return new Promise((resolve, reject)=>{

			if (this.viewsDirectory) {

				this.fs.readdir(this.viewsDirectory).then(files=>{

					files.forEach(file=>{

						switch (this.path.extname(file)) {

							case '.html':
								this.filesToWatch.push(this.path.join(this.viewsDirectory, `/${file}`));
								break;

							case '.css':
								this.filesToWatch.push(this.path.join(this.viewsDirectory, `/${file}`));
								break;
							
						}

					});

					resolve();

				}).catch(err=>{
					reject(err);
				});

			}

		});

	}

	readDirectories(){

		this.readPublicDirectory().then(()=>{

			this.readViewsDirectory().then(()=>{

				this.watchFiles();

			}).catch(err=>{
				console.log(err);
			});

		}).catch(err=>{
			console.log(err);
		});

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

		//Primeiro pegamos as stylesheets presentes no arquivo
		//Depois olhamos por mudanças
		//Quando ocorrerem nós criamos um elemento link, adicionamos os atributos href e rel, e por fim adicionamos no head com appendchild. também é necessário remover o elemento atual de link, isso dará a impressão de que alteramos o atual, mas na verdade criamos outro e carregamos

		this.fs.watchFile(this.documentPath, (current, previous)=>{

			let fileData = {
				filename: this.path.basename(this.documentPath),
				file: this.documentPath,
				ext: this.path.extname(this.documentPath)
			}

			this.changesListener(fileData, current, previous);

		});

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

		/*this.filesToWatch.forEach(file=>{

			if (this.path.resolve(file) == this.path.resolve(this.documentPath)) {

				this.fs.watchFile(file, (current, previous)=>{

					let fileData = {
						filename: this.path.basename(file),
						file,
						ext: this.path.extname(file)
					}

					this.changesListener(fileData, current, previous);
				});

			}

		});*/

	}

	changesListener(fileData, current, previous){

		if (current.mtime != previous.mtime) {
			
			this.fs.readFile(fileData.file).then(data=>{

				fileData.data = data.toString();
				this.socket.emit('file-change', fileData);

				//console.log(data.toString());

			}).catch(err=>{
				console.log(err);
			});

		}	

	}

}

module.exports = RealTimeFrontend;