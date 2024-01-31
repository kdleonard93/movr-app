#!/usr/bin/env bash
set -xe

rm go.mod
go mod init github.com/crdb/movrapp

go build -o bin/application .
