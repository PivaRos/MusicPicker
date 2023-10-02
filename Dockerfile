FROM node:20-slim
WORKDIR /MusicPicker
COPY . /MusicPicker
RUN npm install
EXPOSE 8000
CMD npm start
