FROM node:20-slim
WORKDIR /MusicPicker
COPY . /MusicPicker
RUN npm install
EXPOSE 8000
EXPOSE 3000
CMD node ./dist/src/musicpicker.js
