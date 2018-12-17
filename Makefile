netlify:
	cd common && npm install && npm run build && cd ../frontend && npm install && NODE_ENV=production npm run build && cd ../ && cp _redirects ./frontend/dist