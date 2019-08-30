FROM node:10.13.0

WORKDIR /usr/src/app

COPY . .

RUN npm install && npm run build && rm -rf {src,node_modules}

CMD ["npm", "start"]