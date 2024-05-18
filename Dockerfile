FROM python:3.6.5
ENV PYTHONUNBUFFERED 1
RUN mkdir /profit_pulse
WORKDIR /profit_pulse
ADD . /profit_pulse/


RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN apt-get update
RUN apt -y install postgresql postgresql-contrib
RUN apt-get -y install ghostscript
