#!/bin/bash
# Wrapper: เรียก shared script
cd "$(dirname "$0")"
exec ../scripts/run-python.sh generator
