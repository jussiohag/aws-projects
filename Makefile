SHELL := /bin/bash

.PHONY: lint test build ci smoke synth deploy-datalake deploy-haweb destroy-datalake destroy-haweb build-static deploy-static destroy-static

lint:
	@cd projects/data-lake/cdk && source .venv/bin/activate && python -m py_compile cdk/data_lake_stack.py
	@cd projects/ha-web-service/cdk && source .venv/bin/activate && python -m py_compile cdk/ha_web_stack.py
	@cd projects/static-hosting/cdk && source .venv/bin/activate && python -m py_compile cdk/static_hosting_stack.py
	@cd projects/static-hosting && npx tsc --noEmit
	@echo "Lint OK"

test:
	@echo "No unit tests configured yet"

build: synth

synth:
	cd projects/data-lake/cdk && source .venv/bin/activate && cdk synth --quiet
	cd projects/ha-web-service/cdk && source .venv/bin/activate && cdk synth --quiet
	cd projects/static-hosting && npm run build && cd cdk && source .venv/bin/activate && cdk synth --quiet

build-static:
	cd projects/static-hosting && npm run build

deploy-static: build-static
	cd projects/static-hosting/cdk && source .venv/bin/activate && cdk deploy

destroy-static:
	cd projects/static-hosting/cdk && source .venv/bin/activate && cdk destroy

deploy-datalake:
	cd projects/data-lake/cdk && source .venv/bin/activate && cdk deploy

deploy-haweb:
	cd projects/ha-web-service/cdk && source .venv/bin/activate && cdk deploy

destroy-datalake:
	cd projects/data-lake/cdk && source .venv/bin/activate && cdk destroy

destroy-haweb:
	cd projects/ha-web-service/cdk && source .venv/bin/activate && cdk destroy

smoke:
	@echo "TODO: configure smoke tests"

ci: lint synth
