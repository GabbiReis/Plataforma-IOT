FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV BUILD_PATH=dist
RUN npm run build

FROM nginx:alpine
# Instala o pacote 'gettext' que contém o 'envsubst'
RUN apk add --no-cache gettext
COPY --from=builder /app/dist /usr/share/nginx/html
# Copiamos o conf como um template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]