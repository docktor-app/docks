# Packages an already-built site: run `npm run docs:build` first. The build is not done
# inside the image because VitePress reads git history for last-updated timestamps.
# Unprivileged nginx: runs as a non-root user and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY .vitepress/dist /usr/share/nginx/html
EXPOSE 8080
