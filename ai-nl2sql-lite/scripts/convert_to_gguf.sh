#!/usr/bin/env bash
# NL2SQL-Lite: Convert MLX adapters to GGUF
# Usage: ./scripts/convert_to_gguf.sh <LLAMA_CPP_DIR> [--base BASE_MODEL] [--out OUTPUT.gguf]
#
# Prerequisites:
#   - adapters/ with adapters.safetensors, adapter_config.json
#   - llama.cpp cloned (https://github.com/ggml-org/llama.cpp)
#   - pip install -r scripts/requirements-convert.txt
#   - pip install -r <LLAMA_CPP_DIR>/requirements.txt (for convert_lora_to_gguf.py)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Defaults
BASE_MODEL="${BASE_MODEL:-scb10x/llama-3-typhoon-v1.5-8b-instruct}"
OUTPUT_GGUF="${OUTPUT_GGUF:-nl2sql-lite.gguf}"

usage() {
    echo "Usage: $0 <LLAMA_CPP_DIR> [--base BASE_MODEL] [--out OUTPUT.gguf]"
    echo ""
    echo "  LLAMA_CPP_DIR   Path to cloned llama.cpp repository"
    echo "  --base          Base model (HF ID or path). Default: $BASE_MODEL"
    echo "  --out           Output GGUF filename. Default: $OUTPUT_GGUF"
    echo ""
    echo "Example:"
    echo "  $0 ../llama.cpp"
    echo "  $0 ../llama.cpp --base scb10x/llama-3-typhoon-v1.5-8b-instruct --out nl2sql.gguf"
    exit 1
}

# Parse args
LLAMA_CPP_DIR=""
while [[ $# -gt 0 ]]; do
    case "$1" in
        --base)
            BASE_MODEL="$2"
            shift 2
            ;;
        --out)
            OUTPUT_GGUF="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        *)
            if [[ -z "$LLAMA_CPP_DIR" ]]; then
                LLAMA_CPP_DIR="$1"
            else
                echo "Error: Unexpected argument: $1" >&2
                usage
            fi
            shift
            ;;
    esac
done

if [[ -z "$LLAMA_CPP_DIR" ]]; then
    echo "Error: LLAMA_CPP_DIR required" >&2
    usage
fi

LLAMA_CPP_DIR="$(cd "$LLAMA_CPP_DIR" && pwd)"
CONVERT_SCRIPT="$LLAMA_CPP_DIR/convert_lora_to_gguf.py"

if [[ ! -f "$CONVERT_SCRIPT" ]]; then
    echo "Error: $CONVERT_SCRIPT not found. Please clone llama.cpp: git clone https://github.com/ggml-org/llama.cpp" >&2
    exit 1
fi

ADAPTERS_DIR="$PROJECT_DIR/adapters"
ADAPTERS_FILE="$ADAPTERS_DIR/adapters.safetensors"
CONVERTED_DIR="$PROJECT_DIR/converted"
OUTPUT_PATH="$PROJECT_DIR/$OUTPUT_GGUF"

if [[ ! -f "$ADAPTERS_FILE" ]]; then
    echo "Error: $ADAPTERS_FILE not found. Run LoRA training first (mlx_lm.lora)." >&2
    exit 1
fi

cd "$PROJECT_DIR"
if [[ -d ".venv" ]]; then
    source .venv/bin/activate
fi

echo "=== Step 1: Convert MLX adapters to PEFT ==="
python3 "$SCRIPT_DIR/convert_adapters_to_peft.py" --adapters-dir "$ADAPTERS_DIR" --output-dir "$CONVERTED_DIR"

echo ""
echo "=== Step 2: Convert PEFT to GGUF (via llama.cpp) ==="
python3 "$CONVERT_SCRIPT" --base "$BASE_MODEL" --outtype q8_0 "$CONVERTED_DIR" --outfile "$OUTPUT_PATH"

echo ""
echo "=== Done ==="
echo "Output: $OUTPUT_PATH"
echo ""
echo "Use with:"
echo "  - Ollama: Create Modelfile with FROM $OUTPUT_GGUF, then ollama create nl2sql-lite -f Modelfile"
echo "  - llama.cpp: ./llama-cli -m $OUTPUT_GGUF -p \"prompt\""
echo "  - LM Studio: Open the .gguf file"
