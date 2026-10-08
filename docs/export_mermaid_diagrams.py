#!/usr/bin/env python3
"""Export Mermaid blocks from proposal.md as transparent SVG and PNG files."""

from __future__ import annotations

import re
import shutil
import subprocess
import sys
import json
from pathlib import Path


MERMAID_CLI_VERSION = "11.17.0"
PNG_SCALE = "3"
MERMAID_BLOCK = re.compile(
    r"(?ms)^[ \t]*```mermaid[^\r\n]*\r?\n(.*?)^[ \t]*```[ \t]*$"
)
ABSOLUTE_PATH_TO_MD = "/home/ubuntu/Workspace/Personal Projects/Viettel GD2/docs/gr2/week02-problem-and-current-solutions/report.md"


def main() -> int:
    source_path = Path(ABSOLUTE_PATH_TO_MD)
    if not ABSOLUTE_PATH_TO_MD or not source_path.is_absolute():
        print("Set ABSOLUTE_PATH_TO_MD to an absolute Markdown file path.", file=sys.stderr)
        return 1

    proposal_dir = source_path.parent
    output_dir = proposal_dir / "outputs"
    diagrams_dir = output_dir / "diagrams"
    output_markdown = output_dir / source_path.name

    if not source_path.is_file():
        print(f"Markdown source not found: {source_path}", file=sys.stderr)
        return 1

    source = source_path.read_text(encoding="utf-8")
    blocks = list(MERMAID_BLOCK.finditer(source))
    if not blocks:
        print(f"No Mermaid diagrams found in: {source_path}", file=sys.stderr)
        return 1

    if shutil.which("npx") is None:
        print("npx is required. Install Node.js and npm first.", file=sys.stderr)
        return 1

    chrome_path = next(
        (
            path
            for command in ("google-chrome", "chromium", "chromium-browser")
            if (path := shutil.which(command)) is not None
        ),
        None,
    )
    if chrome_path is None:
        print(
            "Google Chrome or Chromium is required to render Mermaid diagrams.",
            file=sys.stderr,
        )
        return 1

    output_dir.mkdir(parents=True, exist_ok=True)
    diagrams_dir.mkdir(parents=True, exist_ok=True)
    puppeteer_config = diagrams_dir / "puppeteer-config.json"
    puppeteer_config.write_text(
        json.dumps({"executablePath": chrome_path}), encoding="utf-8"
    )

    # Preserve existing Markdown image paths, such as images/infrahub-architecture.png.
    source_images = proposal_dir / "images"
    if source_images.is_dir():
        shutil.copytree(source_images, output_dir / "images", dirs_exist_ok=True)

    # Clean up stale diagrams if diagram count decreased
    valid_stems = {f"diagram-{i:02d}" for i in range(1, len(blocks) + 1)}
    for stale_file in diagrams_dir.glob("diagram-*.*"):
        if stale_file.stem not in valid_stems:
            stale_file.unlink(missing_ok=True)

    replacements: list[tuple[int, int, str]] = []
    for index, block in enumerate(blocks, start=1):
        diagram_name = f"diagram-{index:02d}"
        diagram_source = diagrams_dir / f"{diagram_name}.mmd"
        diagram_svg = diagrams_dir / f"{diagram_name}.svg"
        diagram_png = diagrams_dir / f"{diagram_name}.png"
        diagram_content = block.group(1).strip() + "\n"

        source_changed = (
            not diagram_source.is_file()
            or diagram_source.read_text(encoding="utf-8") != diagram_content
        )
        if source_changed:
            diagram_source.write_text(diagram_content, encoding="utf-8")

        for diagram_image in (diagram_svg, diagram_png):
            if (
                not source_changed
                and diagram_image.is_file()
                and diagram_image.stat().st_size > 0
            ):
                print(f"Skipping {diagram_image.name} (cached)", flush=True)
                continue

            command = [
                "npx",
                "--yes",
                f"@mermaid-js/mermaid-cli@{MERMAID_CLI_VERSION}",
                "-i",
                str(diagram_source),
                "-o",
                str(diagram_image),
                "-b",
                "transparent",
                "-p",
                str(puppeteer_config),
            ]
            if diagram_image.suffix == ".png":
                command.extend(["-s", PNG_SCALE])
            print(f"Rendering {diagram_image.name}", flush=True)
            try:
                subprocess.run(command, check=True)
            except subprocess.CalledProcessError as error:
                print(f"Failed to render {diagram_image.name}", file=sys.stderr)
                return error.returncode

        replacement = f"![Mermaid diagram {index}](diagrams/{diagram_name}.svg)"
        replacements.append((block.start(), block.end(), replacement))

    rendered_markdown = source
    for start, end, replacement in reversed(replacements):
        rendered_markdown = rendered_markdown[:start] + replacement + rendered_markdown[end:]

    output_markdown.write_text(rendered_markdown, encoding="utf-8")
    print(f"Created {output_markdown}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
