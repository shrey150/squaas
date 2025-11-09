.PHONY: install run test demo clean

install:
	poetry install

run:
	poetry run uvicorn main:app --reload --port 8787

run-prod:
	poetry run uvicorn main:app --host 0.0.0.0 --port 8787

test:
	poetry run python simple_test.py

demo:
	poetry run python demo_livestream.py

test-all:
	poetry run python test_api.py

shell:
	poetry shell

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies with Poetry"
	@echo "  make run        - Start development server"
	@echo "  make run-prod   - Start production server"
	@echo "  make test       - Run simple test"
	@echo "  make demo       - Run full livestream demo"
	@echo "  make shell      - Enter Poetry shell"
	@echo "  make clean      - Remove Python cache files"

