# Use the official Node.js image as the base image
FROM node:alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the environment variable for MongoDB
ENV MONGO_URI=mongodb://mongo:27017/mock-db

# Start the app
CMD [ "npm", "start" ]