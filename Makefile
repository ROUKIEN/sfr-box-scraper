DOCKER_REGISTRY=ghcr.io/roukien
DOCKER_IMAGE=sfr-box-scraper
DOCKER_TAG?=latest

build-docker: ## builds the docker image
	docker build -t $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG) .

release-docker: ## releases the docker image
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE):$(DOCKER_TAG)
