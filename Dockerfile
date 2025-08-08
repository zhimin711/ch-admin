FROM openresty/openresty:1.19.9.1-6-alpine

COPY dist /usr/local/openresty/nginx/html
EXPOSE 80
