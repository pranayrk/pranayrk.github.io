#!/bin/bash

set -meuxo pipefail

python3 -m http.server &
xdg-open http://localhost:8000/
fg
