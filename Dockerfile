# Tells the Docker which base image to start.
FROM ubuntu:18.04

RUN apt-get update -y && apt-get install curl -y

RUN apt-get install libfontconfig1 -y &&\
    curl -sL https://deb.nodesource.com/setup_12.x | bash - && apt-get install nodejs -y

#WORKING DIR.

RUN mkdir /app

# Adds files from the host file system into the Docker container.
COPY . /app

# Sets the current working directory for subsequent instructions
WORKDIR /app

RUN npm install

#expose a port to allow external access
EXPOSE 3000

# Start mean application
CMD ["npm", "run", "dev"]
