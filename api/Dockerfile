# syntax=docker/dockerfile:1.4

FROM python:alpine

WORKDIR /usr/src/app
COPY ./requirements.txt /usr/src/app/requirements.txt

EXPOSE 8000
RUN apk --no-cache add gcc musl-dev
ARG CACHEBUST=2
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade --no-cache-dir -r requirements.txt

CMD ["python3", "-m", "litestar", "run", "--reload", "--host", "0.0.0.0"]