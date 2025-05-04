# Makefile for Docker containers

################################################################################
# Variables
################################################################################

SRC_DIR   := $(PWD)/../app
SRC_DEPS  := $(SRC_DIR)/package.json
SRC_FILES := $(shell find $(SRC_DIR)/src -type f -printf '%p ')
BUILD_DIR := $(PWD)/nginx/dist

# Angular app builder
ANGULAR_CONTAINER  := penerjemah-fe-builder
ANGULAR_IMAGE      := localhost/$(ANGULAR_CONTAINER)
ANGULAR_DIR        := $(PWD)/angular
ANGULAR_DOCKERFILE := $(ANGULAR_DIR)/Dockerfile
ANGULAR_ENTRYPOINT := $(ANGULAR_DIR)/entrypoint.sh

# Webserver
NGINX_CONTAINER  := penerjemah-fe-ws
NGINX_IMAGE      := nginx:stable
NGINX_DIR        := $(PWD)/nginx
NGINX_DOCKERFILE := $(NGINX_DIR)/Dockerfile
NGINX_CONFIG     := $(NGINX_DIR)/nginx.conf
NGINX_SSL_DIR    := $(NGINX_DIR)/ssl

################################################################################
# Quick Rules
################################################################################

all: .nginx_run

rebuild: .angular_run

restart:
	docker restart $(NGINX_CONTAINER)

reset: pristine all

.PHONY: all clean pristine rebuild restart reset

################################################################################
# Main Rules
################################################################################

.nginx_run: .angular_run
	docker run -dit \
		--name     $(NGINX_CONTAINER) \
		--hostname $(NGINX_CONTAINER) \
		--restart  always \
		-p 80:80/tcp \
		-p 443:443/tcp \
		-v $(NGINX_SSL_DIR):/etc/nginx/ssl/ \
		-v $(BUILD_DIR):/usr/share/nginx/html/ \
		-v $(NGINX_CONFIG):/etc/nginx/nginx.conf \
		$(NGINX_IMAGE)
	touch $@

.angular_run: .angular_build_image $(SRC_DEPS) $(SRC_FILES)
	mkdir -p $(BUILD_DIR)
	docker run --rm -i \
		--name $(ANGULAR_CONTAINER) \
		-v $(SRC_DIR):/app/ \
		-v $(BUILD_DIR):/dist/ \
		$(ANGULAR_IMAGE)
	touch $@

.angular_build_image: $(ANGULAR_DOCKERFILE) $(ANGULAR_ENTRYPOINT)
	docker rmi -f $(ANGULAR_IMAGE) | true
	docker build --network host --file $< --tag $(ANGULAR_IMAGE) $(ANGULAR_DIR)
	touch $@

################################################################################
# Cleaners
################################################################################

# Clean containers only
clean:
	docker rm -f \
		$(NGINX_CONTAINER) \
		| true
	rm -f \
		.nginx_run \
		.angular_run

# Clean containers & images
pristine: clean
	docker rmi -f \
		$(ANGULAR_IMAGE) \
		| true
	rm -rf \
		.angular_build_image \
		$(BUILD_DIR)

