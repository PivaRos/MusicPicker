FROM node:20-slim
WORKDIR /MusicPicker
COPY . /MusicPicker
RUN npm install
EXPOSE 8000

CMD ["cp ./MusicPicker/DefaultAppConfig.json ./MusicPicker/dist/src/","npm start"]
