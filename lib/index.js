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

			this.checkDirectories();
			this.readDirectories();

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

	watchFiles(){

		this.filesToWatch.forEach(file=>{

			this.fs.watchFile(file, (current, previous)=>{

				let fileData = {
					filename: this.path.basename(file),
					file,
					ext: this.path.extname(file)
				}

				this.changesListener(fileData, current, previous);
			});

		});

	}

	changesListener(fileData, current, previous){

		if (current.mtime != previous.mtime) {
			
			this.fs.readFile(fileData.file).then(data=>{

				fileData.data = data.toString();
				this.socket.emit('file-change', fileData);

				console.log(data.toString());

			}).catch(err=>{
				console.log(err);
			});

		}	

	}

}

module.exports = RealTimeFrontend;