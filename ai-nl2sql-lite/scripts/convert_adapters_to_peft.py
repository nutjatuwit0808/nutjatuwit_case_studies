#!/usr/bin/env python3
"""
Convert MLX LoRA adapters to Hugging Face PEFT format.
Based on: https://github.com/ml-explore/mlx/discussions/1507

Usage:
    python scripts/convert_adapters_to_peft.py [--adapters-dir ADAPTERS_DIR] [--output-dir OUTPUT_DIR]

Input:  adapters/adapters.safetensors, adapters/adapter_config.json
Output: converted/adapter_model.safetensors, converted/adapter_config.json
"""

import argparse
import json
import sys
from pathlib import Path


def get_target_modules_from_state_dict(state_dict: dict) -> list[str]:
    """Extract target_modules (e.g. q_proj, k_proj) from adapter keys."""
    modules = set()
    for key in state_dict.keys():
        parts = key.split(".")
        for part in parts:
            if part.endswith("_proj"):
                modules.add(part)
    return sorted(modules)


def rename_key(old_key: str) -> str:
    """Convert MLX adapter key to PEFT format."""
    new_key = f"base_model.model.model.{old_key}"
    new_key = new_key.replace("lora_a", "lora_A.weight")
    new_key = new_key.replace("lora_b", "lora_B.weight")
    return new_key


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert MLX adapters to PEFT format")
    parser.add_argument(
        "--adapters-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "adapters",
        help="Path to adapters directory",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "converted",
        help="Output directory for PEFT adapter",
    )
    args = parser.parse_args()

    adapters_safetensors = args.adapters_dir / "adapters.safetensors"
    adapter_config_path = args.adapters_dir / "adapter_config.json"

    if not adapters_safetensors.exists():
        print(f"Error: {adapters_safetensors} not found", file=sys.stderr)
        return 1
    if not adapter_config_path.exists():
        print(f"Error: {adapter_config_path} not found", file=sys.stderr)
        return 1

    try:
        from safetensors.torch import load_file, save_file
    except ImportError:
        print("Error: safetensors and torch required. Run: pip install -r scripts/requirements-convert.txt", file=sys.stderr)
        return 1

    # Load MLX adapters
    loaded = load_file(str(adapters_safetensors))

    def convert_value(tensor):
        """Transpose for PEFT format (lora_a, lora_b)."""
        return tensor.transpose(0, 1).contiguous()

    new_state_dict = {
        rename_key(k): convert_value(v)
        for k, v in loaded.items()
    }

    args.output_dir.mkdir(parents=True, exist_ok=True)
    output_safetensors = args.output_dir / "adapter_model.safetensors"
    save_file(new_state_dict, str(output_safetensors))
    print(f"Saved {output_safetensors}")

    # Build PEFT adapter_config.json
    target_modules = get_target_modules_from_state_dict(loaded)
    with open(adapter_config_path, encoding="utf-8") as f:
        mlx_config = json.load(f)

    lora_params = mlx_config.get("lora_parameters", {})
    peft_config = {
        "alpha_pattern": {},
        "auto_mapping": None,
        "base_model_name_or_path": "scb10x/llama-3-typhoon-v1.5-8b-instruct",
        "bias": "none",
        "fan_in_fan_out": False,
        "inference_mode": True,
        "init_lora_weights": True,
        "layers_pattern": None,
        "layers_to_transform": None,
        "loftq_config": {},
        "lora_alpha": int(lora_params.get("scale", 20)),
        "lora_dropout": float(lora_params.get("dropout", 0.0)),
        "megatron_config": None,
        "megatron_core": "megatron.core",
        "modules_to_save": None,
        "peft_type": "LORA",
        "r": int(lora_params.get("rank", 8)),
        "rank_pattern": {},
        "revision": None,
        "target_modules": target_modules,
        "task_type": "CAUSAL_LM",
        "use_rslora": False,
    }

    output_config = args.output_dir / "adapter_config.json"
    with open(output_config, "w", encoding="utf-8") as f:
        json.dump(peft_config, f, indent=2)
    print(f"Saved {output_config}")
    print(f"target_modules: {target_modules}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
