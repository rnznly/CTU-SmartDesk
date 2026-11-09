# Production Nginx image for CTU SmartDesk PWA
FROM nginx:alpine

# Copy static assets to default Nginx web root
COPY . /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
