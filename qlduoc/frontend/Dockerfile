# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (using --legacy-peer-deps if needed, or just install)
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build artifacts from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
# We will create this file in the project root/docker/nginx folder, expecting it to be passed in build context or separate file
# For simpler context mapping, we'll assume the user provides nginx.conf or we inline a default here? 
# Better to copy a config file. I'll rely on docker-compose to mount the config OR copy it here if it exists in frontend dir.
# Let's assume we place a `nginx.conf` in frontend root for this build, OR just use a generic one if not provided.
# Actually, for deployment simplicity, let's CREATE the nginx config inside this image or mount it.
# I will write a simple config to /etc/nginx/conf.d/default.conf directly via echo if possible or COPY.
# I'll choose to COPY a file named 'nginx.conf' which I will create in the frontend directory next.

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
