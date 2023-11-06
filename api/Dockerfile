# syntax=docker/dockerfile:1.4

FROM python:latest

WORKDIR /usr/src/app
COPY ./requirements.txt /usr/src/app/requirements.txt

EXPOSE 8000

RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

CMD ["python3", "-m", "litestar", "run", "--reload"]