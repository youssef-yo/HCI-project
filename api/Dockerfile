FROM python:3.12.0

# Setup a spot for the api code
WORKDIR /usr/local/src/skiff/app/api

# Install Python dependencies
RUN pip install --upgrade pip poetry
COPY pyproject.toml poetry.lock ./

RUN poetry install --without dev --no-root


# Copy over the source code
COPY . .

# Kick things off
ENTRYPOINT [ "poetry", "run", "uvicorn" ]
CMD ["main:app", "--host", "0.0.0.0"]
