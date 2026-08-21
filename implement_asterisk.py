from pathlib import Path


ROOT = Path(__file__).resolve().parent


def replace_once(path: str, old: str, new: str) -> None:
    file_path = ROOT / path
    content = file_path.read_text()
    if new in content:
        return
    if old not in content:
        raise RuntimeError(f"Expected text not found in {path}")
    file_path.write_text(content.replace(old, new, 1))


def main() -> None:
    replace_once(
        "src/app/(admin)/admin/events/page.tsx",
        "Speaker(s) / Guest(s) (Comma separated)",
        "Speaker(s) / Guest(s) (Comma separated. Prefix with * to skip feedback)",
    )
    replace_once(
        "src/app/feedback/page.tsx",
        "? selectedEvent.speaker.split(/[\\n,]+/).map(s => s.trim()).filter(Boolean)",
        '? selectedEvent.speaker.split(/[\\n,]+/).map(s => s.trim()).filter(Boolean).filter(s => !s.startsWith("*"))',
    )
    replace_once(
        "src/app/(landing)/events/[slug]/page.tsx",
        "{event.speaker.split(/[\\n,]+/).map((s: string) => s.trim()).filter(Boolean).map((s: string, idx: number) => (",
        '{event.speaker.split(/[\\n,]+/).map((s: string) => s.trim().replace(/^\\*/, "")).filter(Boolean).map((s: string, idx: number) => (',
    )


if __name__ == "__main__":
    main()
